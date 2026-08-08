"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Package,
  PanelTop,
  Settings,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/proofs", label: "Artwork Proofs", icon: ClipboardCheck },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const CRM_NAV = [
  { href: "/admin/crm/menus", label: "Menus", icon: PanelTop },
  { href: "/admin/crm/posts", label: "Posts", icon: Newspaper },
  { href: "/admin/crm/pages", label: "Pages", icon: FolderOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const site = useSiteSettings();
  const crmActive = pathname?.startsWith("/admin/crm");
  const [crmOpen, setCrmOpen] = useState(Boolean(crmActive));

  useEffect(() => {
    if (crmActive) setCrmOpen(true);
  }, [crmActive]);

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-border bg-[#111827] text-white lg:w-64">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Admin
        </p>
        <p className="mt-1 text-sm font-bold">{site.name} Control</p>
        {user?.email ? (
          <p className="mt-1 truncate text-xs text-white/50">{user.email}</p>
        ) : null}
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto p-3" aria-label="Admin">
        <ul className="space-y-0.5">
          {NAV.slice(0, 6).map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                    active
                      ? "bg-primary text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}

          {/* CRM dropdown */}
          <li>
            <button
              type="button"
              onClick={() => setCrmOpen((v) => !v)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                crmActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
              aria-expanded={crmOpen}
            >
              <Menu className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">CRM</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  crmOpen && "rotate-180",
                )}
              />
            </button>
            {crmOpen ? (
              <ul className="mt-0.5 space-y-0.5 border-l border-white/10 ml-5 pl-2">
                {CRM_NAV.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          active
                            ? "bg-primary text-white"
                            : "text-white/65 hover:bg-white/10 hover:text-white",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>

          {NAV.slice(6).map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                    active
                      ? "bg-primary text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
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

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/admin/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
