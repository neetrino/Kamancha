import { notFound } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { getStorefrontCart } from "@/features/cart/get-storefront-cart";
import {
  removeStorefrontCartItem,
  updateStorefrontCartItem,
} from "@/features/cart/storefront-cart-mutations";
import { buildInvitePath } from "@/features/group-orders/application/money";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type CartPageProps = { params: Promise<{ locale: string }> };

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const bag = await getStorefrontCart();
  const labels = getDictionary(locale).cartDrawer;
  const total = bag.items.reduce(
    (sum, line) => sum + line.quantity * line.unitAmount,
    0,
  );
  const checkoutHref = bag.inviteToken
    ? buildInvitePath(locale, bag.inviteToken)
    : `/${locale}/checkout`;
  const checkoutLabel =
    bag.source === "group" ? labels.checkoutGroupOrder : labels.checkout;

  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-3xl font-semibold">{labels.title}</h1>
      {bag.items.map((line) => {
        const additions = line.modifiers.filter((row) => row.kind === "ADDITION");
        const exceptions = line.modifiers.filter(
          (row) => row.kind === "EXCEPTION",
        );
        return (
          <div
            className="flex items-center justify-between border p-3"
            key={line.id}
          >
            <div>
              <p>
                {line.product.translations[locale]?.title ?? line.product.sku}
              </p>
              {additions.length > 0 ? (
                <p className="text-xs text-gray-600">
                  + {additions.map((row) => row.name).join(", ")}
                </p>
              ) : null}
              {exceptions.length > 0 ? (
                <p className="text-xs text-gray-600">
                  − {exceptions.map((row) => row.name).join(", ")}
                </p>
              ) : null}
              <p className="text-sm">
                {line.unitAmount} AMD × {line.quantity}
              </p>
            </div>
            {bag.canEdit ? (
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await updateStorefrontCartItem(line.id, line.quantity - 1);
                  }}
                >
                  <button className="border px-2">−</button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await updateStorefrontCartItem(line.id, line.quantity + 1);
                  }}
                >
                  <button className="border px-2">+</button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await removeStorefrontCartItem(line.id);
                  }}
                >
                  <button className="text-red-700">{labels.removeItem}</button>
                </form>
              </div>
            ) : null}
          </div>
        );
      })}
      <p className="font-medium">
        {labels.total}: {total} AMD
      </p>
      {bag.items.length ? (
        <AppLink
          href={checkoutHref}
          prefetchPolicy="intent"
          className="bg-[var(--accent)] px-4 py-2 text-center text-[var(--accent-foreground)]"
        >
          {checkoutLabel}
        </AppLink>
      ) : (
        <p>{labels.empty}</p>
      )}
    </section>
  );
}
