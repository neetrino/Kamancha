"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { SideSheet } from "@/components/ui/SideSheet";
import { AdminDateTimePickerField } from "@/features/admin/ui/AdminDateTimePickerField";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
} from "@/features/admin/ui/admin-form-classes";
import {
  createPromotionAction,
  updatePromotionAction,
} from "@/features/promotions/application/upsert-promotion";
import type {
  AdminPromotionListItem,
  CouponUserOption,
} from "@/features/promotions/application/queries";
import type { DiscountType } from "@/features/promotions/domain/promotion-rules";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

type CouponDrawerCoupon = Pick<
  AdminPromotionListItem,
  | "id"
  | "code"
  | "discountType"
  | "discountValue"
  | "totalUsageLimit"
  | "endsAt"
  | "isActive"
  | "eligibleUserIds"
>;

type CouponDrawerCopy = {
  drawer: Dictionary["admin"]["coupons"]["drawer"];
  common: Dictionary["admin"]["common"];
};

type CouponDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  coupon?: CouponDrawerCoupon | null;
  userOptions: CouponUserOption[];
  copy: CouponDrawerCopy;
};

function toDateTimeLocal(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function CouponDrawer({
  locale,
  open,
  onClose,
  coupon = null,
  userOptions,
  copy,
}: CouponDrawerProps) {
  const router = useRouter();
  const isEdit = coupon != null;
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] =
    useState<DiscountType>("PERCENTAGE");
  const [value, setValue] = useState("10");
  const [quantity, setQuantity] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [userIds, setUserIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;

    if (coupon) {
      scheduleStateUpdate(setName, coupon.code ?? "");
      scheduleStateUpdate(setCode, coupon.code ?? "");
      scheduleStateUpdate(
        setDiscountType,
        coupon.discountType === "FIXED" ? "FIXED" : "PERCENTAGE",
      );
      scheduleStateUpdate(setValue, String(coupon.discountValue));
      scheduleStateUpdate(
        setQuantity,
        coupon.totalUsageLimit != null ? String(coupon.totalUsageLimit) : "",
      );
      scheduleStateUpdate(setExpiresAt, toDateTimeLocal(coupon.endsAt));
      scheduleStateUpdate(setUserIds, coupon.eligibleUserIds);
      scheduleStateUpdate(setError, null);
    } else {
      scheduleStateUpdate(setName, "");
      scheduleStateUpdate(setCode, "");
      scheduleStateUpdate(setDiscountType, "PERCENTAGE");
      scheduleStateUpdate(setValue, "10");
      scheduleStateUpdate(setQuantity, "1");
      scheduleStateUpdate(setExpiresAt, "");
      scheduleStateUpdate(setUserIds, []);
      scheduleStateUpdate(setError, null);
    }
  }, [open, coupon]);

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.drawer.editAria : copy.drawer.newAria}
      panelClassName="w-full max-w-md"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? copy.drawer.editTitle : copy.drawer.newTitle}
        </h2>
      </div>

      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const nextCode = (code.trim() || name.trim()).toUpperCase();
          if (!nextCode) {
            setError(copy.drawer.codeRequired);
            return;
          }

          const payload = {
            kind: "COUPON" as const,
            code: nextCode,
            productId: null,
            categoryId: null,
            discountType,
            discountValue: Number(value),
            maxDiscountAmount: null,
            minimumOrderAmount: null,
            totalUsageLimit: quantity ? Number(quantity) : null,
            perUserUsageLimit: null,
            priority: 0,
            allowStacking: false,
            isActive: coupon?.isActive ?? true,
            startsAt: null,
            endsAt: expiresAt ? new Date(expiresAt) : null,
            userIds,
          };

          startTransition(async () => {
            setError(null);
            const result =
              isEdit && coupon
                ? await updatePromotionAction(locale, coupon.id, payload)
                : await createPromotionAction(locale, payload);

            if (!result.ok) {
              setError(result.error.message);
              return;
            }

            onClose();
            router.refresh();
          });
        }}
      >
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={ADMIN_LABEL}>{copy.drawer.name}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={copy.drawer.namePlaceholder}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
            </label>
            <label>
              <span className={ADMIN_LABEL}>{copy.drawer.code}</span>
              <input
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.toUpperCase())
                }
                placeholder={copy.drawer.codePlaceholder}
                className={`${ADMIN_INPUT} uppercase`}
                disabled={isPending}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={ADMIN_LABEL}>{copy.drawer.discountType}</span>
              <SelectDropdown
                ariaLabel={copy.drawer.discountTypeAria}
                value={discountType}
                options={[
                  { label: copy.drawer.percentOff, value: "PERCENTAGE" },
                  { label: copy.drawer.fixedAmountAmd, value: "FIXED" },
                ]}
                disabled={isPending}
                deferChange={false}
                className="mt-1"
                onValueChange={(next) =>
                  setDiscountType(next as DiscountType)
                }
              />
            </div>
            <label>
              <span className={ADMIN_LABEL}>{copy.drawer.value}</span>
              <input
                type="number"
                min={1}
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
            </label>
          </div>

          <div className="grid items-stretch gap-4 sm:grid-cols-2">
            <label className="flex flex-col">
              <span className={`${ADMIN_LABEL} flex flex-1 items-end`}>
                {copy.drawer.quantity}
              </span>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
            </label>
            <label className="flex flex-col">
              <span className={`${ADMIN_LABEL} flex-1`}>
                {copy.drawer.expiresOptional}
              </span>
              <AdminDateTimePickerField
                value={expiresAt}
                onChange={setExpiresAt}
                disabled={isPending}
                locale={locale}
                common={copy.common}
              />
            </label>
          </div>

          <MultiSelectDropdown
            ariaLabel={copy.drawer.selectUsers}
            title={copy.drawer.selectUsers}
            emptyLabel={copy.drawer.allUsersCanUse}
            searchPlaceholder={copy.drawer.searchUsers}
            noResultsLabel={copy.drawer.noMatchingUsers}
            options={userOptions.map((user) => ({
              value: user.id,
              label: user.label,
              hint: user.email,
            }))}
            values={userIds}
            disabled={isPending}
            onValuesChange={setUserIds}
          />

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>

        <div className="flex items-center gap-4 border-t border-gray-200 px-5 py-4">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEdit
                ? copy.common.saving
                : copy.common.creating
              : isEdit
                ? copy.common.save
                : copy.common.create}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {copy.common.cancel}
          </button>
        </div>
      </form>
    </SideSheet>
  );
}
