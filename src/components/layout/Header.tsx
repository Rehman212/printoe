"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  FileText,
  Heart,
  LogOut,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { SITE, categories } from "@/lib/data";
import { HEADER_NAV_GROUPS } from "@/lib/uprinting-nav";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCartOptional } from "@/lib/cart-store";

const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: User },
  { href: "/dashboard/orders", label: "My orders", icon: ShoppingBag },
  { href: "/dashboard/saved-designs", label: "Saved Designs", icon: Bookmark },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/quotations", label: "Quotations", icon: FileText },
];

export function Header({ announcementOnly = false }: { announcementOnly?: boolean }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const cart = useCartOptional();
  const cartCount = cart?.itemCount ?? 0;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");

  const initials = (user?.name || user?.email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = user?.name?.split(/\s+/)[0] ?? "there";

  useEffect(() => {
    if (announcementOnly) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [announcementOnly]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        "relative z-[100] bg-card",
        !announcementOnly && "sticky top-0",
      )}
    >
      {/* Announcement bar */}
      <div className="bg-secondary text-center text-[13px] font-medium tracking-wide text-white">
        <div className="brand-cmy-bar h-1 w-full" aria-hidden />
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2">
          <span>High Quality</span>
          <span className="hidden text-white/40 sm:inline">|</span>
          <span>On Time Delivery</span>
          <span className="hidden text-white/40 sm:inline">|</span>
          <span>Everyday Fair Prices</span>
        </div>
      </div>

      {announcementOnly ? null : (
        <>
      {/* Main header: logo · search · account */}
      <div
        className={cn(
          "border-b border-border bg-card transition-shadow",
          scrolled && "shadow-soft",
        )}
      >
        <Container size="wide">
          <div className="flex items-center gap-3 py-3 md:gap-5 md:py-4">
            <Logo priority />

            <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
              <a
                href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
                className="hidden shrink-0 items-start gap-2 lg:flex"
              >
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-secondary">
                    {SITE.phone}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    Quality Customer Service
                  </span>
                </span>
              </a>

              <form onSubmit={onSearch} className="mx-auto w-full max-w-xl">
                <div className="flex overflow-hidden rounded-md border-2 border-primary bg-white shadow-sm">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search (e.g. labels, boxes, etc)."
                    className="h-11 w-full flex-1 bg-transparent px-4 text-sm font-medium text-text-primary outline-none placeholder:text-text-secondary"
                    aria-label="Search products"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-12 items-center justify-center bg-primary text-white transition hover:bg-primary-hover"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-background focus-ring sm:px-2"
                    aria-label={`Account for ${user.name}`}
                    aria-expanded={accountOpen}
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-soft"
                      title={user.email}
                    >
                      {initials}
                    </span>
                    <span className="hidden leading-tight sm:block">
                      <span className="block text-xs font-medium text-text-secondary">
                        Hi, {firstName}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-secondary">
                        Your Account
                        <ChevronDown className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </button>
                  {accountOpen ? (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-40 cursor-default"
                        aria-label="Close account menu"
                        onClick={() => setAccountOpen(false)}
                      />
                      <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                        <div className="border-b border-border px-4 py-3">
                          <p className="truncate text-sm font-bold text-text-primary">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-text-secondary">
                            {user.email}
                          </p>
                        </div>
                        <ul className="p-2">
                          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
                            <li key={href}>
                              <Link
                                href={href}
                                onClick={() => setAccountOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-secondary/5 hover:text-text-primary"
                              >
                                <Icon className="h-4 w-4" />
                                {label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-border p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAccountOpen(false);
                              logout();
                              router.push("/");
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/5"
                          >
                            <LogOut className="h-4 w-4" />
                            Log out
                          </button>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-background sm:flex focus-ring"
                >
                  <User className="h-5 w-5 text-secondary" />
                  <span className="leading-tight">
                    <span className="block text-xs font-medium text-text-secondary">
                      Hi, Log In!
                    </span>
                    <span className="text-sm font-bold text-secondary">
                      Your Account
                    </span>
                  </span>
                </Link>
              )}

              <Link
                href="/cart"
                className="relative flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-background focus-ring"
                aria-label={
                  cartCount
                    ? `Cart with ${cartCount} items`
                    : "Cart is empty"
                }
              >
                <span className="relative">
                  <ShoppingCart className="h-6 w-6 text-secondary" />
                  {cartCount > 0 ? (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  ) : null}
                </span>
                <span className="hidden text-sm font-bold text-secondary md:inline">
                  Cart
                </span>
              </Link>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-background lg:hidden focus-ring"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={onSearch} className="pb-3 md:hidden">
            <div className="flex overflow-hidden rounded-md border-2 border-primary">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="h-10 w-full px-3 text-sm outline-none"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="bg-primary px-3 text-white"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </Container>
      </div>

      {/* Category navigation */}
      <div className="relative z-[110] hidden border-b border-border bg-card lg:block">
        <Container size="wide">
          <nav
            className="relative flex items-center gap-1 py-0"
            aria-label="Product categories"
          >
            <div
              className={cn("relative", productsOpen && "z-[120]")}
              onMouseEnter={() => {
                setProductsOpen(true);
                setNavOpen(null);
              }}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-secondary hover:text-primary"
              >
                All Products
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {productsOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 top-full z-[120] w-72 border border-border bg-card py-2 shadow-card"
                  >
                    <Link
                      href="/custom-printing"
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-secondary hover:bg-[#e8f4fc] hover:text-primary"
                      onClick={() => setProductsOpen(false)}
                    >
                      Custom Product Builder
                      <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-secondary hover:bg-[#e8f4fc] hover:text-primary"
                        onClick={() => setProductsOpen(false)}
                      >
                        {cat.name}
                        <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
                      </Link>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {HEADER_NAV_GROUPS.map((group) => {
              const isOpen = navOpen === group.label;
              return (
                <div
                  key={group.label}
                  className={cn("relative", isOpen && "z-[120]")}
                  onMouseEnter={() => {
                    setNavOpen(group.label);
                    setProductsOpen(false);
                  }}
                  onMouseLeave={() => setNavOpen(null)}
                >
                  <Link
                    href={group.href}
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap px-3 py-3.5 text-sm font-semibold transition",
                      isOpen
                        ? "text-primary"
                        : "text-secondary hover:text-primary",
                    )}
                  >
                    {group.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Link>
                  <AnimatePresence>
                    {isOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute left-0 top-full z-[120] min-w-[240px] border border-border bg-card py-2 shadow-card"
                      >
                        {group.children.map((child) => (
                          <Link
                            key={child.href + child.label}
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-medium text-secondary hover:bg-[#e8f4fc] hover:text-primary"
                            onClick={() => setNavOpen(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>
        </Container>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-card lg:hidden"
          >
            <Container className="space-y-1 py-3">
              <Link
                href="/custom-printing"
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary hover:bg-background"
                onClick={() => setMobileOpen(false)}
              >
                Custom Product Builder
              </Link>
              {HEADER_NAV_GROUPS.map((group) => {
                const open = mobileNavOpen === group.label;
                return (
                  <div key={group.label} className="border-b border-border/60 pb-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-secondary hover:bg-background"
                      onClick={() =>
                        setMobileNavOpen(open ? null : group.label)
                      }
                      aria-expanded={open}
                    >
                      {group.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open ? (
                      <div className="pb-2 pl-2">
                        <Link
                          href={group.href}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-primary"
                          onClick={() => setMobileOpen(false)}
                        >
                          View all
                        </Link>
                        {group.children.map((child) => (
                          <Link
                            key={child.href + child.label}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-background"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {isAuthenticated ? (
                <>
                  {ACCOUNT_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary hover:bg-background"
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-danger hover:bg-background"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                      router.push("/");
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary hover:bg-background"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
              )}
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
        </>
      )}
    </header>
  );
}
