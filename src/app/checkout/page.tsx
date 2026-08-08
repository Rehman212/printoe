"use client";

import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useSiteSettingsState } from "@/components/settings/SiteSettingsProvider";

function CheckoutGate() {
  const { site, loading } = useSiteSettingsState();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-text-secondary">
        Loading checkout…
      </div>
    );
  }

  const flow = (
    <Suspense
      fallback={
        <div className="px-6 py-16 text-center text-sm text-text-secondary">
          Loading checkout…
        </div>
      }
    >
      <CheckoutFlow />
    </Suspense>
  );

  if (site.allowGuestCheckout) {
    return flow;
  }

  return <RequireAuth role="CUSTOMER">{flow}</RequireAuth>;
}

export default function CheckoutPage() {
  return <CheckoutGate />;
}
