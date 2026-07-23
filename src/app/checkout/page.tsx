import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="px-6 py-16 text-center text-sm text-text-secondary">
            Loading checkout…
          </div>
        }
      >
        <CheckoutFlow />
      </Suspense>
    </RequireAuth>
  );
}
