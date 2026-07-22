"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
} from "lucide-react";
import {
  adminCustomers,
  adminOrdersSeed,
  adminProofs,
  adminQuotes,
  type AdminOrder,
  type AdminProof,
  type AdminQuote,
} from "@/lib/admin-data";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { AdminCategories } from "@/components/admin/AdminCategories";

const ORDER_STATUSES: AdminOrder["status"][] = [
  "processing",
  "printing",
  "shipped",
  "delivered",
  "cancelled",
];

export function AdminSection({ section }: { section: string }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState(adminOrdersSeed);
  const [quotes, setQuotes] = useState(adminQuotes);
  const [proofs, setProofs] = useState(adminProofs);

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

  function setOrderStatus(id: string, status: AdminOrder["status"]) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o)),
    );
    toast({
      title: "Order updated",
      description: `${id} → ${status}`,
      tone: "success",
    });
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          {title.title}
        </h1>
        <p className="mt-1 text-sm font-medium text-text-secondary">
          {title.description}
        </p>
      </div>

      {section === "orders" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-6 py-4 font-semibold">{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">
                        {order.customer}
                      </p>
                      <p className="text-xs text-text-secondary">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          setOrderStatus(
                            order.id,
                            e.target.value as AdminOrder["status"],
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
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

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

