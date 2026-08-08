"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CreditCard,
  Download,
  FileText,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  MapPin,
  Palette,
  Receipt,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/quotations", label: "Quotations", icon: FileText },
  { href: "/dashboard/saved-designs", label: "Saved Designs", icon: Palette },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/payment-methods", label: "Payment Methods", icon: CreditCard },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/support-tickets", label: "Support Tickets", icon: LifeBuoy },
  { href: "/dashboard/profile-settings", label: "Profile Settings", icon: Settings },
  { href: "/dashboard/team-management", label: "Team Management", icon: Users },
  { href: "/dashboard/account-security", label: "Account Security", icon: Lock },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const site = useSiteSettings();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="border-b border-border bg-gradient-to-br from-primary/10 via-card to-accent/5 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Customer
        </p>
        <p className="mt-1 text-sm font-bold text-text-primary">{site.name} Account</p>
        <p className="mt-1 text-[11px] font-medium text-text-secondary">
          Orders · Designs · Billing
        </p>
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto p-3" aria-label="Dashboard">
        <ul className="space-y-0.5">
          {DASHBOARD_NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all focus-ring",
                    active
                      ? "bg-primary/10 text-primary shadow-soft"
                      : "text-text-secondary hover:bg-secondary/5 hover:text-text-primary",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
