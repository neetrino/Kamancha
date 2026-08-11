import { Suspense } from "react";
import { headers } from "next/headers";

import { getMaintenanceGateState } from "@/lib/maintenance/gate";

type MaintenanceGateProps = {
  children: React.ReactNode;
};

async function MaintenanceGateInner({ children }: MaintenanceGateProps) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const state = await getMaintenanceGateState(pathname);

  if (state.showMaintenance) {
    return (
      <section className="flex flex-col items-center gap-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Maintenance</h1>
        <p className="max-w-md text-neutral-600">
          {state.message ??
            "We are temporarily unavailable. Please check back soon."}
        </p>
      </section>
    );
  }

  return children;
}

/**
 * Storefront maintenance check — does not block first paint.
 * Page content streams as the Suspense fallback while the gate resolves.
 */
export function MaintenanceGate({ children }: MaintenanceGateProps) {
  return (
    <Suspense fallback={children}>
      <MaintenanceGateInner>{children}</MaintenanceGateInner>
    </Suspense>
  );
}
