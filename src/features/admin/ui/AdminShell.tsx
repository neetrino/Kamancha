"use client";

import type { ReactNode } from "react";

import { AdminPageReveal } from "@/features/admin/ui/AdminPageReveal";
import { AdminSidebar } from "@/features/admin/ui/AdminSidebar";
import { AdminSidebarCollapseProvider } from "@/features/admin/ui/AdminSidebarCollapseContext";
import {
  ADMIN_MAIN_COLUMN,
  ADMIN_MAIN_INNER,
  ADMIN_PAGE_SHELL,
} from "@/features/admin/ui/admin-shell-classes";
import { AdminNewOrderAlert } from "@/features/orders/ui/AdminNewOrderAlert";
import { AdminOrderAlertsProvider } from "@/features/orders/ui/AdminOrderAlertsContext";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminShellProps = {
  locale: Locale;
  copy: Dictionary["admin"];
  children: ReactNode;
};

export function AdminShell({ locale, copy, children }: AdminShellProps) {
  return (
    <AdminSidebarCollapseProvider>
      <AdminOrderAlertsProvider locale={locale}>
        <div className={ADMIN_PAGE_SHELL} data-admin-shell="">
          <AdminSidebar
            locale={locale}
            shell={copy.shell}
            nav={copy.nav}
            ordersBadgeAria={copy.orders.newAlert.badgeAria}
          />
          <div className={ADMIN_MAIN_COLUMN}>
            <div className={ADMIN_MAIN_INNER}>
              <AdminPageReveal>{children}</AdminPageReveal>
            </div>
          </div>
          <AdminNewOrderAlert locale={locale} copy={copy.orders.newAlert} />
        </div>
      </AdminOrderAlertsProvider>
    </AdminSidebarCollapseProvider>
  );
}
