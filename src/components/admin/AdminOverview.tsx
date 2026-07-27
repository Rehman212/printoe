"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardCheck,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  fetchAdminStats,
  type AdminStats,
} from "@/lib/admin-api";
import {
  fetchAdminOrders,
  type ApiOrderRow,
  type OrderStatus,
} from "@/lib/orders-api";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "primary" | "accent" | "success" | "warning"
> = {
  processing: "warning",
  printing: "primary",
  shipped: "accent",
  delivered: "success",
  cancelled: "default",
};

const ICONS = {
  revenue: DollarSign,
  orders: ShoppingBag,
  customers: Users,
  products: Package,
};

export function AdminOverview() {
  const [recentOrders, setRecentOrders] = useState<ApiOrderRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    void fetchAdminOrders()
      .then((res) => setRecentOrders(res.data.slice(0, 5)))
      .catch(() => setRecentOrders([]));
    void fetchAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  const metrics = [
    {
      label: "Revenue",
      value: stats ? formatCurrency(stats.revenue) : "—",
      change: "all time",
      key: "revenue" as const,
    },
    {
      label: "Open Orders",
      value: stats ? String(stats.openOrders) : "—",
      change: "processing + printing",
      key: "orders" as const,
    },
    {
      label: "Customers",
      value: stats ? String(stats.customers) : "—",
      change: "storefront accounts",
      key: "customers" as const,
    },
    {
      label: "Products",
      value: stats ? String(stats.products) : "—",
      change: "live catalog",
      key: "products" as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Manage catalog, orders, customers, quotes, and artwork proofs.
          </p>
        </div>
        <Link href="/admin/products">
          <Button className="gap-1">
            Upload product
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => {
          const Icon = ICONS[m.key] ?? Package;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        {m.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-text-primary">
                        {m.value}
                      </p>
                      <p className="mt-1 text-xs font-bold text-success">
                        {m.change}
                      </p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-bold text-text-primary">
                Proofs awaiting review
              </p>
              <p className="mt-1 text-2xl font-extrabold text-primary">
                {stats?.awaitingProofs ?? "—"}
              </p>
            </div>
            <Link href="/admin/proofs">
              <Button size="sm" variant="outline">
                Review
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-bold text-text-primary">Pending quotes</p>
              <p className="mt-1 text-2xl font-extrabold text-warning">
                {stats?.pendingQuotes ?? "—"}
              </p>
            </div>
            <Link href="/admin/quotes">
              <Button size="sm" variant="outline">
                Open
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-bold text-text-primary">Catalog size</p>
              <p className="mt-1 text-2xl font-extrabold text-text-primary">
                {stats?.products ?? "—"}
              </p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-text-secondary/40" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h2 className="text-lg font-bold text-text-primary">Recent orders</h2>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="gap-1">
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-text-secondary">
                <th className="pb-3 pr-4">Order</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-text-secondary"
                  >
                    No orders in database yet. Place a checkout to see them here.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.dbId}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-3 pr-4 font-semibold">{order.id}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-text-secondary">{order.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {order.product}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={STATUS_VARIANT[order.status]}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
