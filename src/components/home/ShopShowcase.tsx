"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Settings } from "lucide-react";
import { products as localProducts } from "@/lib/data";
import { fetchProducts } from "@/lib/products-api";
import { DynamicIcon } from "@/lib/icons";
import {
  CATEGORY_SUBMENUS,
  POPULAR_FOOTER_LINKS,
  POPULAR_PRODUCT_CATEGORIES,
} from "@/lib/uprinting-nav";
import { BUSINESS_CARDS_FLYOUT_SECTIONS } from "@/lib/business-cards-catalog";
import { SHOP_FLYOUTS, SHOP_STATIC_CATEGORIES } from "@/lib/shop-catalog";
import { Container } from "@/components/ui/Section";
import { ProductMedia } from "@/components/shared/ProductMedia";
import { cn, formatCurrency } from "@/lib/utils";
import type { CatalogProduct } from "@/types";

const STATIC_FLYOUT_IDS = new Set<string>([
  "apparel",
  "banners",
  "boxes",
  "business-cards",
  ...SHOP_STATIC_CATEGORIES,
]);

const popularItems = [
  {
    id: "builder",
    name: "Custom Product Builder",
    href: "/custom-printing",
    icon: "Sparkles",
  },
  ...POPULAR_PRODUCT_CATEGORIES.map((c) => ({
    id: c.slug,
    name: c.name,
    href: `/products?category=${c.slug}`,
    icon: c.icon,
  })),
];

const TOP_SELLER_ORDER = [
  "menus",
  "coasters",
  "bottle-labels",
  "vinyl-banners",
  "bag-toppers",
  "notepads",
  "carbonless-forms",
  "postcards",
];

/** Extra homepage grid (UPrinting Featured-style) — fills rows under Top Sellers */
const FEATURED_GRID_ORDER = [
  "custom-stickers",
  "event-tents",
  "take-out-bags",
  "yard-signs",
  "table-tents",
  "drinkware",
  "pouches",
  "wall-decals",
];

const HOMEPAGE_GRID_COUNT = 16;

function mapCard(p: CatalogProduct | { name: string; slug: string; image: string; imageUrl?: string | null; price: number }) {
  if ("basePrice" in p) {
    return {
      name: p.name,
      slug: p.slug,
      image: p.category.slug,
      imageUrl: p.imageUrl,
      price: p.basePrice,
    };
  }
  return p;
}

