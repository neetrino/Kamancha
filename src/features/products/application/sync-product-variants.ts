import "server-only";

import { and, eq, inArray, ne } from "drizzle-orm";

import { getProviders } from "@/config/providers";
import { getDb } from "@/db/client";
import {
  attributeValues,
  cartItems,
  groupOrderItems,
  orderItems,
  productAttributeLinks,
  productVariantValues,
  productVariants,
  products,
} from "@/db/schema";
import { buildVariantSignature } from "@/features/products/domain/variant-selection";
import { createId } from "@/lib/id";
import {
  extensionForImageMime,
  resolveImageMimeType,
  validateImageFile,
} from "@/lib/media/image-file";

export type VariantWrite = {
  id: string | null;
  clientKey: string;
  sku: string;
  priceAmount: number;
  stockOnHand: number;
  valueIds: string[];
  removeImage: boolean;
};

export type SyncVariantsInput = {
  productId: string;
  kind: "SIMPLE" | "VARIABLE";
  attributeIds: string[];
  variants: VariantWrite[];
  filesByClientKey: ReadonlyMap<string, File>;
};

export type SyncVariantsResult =
  | { ok: true; priceAmount: number; stockOnHand: number }
  | { ok: false; error: string };

/** Replaces variable-product axes and variants. Simple products drop them. */
export async function syncProductVariants(
  input: SyncVariantsInput,
): Promise<SyncVariantsResult> {
  if (input.kind === "SIMPLE") {
    const cleared = await clearVariants(input.productId);
    if (!cleared.ok) return cleared;
    await getDb()
      .update(products)
      .set({ kind: "SIMPLE", updatedAt: new Date() })
      .where(eq(products.id, input.productId));
    return { ok: true, priceAmount: 0, stockOnHand: 0 };
  }

  const prepared = await prepareVariable(input);
  if (!prepared.ok) return prepared;

  const removed = await removeMissingVariants(
    input.productId,
    prepared.rows.map((row) => row.id),
  );
  if (!removed.ok) return removed;

  await replaceAttributeLinks(input.productId, input.attributeIds);
  const saved = await saveVariantRows(input.productId, prepared.rows, input);
  if (!saved.ok) return saved;

  const priceAmount = Math.min(...prepared.rows.map((row) => row.priceAmount));
  const stockOnHand = prepared.rows.reduce(
    (sum, row) => sum + row.stockOnHand,
    0,
  );
  await getDb()
    .update(products)
    .set({
      kind: "VARIABLE",
      priceAmount,
      stockOnHand,
      updatedAt: new Date(),
    })
    .where(eq(products.id, input.productId));

  return { ok: true, priceAmount, stockOnHand };
}

type PreparedRow = VariantWrite & { id: string; signature: string };

async function prepareVariable(
  input: SyncVariantsInput,
): Promise<{ ok: true; rows: PreparedRow[] } | { ok: false; error: string }> {
  if (input.attributeIds.length === 0 || input.variants.length === 0) {
    return {
      ok: false,
      error: "A variable product needs at least one attribute and one variant.",
    };
  }

  const valueOwner = await loadValueOwners(input.attributeIds);
  if (!valueOwner) {
    return { ok: false, error: "One or more attributes are invalid." };
  }

  const existingIds = new Set(
    (
      await getDb()
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, input.productId))
    ).map((row) => row.id),
  );
  const rows: PreparedRow[] = [];
  const signatures = new Set<string>();
  const skus = new Set<string>();

  for (const variant of input.variants) {
    if (variant.id && !existingIds.has(variant.id)) {
      return { ok: false, error: "Unknown variant." };
    }
    const check = describeVariant(variant, input.attributeIds, valueOwner);
    if (!check.ok) return check;
    if (signatures.has(check.signature) || skus.has(variant.sku)) {
      return { ok: false, error: "Each variant needs a unique combination and SKU." };
    }
    signatures.add(check.signature);
    skus.add(variant.sku);
    rows.push({
      ...variant,
      id: variant.id ?? createId(),
      signature: check.signature,
    });
  }

  const skuError = await assertSkusAvailable(
    input.productId,
    rows.map((row) => row.sku),
  );
  if (skuError) return { ok: false, error: skuError };
  return { ok: true, rows };
}

function describeVariant(
  variant: VariantWrite,
  attributeIds: string[],
  valueOwner: Map<string, string>,
): { ok: true; signature: string } | { ok: false; error: string } {
  if (!variant.sku.trim()) {
    return { ok: false, error: "Every variant needs a SKU." };
  }
  const seen = new Set<string>();
  for (const valueId of variant.valueIds) {
    const attributeId = valueOwner.get(valueId);
    if (!attributeId || !attributeIds.includes(attributeId) || seen.has(attributeId)) {
      return { ok: false, error: "Each variant needs one value per attribute." };
    }
    seen.add(attributeId);
  }
  if (seen.size !== attributeIds.length) {
    return { ok: false, error: "Each variant needs one value per attribute." };
  }
  return { ok: true, signature: buildVariantSignature(variant.valueIds) };
}

async function loadValueOwners(
  attributeIds: string[],
): Promise<Map<string, string> | null> {
  const rows = await getDb()
    .select({
      id: attributeValues.id,
      attributeId: attributeValues.attributeId,
    })
    .from(attributeValues)
    .where(inArray(attributeValues.attributeId, attributeIds));

  const owners = new Set(rows.map((row) => row.attributeId));
  if (attributeIds.some((id) => !owners.has(id))) return null;

  return new Map(rows.map((row) => [row.id, row.attributeId]));
}

