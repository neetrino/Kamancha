import "server-only";

import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import type { TranslationsJson } from "@/db/schema/catalog";
import {
  groupOrderItemModifiers,
  groupOrderItems,
  groupOrderParticipants,
  orderItems,
  products,
} from "@/db/schema";
import { loadPrimaryProductImageUrls } from "@/features/products/application/product-primary-images";
import type { Locale } from "@/lib/i18n/config";

export type CustomerGroupOrderShare = {
  participantId: string;
  subtotalAmount: number;
  deliveryShareAmount: number;
  finalAmount: number;
};

/**
 * SQL: customer-visible amount — participant final share for group orders,
 * otherwise the full order total.
 *
 * Nested select column refs must be fully table-qualified — drizzle drops
 * table names inside select expressions, and joins make short names ambiguous.
 */
export function customerOrderDisplayAmountSql(userId: string) {
  return sql`
    coalesce(
      (
        select ${sql.raw(`"group_order_participants"."final_amount"`)}
        from ${groupOrderParticipants}
        where ${sql.raw(
          `"group_order_participants"."group_order_id" = "orders"."group_order_id"`,
        )}
          and ${sql.raw(`"group_order_participants"."user_id"`)} = ${userId}
          and ${sql.raw(`"group_order_participants"."status"`)} = 'ACTIVE'
        limit 1
      ),
      ${sql.raw(`"orders"."total_amount"`)}
    )
  `;
}

/**
 * SQL: item quantity for the customer's group-order bag, else full order lines.
 */
export function customerOrderItemsCountSql(userId: string) {
  return sql`
    case
      when ${sql.raw(`"orders"."group_order_id"`)} is not null
        and exists (
          select 1
          from ${groupOrderParticipants}
          where ${sql.raw(
            `"group_order_participants"."group_order_id" = "orders"."group_order_id"`,
          )}
            and ${sql.raw(`"group_order_participants"."user_id"`)} = ${userId}
            and ${sql.raw(`"group_order_participants"."status"`)} = 'ACTIVE'
        )
      then coalesce(
        (
          select sum(${sql.raw(`"group_order_items"."quantity"`)})
          from ${groupOrderParticipants}
          inner join ${groupOrderItems}
            on ${sql.raw(
              `"group_order_items"."participant_id" = "group_order_participants"."id"`,
            )}
          where ${sql.raw(
            `"group_order_participants"."group_order_id" = "orders"."group_order_id"`,
          )}
            and ${sql.raw(`"group_order_participants"."user_id"`)} = ${userId}
            and ${sql.raw(`"group_order_participants"."status"`)} = 'ACTIVE'
        ),
        0
      )
      else coalesce(
        (
          select sum(${sql.raw(`"order_items"."quantity"`)})
          from ${orderItems}
          where ${sql.raw(`"order_items"."order_id" = "orders"."id"`)}
        ),
        0
      )
    end
  `;
}

/**
 * Orders the customer owns, or group orders where they had merchandise.
 */
export function customerOrdersVisibilitySql(userId: string) {
  return sql`(
    ${sql.raw(`"orders"."user_id"`)} = ${userId}
    or (
      ${sql.raw(`"orders"."group_order_id"`)} is not null
      and exists (
        select 1
        from ${groupOrderParticipants}
        where ${sql.raw(
          `"group_order_participants"."group_order_id" = "orders"."group_order_id"`,
        )}
          and ${sql.raw(`"group_order_participants"."user_id"`)} = ${userId}
          and ${sql.raw(`"group_order_participants"."status"`)} = 'ACTIVE'
          and ${sql.raw(`"group_order_participants"."subtotal_amount"`)} > 0
      )
    )
  )`;
}

/** Loads the signed-in user's share on a linked group order, if any. */
export async function findCustomerGroupOrderShare(
  userId: string,
  groupOrderId: string | null,
): Promise<CustomerGroupOrderShare | null> {
  if (!groupOrderId) return null;

  const [row] = await getDb()
    .select({
      participantId: groupOrderParticipants.id,
      subtotalAmount: groupOrderParticipants.subtotalAmount,
      deliveryShareAmount: groupOrderParticipants.deliveryShareAmount,
      finalAmount: groupOrderParticipants.finalAmount,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrderId),
        eq(groupOrderParticipants.userId, userId),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    )
    .limit(1);

  return row ?? null;
}

export type CustomerGroupOrderShareItem = {
  id: string;
  title: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
  currency: string;
  modifiers: Array<{
    id: string;
    kind: "ADDITION" | "EXCEPTION";
    name: string;
    unitPriceAmount: number;
  }>;
};

function resolveProductTitle(
  translations: TranslationsJson,
  locale: Locale,
  sku: string,
): string {
  return (
    translations[locale]?.title?.trim() ||
    translations.hy?.title?.trim() ||
    translations.en?.title?.trim() ||
    translations.ru?.title?.trim() ||
    sku
  );
}

/** Lines from the group bag for this participant (post-checkout history). */
export async function loadCustomerGroupOrderShareItems(input: {
  participantId: string;
  locale: Locale;
  currency: string;
}): Promise<CustomerGroupOrderShareItem[]> {
  const db = getDb();
  const rows = await db
    .select({
      item: groupOrderItems,
      product: {
        id: products.id,
        sku: products.sku,
        translations: products.translations,
      },
    })
    .from(groupOrderItems)
    .innerJoin(products, eq(groupOrderItems.productId, products.id))
    .where(eq(groupOrderItems.participantId, input.participantId));

  if (rows.length === 0) return [];

  const itemIds = rows.map((row) => row.item.id);
  const mods = await db
    .select()
    .from(groupOrderItemModifiers)
    .where(inArray(groupOrderItemModifiers.groupOrderItemId, itemIds));

  const modsByItem = new Map<string, typeof mods>();
  for (const mod of mods) {
    const list = modsByItem.get(mod.groupOrderItemId) ?? [];
    list.push(mod);
    modsByItem.set(mod.groupOrderItemId, list);
  }

  const imageByProduct = await loadPrimaryProductImageUrls(
    rows.map((row) => row.product.id),
  );

  return rows.map((row) => {
    const itemMods = modsByItem.get(row.item.id) ?? [];
    return {
      id: row.item.id,
      title: resolveProductTitle(
        row.product.translations,
        input.locale,
        row.product.sku,
      ),
      sku: row.product.sku,
      imageUrl: imageByProduct.get(row.product.id) ?? null,
      quantity: row.item.quantity,
      unitPriceAmount: row.item.unitAmount,
      lineTotalAmount: row.item.lineTotalAmount,
      currency: input.currency,
      modifiers: itemMods.flatMap((mod) => {
        if (
          mod.kindSnapshot !== "ADDITION" &&
          mod.kindSnapshot !== "EXCEPTION"
        ) {
          return [];
        }
        return [
          {
            id: mod.id,
            kind: mod.kindSnapshot,
            name: mod.nameSnapshot,
            unitPriceAmount: mod.priceAmountSnapshot,
          },
        ];
      }),
    };
  });
}
