import type { Order } from "@/types";
import { orders as seedOrders } from "@/lib/data";

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  company: string;
  orders: number;
  spent: number;
  status: "active" | "inactive";
  joined: string;
};

export type AdminQuote = {
  id: string;
  customer: string;
  product: string;
  qty: number;
  total: number;
  status: "pending" | "approved" | "declined";
  date: string;
};

export type AdminProof = {
  id: string;
  orderId: string;
  customer: string;
  fileName: string;
  status: "awaiting" | "approved" | "changes";
  submitted: string;
};

export type AdminOrder = Order & {
  customer: string;
  email: string;
};

export const ADMIN_CREDENTIALS = {
  email: "demouser@gmail.com",
  password: "Mani123@!!",
};

export const adminCustomers: AdminCustomer[] = [
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@lumen.studio",
    company: "Lumen Studio",
    orders: 14,
    spent: 4280,
    status: "active",
    joined: "2025-11-02",
  },
  {
    id: "u2",
    name: "Marcus Webb",
    email: "marcus@northline.co",
    company: "Northline Co",
    orders: 8,
    spent: 2190,
    status: "active",
    joined: "2026-01-18",
  },
  {
    id: "u3",
    name: "Priya Patel",
    email: "priya@brightbox.io",
    company: "Brightbox",
    orders: 3,
    spent: 640,
    status: "active",
    joined: "2026-05-09",
  },
  {
    id: "u4",
    name: "James Okonkwo",
    email: "james@atelier.press",
    company: "Atelier Press",
    orders: 0,
    spent: 0,
    status: "inactive",
    joined: "2026-06-22",
  },
];

export const adminQuotes: AdminQuote[] = [
  {
    id: "QT-882",
    customer: "Lumen Studio",
    product: "Rigid Product Boxes",
    qty: 500,
    total: 6490,
    status: "approved",
    date: "2026-07-16",
  },
  {
    id: "QT-871",
    customer: "Northline Co",
    product: "Roll Labels",
    qty: 10000,
    total: 1890,
    status: "pending",
    date: "2026-07-18",
  },
  {
    id: "QT-865",
    customer: "Brightbox",
    product: "Vinyl Banners",
    qty: 12,
    total: 420,
    status: "declined",
    date: "2026-07-12",
  },
];

export const adminProofs: AdminProof[] = [
  {
    id: "PRF-301",
    orderId: "ORD-10482",
    customer: "Sarah Chen",
    fileName: "cards-front.pdf",
    status: "awaiting",
    submitted: "2026-07-19",
  },
  {
    id: "PRF-298",
    orderId: "ORD-10471",
    customer: "Marcus Webb",
    fileName: "banner-v3.png",
    status: "approved",
    submitted: "2026-07-15",
  },
  {
    id: "PRF-290",
    orderId: "ORD-10440",
    customer: "Priya Patel",
    fileName: "sticker-diecut.ai",
    status: "changes",
    submitted: "2026-07-18",
  },
];

export const adminOrdersSeed: AdminOrder[] = seedOrders.map((o, i) => ({
  ...o,
  customer: adminCustomers[i % adminCustomers.length].name,
  email: adminCustomers[i % adminCustomers.length].email,
}));

export const ADMIN_METRICS = [
  { label: "Revenue (30d)", value: "$48,220", change: "+12%", key: "revenue" },
  { label: "Open Orders", value: "86", change: "+9", key: "orders" },
  { label: "Customers", value: "1,240", change: "+34", key: "customers" },
  { label: "Products", value: "—", change: "live", key: "products" },
];
