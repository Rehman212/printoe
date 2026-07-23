"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { categories, products as localProducts } from "@/lib/data";
import { fetchProducts } from "@/lib/products-api";
import { DynamicIcon } from "@/lib/icons";
import { Container } from "@/components/ui/Section";
import { ProductMedia } from "@/components/shared/ProductMedia";
import { cn, formatCurrency } from "@/lib/utils";
import type { CatalogProduct } from "@/types";

/** Static flyout extras under Popular Products (kept as browse links) */
const categorySubmenus: Record<string, { label: string; href: string }[]> = {
  builder: [
    { label: "Start from blank", href: "/editor" },
    { label: "Upload artwork", href: "/editor" },
    { label: "Use a template", href: "/editor" },
  ],
  apparel: [
    { label: "Custom T-Shirts", href: "/products?category=apparel" },
    { label: "Hoodies", href: "/products?category=apparel" },
  ],
  banners: [
    { label: "Vinyl Banners", href: "/products?category=banners" },
    { label: "Retractable Banners", href: "/products?category=banners" },
  ],
  boxes: [
    { label: "Mailer Boxes", href: "/products?category=boxes" },
    { label: "Product Boxes", href: "/products?category=boxes" },
  ],
  brochures: [
    { label: "Bi-Fold Brochures", href: "/products?category=brochures" },
    { label: "Booklets", href: "/products?category=brochures" },
  ],
  "business-cards": [
    { label: "Standard Business Cards", href: "/products?category=business-cards" },
    { label: "Silk Business Cards", href: "/products?category=business-cards" },
  ],
  flyers: [
    { label: "Business Flyers", href: "/products?category=flyers" },
    { label: "Die-Cut Flyers", href: "/products?category=flyers" },
  ],
  labels: [
    { label: "Bottle Labels", href: "/products?category=labels" },
    { label: "Roll Labels", href: "/products?category=labels" },
  ],
  packaging: [
    { label: "Take-out Bags", href: "/products?category=packaging" },
    { label: "Stand Up Pouches", href: "/products?category=packaging" },
  ],
  postcards: [
    { label: "Standard Postcards", href: "/products?category=postcards" },
    { label: "EDDM Postcards", href: "/products?category=postcards" },
  ],
  "promotional-products": [
    { label: "Event Tents", href: "/products?category=promotional-products" },
    { label: "Drinkware", href: "/products?category=promotional-products" },
  ],
  signs: [
    { label: "Yard Signs", href: "/products?category=signs" },
    { label: "Wall Decals", href: "/products?category=signs" },
  ],
  stickers: [
    { label: "Custom Stickers", href: "/products?category=stickers" },
    { label: "Die-Cut Stickers", href: "/products?category=stickers" },
  ],
  "marketing-materials": [
    { label: "Menus", href: "/products?category=marketing-materials" },
    { label: "Notepads", href: "/products?category=marketing-materials" },
  ],
  posters: [
    { label: "Large Format Posters", href: "/products?category=posters" },
    { label: "Bulk Posters", href: "/products?category=posters" },
  ],
};

const popularItems = [
  {
    id: "builder",
    name: "Custom Product Builder",
    href: "/editor",
    icon: "Sparkles",
  },
  ...categories.map((c) => ({
    id: c.slug,
    name: c.name,
    href: `/products?category=${c.slug}`,
    icon: c.icon,
  })),
];

const footerLinks = [
  { label: "Custom Quote", href: "/quote" },
  { label: "Direct Mail", href: "/products?category=postcards" },
  { label: "See More Products", href: "/products", chevron: true },
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
            <h2 className="mb-3 text-lg font-bold text-secondary">
              Popular Products
            </h2>
            <nav
              className="relative border border-border bg-white"
              aria-label="Popular products"
              onMouseLeave={() => setOpenId(null)}
            >
              <ul className="divide-y divide-border">
                {popularItems.map((item) => {
                  const live = submenuByCategory[item.id] ?? [];
                  const staticExtras = categorySubmenus[item.id] ?? [];
                  const submenu = [...live, ...staticExtras].slice(0, 8);
                  const hasSubmenu = submenu.length > 0;
                  const isOpen = openId === item.id;

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
                        {hasSubmenu && (
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
                          className="absolute left-full top-0 z-40 ml-0 min-w-[220px] border border-border bg-white py-2 shadow-soft"
                        >
                          {live.length > 0 ? (
                            <p className="px-4 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                              Live products
                            </p>
                          ) : null}
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
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-secondary transition hover:bg-[#e8f4fc] hover:text-primary"
                  >
                    {link.label}
                    {"chevron" in link && link.chevron ? (
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
                  <div className="overflow-hidden border border-border bg-[#f3f4f6] transition group-hover:border-primary/40 group-hover:shadow-soft">
                    <ProductMedia
                      imageUrl={item.imageUrl ?? undefined}
                      fallbackVariant={item.image}
                      className="aspect-square"
                      label={item.name}
                    />
                  </div>
                  <p className="mt-2.5 text-center text-sm font-semibold text-secondary group-hover:text-primary">
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
