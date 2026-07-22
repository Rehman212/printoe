import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutFlow />
    </RequireAuth>
  );
}
