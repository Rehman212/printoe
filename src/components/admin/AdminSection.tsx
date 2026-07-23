"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  adminCustomers,
  adminProofs,
  adminQuotes,
  type AdminProof,
  type AdminQuote,
} from "@/lib/admin-data";
import {
  fetchAdminOrder,
  fetchAdminOrders,
  updateAdminOrderStatus,
  type ApiOrderDetail,
  type ApiOrderRow,
  type OrderStatus,
} from "@/lib/orders-api";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { AdminCategories } from "@/components/admin/AdminCategories";

const ORDER_STATUSES: OrderStatus[] = [
  "processing",
  "printing",
  "shipped",
  "delivered",
  "cancelled",
];

export function AdminSection({ section }: { section: string }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<ApiOrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewDetail, setViewDetail] = useState<ApiOrderDetail | null>(null);
  const [quotes, setQuotes] = useState(adminQuotes);
  const [proofs, setProofs] = useState(adminProofs);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await fetchAdminOrders();
      setOrders(res.data);
    } catch (err) {
      setOrdersError(
        err instanceof Error ? err.message : "Could not load orders from API.",
      );
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (section === "orders") void loadOrders();
  }, [section, loadOrders]);

  const title = useMemo(() => {
    const map: Record<string, { title: string; description: string }> = {
      orders: {
        title: "Orders",
        description: "Update production status and fulfill customer print jobs.",
      },
      customers: {
        title: "Customers",
        description: "Accounts that order from Printoe.",
      },
      quotes: {
        title: "Quotes",
        description: "Approve or decline custom bulk quotations.",
      },
      proofs: {
        title: "Artwork Proofs",
        description: "Review customer uploads before printing.",
      },
      categories: {
        title: "Categories",
        description:
          "Add, edit, or remove storefront sections (Popular Products + catalog).",
      },
      settings: {
        title: "Settings",
        description: "Store branding, notifications, and admin preferences.",
      },
    };
    return map[section];
  }, [section]);

  if (!title) {
    return (
      <EmptyState
        title="Section not found"
        description="This admin page doesn't exist."
        action={
          <Link href="/admin">
            <Button>Back to overview</Button>
          </Link>
        }
      />
    );
  }

  async function setOrderStatus(id: string, status: OrderStatus) {
    const prev = orders;
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    try {
      const res = await updateAdminOrderStatus(id, status);
      setOrders((list) =>
        list.map((o) => (o.id === id ? res.data : o)),
      );
      if (viewDetail?.orderNumber === id) {
        setViewDetail((d) => (d ? { ...d, status } : d));
      }
      toast({
        title: "Order updated",
        description: `${id} → ${status}`,
        tone: "success",
      });
    } catch (err) {
      setOrders(prev);
      toast({
        title: "Status update failed",
        description:
          err instanceof Error ? err.message : "Could not update order.",
        tone: "danger",
      });
    }
  }

  async function openViewOrder(id: string) {
    setViewOpen(true);
    setViewLoading(true);
    setViewDetail(null);
    try {
      const res = await fetchAdminOrder(id);
      setViewDetail(res.data);
    } catch (err) {
      toast({
        title: "Could not load order",
        description:
          err instanceof Error ? err.message : "Order details unavailable.",
        tone: "danger",
      });
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  }

  function setQuoteStatus(id: string, status: AdminQuote["status"]) {
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status } : q)),
    );
    toast({
      title: "Quote updated",
      description: `${id} → ${status}`,
      tone: "success",
    });
  }

  function setProofStatus(id: string, status: AdminProof["status"]) {
    setProofs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
    toast({
      title: "Proof updated",
      description: `${id} → ${status}`,
      tone: "success",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            {title.title}
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {title.description}
          </p>
        </div>
        {section === "orders" ? (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void loadOrders()}
            disabled={ordersLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4", ordersLoading && "animate-spin")}
            />
            Refresh
          </Button>
        ) : null}
      </div>

      {section === "orders" && (
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-text-secondary">
              {ordersLoading
                ? "Loading orders from database…"
                : `${orders.length} order${orders.length === 1 ? "" : "s"} in PostgreSQL`}
            </p>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {ordersError ? (
              <div className="p-6 text-sm text-text-secondary">
                <p className="font-semibold text-secondary">API / DB error</p>
                <p className="mt-1">{ordersError}</p>
                <p className="mt-2 text-xs">
                  Sign in as admin and ensure backend is running on :4000.
                </p>
              </div>
            ) : ordersLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-xl bg-border/50"
                  />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-text-secondary">
                No orders yet. Place a checkout order while logged in — it will
                appear here with status <strong>processing</strong>.
              </p>
            ) : (
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="px-6 py-3">Order</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Qty</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.dbId}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-6 py-4 font-semibold">{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-text-primary">
                          {order.customer}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {order.email}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {order.product}
                        {order.itemCount > 1
                          ? ` (+${order.itemCount - 1} more)`
                          : ""}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            void setOrderStatus(
                              order.id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className="h-9 rounded-lg border border-border bg-card px-2 text-xs font-semibold capitalize focus-ring"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => void openViewOrder(order.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      <Modal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setViewDetail(null);
        }}
        title={
          viewDetail
            ? `Order ${viewDetail.orderNumber}`
            : "Order details"
        }
        description="Read-only view of the order saved in PostgreSQL."
        size="lg"
      >
        {viewLoading || !viewDetail ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-xl bg-border/50"
              />
            ))}
          </div>
        ) : (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" className="capitalize">
                {viewDetail.status}
              </Badge>
              <span className="text-xs text-text-secondary">
                Placed{" "}
                {new Date(viewDetail.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                  Customer
                </p>
                <p className="mt-1 font-semibold text-text-primary">
                  {viewDetail.shippingName || viewDetail.customer.name}
                </p>
                <p className="text-sm text-text-secondary">
                  {viewDetail.shippingEmail || viewDetail.customer.email}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                  Shipping
                </p>
                <p className="mt-1 text-sm text-text-primary">
                  {[
                    viewDetail.shippingAddress,
                    viewDetail.shippingCity,
                    viewDetail.shippingState,
                    viewDetail.shippingZip,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                <p className="mt-1 text-xs text-text-secondary capitalize">
                  Method: {viewDetail.shippingMethod || "—"} · Payment:{" "}
                  {viewDetail.paymentMethod || "—"}
                </p>
              </div>
            </div>

            {viewDetail.artworkFile ? (
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                <span className="font-semibold text-text-primary">
                  Artwork file:{" "}
                </span>
                <span className="text-text-secondary">
                  {viewDetail.artworkFile}
                </span>
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-secondary">
                Line items
              </p>
              <div className="space-y-2">
                {viewDetail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-text-primary">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        Qty {item.quantity}
                        {item.size ? ` · ${item.size}` : ""}
                        {item.material ? ` · ${item.material}` : ""}
                        {item.finishing ? ` · ${item.finishing}` : ""}
                        {item.productSlug ? ` · /${item.productSlug}` : ""}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(viewDetail.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span>{formatCurrency(viewDetail.shipping)}</span>
              </div>
              <div className="mt-1 flex justify-between text-text-secondary">
                <span>Tax</span>
                <span>{formatCurrency(viewDetail.tax)}</span>
              </div>
              {viewDetail.discount > 0 ? (
                <div className="mt-1 flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(viewDetail.discount)}</span>
                </div>
              ) : null}
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-text-primary">
                <span>Total</span>
                <span>{formatCurrency(viewDetail.total)}</span>
              </div>
            </div>

            {viewDetail.notes ? (
              <div className="rounded-xl border border-border px-4 py-3 text-sm">
                <p className="text-xs font-bold uppercase text-text-secondary">
                  Notes
                </p>
                <p className="mt-1 text-text-primary">{viewDetail.notes}</p>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => {
                  setViewOpen(false);
                  setViewDetail(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {section === "customers" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Orders</th>
                  <th className="px-6 py-3">Spent</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {adminCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-text-secondary">{c.email}</p>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{c.company}</td>
                    <td className="px-6 py-4 text-text-secondary">{c.orders}</td>
                    <td className="px-6 py-4 font-semibold">
                      {formatCurrency(c.spent)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={c.status === "active" ? "success" : "default"}
                        className="capitalize"
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{c.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {section === "quotes" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-3">Quote</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-6 py-4 font-semibold">{q.id}</td>
                    <td className="px-6 py-4 text-text-secondary">
                      {q.customer}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {q.product}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {q.qty.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(["pending", "approved", "declined"] as const).map(
                          (s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setQuoteStatus(q.id, s)}
                              className="rounded-md border border-border px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition hover:border-primary hover:text-primary"
                            >
                              {s}
                            </button>
                          ),
                        )}
                        <Badge
                          variant={
                            q.status === "approved"
                              ? "success"
                              : q.status === "pending"
                                ? "warning"
                                : "default"
                          }
                          className="ml-1 capitalize"
                        >
                          {q.status}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(q.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {section === "proofs" && (
        <div className="space-y-3">
          {proofs.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{p.fileName}</p>
                    <p className="text-xs text-text-secondary">
                      {p.orderId} · {p.customer} · Submitted {p.submitted}
                    </p>
                    <Badge
                      className="mt-2 capitalize"
                      variant={
                        p.status === "approved"
                          ? "success"
                          : p.status === "awaiting"
                            ? "warning"
                            : "primary"
                      }
                    >
                      {p.status === "changes" ? "Changes requested" : p.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setProofStatus(p.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setProofStatus(p.id, "changes")}
                  >
                    Request changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {section === "categories" && <AdminCategories />}

      {section === "settings" && (
        <Card>
          <CardHeader>
            <p className="text-sm font-bold text-text-primary">Store settings</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Store name" defaultValue="Printoe" />
              <Input label="Support email" defaultValue="hello@printoe.com" />
              <Input
                label="Support phone"
                defaultValue="+1 (888) 555-0199"
                className="sm:col-span-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Email admin on new orders
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Require PDF proof for custom artwork
            </label>
            <Button
              onClick={() =>
                toast({
                  title: "Settings saved",
                  description: "Demo preferences updated locally.",
                  tone: "success",
                })
              }
            >
              Save settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

