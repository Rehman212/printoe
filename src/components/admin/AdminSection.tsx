"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Eye,
  RefreshCw,
} from "lucide-react";
import {
  fetchAdminCustomers,
  fetchAdminProofs,
  fetchAdminQuotes,
  updateAdminProofStatus,
  updateAdminQuoteStatus,
  type AdminCustomerRow,
  type AdminProofRow,
  type AdminQuoteRow,
} from "@/lib/admin-api";
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

const SETTINGS_KEY = "printoe_admin_settings";

type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  emailOnOrders: boolean;
  requireProof: boolean;
};

const defaultSettings: StoreSettings = {
  storeName: "Printoe",
  supportEmail: "hello@printoe.com",
  supportPhone: "+1 (888) 555-0199",
  emailOnOrders: true,
  requireProof: true,
};

function loadSettings(): StoreSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...(JSON.parse(raw) as StoreSettings) };
  } catch {
    return defaultSettings;
  }
}

export function AdminSection({ section }: { section: string }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<ApiOrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewDetail, setViewDetail] = useState<ApiOrderDetail | null>(null);

  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState<string | null>(null);

  const [quotes, setQuotes] = useState<AdminQuoteRow[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  const [proofs, setProofs] = useState<AdminProofRow[]>([]);
  const [proofsLoading, setProofsLoading] = useState(false);
  const [proofsError, setProofsError] = useState<string | null>(null);

  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

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

  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    setCustomersError(null);
    try {
      const res = await fetchAdminCustomers();
      setCustomers(res.data);
    } catch (err) {
      setCustomersError(
        err instanceof Error ? err.message : "Could not load customers.",
      );
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  }, []);

  const loadQuotes = useCallback(async () => {
    setQuotesLoading(true);
    setQuotesError(null);
    try {
      const res = await fetchAdminQuotes();
      setQuotes(res.data);
    } catch (err) {
      setQuotesError(
        err instanceof Error ? err.message : "Could not load quotes.",
      );
      setQuotes([]);
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  const loadProofs = useCallback(async () => {
    setProofsLoading(true);
    setProofsError(null);
    try {
      const res = await fetchAdminProofs();
      setProofs(res.data);
    } catch (err) {
      setProofsError(
        err instanceof Error ? err.message : "Could not load proofs.",
      );
      setProofs([]);
    } finally {
      setProofsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (section === "orders") void loadOrders();
    if (section === "customers") void loadCustomers();
    if (section === "quotes") void loadQuotes();
    if (section === "proofs") void loadProofs();
    if (section === "settings") setSettings(loadSettings());
  }, [section, loadOrders, loadCustomers, loadQuotes, loadProofs]);

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
      setOrders((list) => list.map((o) => (o.id === id ? res.data : o)));
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

  async function setQuoteStatus(
    id: string,
    status: AdminQuoteRow["status"],
  ) {
    const prev = quotes;
    setQuotes((list) =>
      list.map((q) => (q.id === id ? { ...q, status } : q)),
    );
    try {
      const res = await updateAdminQuoteStatus(id, status);
      setQuotes((list) =>
        list.map((q) => (q.id === id || q.dbId === res.data.dbId ? res.data : q)),
      );
      toast({
        title: "Quote updated",
        description: `${id} → ${status}`,
        tone: "success",
      });
    } catch (err) {
      setQuotes(prev);
      toast({
        title: "Quote update failed",
        description:
          err instanceof Error ? err.message : "Could not update quote.",
        tone: "danger",
      });
    }
  }

  async function setProofStatus(
    proof: AdminProofRow,
    status: AdminProofRow["status"],
  ) {
    const prev = proofs;
    setProofs((list) =>
      list.map((p) => (p.id === proof.id ? { ...p, status } : p)),
    );
    try {
      const res = await updateAdminProofStatus(proof.id, status);
      setProofs((list) =>
        list.map((p) => (p.id === proof.id ? res.data : p)),
      );
      toast({
        title: "Proof updated",
        description: `${proof.proofId} → ${status}`,
        tone: "success",
      });
    } catch (err) {
      setProofs(prev);
      toast({
        title: "Proof update failed",
        description:
          err instanceof Error ? err.message : "Could not update proof.",
        tone: "danger",
      });
    }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Store preferences updated on this device.",
      tone: "success",
    });
  }

  const refreshForSection =
    section === "orders"
      ? loadOrders
      : section === "customers"
        ? loadCustomers
        : section === "quotes"
          ? loadQuotes
          : section === "proofs"
            ? loadProofs
            : null;

  const sectionLoading =
    section === "orders"
      ? ordersLoading
      : section === "customers"
        ? customersLoading
        : section === "quotes"
          ? quotesLoading
          : section === "proofs"
            ? proofsLoading
            : false;

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
        {refreshForSection ? (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void refreshForSection()}
            disabled={sectionLoading}
          >
            <RefreshCw
              className={cn("h-4 w-4", sectionLoading && "animate-spin")}
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
                Placed {new Date(viewDetail.createdAt).toLocaleString()}
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
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-bold text-text-primary">
                <span>Total</span>
                <span>{formatCurrency(viewDetail.total)}</span>
              </div>
            </div>

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
            {customersError ? (
              <p className="p-6 text-sm text-text-secondary">{customersError}</p>
            ) : customersLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-xl bg-border/50"
                  />
                ))}
              </div>
            ) : customers.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-text-secondary">
                No customer accounts yet. New signups appear here.
              </p>
            ) : (
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
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-text-secondary">{c.email}</p>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {c.company}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {c.orders}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {formatCurrency(c.spent)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            c.status === "active" ? "success" : "default"
                          }
                          className="capitalize"
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {c.joined}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {section === "quotes" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            {quotesError ? (
              <p className="p-6 text-sm text-text-secondary">{quotesError}</p>
            ) : quotesLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-xl bg-border/50"
                  />
                ))}
              </div>
            ) : quotes.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-text-secondary">
                No quotes in the database yet.
              </p>
            ) : (
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
                      key={q.dbId}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              q.status === "approved"
                                ? "success"
                                : q.status === "pending"
                                  ? "warning"
                                  : "default"
                            }
                            className="capitalize"
                          >
                            {q.status}
                          </Badge>
                          {q.status !== "approved" ? (
                            <Button
                              size="sm"
                              onClick={() =>
                                void setQuoteStatus(q.id, "approved")
                              }
                            >
                              Approve
                            </Button>
                          ) : null}
                          {q.status !== "declined" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                void setQuoteStatus(q.id, "declined")
                              }
                            >
                              Decline
                            </Button>
                          ) : null}
                          {q.status !== "pending" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                void setQuoteStatus(q.id, "pending")
                              }
                            >
                              Reopen
                            </Button>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {formatCurrency(q.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {section === "proofs" && (
        <div className="space-y-3">
          {proofsError ? (
            <Card>
              <CardContent className="p-6 text-sm text-text-secondary">
                {proofsError}
              </CardContent>
            </Card>
          ) : proofsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-border/50"
                />
              ))}
            </div>
          ) : proofs.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-text-secondary">
                No artwork proofs yet. When customers upload files at checkout,
                they appear here for approval.
              </CardContent>
            </Card>
          ) : (
            proofs.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">
                        {p.fileName}
                      </p>
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
                        {p.status === "changes"
                          ? "Changes requested"
                          : p.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.status !== "approved" ? (
                      <Button
                        size="sm"
                        onClick={() => void setProofStatus(p, "approved")}
                      >
                        Approve
                      </Button>
                    ) : (
                      <Button size="sm" disabled variant="outline">
                        Approved
                      </Button>
                    )}
                    {p.status !== "changes" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void setProofStatus(p, "changes")}
                      >
                        Request changes
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void setProofStatus(p, "awaiting")}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
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
              <Input
                label="Store name"
                value={settings.storeName}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, storeName: e.target.value }))
                }
              />
              <Input
                label="Support email"
                value={settings.supportEmail}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, supportEmail: e.target.value }))
                }
              />
              <Input
                label="Support phone"
                value={settings.supportPhone}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, supportPhone: e.target.value }))
                }
                className="sm:col-span-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={settings.emailOnOrders}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    emailOnOrders: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Email admin on new orders
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={settings.requireProof}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    requireProof: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Require PDF proof for custom artwork
            </label>
            <Button onClick={saveSettings}>Save settings</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
