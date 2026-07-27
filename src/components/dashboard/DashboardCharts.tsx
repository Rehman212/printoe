"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export const ORDER_VOLUME = [
  { day: "Mon", orders: 2 },
  { day: "Tue", orders: 4 },
  { day: "Wed", orders: 3 },
  { day: "Thu", orders: 5 },
  { day: "Fri", orders: 4 },
  { day: "Sat", orders: 6 },
  { day: "Sun", orders: 3 },
];

export const SPEND_TREND = [
  { month: "Jan", spend: 820 },
  { month: "Feb", spend: 940 },
  { month: "Mar", spend: 880 },
  { month: "Apr", spend: 1100 },
  { month: "May", spend: 1240 },
  { month: "Jun", spend: 1180 },
  { month: "Jul", spend: 1420 },
];

export const SPEND_30D = [
  { week: "W1", amount: 420 },
  { week: "W2", amount: 580 },
  { week: "W3", amount: 640 },
  { week: "W4", amount: 720 },
  { week: "W5", amount: 480 },
];

export const DESIGN_ACTIVITY = [
  { label: "Mon", value: 2 },
  { label: "Tue", value: 4 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 3 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 4 },
];

export const STATUS_BREAKDOWN = [
  { name: "Printing", value: 4, color: "#e6007a" },
  { name: "Shipped", value: 3, color: "#00aeef" },
  { name: "Delivered", value: 8, color: "#00a651" },
  { name: "Processing", value: 2, color: "#d4a017" },
];

export const QUOTE_PIPELINE = [
  { name: "Ready", value: 2, color: "#00a651" },
  { name: "Pending", value: 3, color: "#d4a017" },
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-left shadow-card">
      {label ? <p className="mb-1 text-xs font-semibold text-text-secondary">{label}</p> : null}
      {payload.map((p, i) => {
        const isMoney =
          typeof p.name === "string" &&
          (p.name.toLowerCase().includes("spend") || p.name.toLowerCase().includes("amount"));
        return (
          <p key={i} className="text-sm font-bold text-text-primary">
            {p.name ? `${p.name}: ` : ""}
            {typeof p.value === "number" && isMoney ? formatCurrency(p.value) : p.value}
          </p>
        );
      })}
    </div>
  );
}

function ChartFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className={className}>
        <div className="h-full w-full animate-pulse rounded-lg bg-secondary/5" />
      </div>
    );
  }
  return <div className={className}>{children}</div>;
}

export function OrdersSparkChart() {
  return (
    <ChartFrame className="mt-3 h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ORDER_VOLUME} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="orders" fill="#e6007a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function SpendSparkChart() {
  return (
    <ChartFrame className="mt-3 h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={SPEND_30D} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendMini" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00aeef" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#00aeef" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="amount"
            name="Amount"
            stroke="#00aeef"
            strokeWidth={2}
            fill="url(#spendMini)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function DesignsSparkChart() {
  return (
    <ChartFrame className="mt-3 h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DESIGN_ACTIVITY} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Bar dataKey="value" fill="#d4a017" radius={[3, 3, 3, 3]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function QuotesSparkChart() {
  return (
    <ChartFrame className="mt-3 h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={QUOTE_PIPELINE}
            dataKey="value"
            nameKey="name"
            innerRadius={16}
            outerRadius={26}
            paddingAngle={4}
            strokeWidth={0}
          >
            {QUOTE_PIPELINE.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function SpendingOverviewChart({
  data,
}: {
  data?: Array<{ month: string; spend: number }>;
} = {}) {
  const chartData = data?.length ? data : SPEND_TREND;
  return (
    <ChartFrame className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendMain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e6007a" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#e6007a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ec" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={48}
          />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="spend"
            name="Spend"
            stroke="#e6007a"
            strokeWidth={2.5}
            fill="url(#spendMain)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function OrderStatusDonut({
  data,
}: {
  data?: Array<{ name: string; value: number; color: string }>;
} = {}) {
  const breakdown = data?.length ? data : STATUS_BREAKDOWN;
  const total = breakdown.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <ChartFrame className="mx-auto h-48 w-full max-w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdown}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              strokeWidth={0}
            >
              {breakdown.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>
      <p className="sr-only">{total} orders in pipeline</p>
      <ul className="mt-2 space-y-2">
        {breakdown.map((s) => (
          <li key={s.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-text-secondary">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
            <span className="font-bold text-text-primary">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WeeklyOrdersBarChart() {
  return (
    <ChartFrame className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={ORDER_VOLUME} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e6e8ec" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="orders" name="Orders" fill="#00aeef" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
