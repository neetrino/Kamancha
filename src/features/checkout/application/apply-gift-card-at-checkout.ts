import { eq } from "drizzle-orm";

import { giftCards } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import { redeemGiftCardForOrder } from "@/features/gift-cards/application/gift-card-ledger";
import {
  calculateGiftCardRedeemAmount,
  giftCardRedeemErrorMessage,
  isGiftCardRedeemable,
  normalizeGiftCardCode,
} from "@/features/gift-cards/domain/gift-card-rules";

export type CheckoutGiftCardApplication = {
  giftCardId: string | null;
  giftCardCodeSnapshot: string | null;
  giftCardAmount: number;
};

const EMPTY_GIFT_CARD: CheckoutGiftCardApplication = {
  giftCardId: null,
  giftCardCodeSnapshot: null,
  giftCardAmount: 0,
};

/** Locks a gift card row and quotes the redeemable amount for this checkout. */
export async function lockAndQuoteGiftCardForCheckout(
  tx: DbTransaction,
  rawCode: string | undefined,
  payableBeforeGiftCard: number,
): Promise<CheckoutGiftCardApplication> {
  if (!rawCode?.trim()) {
    return EMPTY_GIFT_CARD;
  }

  const code = normalizeGiftCardCode(rawCode);
  const [card] = await tx
    .select()
    .from(giftCards)
    .where(eq(giftCards.code, code))
    .for("update")
    .limit(1);

  if (
    !card ||
    !isGiftCardRedeemable({
      status: card.status,
      balanceAmount: card.balanceAmount,
      expiresAt: card.expiresAt,
    })
  ) {
    throw new Error(
      giftCardRedeemErrorMessage({
        found: Boolean(card),
        status: card?.status,
        balanceAmount: card?.balanceAmount,
        expiresAt: card?.expiresAt ?? null,
      }),
    );
  }

  const giftCardAmount = calculateGiftCardRedeemAmount({
    balanceAmount: card.balanceAmount,
    payableBeforeGiftCard,
  });
  if (giftCardAmount <= 0) {
    throw new Error("Gift card cannot be applied to this order.");
  }

  return {
    giftCardId: card.id,
    giftCardCodeSnapshot: card.code,
    giftCardAmount,
  };
}

/** Persists the checkout redeem on the gift-card ledger. */
export async function persistCheckoutGiftCardRedeem(input: {
  tx: DbTransaction;
  application: CheckoutGiftCardApplication;
  orderId: string;
  correlationId: string;
}): Promise<void> {
  const { application } = input;
  if (!application.giftCardId || application.giftCardAmount <= 0) {
    return;
  }
  await redeemGiftCardForOrder({
    tx: input.tx,
    giftCardId: application.giftCardId,
    orderId: input.orderId,
    amount: application.giftCardAmount,
    correlationId: input.correlationId,
  });
}
