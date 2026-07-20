"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { SITE, categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/shared/Logo";

const navLinks = [
  { label: "Marketing Materials", href: "/products?category=marketing-materials" },
  { label: "Stickers & Labels", href: "/products?category=stickers" },
  { label: "Boxes & Packaging", href: "/products?category=packaging" },
  { label: "Signs & Banners", href: "/products?category=banners" },
  { label: "Apparel & Promo", href: "/products?category=apparel" },
  { label: "Featured Collections", href: "/products" },
];

export function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card">
      {/* Announcement bar */}
      <div className="bg-secondary text-center text-[13px] font-medium tracking-wide text-white">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2">
          <span>High Quality</span>
          <span className="hidden text-white/40 sm:inline">|</span>
          <span>On Time Delivery</span>
          <span className="hidden text-white/40 sm:inline">|</span>
          <span>Everyday Fair Prices</span>
        </div>
      </div>

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

              <Link
                href="/cart"
                className="relative flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-background focus-ring"
                aria-label="Cart with 2 items"
              >
                <span className="relative">
                  <ShoppingCart className="h-6 w-6 text-secondary" />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                    2
                  </span>
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
      <div className="hidden border-b border-border bg-card lg:block">
        <Container size="wide">
          <nav
            className="flex items-center gap-1 overflow-x-auto py-0"
            aria-label="Product categories"
          >
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
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
                    className="absolute left-0 top-full z-50 w-72 border border-border bg-card py-2 shadow-card"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-secondary hover:bg-background hover:text-primary"
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
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-secondary transition hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
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
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary hover:bg-background"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-secondary hover:bg-background"
                onClick={() => setMobileOpen(false)}
              >
                Your Account
              </Link>
            </Container>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
