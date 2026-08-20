"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
import {
  HEADER_NAV_GROUPS,
  type MegaColumn,
  type NavGroup,
} from "@/lib/uprinting-nav";
import { fetchProducts } from "@/lib/products-api";
import type { CatalogProduct } from "@/types";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCartOptional } from "@/lib/cart-store";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: User },
  { href: "/dashboard/orders", label: "My orders", icon: ShoppingBag },
  { href: "/dashboard/saved-designs", label: "Saved Designs", icon: Bookmark },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/quotations", label: "Quotations", icon: FileText },
];

const NAV_PRODUCT_CATEGORIES: Record<string, Set<string>> = {
  "Marketing Materials": new Set([
    "business-cards",
    "brochures",
    "flyers",
    "marketing-materials",
    "postcards",
  ]),
  "Stickers & Labels": new Set(["stickers", "labels"]),
  "Boxes & Packaging": new Set(["boxes", "packaging"]),
  "Signs & Banners": new Set(["banners", "signs"]),
  "Apparel & Promo": new Set(["apparel", "promotional-products"]),
};

function normalizedProductName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const MATCH_IGNORED_WORDS = new Set([
  "all",
  "and",
  "custom",
  "printed",
  "printing",
  "the",
]);

function productNameTokens(value: string) {
  return normalizedProductName(value)
    .split(" ")
    .filter((word) => word && !MATCH_IGNORED_WORDS.has(word))
    .map((word) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word));
}

function isRelatedProduct(label: string, productName: string) {
  const labelTokens = productNameTokens(label);
  const productTokens = productNameTokens(productName);
  if (!labelTokens.length || !productTokens.length) return false;
  const labelSet = new Set(labelTokens);
  const productSet = new Set(productTokens);
  return (
    labelTokens.every((word) => productSet.has(word)) ||
    productTokens.every((word) => labelSet.has(word))
  );
}

function resolveProductMenu(
  groups: NavGroup[],
  products: CatalogProduct[],
): NavGroup[] {
  const productByName = new Map(
    products.map((product) => [normalizedProductName(product.name), product]),
  );

  return groups.map((group) => {
    if (!group.mega) return group;

    const linkedSlugs = new Set<string>();
    const supplementalProducts = new Map<string, CatalogProduct>();
    const mega = group.mega.map((column): MegaColumn => ({
      ...column,
      links: column.links.map((link) => {
        if (link.all) return { ...link, href: "#" };

        const exactProduct = productByName.get(
          normalizedProductName(link.label),
        );
        if (exactProduct) {
          linkedSlugs.add(exactProduct.slug);
          return { ...link, href: `/products/${exactProduct.slug}` };
        }

        const relatedProducts = products.filter(
          (product) =>
            !linkedSlugs.has(product.slug) &&
            isRelatedProduct(link.label, product.name),
        );
        if (relatedProducts.length === 1) {
          linkedSlugs.add(relatedProducts[0].slug);
          return { ...link, href: `/products/${relatedProducts[0].slug}` };
        }
        if (relatedProducts.length > 1) {
          for (const product of relatedProducts) {
            linkedSlugs.add(product.slug);
            supplementalProducts.set(product.slug, product);
          }
        }
        return { ...link, href: "#" };
      }),
    }));

    const categories = NAV_PRODUCT_CATEGORIES[group.label];
    const extraProducts = [
      ...supplementalProducts.values(),
      ...products.filter((product) => {
        if (linkedSlugs.has(product.slug)) return false;
        if (group.label === "Featured Collections") return product.featured;
        return categories?.has(product.category.slug);
      }),
    ];

    for (let offset = 0; offset < extraProducts.length; offset += 6) {
      const chunk = extraProducts.slice(offset, offset + 6);
      mega.push({
        title:
          extraProducts.length <= 6
            ? "More Products"
            : `More Products ${offset / 6 + 1}`,
        href: group.href,
        image: chunk[0]?.imageUrl || mega[0]?.image || "/mega/featured-collections.jpg",
        links: chunk.map((product) => ({
          label: product.name,
          href: `/products/${product.slug}`,
        })),
      });
    }

    return { ...group, mega };
  });
}

