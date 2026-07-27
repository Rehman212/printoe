"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  FileText,
  LifeBuoy,
  Package,
  Palette,
  Plus,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  DesignsSparkChart,
  OrderStatusDonut,
  OrdersSparkChart,
  QuotesSparkChart,
  SpendingOverviewChart,
  SpendSparkChart,
  WeeklyOrdersBarChart,
} from "@/components/dashboard/DashboardCharts";
import {
  fetchCustomerOverview,
  type CustomerOverview,
} from "@/lib/customer-api";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const STATUS_VARIANT: Record<
  string,
  "default" | "primary" | "accent" | "success" | "warning"
> = {
  processing: "warning",
  printing: "primary",
  shipped: "accent",
  delivered: "success",
  cancelled: "default",
};

const QUICK_ACTIONS = [
  {
    href: "/products",
    label: "New order",
    desc: "Browse catalog",
    icon: Plus,
    tone: "bg-primary/10 text-primary",
  },
  {
    href: "/upload",
    label: "Upload design",
    desc: "Send print files",
    icon: Upload,
    tone: "bg-accent/10 text-accent",
  },
  {
    href: "/quote",
    label: "Get a quote",
    desc: "Custom pricing",
    icon: FileText,
    tone: "bg-brand-yellow/20 text-[#a67c00]",
  },
  {
    href: "/dashboard/support-tickets",
    label: "Support",
    desc: "Open a ticket",
    icon: LifeBuoy,
    tone: "bg-success/10 text-success",
  },
];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function DashboardOverview() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";
  const [data, setData] = useState<CustomerOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCustomerOverview()
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const m = data?.metrics;
    return [
      {
        label: "Active Orders",
        value: m ? String(m.activeOrders) : "—",
        change: "processing · printing · shipped",
        icon: Package,
        color: "text-primary",
        bg: "bg-primary/10",
        Chart: OrdersSparkChart,
      },
      {
        label: "Spend (30d)",
        value: m ? formatCurrency(m.spend30d) : "—",
        change: "from your orders",
        icon: TrendingUp,
        color: "text-accent",
        bg: "bg-accent/10",
        Chart: SpendSparkChart,
      },
      {
        label: "Saved Designs",
        value: m ? String(m.savedDesigns) : "—",
        change: "in your library",
        icon: Zap,
        color: "text-warning",
        bg: "bg-warning/10",
        Chart: DesignsSparkChart,
      },
      {
        label: "Open Quotes",
        value: m ? String(m.openQuotes) : "—",
        change: m ? `${m.openTickets} open tickets` : "awaiting reply",
        icon: FileText,
        color: "text-success",
        bg: "bg-success/10",
        Chart: QuotesSparkChart,
      },
    ];
  }, [data]);

  const statusBreakdown = useMemo(() => {
    const s = data?.statusBreakdown;
    if (!s) return [];
    return [
      { name: "Processing", value: s.processing || 0, color: "#f59e0b" },
      { name: "Printing", value: s.printing || 0, color: "#e6007a" },
      { name: "Shipped", value: s.shipped || 0, color: "#00aeef" },
      { name: "Delivered", value: s.delivered || 0, color: "#16a34a" },
    ].filter((x) => x.value > 0);
  }, [data]);

  const totalStatus = statusBreakdown.reduce((sum, x) => sum + x.value, 0);
  const recentOrders = data?.recentOrders ?? [];
  const activity = data?.activity ?? [];
  const monthlySpend = data?.monthlySpend ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Customer hub
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Track orders, designs, quotes, and billing in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/products">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Start new order
            </Button>
          </Link>
          <Link href="/editor">
            <Button variant="outline" className="gap-2">
              <Palette className="h-4 w-4" />
              Design online
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card"
          >
            <span className={cn("rounded-xl p-2.5", a.tone)}>
              <a.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-text-primary group-hover:text-primary">
                {a.label}
              </span>
              <span className="text-xs font-medium text-text-secondary">
                {a.desc}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hover className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      {m.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-text-primary">
                      {loading ? "…" : m.value}
                    </p>
                    <p className={cn("mt-1 text-xs font-bold", m.color)}>
                      {m.change}
                    </p>
                  </div>
                  <div className={cn("rounded-xl p-2.5", m.bg, m.color)}>
                    <m.icon className="h-5 w-5" />
                  </div>
                </div>
                <m.Chart />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Spending overview
              </h2>
              <p className="text-xs font-medium text-text-secondary">
                Last 7 months · live from orders
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <SpendingOverviewChart data={monthlySpend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-bold text-text-primary">Order status</h2>
            <p className="text-xs font-medium text-text-secondary">
              {totalStatus} orders in pipeline
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <OrderStatusDonut data={statusBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h2 className="text-lg font-bold text-text-primary">Recent Orders</h2>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="overflow-x-auto pt-0">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="pb-3 pr-4">Order</th>
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
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
                      No orders yet.{" "}
                      <Link href="/products" className="text-primary font-semibold">
                        Start shopping
                      </Link>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.dbId}
                      className="border-b border-border/60 transition hover:bg-secondary/[0.03] last:border-0"
                    >
                      <td className="py-3.5 pr-4 font-semibold text-text-primary">
                        {order.id}
                      </td>
                      <td className="py-3.5 pr-4 text-text-secondary">
                        {order.product}
                      </td>
                      <td className="py-3.5 pr-4">
                        <Badge
                          variant={STATUS_VARIANT[order.status] ?? "default"}
                          className="capitalize"
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 pr-4 text-text-secondary">
                        {order.date}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-text-primary">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h2 className="text-lg font-bold text-text-primary">
              Recent Activity
            </h2>
            <Link href="/dashboard/notifications">
              <Button variant="ghost" size="sm" className="gap-1">
                All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {activity.length === 0 ? (
              <p className="py-6 text-sm text-text-secondary">
                Activity from your orders and quotes will appear here.
              </p>
            ) : (
              <ul className="space-y-4">
                {activity.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <span
                      className={cn(
                        "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                        item.color,
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {item.text}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {relativeTime(item.time)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Saved designs
              </h2>
              <p className="text-xs font-medium text-text-secondary">
                Continue where you left off
              </p>
            </div>
            <Link href="/dashboard/saved-designs">
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/dashboard/saved-designs"
              className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-primary/30"
            >
              <span className="text-sm font-semibold text-text-primary">
                {data?.metrics.savedDesigns ?? 0} designs in library
              </span>
              <Palette className="h-5 w-5 text-primary" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-lg font-bold text-text-primary">
              Order snapshot
            </h2>
            <p className="text-xs font-medium text-text-secondary">
              Live counts from your account
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <WeeklyOrdersBarChart />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-primary/5 p-3 text-center">
                <p className="text-lg font-bold text-primary">
                  {data?.statusBreakdown.printing ?? 0}
                </p>
                <p className="text-[11px] font-semibold text-text-secondary">
                  In production
                </p>
              </div>
              <div className="rounded-xl bg-accent/5 p-3 text-center">
                <p className="text-lg font-bold text-accent">
                  {data?.statusBreakdown.shipped ?? 0}
                </p>
                <p className="text-[11px] font-semibold text-text-secondary">
                  In transit
                </p>
              </div>
              <div className="rounded-xl bg-success/5 p-3 text-center">
                <p className="text-lg font-bold text-success">
                  {data?.metrics.openQuotes ?? 0}
                </p>
                <p className="text-[11px] font-semibold text-text-secondary">
                  Open quotes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
