"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { DASHBOARD_NAV } from "@/components/dashboard/DashboardSidebar";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/data";

const NOTIFICATIONS = [
  { id: "n1", text: "Order ORD-10482 is now printing", time: "2h ago", unread: true },
  { id: "n2", text: "Quote #QT-882 was approved", time: "5h ago", unread: true },
  { id: "n3", text: "Invoice INV-2201 paid successfully", time: "2d ago", unread: false },
];

export function DashboardTopBar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/dashboard/orders?q=${encodeURIComponent(q)}`);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 lg:px-8">
        <button
          type="button"
          className="rounded-xl p-2.5 text-text-secondary transition hover:bg-secondary/5 hover:text-text-primary focus-ring lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileNav(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <form onSubmit={onSearch} className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, quotes, designs…"
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-secondary focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
              aria-label="Search dashboard"
            />
          </form>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/dashboard/support-tickets"
            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-secondary/5 hover:text-text-primary sm:inline-flex"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((v) => !v);
                setProfileOpen(false);
              }}
              className="relative rounded-xl p-2.5 text-text-secondary transition hover:bg-secondary/5 hover:text-text-primary focus-ring"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="h-5 w-5" />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              ) : null}
            </button>
            {notifOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close notifications"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-bold text-text-primary">Notifications</p>
                    <Link
                      href="/dashboard/notifications"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={() => setNotifOpen(false)}
                    >
                      View all
                    </Link>
                  </div>
                  <ul className="max-h-72 overflow-y-auto">
                    {NOTIFICATIONS.map((n) => (
                      <li
                        key={n.id}
                        className={cn(
                          "border-b border-border/60 px-4 py-3 last:border-0",
                          n.unread && "bg-primary/[0.03]",
                        )}
                      >
                        <p className="text-sm font-medium text-text-primary">{n.text}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">{n.time}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((v) => !v);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2 transition hover:bg-secondary/5 focus-ring"
              aria-expanded={profileOpen}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white shadow-soft">
                {initials}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block truncate text-sm font-bold text-text-primary">
                  {user?.name || "Account"}
                </span>
                <span className="block truncate text-[11px] font-medium text-text-secondary">
                  {user?.email || "Customer"}
                </span>
              </span>
              <ChevronDown className="hidden h-4 w-4 text-text-secondary sm:block" />
            </button>
            {profileOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close profile menu"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-card">
                  <Link
                    href="/dashboard/profile-settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-secondary/5 hover:text-text-primary"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-secondary/5 hover:text-text-primary"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    My orders
                  </Link>
                  <Link
                    href="/dashboard/account-security"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-secondary/5 hover:text-text-primary"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Security
                  </Link>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      router.push("/login");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {mobileNav ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-secondary/40"
            aria-label="Close menu"
            onClick={() => setMobileNav(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-card shadow-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Customer
                </p>
                <p className="text-sm font-bold text-text-primary">{SITE.name} Account</p>
              </div>
              <button
                type="button"
                className="rounded-xl p-2 text-text-secondary hover:bg-secondary/5"
                aria-label="Close menu"
                onClick={() => setMobileNav(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-0.5">
                {DASHBOARD_NAV.map(({ href, label, icon: Icon, exact }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMobileNav(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:bg-secondary/5 hover:text-text-primary",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
