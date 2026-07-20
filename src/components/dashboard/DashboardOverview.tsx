"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Package, TrendingUp, Zap } from "lucide-react";
import { orders } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const STATUS_VARIANT: Record<
  (typeof orders)[0]["status"],
  "default" | "primary" | "accent" | "success" | "warning"
> = {
  processing: "warning",
  printing: "primary",
  shipped: "accent",
  delivered: "success",
  cancelled: "default",
};

const METRICS = [
  { label: "Active Orders", value: "12", change: "+3", icon: Package, color: "text-primary" },
  { label: "Spend (30d)", value: "$2,840", change: "+18%", icon: TrendingUp, color: "text-accent" },
  { label: "Saved Designs", value: "24", change: "+2", icon: Zap, color: "text-warning" },
];

const ACTIVITY = [
  { id: "a1", text: "Order ORD-10482 entered production", time: "2h ago" },
  { id: "a2", text: "Quote #QT-882 approved", time: "5h ago" },
  { id: "a3", text: "New design saved: Summer Flyer", time: "Yesterday" },
  { id: "a4", text: "Invoice INV-2201 paid", time: "2 days ago" },
];

function MiniBarChart({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values);
  return (
    <svg viewBox={`0 0 ${values.length * 12} 48`} className={cn("h-12 w-full", className)}>
      {values.map((v, i) => {
        const h = (v / max) * 40;
        return (
          <rect
            key={i}
            x={i * 12 + 2}
            y={48 - h}
            width={8}
            height={h}
            rx={2}
            className="fill-primary/80"
          />
        );
      })}
    </svg>
  );
}

function MiniLineChart({ values }: { values: number[] }) {
  const w = 120;
  const h = 48;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-12 w-full">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-accent"
        points={points}
      />
      <polyline
        fill="url(#lineGrad)"
        stroke="none"
        points={`0,${h} ${points} ${w},${h}`}
        opacity={0.15}
      />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1 text-sm font-medium text-text-secondary">
          Here&apos;s what&apos;s happening with your print projects.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {METRICS.map((m, i) => (
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
                    <p className="mt-2 text-2xl font-bold text-text-primary">{m.value}</p>
                    <p className={cn("mt-1 text-xs font-bold", m.color)}>{m.change} this month</p>
                  </div>
                  <div className={cn("rounded-xl bg-secondary/5 p-2.5", m.color)}>
                    <m.icon className="h-5 w-5" />
                  </div>
                </div>
                {i === 0 && <MiniBarChart values={[12, 18, 14, 22, 19, 26, 24]} className="mt-4" />}
                {i === 1 && (
                  <div className="mt-4 text-accent">
                    <MiniLineChart values={[820, 940, 880, 1100, 1240, 1180, 1420, 2840]} />
                  </div>
                )}
                {i === 2 && (
                  <div className="mt-4 flex gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((w, j) => (
                      <div
                        key={j}
                        className="h-2 flex-1 rounded-full bg-warning/20"
                        style={{ opacity: w / 100 }}
                      >
                        <div
                          className="h-full rounded-full bg-warning"
                          style={{ width: `${w}%` }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3.5 pr-4 font-semibold text-text-primary">{order.id}</td>
                    <td className="py-3.5 pr-4 text-text-secondary">{order.product}</td>
                    <td className="py-3.5 pr-4">
                      <Badge variant={STATUS_VARIANT[order.status]} className="capitalize">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 pr-4 text-text-secondary">{order.date}</td>
                    <td className="py-3.5 text-right font-semibold text-text-primary">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text-primary">Recent Activity</h2>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-4">
              {ACTIVITY.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.text}</p>
                    <p className="text-xs text-text-secondary">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
