"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { ProductVisual } from "@/components/shared/ProductVisual";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  EmptyState,
  Input,
  Section,
  SectionHeader,
  useToast,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Misc";

const COUPONS: Record<string, number> = {
  PRESS10: 0.1,
  WELCOME15: 0.15,
};

export function CartView() {
  const { toast } = useToast();
  const { items, subtotal, updateQuantity, removeItem, loading } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const discountRate = appliedCoupon ? COUPONS[appliedCoupon] ?? 0 : 0;
  const discount = subtotal * discountRate;
  const shipping = subtotal > 150 || items.length === 0 ? 0 : 12.99;
  const total = subtotal - discount + shipping;

  const lineCount = useMemo(() => items.length, [items.length]);

  const onQty = async (id: string, next: number) => {
    if (next < 1) {
      await removeItem(id);
      toast({ title: "Item removed", tone: "info" });
      return;
    }
    try {
      await updateQuantity(id, next);
    } catch (err) {
      toast({
        title: "Could not update quantity",
        description: err instanceof Error ? err.message : "Try again",
        tone: "danger",
      });
    }
  };

  const onRemove = async (id: string) => {
    try {
      await removeItem(id);
      toast({ title: "Item removed", tone: "info" });
    } catch (err) {
      toast({
        title: "Remove failed",
        description: err instanceof Error ? err.message : "Try again",
        tone: "danger",
      });
    }
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      toast({
        title: "Coupon applied",
        description: `${Math.round(COUPONS[code] * 100)}% off your order`,
        tone: "success",
      });
    } else {
      toast({ title: "Invalid coupon code", tone: "warning" });
    }
  };

  return (
    <Section className="pb-20 pt-8">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Cart" },
          ]}
        />

        <SectionHeader
          align="left"
          eyebrow="Your order"
          title="Shopping cart"
          description={
            loading
              ? "Loading cart…"
              : `${lineCount} item${lineCount === 1 ? "" : "s"} ready for checkout`
          }
        />

        {!loading && items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Your cart is empty"
            description="Browse our catalog and configure your next print run."
            action={
              <Link href="/products">
                <Button>Shop products</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                    <ProductVisual
                      variant={item.image}
                      className="h-28 w-full shrink-0 sm:h-24 sm:w-28"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-text-primary">
                            {item.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {item.size && item.size !== "—" ? (
                              <Badge variant="outline">{item.size}</Badge>
                            ) : null}
                            {item.material && item.material !== "—" ? (
                              <Badge variant="outline">{item.material}</Badge>
                            ) : null}
                            {item.finishing && item.finishing !== "—" ? (
                              <Badge variant="outline">{item.finishing}</Badge>
                            ) : null}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-text-secondary hover:text-danger"
                          onClick={() => void onRemove(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => void onQty(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-12 text-center text-sm font-bold text-text-primary">
                            {item.quantity.toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => void onQty(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-lg font-bold text-text-primary">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card>
                <CardContent className="space-y-5 pt-6">
                  <h2 className="text-lg font-bold text-text-primary">
                    Order summary
                  </h2>

                  <div className="space-y-3 text-sm font-semibold">
                    <div className="flex justify-between text-text-secondary">
                      <span>Subtotal</span>
                      <span className="text-text-primary">
                        {formatCurrency(subtotal)}
                      </span>
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
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Shipping
                      </span>
                      <span className={cn(shipping === 0 && "text-success")}>
                        {shipping === 0 ? "Free" : formatCurrency(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3 text-base">
                      <span className="text-text-primary">Total</span>
                      <span className="font-bold text-text-primary">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={applyCoupon}>
                      Apply
                    </Button>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full" size="lg" disabled={!items.length}>
                      Proceed to checkout
                    </Button>
                  </Link>

                  <Link
                    href="/products"
                    className="block text-center text-sm font-semibold text-primary hover:underline"
                  >
                    Continue shopping
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