export function ShopShowcase() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [apiProducts, setApiProducts] = useState<CatalogProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchProducts()
      .then((res) => {
        if (!cancelled) setApiProducts(res.data);
      })
      .catch(() => {
        if (!cancelled) setApiProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submenuByCategory = useMemo(() => {
    const map: Record<string, { label: string; href: string }[]> = {};
    for (const p of apiProducts) {
      const slug = p.category.slug;
      if (!map[slug]) map[slug] = [];
      map[slug].push({
        label: p.name,
        href: `/products/${p.slug}`,
      });
    }
    return map;
  }, [apiProducts]);

  const topSellers = useMemo(() => {
    if (apiProducts.length) {
      const bySlug = new Map(apiProducts.map((p) => [p.slug, p]));
      const picked: CatalogProduct[] = [];
      const used = new Set<string>();

      const push = (slug: string) => {
        const p = bySlug.get(slug);
        if (p && !used.has(p.slug)) {
          used.add(p.slug);
          picked.push(p);
        }
      };

      TOP_SELLER_ORDER.forEach(push);
      FEATURED_GRID_ORDER.forEach(push);

      // Fill remaining slots: Featured badge, then any active products
      for (const p of apiProducts) {
        if (picked.length >= HOMEPAGE_GRID_COUNT) break;
        if (p.badge === "Featured" && !used.has(p.slug)) {
          used.add(p.slug);
          picked.push(p);
        }
      }
      for (const p of apiProducts) {
        if (picked.length >= HOMEPAGE_GRID_COUNT) break;
        if (!used.has(p.slug)) {
          used.add(p.slug);
          picked.push(p);
        }
      }

      return picked.slice(0, HOMEPAGE_GRID_COUNT).map(mapCard);
    }
    return localProducts.slice(0, HOMEPAGE_GRID_COUNT).map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.image,
      imageUrl: p.imageUrl,
      price: p.price,
    }));
  }, [apiProducts]);

  return (
    <section className="border-b border-border bg-white py-8 md:py-10">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] lg:items-start">
          <aside className="relative z-30">
            <nav
              className="relative border border-border bg-white shadow-soft"
              aria-label="Popular products"
              onMouseLeave={() => setOpenId(null)}
            >
              <h2 className="border-b border-border bg-[#f5f5f5] px-3.5 py-3 text-base font-bold text-secondary">
                Popular Products
              </h2>
              <ul className="divide-y divide-border">
                {popularItems.map((item) => {
                  const isBuilder = item.id === "builder";
                  const live = isBuilder
                    ? []
                    : (submenuByCategory[item.id] ?? []);
                  const staticExtras = isBuilder
                    ? []
                    : (CATEGORY_SUBMENUS[item.id] ?? []);
                  // Apparel / Banners flyouts match UPrinting subtype lists
                  const submenu = STATIC_FLYOUT_IDS.has(item.id)
                      ? staticExtras
                      : [...live, ...staticExtras].slice(0, 8);
                  const hasSubmenu = !isBuilder && submenu.length > 0;
                  const isOpen = openId === item.id;
                  const isBcFlyout = item.id === "business-cards";
                  const shopSections = SHOP_FLYOUTS[item.id];

                  return (
                    <li
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenId(item.id)}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-2.5 transition focus-ring",
                          isOpen
                            ? "bg-[#e8f4fc] text-primary"
                            : "hover:bg-[#e8f4fc] hover:text-primary",
                        )}
                        aria-expanded={hasSubmenu ? isOpen : undefined}
                        aria-haspopup={hasSubmenu ? "menu" : undefined}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center",
                            isOpen ? "text-primary" : "text-text-secondary",
                          )}
                        >
                          <DynamicIcon
                            name={item.icon}
                            className="h-[18px] w-[18px]"
                          />
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-sm font-medium",
                            isOpen ? "text-primary" : "text-secondary",
                          )}
                        >
                          {item.name}
                        </span>
                        {(hasSubmenu || isBuilder) && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4",
                              isOpen
                                ? "text-primary"
                                : "text-text-secondary/70",
                            )}
                          />
                        )}
                      </Link>

                      {hasSubmenu && isOpen && (
                        <div
                          role="menu"
                          className="absolute left-full top-0 z-40 ml-0 max-h-[min(70vh,560px)] min-w-[280px] overflow-y-auto border border-border bg-white py-2 shadow-soft"
                        >
                          {isBcFlyout ? (
                            BUSINESS_CARDS_FLYOUT_SECTIONS.map((section) => (
                              <div key={section.title} className="pb-2">
                                <p className="px-4 pb-1 pt-2 text-sm font-bold text-secondary">
                                  {section.title}
                                </p>
                                {section.items.map((sub) => (
                                  <Link
                                    key={sub.href}
                                    href={sub.href}
                                    role="menuitem"
                                    className="block px-4 py-1.5 text-sm text-secondary transition hover:bg-[#e8f4fc] hover:text-primary"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            ))
                          ) : shopSections ? (
                            shopSections.map((section, si) => (
                              <div key={(section.title ?? "s") + si} className="pb-1">
                                {section.header ? (
                                  <p className="flex items-center gap-2 px-4 pb-1 pt-2 text-sm font-bold text-secondary">
                                    <Settings className="h-4 w-4 text-text-secondary" />
                                    {section.header}
                                  </p>
                                ) : null}
                                {section.title ? (
                                  <p className="px-4 pb-1 pt-2 text-sm font-bold text-secondary">
                                    {section.title}
                                  </p>
                                ) : null}
                                {section.items.map((sub) => (
                                  <Link
                                    key={sub.href + sub.label}
                                    href={sub.href}
                                    role="menuitem"
                                    className="block px-4 py-1.5 text-sm text-secondary transition hover:bg-[#e8f4fc] hover:text-primary"
                                  >
                                    {sub.label}
                                  </Link>
                                ))}
                              </div>
                            ))
                          ) : (
                            <>
                              {submenu.map((sub) => (
                                <Link
                                  key={sub.href + sub.label}
                                  href={sub.href}
                                  role="menuitem"
                                  className="block px-4 py-2 text-sm text-secondary transition hover:bg-[#e8f4fc] hover:text-primary"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </>
                          )}
                          <Link
                            href={item.href}
                            className="mt-1 block border-t border-border px-4 py-2 text-xs font-semibold text-primary hover:underline"
                          >
                            View all {item.name}
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-border py-1">
                {POPULAR_FOOTER_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 text-sm text-secondary transition hover:bg-[#e8f4fc] hover:text-primary",
                      link.bold ? "font-bold" : "font-medium",
                    )}
                  >
                    {link.label}
                    {link.chevron ? (
                      <ChevronRight className="h-4 w-4 text-text-secondary/70" />
                    ) : null}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-secondary">Top Sellers</h2>
              <Link
                href="/products"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
              {topSellers.map((item) => (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  className="group focus-ring"
                >
                  <div className="relative overflow-hidden border border-border bg-[#f3f4f6]">
                    <div className="transition-[filter,transform] duration-300 ease-out group-hover:scale-[1.03] group-hover:blur-[2.5px]">
                      <ProductMedia
                        imageUrl={item.imageUrl ?? undefined}
                        fallbackVariant={item.image}
                        className="aspect-square"
                        label={item.name}
                      />
                    </div>
                    <div
                      className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    >
                      <span className="rounded-sm bg-[#1b5e20] px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                        Shop Now
                      </span>
                    </div>
                  </div>
                  <p className="mt-2.5 bg-transparent px-1 py-1 text-center text-sm font-semibold text-secondary transition duration-300 group-hover:bg-white group-hover:shadow-md">
                    {item.name}
                  </p>
                  <p className="text-center text-xs font-medium text-text-secondary">
                    From {formatCurrency(item.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
