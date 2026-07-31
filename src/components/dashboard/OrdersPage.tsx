"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  MapPin,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
} from "lucide-react";
import { ProductMedia } from "@/components/shared/ProductMedia";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { useCartOptional } from "@/lib/cart-store";
import {
  fetchMyOrder,
  fetchMyOrders,
  type ApiOrderDetail,
  type ApiOrderRow,
  type OrderStatus,
} from "@/lib/orders-api";
import { cn, formatCurrency } from "@/lib/utils";

const STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "primary" | "accent" | "success" | "warning" | "danger"
> = {
  processing: "warning",
  printing: "primary",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
};

const TIMELINE_STEPS: OrderStatus[] = [
  "processing",
  "printing",
  "shipped",
  "delivered",
];

const FILTER_CHIPS: Array<{ key: "all" | OrderStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "processing", label: "Processing" },
  { key: "printing", label: "Printing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function stepIndex(status: OrderStatus) {
  if (status === "cancelled") return -1;
  return TIMELINE_STEPS.indexOf(status);
}

function formatOrderDate(date: string) {
  const d = new Date(date.length === 10 ? `${date}T12:00:00` : date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
        This order was cancelled
      </div>
    );
  }

  const active = stepIndex(status);

  return (
    <div className="overflow-x-auto">
      <ol className="flex min-w-[280px] items-start gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= active;
          const current = i === active;
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center">
              {i < TIMELINE_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-1/2 top-2.5 h-0.5 w-full",
                    i < active ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  "relative z-[1] flex h-5 w-5 items-center justify-center rounded-full border-2 text-[9px] font-bold",
                  done
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-text-secondary",
                  current && "ring-4 ring-primary/15",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "mt-1.5 text-center text-[10px] font-semibold capitalize",
                  done ? "text-secondary" : "text-text-secondary",
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OrderCard({
  order,
  expanded,
  detail,
  detailLoading,
  onToggle,
  onReorder,
}: {
  order: ApiOrderRow;
  expanded: boolean;
  detail: ApiOrderDetail | null;
  detailLoading: boolean;
  onToggle: () => void;
  onReorder: () => void;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow duration-200",
        expanded ? "shadow-card border-primary/20" : "hover:shadow-card",
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-[#f3f4f6] sm:h-24 sm:w-24">
            <ProductMedia
              imageUrl={order.imageUrl ?? undefined}
              fallbackVariant="business-cards"
              label={order.product}
              className="absolute inset-0 h-full w-full"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-secondary">{order.id}</p>
                  <Badge
                    variant={STATUS_VARIANT[order.status] ?? "default"}
                    className="capitalize"
                  >
                    {order.status}
                  </Badge>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-text-primary">
                  {order.product}
                  {order.itemCount > 1 ? (
                    <span className="font-medium text-text-secondary">
                      {" "}
                      +{order.itemCount - 1} more
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs font-medium text-text-secondary">
                  {formatOrderDate(order.date)} · Qty {order.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-secondary">
                  {formatCurrency(order.total)}
                </p>
                <p className="text-[11px] font-medium text-text-secondary">
                  Order total
                </p>
              </div>
            </div>

            <OrderTimeline status={order.status} />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={onToggle}
                aria-expanded={expanded}
              >
                {expanded ? "Hide details" : "View details"}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1.5"
                onClick={onReorder}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reorder
              </Button>
              {order.productSlug ? (
                <Link href={`/products/${order.productSlug}`}>
                  <Button type="button" size="sm" variant="ghost">
                    View product
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {expanded ? (
          <div className="border-t border-border bg-secondary/[0.02] px-4 py-4 sm:px-5">
            {detailLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-xl bg-border/40"
                  />
                ))}
              </div>
            ) : detail ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Items
                  </h4>
                  <ul className="space-y-3">
                    {detail.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-3 rounded-xl border border-border bg-card p-3"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-[#f3f4f6]">
                          <ProductMedia
                            imageUrl={item.imageUrl ?? undefined}
                            fallbackVariant={item.image || "business-cards"}
                            label={item.name}
                            className="absolute inset-0 h-full w-full"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-secondary">
                            {item.name}
                          </p>
                          <p className="mt-0.5 text-xs text-text-secondary">
                            {[item.size, item.material, item.finishing]
                              .filter(Boolean)
                              .join(" · ") || "Standard options"}
                          </p>
                          <p className="mt-1 text-xs font-medium text-text-secondary">
                            Qty {item.quantity} ·{" "}
                            {formatCurrency(item.unitPrice * item.quantity)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                    <div className="flex justify-between text-text-secondary">
                      <span>Subtotal</span>
                      <span>{formatCurrency(detail.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Shipping</span>
                      <span>{formatCurrency(detail.shipping)}</span>
                    </div>
                    {detail.tax > 0 ? (
                      <div className="flex justify-between text-text-secondary">
                        <span>Tax</span>
                        <span>{formatCurrency(detail.tax)}</span>
                      </div>
                    ) : null}
                    {detail.discount > 0 ? (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-{formatCurrency(detail.discount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between pt-1 text-base font-bold text-secondary">
                      <span>Total</span>
                      <span>{formatCurrency(detail.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                      <MapPin className="h-3.5 w-3.5" />
                      Shipping
                    </h4>
                    <p className="text-sm font-semibold text-secondary">
                      {detail.shippingName || "—"}
                    </p>
                    {detail.shippingEmail ? (
                      <p className="text-xs text-text-secondary">
                        {detail.shippingEmail}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm text-text-secondary">
                      {[
                        detail.shippingAddress,
                        detail.shippingCity,
                        detail.shippingState,
                        detail.shippingZip,
                      ]
                        .filter(Boolean)
                        .join(", ") || "No address on file"}
                    </p>
                    {detail.shippingMethod ? (
                      <p className="mt-2 text-xs font-medium text-text-secondary">
                        Method: {detail.shippingMethod}
                      </p>
                    ) : null}
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Payment
                    </h4>
                    <p className="text-sm font-semibold capitalize text-secondary">
                      {detail.paymentMethod?.replace(/_/g, " ") || "—"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                Could not load order details.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function OrdersPage() {
  const router = useRouter();
  const cart = useCartOptional();
  const { toast } = useToast();

  const [orders, setOrders] = useState<ApiOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ApiOrderDetail>>({});
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchMyOrders()
      .then((res) => {
        if (!cancelled) setOrders(res.data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load orders");
          setOrders([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length };
    for (const o of orders) {
      map[o.status] = (map[o.status] ?? 0) + 1;
    }
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        (o.productSlug ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, query, statusFilter]);

  const loadDetail = useCallback(
    async (order: ApiOrderRow) => {
      if (details[order.dbId]) return;
      setDetailLoadingId(order.dbId);
      try {
        const res = await fetchMyOrder(order.dbId);
        setDetails((prev) => ({ ...prev, [order.dbId]: res.data }));
      } catch (e: unknown) {
        toast({
          title: "Could not load details",
          description: e instanceof Error ? e.message : "Try again",
          tone: "danger",
        });
      } finally {
        setDetailLoadingId(null);
      }
    },
    [details, toast],
  );

  const onToggle = useCallback(
    (order: ApiOrderRow) => {
      const next = expandedId === order.dbId ? null : order.dbId;
      setExpandedId(next);
      if (next) void loadDetail(order);
    },
    [expandedId, loadDetail],
  );

  const onReorder = useCallback(
    async (order: ApiOrderRow) => {
      try {
        let detail = details[order.dbId];
        if (!detail) {
          const res = await fetchMyOrder(order.dbId);
          detail = res.data;
          setDetails((prev) => ({ ...prev, [order.dbId]: detail! }));
        }
        const item = detail.items[0];
        if (!item) {
          toast({
            title: "Nothing to reorder",
            tone: "danger",
          });
          return;
        }
        if (cart) {
          await cart.addItem({
            productId: item.productId ?? undefined,
            productSlug: item.productSlug ?? undefined,
            name: item.name,
            image: item.image,
            imageUrl: item.imageUrl ?? undefined,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            size: item.size,
            material: item.material,
            finishing: item.finishing,
          });
          toast({
            title: "Added to cart",
            description: `${item.name} is ready to checkout`,
            tone: "success",
          });
          router.push("/cart");
        } else if (item.productSlug) {
          router.push(`/products/${item.productSlug}`);
        } else {
          router.push("/products");
        }
      } catch (e: unknown) {
        toast({
          title: "Reorder failed",
          description: e instanceof Error ? e.message : "Try again",
          tone: "danger",
        });
      }
    },
    [cart, details, router, toast],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-border/50"
            />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-border bg-border/30"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="Couldn't load orders"
        description={error}
        action={
          <Button type="button" onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      />
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag className="h-6 w-6" />}
        title="No orders yet"
        description="When you place a print job, you'll track production and delivery here."
        action={
          <Link href="/products">
            <Button>Browse products</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => {
          const count = counts[chip.key] ?? 0;
          if (chip.key !== "all" && count === 0) return null;
          const active = statusFilter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setStatusFilter(chip.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus-ring",
                active
                  ? "border-primary bg-primary text-white shadow-soft"
                  : "border-border bg-card text-text-secondary hover:border-primary/30 hover:text-primary",
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active ? "bg-white/20 text-white" : "bg-secondary/5 text-secondary",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by order ID or product…"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm font-medium text-text-primary shadow-soft outline-none placeholder:text-text-secondary focus:border-primary/40 focus-ring"
            aria-label="Search orders"
          />
        </div>
        <p className="text-xs font-semibold text-text-secondary">
          Showing {filtered.length} of {orders.length} order
          {orders.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No matching orders"
          description="Try another status filter or clear your search."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.dbId}
              order={order}
              expanded={expandedId === order.dbId}
              detail={details[order.dbId] ?? null}
              detailLoading={detailLoadingId === order.dbId}
              onToggle={() => onToggle(order)}
              onReorder={() => void onReorder(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
