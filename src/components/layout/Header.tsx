"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Globe,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  Zap,
} from "lucide-react";
import { SITE, categories, navCategories } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

const langs = [
  { value: "en", label: "EN" },
  { value: "es", label: "ES" },
  { value: "fr", label: "FR" },
];

const currencies = [
  { value: "usd", label: "USD $" },
  { value: "eur", label: "EUR €" },
  { value: "gbp", label: "GBP £" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("usd");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "glass border-b border-border/80 shadow-soft"
            : "bg-transparent",
        )}
      >
        <Container size="wide" className="relative">
          <div className="flex h-16 items-center justify-between gap-4 md:h-20">
            <div className="flex items-center gap-6 lg:gap-10">
              <Link href="/" className="group flex items-center gap-2.5 focus-ring rounded-xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-soft transition-transform group-hover:scale-105">
                  <Zap className="h-5 w-5" fill="currentColor" />
                </span>
                <span className="text-xl font-bold tracking-tight text-text-primary">
                  {SITE.name}
                </span>
              </Link>

              <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
                <div
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-text-primary hover:bg-secondary/5 focus-ring"
                    aria-expanded={megaOpen}
                  >
                    Products
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        megaOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {megaOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute left-0 top-full pt-3"
                      >
                        <div className="w-[640px] rounded-2xl border border-border bg-card p-5 shadow-card">
                          <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-bold text-text-primary">
                              Product categories
                            </p>
                            <Link
                              href="/products"
                              className="text-sm font-semibold text-primary hover:underline"
                            >
                              View all
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {navCategories.map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/products?category=${cat.slug}`}
                                className="rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/5 focus-ring"
                                onClick={() => setMegaOpen(false)}
                              >
                                <p className="text-sm font-semibold text-text-primary">
                                  {cat.name}
                                </p>
                                <p className="text-xs text-text-secondary">
                                  From ${cat.startingPrice.toFixed(2)} · {cat.count} options
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
                <Link
                  href="/services"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-text-primary hover:bg-secondary/5 focus-ring"
                >
                  Services
                </Link>
                <Link
                  href="/editor"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-text-primary hover:bg-secondary/5 focus-ring"
                >
                  Design Studio
                </Link>
                <Link
                  href="/blog"
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-text-primary hover:bg-secondary/5 focus-ring"
                >
                  Resources
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:inline-flex"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              <div className="hidden items-center gap-1 xl:flex">
                <label className="sr-only" htmlFor="lang">
                  Language
                </label>
                <select
                  id="lang"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="h-9 rounded-xl border border-transparent bg-transparent px-2 text-xs font-semibold text-text-secondary hover:bg-secondary/5 focus-ring"
                >
                  {langs.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <label className="sr-only" htmlFor="currency">
                  Currency
                </label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-9 rounded-xl border border-transparent bg-transparent px-2 text-xs font-semibold text-text-secondary hover:bg-secondary/5 focus-ring"
                >
                  {currencies.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/dashboard/wishlist"
                className="hidden h-11 w-11 items-center justify-center rounded-2xl text-text-secondary hover:bg-secondary/5 hover:text-text-primary focus-ring md:inline-flex"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <Link
                href="/dashboard"
                className="hidden h-11 w-11 items-center justify-center rounded-2xl text-text-secondary hover:bg-secondary/5 hover:text-text-primary focus-ring md:inline-flex"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>

              <Link
                href="/cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl text-text-secondary hover:bg-secondary/5 hover:text-text-primary focus-ring"
                aria-label="Cart with 2 items"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  2
                </span>
              </Link>

              <Link href="/quote" className="hidden sm:block">
                <Button size="sm" className="gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Instant Quote
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </Container>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border bg-card lg:hidden"
            >
              <Container className="space-y-4 py-5">
                <Input
                  placeholder="Search products…"
                  leftIcon={<Search className="h-4 w-4" />}
                  onFocus={() => {
                    setMobileOpen(false);
                    setSearchOpen(true);
                  }}
                />
                <div className="grid gap-1">
                  {categories.slice(0, 6).map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-primary/5"
                      onClick={() => setMobileOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
                <div className="flex gap-2 border-t border-border pt-4">
                  <Link href="/quote" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Instant Quote</Button>
                  </Link>
                  <Link href="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Account
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-text-secondary">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{langs.find((l) => l.value === lang)?.label}</span>
                  <span>·</span>
                  <span>{currencies.find((c) => c.value === currency)?.label}</span>
                </div>
              </Container>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Search Pressora"
        description="Find products, templates, and resources"
        size="lg"
      >
        <Input
          autoFocus
          placeholder="Try business cards, vinyl banners…"
          leftIcon={<Search className="h-4 w-4" />}
        />
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Popular
          </p>
          {categories.slice(0, 5).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              onClick={() => setSearchOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-primary/5"
            >
              <span className="text-sm font-semibold">{cat.name}</span>
              <span className="text-xs text-text-secondary">
                from ${cat.startingPrice.toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      </Modal>
    </>
  );
}
