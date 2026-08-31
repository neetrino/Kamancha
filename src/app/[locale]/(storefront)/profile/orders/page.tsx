import Link from "next/link";
import { notFound } from "next/navigation";

import { listCustomerOrders } from "@/features/orders/application/queries";
import type { OrderStatus } from "@/features/orders/domain/order-status";
import {
  adminOrdersFilterSchema,
  type CustomerOrderKind,
} from "@/features/orders/schemas/change-status";
import { CustomerOrderKindFilter } from "@/features/orders/ui/CustomerOrderKindFilter";
import { CustomerOrdersFilters } from "@/features/orders/ui/CustomerOrdersFilters";
import { CustomerOrdersView } from "@/features/orders/ui/CustomerOrdersView";
import { claimGuestGroupOrderParticipantsForUser } from "@/features/group-orders/application/claim-guest-participants";
import {
  PROFILE_PAGE_TITLE,
} from "@/features/profile/ui/profile-surface";
import { requireUser } from "@/lib/auth/policies";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type OrdersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildOrdersQuery(
  filters: {
    q?: string;
    status?: OrderStatus;
    paymentStatus?: string;
    kind: CustomerOrderKind;
    page: number;
  },
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
  if (filters.kind !== "all") params.set("kind", filters.kind);
  params.set("page", String(page));
  return params.toString();
}

export default async function OrdersPage({
  params,
  searchParams,
}: OrdersPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const user = await requireUser(locale);
  await claimGuestGroupOrderParticipantsForUser(user.id);
  const dictionary = getDictionary(locale);

  const raw = await searchParams;
  const parsed = adminOrdersFilterSchema.safeParse({
    status: firstParam(raw.status) || undefined,
    paymentStatus: firstParam(raw.paymentStatus) || undefined,
    archived: "active",
    q: firstParam(raw.q) || undefined,
    kind: firstParam(raw.kind) || "all",
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? { ...parsed.data, kind: parsed.data.kind ?? ("all" as const) }
    : {
        page: 1 as const,
        archived: "active" as const,
        status: undefined,
        paymentStatus: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        q: undefined,
        kind: "all" as const,
      };

  const { rows, total, pageSize } = await listCustomerOrders(user.id, filters);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="profile-sheet-keep-frame space-y-6">
      <h1 className={PROFILE_PAGE_TITLE}>{dictionary.profile.orders}</h1>

      <CustomerOrderKindFilter
        locale={locale}
        active={filters.kind}
        baseQuery={{
          q: filters.q,
          status: filters.status,
          paymentStatus: filters.paymentStatus,
        }}
        labels={{
          all: dictionary.profile.ordersKindAll,
          personal: dictionary.profile.ordersKindPersonal,
          group: dictionary.profile.ordersKindGroup,
          aria: dictionary.profile.ordersKindAria,
        }}
      />

      <div className="hidden xl:block">
        <CustomerOrdersFilters
          total={total}
          totalLabel={dictionary.profile.totalOrders}
          status={filters.status}
          paymentStatus={filters.paymentStatus}
          kind={filters.kind}
          q={filters.q}
          copy={dictionary.admin.orders.filters}
          searchPlaceholder={dictionary.profile.ordersSearchPlaceholder}
          searchAria={dictionary.profile.ordersSearchAria}
        />
      </div>

      <CustomerOrdersView
        locale={locale}
        orders={rows}
        copy={dictionary.admin}
        profileCopy={{
          orderNumber: dictionary.profile.orderNumber,
          itemCountOne: dictionary.profile.itemCountOne,
          itemCountOther: dictionary.profile.itemCountOther,
          placedOn: dictionary.profile.placedOn,
          viewDetails: dictionary.profile.viewDetails,
          noOrders: dictionary.profile.noOrders,
          startShopping: dictionary.profile.startShopping,
          groupOrderBadge: dictionary.profile.groupOrderBadge,
        }}
      />

      {totalPages > 1 ? (
        <nav className="flex items-center gap-3 font-big-fat-boii text-sm font-normal tracking-wide text-gray-800 uppercase xl:text-white/80">
          {filters.page > 1 ? (
            <Link
              href={`/${locale}/profile/orders?${buildOrdersQuery(filters, filters.page - 1)}`}
              className="transition-opacity hover:opacity-80"
            >
              Previous
            </Link>
          ) : null}
          <span>
            Page {filters.page} / {totalPages}
          </span>
          {filters.page < totalPages ? (
            <Link
              href={`/${locale}/profile/orders?${buildOrdersQuery(filters, filters.page + 1)}`}
              className="transition-opacity hover:opacity-80"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
