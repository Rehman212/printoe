"use client";

import Link from "next/link";
import {
  Bell,
  CreditCard,
  Download,
  FileText,
  Heart,
  LifeBuoy,
  Lock,
  MapPin,
  Palette,
  Receipt,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { orders } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/Misc";

const SECTION_META: Record<
  string,
  { title: string; description: string; icon: React.ReactNode }
> = {
  orders: {
    title: "Orders",
    description: "Track production, shipping, and delivery for all print jobs.",
    icon: <ShoppingBag className="h-6 w-6" />,
  },
  quotations: {
    title: "Quotations",
    description: "Review and approve custom quotes for bulk or specialty runs.",
    icon: <FileText className="h-6 w-6" />,
  },
  "saved-designs": {
    title: "Saved Designs",
    description: "Designs you've created or uploaded in Design Studio.",
    icon: <Palette className="h-6 w-6" />,
  },
  downloads: {
    title: "Downloads",
    description: "Proofs, print-ready files, and production assets.",
    icon: <Download className="h-6 w-6" />,
  },
  invoices: {
    title: "Invoices",
    description: "Billing history and payment receipts.",
    icon: <Receipt className="h-6 w-6" />,
  },
  wishlist: {
    title: "Wishlist",
    description: "Products and templates you've saved for later.",
    icon: <Heart className="h-6 w-6" />,
  },
  addresses: {
    title: "Addresses",
    description: "Shipping and billing addresses for your account.",
    icon: <MapPin className="h-6 w-6" />,
  },
  "payment-methods": {
    title: "Payment Methods",
    description: "Cards and invoicing preferences on file.",
    icon: <CreditCard className="h-6 w-6" />,
  },
  notifications: {
    title: "Notifications",
    description: "Order updates, promotions, and account alerts.",
    icon: <Bell className="h-6 w-6" />,
  },
  "support-tickets": {
    title: "Support Tickets",
    description: "Get help from our print specialists.",
    icon: <LifeBuoy className="h-6 w-6" />,
  },
  "profile-settings": {
    title: "Profile Settings",
    description: "Manage your personal and company information.",
    icon: <Settings className="h-6 w-6" />,
  },
  "team-management": {
    title: "Team Management",
    description: "Invite teammates and manage roles.",
    icon: <Users className="h-6 w-6" />,
  },
  "account-security": {
    title: "Account Security",
    description: "Password, two-factor authentication, and sessions.",
    icon: <Lock className="h-6 w-6" />,
  },
};

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

const QUOTES = [
  { id: "QT-882", product: "Rigid Product Boxes", qty: 500, total: 6490, status: "approved" },
  { id: "QT-871", product: "Roll Labels", qty: 10000, total: 1890, status: "pending" },
];

const DESIGNS = [
  { id: "d1", name: "Summer Flyer v2", updated: "2026-07-19", product: "Flyers" },
  { id: "d2", name: "Executive Cards", updated: "2026-07-12", product: "Business Cards" },
];

const INVOICES = [
  { id: "INV-2201", date: "2026-07-15", amount: 159.96, status: "paid" },
  { id: "INV-2198", date: "2026-07-08", amount: 249.95, status: "paid" },
];

export function DashboardSection({ section }: { section: string }) {
  const meta = SECTION_META[section];

  if (!meta) {
    return (
      <EmptyState
        title="Section not found"
        description="This dashboard page doesn't exist yet."
        action={
          <Link href="/dashboard">
            <Button>Back to overview</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
          {meta.title}
        </h1>
        <p className="mt-1 text-sm font-medium text-text-secondary">{meta.description}</p>
      </div>

      {section === "orders" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Qty</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-4 font-semibold">{order.id}</td>
                    <td className="px-6 py-4 text-text-secondary">{order.product}</td>
                    <td className="px-6 py-4 text-text-secondary">{order.quantity}</td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_VARIANT[order.status]} className="capitalize">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{order.date}</td>
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

      {section === "quotations" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-3">Quote</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {QUOTES.map((q) => (
                  <tr key={q.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-4 font-semibold">{q.id}</td>
                    <td className="px-6 py-4 text-text-secondary">{q.product}</td>
                    <td className="px-6 py-4 text-text-secondary">{q.qty.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={q.status === "approved" ? "success" : "warning"}>
                        {q.status}
                      </Badge>
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

      {section === "saved-designs" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {DESIGNS.map((d) => (
            <Card key={d.id} hover>
              <CardContent className="p-5">
                <div className="mb-4 aspect-[1.75/1] rounded-xl bg-gradient-to-br from-primary/10 to-accent/10" />
                <p className="font-bold text-text-primary">{d.name}</p>
                <p className="text-xs text-text-secondary">
                  {d.product} · Updated {d.updated}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href="/editor">
                    <Button size="sm">Edit</Button>
                  </Link>
                  <Button size="sm" variant="outline">
                    Duplicate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="flex items-center justify-center border-dashed">
            <Link href="/editor">
              <Button variant="outline">Create new design</Button>
            </Link>
          </Card>
        </div>
      )}

      {section === "downloads" && (
        <EmptyState
          icon={meta.icon}
          title="No downloads yet"
          description="Proofs and print-ready files will appear here once your orders are approved."
        />
      )}

      {section === "invoices" && (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-4 font-semibold">{inv.id}</td>
                    <td className="px-6 py-4 text-text-secondary">{inv.date}</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">{inv.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="sm" variant="ghost">
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {section === "wishlist" && (
        <EmptyState
          icon={meta.icon}
          title="Your wishlist is empty"
          description="Save products from the catalog to compare options later."
          action={
            <Link href="/products">
              <Button>Browse products</Button>
            </Link>
          }
        />
      )}

      {section === "addresses" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <p className="text-sm font-bold">Default shipping</p>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary">Acme Corp</p>
              <p className="mt-2">450 Market Street, Suite 1200</p>
              <p>San Francisco, CA 94105</p>
              <Button size="sm" variant="outline" className="mt-4">
                Edit
              </Button>
            </CardContent>
          </Card>
          <Card className="flex items-center justify-center border-dashed">
            <Button variant="outline">Add address</Button>
          </Card>
        </div>
      )}

      {section === "payment-methods" && (
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-secondary/5 p-3">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-text-primary">Visa ending in 4242</p>
                <p className="text-xs text-text-secondary">Expires 08/28 · Default</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              Manage
            </Button>
          </CardContent>
        </Card>
      )}

      {section === "notifications" && (
        <ul className="space-y-3">
          {[
            { title: "Order ORD-10482 is printing", read: false },
            { title: "New blog: Premium paper stocks", read: true },
            { title: "Quote QT-871 awaiting approval", read: false },
          ].map((n, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-3 p-4">
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                <p className="text-sm font-medium text-text-primary">{n.title}</p>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}

      {section === "support-tickets" && (
        <EmptyState
          icon={meta.icon}
          title="No open tickets"
          description="Our specialists typically respond within 2 business hours."
          action={<Button>Open a ticket</Button>}
        />
      )}

      {section === "profile-settings" && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name" defaultValue="Sarah" />
              <Input label="Last name" defaultValue="Chen" />
              <Input label="Company" defaultValue="Lumen Studio" className="sm:col-span-2" />
              <Input label="Email" type="email" defaultValue="sarah@lumen.studio" className="sm:col-span-2" />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
      )}

      {section === "team-management" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <p className="text-sm font-bold">Team members</p>
            <Button size="sm">Invite</Button>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-border">
              {[
                { name: "Sarah Chen", role: "Owner", email: "sarah@lumen.studio" },
                { name: "Marcus Webb", role: "Editor", email: "marcus@lumen.studio" },
              ].map((m) => (
                <li key={m.email} className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-text-primary">{m.name}</p>
                    <p className="text-xs text-text-secondary">{m.email}</p>
                  </div>
                  <Badge>{m.role}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {section === "account-security" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-bold text-text-primary">Password</p>
                <p className="text-xs text-text-secondary">Last changed 3 months ago</p>
              </div>
              <Button size="sm" variant="outline">
                Update
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-bold text-text-primary">Two-factor authentication</p>
                <p className="text-xs text-text-secondary">Add an extra layer of security</p>
              </div>
              <Button size="sm">Enable</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