async function assertSkusAvailable(
  productId: string,
  skus: string[],
): Promise<string | null> {
  const [productHit, variantHit] = await Promise.all([
    getDb()
      .select({ sku: products.sku })
      .from(products)
      .where(and(inArray(products.sku, skus), ne(products.id, productId)))
      .limit(1),
    getDb()
      .select({ sku: productVariants.sku })
      .from(productVariants)
      .where(
        and(
          inArray(productVariants.sku, skus),
          ne(productVariants.productId, productId),
        ),
      )
      .limit(1),
  ]);

  const [selfSku] = await getDb()
    .select({ sku: products.sku })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (selfSku && skus.includes(selfSku.sku)) {
    return "Variant SKU must differ from the product SKU.";
  }
  if (productHit[0] || variantHit[0]) {
    return "SKU is already used by another product or variant.";
  }
  return null;
}

async function clearVariants(
  productId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const removed = await removeMissingVariants(productId, []);
  if (!removed.ok) return removed;
  await getDb()
    .delete(productAttributeLinks)
    .where(eq(productAttributeLinks.productId, productId));
  return { ok: true };
}

async function removeMissingVariants(
  productId: string,
  keepIds: string[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await getDb()
    .select({
      id: productVariants.id,
      imageObjectKey: productVariants.imageObjectKey,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  const keep = new Set(keepIds);
  const remove = existing.filter((row) => !keep.has(row.id));
  if (remove.length === 0) return { ok: true };

  const removeIds = remove.map((row) => row.id);
  const blocked = await variantIsReferenced(removeIds);
  if (blocked) {
    return {
      ok: false,
      error: "A variant that is already in a cart or order cannot be removed.",
    };
  }

  await getDb()
    .delete(productVariants)
    .where(inArray(productVariants.id, removeIds));
  const storage = getProviders().storage;
  await Promise.all(
    remove
      .map((row) => row.imageObjectKey)
      .filter((key): key is string => Boolean(key))
      .map((key) => storage.deleteObject(key)),
  );
  return { ok: true };
}

async function variantIsReferenced(ids: string[]): Promise<boolean> {
  const db = getDb();
  const [cart, order, group] = await Promise.all([
    db
      .select({ id: cartItems.id })
      .from(cartItems)
      .where(inArray(cartItems.variantId, ids))
      .limit(1),
    db
      .select({ id: orderItems.id })
      .from(orderItems)
      .where(inArray(orderItems.variantId, ids))
      .limit(1),
    db
      .select({ id: groupOrderItems.id })
      .from(groupOrderItems)
      .where(inArray(groupOrderItems.variantId, ids))
      .limit(1),
  ]);
  return Boolean(cart[0] || order[0] || group[0]);
}

async function replaceAttributeLinks(
  productId: string,
  attributeIds: string[],
): Promise<void> {
  const db = getDb();
  await db
    .delete(productAttributeLinks)
    .where(eq(productAttributeLinks.productId, productId));
  await db.insert(productAttributeLinks).values(
    attributeIds.map((attributeId, index) => ({
      id: createId(),
      productId,
      attributeId,
      sortOrder: index,
    })),
  );
}

async function saveVariantRows(
  productId: string,
  rows: PreparedRow[],
  input: SyncVariantsInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const existing = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));
  const byId = new Map(existing.map((row) => [row.id, row]));

  for (const row of rows) {
    const file = input.filesByClientKey.get(row.clientKey) ?? null;
    if (file) {
      const invalid = validateImageFile(file);
      if (invalid) return { ok: false, error: invalid };
    }
    const previous = byId.get(row.id);
    const imageObjectKey = await nextImageKey(
      productId,
      row,
      previous?.imageObjectKey ?? null,
      file,
    );
    const values = {
      sku: row.sku.trim(),
      priceAmount: row.priceAmount,
      stockOnHand: row.stockOnHand,
      optionSignature: row.signature,
      imageObjectKey,
      updatedAt: new Date(),
    };
    if (previous) {
      await db
        .update(productVariants)
        .set(values)
        .where(eq(productVariants.id, row.id));
    } else {
      await db.insert(productVariants).values({
        id: row.id,
        productId,
        ...values,
      });
    }
    await replaceVariantValues(row.id, row.valueIds);
  }

  return { ok: true };
}

async function nextImageKey(
  productId: string,
  row: PreparedRow,
  previousKey: string | null,
  file: File | null,
): Promise<string | null> {
  const storage = getProviders().storage;
  if (file) {
    const mime = resolveImageMimeType(file) ?? file.type;
    const objectKey = `uploads/variants/${productId}/${row.id}.${extensionForImageMime(mime)}`;
    await storage.putObject({
      objectKey,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: mime,
    });
    if (previousKey && previousKey !== objectKey) {
      await storage.deleteObject(previousKey);
    }
    return objectKey;
  }
  if (row.removeImage && previousKey) {
    await storage.deleteObject(previousKey);
    return null;
  }
  return previousKey;
}

async function replaceVariantValues(
  variantId: string,
  valueIds: string[],
): Promise<void> {
  const db = getDb();
  const owners = await db
    .select({
      id: attributeValues.id,
      attributeId: attributeValues.attributeId,
    })
    .from(attributeValues)
    .where(inArray(attributeValues.id, valueIds));

  await db
    .delete(productVariantValues)
    .where(eq(productVariantValues.variantId, variantId));
  await db.insert(productVariantValues).values(
    owners.map((owner) => ({
      id: createId(),
      variantId,
      attributeId: owner.attributeId,
      attributeValueId: owner.id,
    })),
  );
}
