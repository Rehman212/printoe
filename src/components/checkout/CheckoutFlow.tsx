"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  Package,
  Tag,
  Truck,
  Wallet,
} from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { fetchProductBySlug } from "@/lib/products-api";
import { placeCheckout } from "@/lib/orders-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn, formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  Input,
  ProgressSteps,
  Section,
  SectionHeader,
  useToast,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Misc";

const STEPS = ["Shipping", "Payment", "Review"];
const TAX_RATE = 0.0825;
const COUPONS: Record<string, number> = { PRESS10: 0.1, WELCOME15: 0.15 };

const shippingMethods = [
  {
    id: "standard",
    name: "Standard",
    description: "5–7 business days",
    price: 12.99,
    icon: Truck,
  },
  {
    id: "express",
    name: "Express",
    description: "2–3 business days",
    price: 24.99,
    icon: Package,
  },
  {
    id: "overnight",
    name: "Overnight",
    description: "Next business day",
    price: 49.99,
    icon: MapPin,
  },
];

const paymentMethods = [
  { id: "card", name: "Credit / Debit Card", icon: CreditCard },
  { id: "invoice", name: "Net 30 Invoice", icon: Building2 },
  { id: "wallet", name: "Digital Wallet", icon: Wallet },
];

export function CheckoutFlow() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { items: cartItems, loading: cartLoading, clearCart, refresh } =
    useCart();
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [queryLine, setQueryLine] = useState<CartItem | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  const productSlug = searchParams.get("product");
  const artworkFile = searchParams.get("file");

  useEffect(() => {
    if (user?.email || user?.name) {
      const parts = (user.name || "").trim().split(/\s+/);
      setForm((f) => ({
        ...f,
        email: f.email || user.email || "",
        firstName: f.firstName || parts[0] || "",
        lastName: f.lastName || parts.slice(1).join(" ") || "",
      }));
    }
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (!productSlug || cartItems.length > 0) return;
    let cancelled = false;
    void fetchProductBySlug(productSlug)
      .then((res) => {
        if (cancelled) return;
        const p = res.data.product;
        setQueryLine({
          id: `query-${p.slug}`,
          productId: p.id,
          name: p.name,
          image: p.category.slug,
          quantity: 1,
          unitPrice: p.basePrice,
          size: "—",
          material: "—",
          finishing: "—",
        });
      })
      .catch(() => {
        /* ignore — empty cart handled below */
      });
    return () => {
      cancelled = true;
    };
  }, [productSlug, cartItems.length]);

  const lineItems = cartItems.length > 0 ? cartItems : queryLine ? [queryLine] : [];

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [lineItems],
  );
  const discountRate = appliedCoupon ? COUPONS[appliedCoupon] ?? 0 : 0;
  const discount = subtotal * discountRate;
  const shippingCost =
    shippingMethods.find((m) => m.id === shippingMethod)?.price ?? 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * TAX_RATE;
  const total = taxable + shippingCost + tax;

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      toast({
        title: "Coupon applied",
        description: `${Math.round(COUPONS[code] * 100)}% discount`,
        tone: "success",
      });
    } else {
      toast({ title: "Invalid coupon", tone: "warning" });
    }
  };

  const placeOrder = async () => {
    if (!lineItems.length) {
      toast({
        title: "Cart empty",
        description: "Add a product before placing an order.",
        tone: "warning",
      });
      return;
    }
    setPlacing(true);
    try {
      const res = await placeCheckout({
        items: lineItems.map((i) => ({
          productId: i.productId,
          productSlug: productSlug || undefined,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          size: i.size,
          material: i.material,
          finishing: i.finishing,
        })),
        subtotal,
        shipping: shippingCost,
        tax,
        discount,
        total,
        shippingName: `${form.firstName} ${form.lastName}`.trim() || user?.name,
        shippingEmail: form.email || user?.email,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingState: form.state,
        shippingZip: form.zip,
        shippingMethod,
        paymentMethod,
        artworkFile: artworkFile || undefined,
        clearCart: cartItems.length > 0,
      });
      setOrderNumber(res.data.orderId);
      setConfirmed(true);
      await clearCart().catch(() => undefined);
      await refresh().catch(() => undefined);
      toast({
        title: "Order confirmed",
        description: `Order ${res.data.orderId} saved — visible in admin Orders.`,
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Checkout failed",
        description:
          err instanceof Error ? err.message : "Could not place order.",
        tone: "danger",
      });
    } finally {
      setPlacing(false);
    }
  };

  if (confirmed) {
    return (
      <Section className="pb-20 pt-8">
        <Container size="narrow">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Order confirmed</h1>
            <p className="mt-3 text-sm font-medium text-text-secondary">
              Thank you for your order. Your print production has been queued and
              you&apos;ll receive tracking once shipped.
            </p>
            <p className="mt-2 text-sm font-bold text-text-primary">
              Order #{orderNumber}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/products">
                <Button variant="outline">Continue shopping</Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="outline">View in admin</Button>
              </Link>
              <Link href="/">
                <Button>Back to home</Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </Section>
    );
  }

  if (cartLoading && !queryLine) {
    return (
      <Section className="pb-20 pt-8">
        <Container size="narrow">
          <p className="text-sm text-text-secondary">Loading checkout…</p>
        </Container>
      </Section>
    );
  }

  if (!lineItems.length) {
    return (
      <Section className="pb-20 pt-8">
        <Container size="narrow">
          <Card>
            <CardContent className="space-y-4 pt-8 text-center">
              <h1 className="text-xl font-bold">Your cart is empty</h1>
              <p className="text-sm text-text-secondary">
                Add products to cart, then return to checkout.
              </p>
              <Link href="/products">
                <Button>Browse products</Button>
              </Link>
            </CardContent>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pb-20 pt-8">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart", href: "/cart" },
            { label: "Checkout" },
          ]}
        />

        <SectionHeader
          align="left"
          eyebrow="Secure checkout"
          title="Complete your order"
          description="Enterprise-grade encryption protects your payment details."
        />

        <div className="mb-10">
          <ProgressSteps steps={STEPS} current={step} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            {step === 0 ? (
              <Card>
                <CardContent className="space-y-5 pt-6">
                  <h2 className="text-lg font-bold text-text-primary">
                    Shipping information
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="First name"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, firstName: e.target.value }))
                      }
                    />
                    <Input
                      label="Last name"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lastName: e.target.value }))
                      }
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <Input
                    label="Street address"
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Input
                      label="City"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    />
                    <Input
                      label="State"
                      value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    />
                    <Input
                      label="ZIP code"
                      value={form.zip}
                      onChange={(e) => setForm((f) => ({ ...f, zip: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-text-primary">
                      Shipping method
                    </h3>
                    {shippingMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setShippingMethod(method.id)}
                        className={cn(
                          "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all focus-ring",
                          shippingMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/30",
                        )}
                      >
                        <method.icon className="h-5 w-5 shrink-0 text-primary" />
                        <div className="flex-1">
                          <p className="font-bold text-text-primary">{method.name}</p>
                          <p className="text-xs font-medium text-text-secondary">
                            {method.description}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-text-primary">
                          {formatCurrency(method.price)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <Button className="w-full sm:w-auto" onClick={() => setStep(1)}>
                    Continue to payment
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {step === 1 ? (
              <Card>
                <CardContent className="space-y-5 pt-6">
                  <h2 className="text-lg font-bold text-text-primary">
                    Payment method
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all focus-ring",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/30",
                        )}
                      >
                        <method.icon className="h-5 w-5 text-primary" />
                        <span className="font-bold text-text-primary">{method.name}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "card" ? (
                    <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
                      <Input
                        label="Card number"
                        placeholder="4242 4242 4242 4242"
                        value={form.cardNumber}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, cardNumber: e.target.value }))
                        }
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                          label="Expiry"
                          placeholder="MM/YY"
                          value={form.expiry}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, expiry: e.target.value }))
                          }
                        />
                        <Input
                          label="CVC"
                          placeholder="123"
                          value={form.cvc}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, cvc: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)}>
                      Back
                    </Button>
                    <Button onClick={() => setStep(2)}>Review order</Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {step === 2 ? (
              <Card>
                <CardContent className="space-y-5 pt-6">
                  <h2 className="text-lg font-bold text-text-primary">Review order</h2>

                  <div className="space-y-3 rounded-2xl border border-border bg-background p-4 text-sm font-semibold">
                    <p className="text-text-secondary">
                      Ship to{" "}
                      <span className="text-text-primary">
                        {form.firstName} {form.lastName}, {form.city}
                      </span>
                    </p>
                    <p className="text-text-secondary">
                      Shipping{" "}
                      <span className="text-text-primary">
                        {shippingMethods.find((m) => m.id === shippingMethod)?.name}
                      </span>
                    </p>
                    <p className="text-text-secondary">
                      Payment{" "}
                      <span className="text-text-primary">
                        {paymentMethods.find((m) => m.id === paymentMethod)?.name}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    {lineItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-bold text-text-primary">{item.name}</p>
                          <p className="text-xs font-medium text-text-secondary">
                            Qty {item.quantity.toLocaleString()} · {item.size}
                          </p>
                        </div>
                        <span className="font-bold text-text-primary">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => void placeOrder()} disabled={placing}>
                      <Lock className="h-4 w-4" />
                      {placing
                        ? "Placing order…"
                        : `Place order · ${formatCurrency(total)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardContent className="space-y-5 pt-6">
                <h2 className="text-lg font-bold text-text-primary">Order summary</h2>

                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm font-semibold"
                    >
                      <span className="text-text-secondary">{item.name}</span>
                      <span className="text-text-primary">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4 text-sm font-semibold">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {appliedCoupon ? (
                    <div className="flex justify-between text-success">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        {appliedCoupon}
                      </span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span>{formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax (8.25%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-text-primary">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={applyCoupon}>
                    Apply
                  </Button>
                </div>

                <Badge variant="success" className="w-full justify-center py-2">
                  <Lock className="mr-1 h-3.5 w-3.5" />
                  256-bit SSL encrypted
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}
