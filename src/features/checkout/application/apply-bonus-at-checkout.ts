import { eq } from "drizzle-orm";

import { users } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import { redeemBonusesForOrder } from "@/features/bonuses/application/bonus-ledger";
import {
  calculateMaxRedeemAmount,
  clampBonusRedeemRequest,
} from "@/features/bonuses/domain/bonus-rules";
import { getStoreBonusSettings } from "@/features/settings/application/queries";

/** Locks the customer row and quotes a valid bonus redeem for this checkout. */
export async function lockAndQuoteBonusForCheckout(
  tx: DbTransaction,
  input: {
    userId: string | undefined;
    requestedAmount: number | undefined;
    merchandiseAfterDiscount: number;
  },
): Promise<number> {
  const requested = input.requestedAmount ?? 0;
  if (requested <= 0) {
    return 0;
  }
  if (!input.userId) {
    throw new Error("Bonuses are available for registered customers only.");
  }

  const bonusSettings = await getStoreBonusSettings();
  const [lockedCustomer] = await tx
    .select({
      id: users.id,
      bonusBalance: users.bonusBalance,
    })
    .from(users)
    .where(eq(users.id, input.userId))
    .for("update")
    .limit(1);

  if (!lockedCustomer) {
    throw new Error("Unable to apply bonuses.");
  }

  const maxRedeem = calculateMaxRedeemAmount({
    eligibleMerchandiseAmount: input.merchandiseAfterDiscount,
    availableBalance: lockedCustomer.bonusBalance,
    maxRedeemPercent: bonusSettings.maxRedeemPercent,
  });
  return clampBonusRedeemRequest(requested, maxRedeem);
}

/** Persists the checkout bonus debit on the loyalty ledger. */
export async function persistCheckoutBonusRedeem(input: {
  tx: DbTransaction;
  userId: string;
  orderId: string;
  amount: number;
  correlationId: string;
}): Promise<void> {
  if (input.amount <= 0) {
    return;
  }
  await redeemBonusesForOrder({
    tx: input.tx,
    userId: input.userId,
    orderId: input.orderId,
    amount: input.amount,
    correlationId: input.correlationId,
  });
}