export function Header({ announcementOnly = false }: { announcementOnly?: boolean }) {
  const router = useRouter();
  const site = useSiteSettings();
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const cart = useCartOptional();
  const cartCount = cart?.itemCount ?? 0;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navOpen, setNavOpen] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuProducts, setMenuProducts] = useState<CatalogProduct[]>([]);

  const navGroups = useMemo(
    () => resolveProductMenu(HEADER_NAV_GROUPS, menuProducts),
    [menuProducts],
  );

  const initials = (user?.name || user?.email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const firstName = user?.name?.split(/\s+/)[0] ?? "there";
  const activeMega = navGroups.find(
    (group) => group.label === navOpen,
  )?.mega;

  useEffect(() => {
    if (announcementOnly) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [announcementOnly]);

  useEffect(() => {
    if (announcementOnly) return;
    let cancelled = false;
    void fetchProducts()
      .then((response) => {
        if (!cancelled) setMenuProducts(response.data);
      })
      .catch(() => {
        if (!cancelled) setMenuProducts([]);
      });
    return () => {
      cancelled = true;
    };
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
                href={`tel:${site.phone.replace(/[^\d+]/g, "")}`}
                className="hidden shrink-0 items-start gap-2 lg:flex"
              >
                <Phone className="mt-0.5 h-4 w-4 text-primary" />
                <span className="leading-tight">
                  <span className="block text-sm font-bold text-secondary">
                    {site.phone}
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
              {isAdmin && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-background focus-ring sm:px-2"
                    aria-label="Admin account"
                    aria-expanded={accountOpen}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white shadow-soft">
                      {initials}
                    </span>
                    <span className="hidden leading-tight sm:block">
                      <span className="block text-xs font-medium text-text-secondary">
                        Staff
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-secondary">
                        Admin
                        <ChevronDown className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </button>
                  {accountOpen ? (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-[200] cursor-default"
                        aria-label="Close account menu"
                        onClick={() => setAccountOpen(false)}
                      />
                      <div className="absolute right-0 z-[210] mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                        <div className="border-b border-border px-4 py-3">
                          <p className="truncate text-sm font-bold text-text-primary">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-text-secondary">
                            {user.email}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                            Admin session
                          </p>
                        </div>
                        <ul className="p-2">
                          <li>
                            <Link
                              href="/admin"
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-secondary/5 hover:text-text-primary"
                            >
                              <User className="h-4 w-4" />
                              Admin panel
                            </Link>
                          </li>
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
              ) : isCustomer && user ? (
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
                        className="fixed inset-0 z-[200] cursor-default"
                        aria-label="Close account menu"
                        onClick={() => setAccountOpen(false)}
                      />
                      <div className="absolute right-0 z-[210] mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
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
      <div
        className="relative z-[110] hidden border-b border-border bg-card lg:block"
        onMouseLeave={() => setNavOpen(null)}
      >
        <Container size="wide">
          <nav
            className="relative flex items-center justify-center gap-2 py-0 xl:gap-6"
            aria-label="Product categories"
          >
            {navGroups.map((group) => {
              const isOpen = navOpen === group.label;
              return (
                <div
                  key={group.label}
                  className={cn("relative", isOpen && "z-[120]")}
                  onMouseEnter={() => setNavOpen(group.label)}
                >
                  <Link
                    href={group.href}
                    className={cn(
                      "inline-flex items-center whitespace-nowrap px-2 py-3.5 text-sm font-semibold transition",
                      isOpen
                        ? "text-primary"
                        : "text-[#1b4f9c] hover:text-primary",
                    )}
                  >
                    {group.label}
                  </Link>
                  <AnimatePresence>
                    {isOpen && !group.mega ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute left-1/2 top-full z-[120] min-w-[240px] -translate-x-1/2 border border-border bg-card py-2 shadow-card"
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

        {/* Full-width mega panel — a DOM child of the nav bar so hovering it
            does not fire the bar's mouseleave. */}
        <AnimatePresence>
          {activeMega ? (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute left-0 right-0 top-full z-[120] max-h-[80vh] overflow-y-auto border-b border-border bg-[#f7f8fa] shadow-card"
            >
              <Container size="wide">
                <div className="grid grid-cols-2 gap-x-8 gap-y-8 py-7 md:grid-cols-3 xl:grid-cols-4">
                  {activeMega.map((col) => (
                    <div key={col.title}>
                      <Link
                        href={col.href}
                        onClick={() => setNavOpen(null)}
                        className="block"
                      >
                        <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-md bg-white shadow-sm">
                          {/* Native img: Next/Image optimizer was serving tiny blurry variants in the mega panel */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={col.image}
                            alt={col.title}
                            className="h-full w-full object-cover"
                            loading="eager"
                            decoding="async"
                          />
                        </span>
                        <span className="mt-2.5 block text-[15px] font-bold text-secondary">
                          {col.title}
                        </span>
                      </Link>
                      <ul className="mt-1.5 space-y-1">
                        {col.links.map((link) => (
                          <li key={link.href + link.label}>
                            <Link
                              href={link.href}
                              onClick={() => setNavOpen(null)}
                              className={cn(
                                "flex items-center gap-2 text-sm transition hover:text-primary",
                                link.all
                                  ? "justify-between font-medium text-secondary"
                                  : "text-text-secondary",
                              )}
                            >
                              <span className="inline-flex flex-wrap items-center gap-1.5">
                                {link.label}
                                {link.badge ? (
                                  <span
                                    className={cn(
                                      "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
                                      link.badge === "New"
                                        ? "bg-emerald-500"
                                        : "bg-emerald-800",
                                    )}
                                  >
                                    {link.badge}
                                  </span>
                                ) : null}
                              </span>
                              {link.all ? (
                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Container>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
              {navGroups.map((group) => {
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
                        {group.mega?.length
                          ? group.mega.flatMap((col) => [
                              <p
                                key={`${col.title}-h`}
                                className="mt-2 px-3 text-xs font-bold uppercase tracking-wide text-text-secondary"
                              >
                                {col.title}
                              </p>,
                              ...col.links.map((link) => (
                                <Link
                                  key={link.href + link.label}
                                  href={link.href}
                                  className="block rounded-lg px-3 py-2 text-sm font-medium text-secondary hover:bg-background"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {link.label}
                                  {link.badge ? (
                                    <span className="ml-2 text-[10px] font-bold text-primary">
                                      {link.badge}
                                    </span>
                                  ) : null}
                                </Link>
                              )),
                            ])
                          : group.children.map((child) => (
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
              {isAdmin ? (
                <>
                  <Link
                    href="/admin"
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary hover:bg-background"
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin panel
                  </Link>
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
              ) : isCustomer ? (
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
