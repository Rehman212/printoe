"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchProducts } from "@/lib/products-api";
import { DynamicIcon } from "@/lib/icons";
import {
  POPULAR_FOOTER_LINKS,
  POPULAR_PRODUCT_CATEGORIES,
} from "@/lib/uprinting-nav";
import { Container } from "@/components/ui/Section";
import { ProductMedia } from "@/components/shared/ProductMedia";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types";

type ShowcaseItem = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  categorySlug: string;
};

type ShowcaseRow = {
  title: string;
  items: ShowcaseItem[];
};

function toShowcaseItem(p: CatalogProduct): ShowcaseItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.imageUrl,
    categorySlug: p.category.slug,
  };
}

/** Builds homepage carousels straight from admin-uploaded products — no hardcoded slugs. */
function buildShowcaseRows(apiProducts: CatalogProduct[]): ShowcaseRow[] {
  if (apiProducts.length === 0) return [];

  const used = new Set<string>();
  const take = (list: CatalogProduct[], count: number) => {
    const picked: CatalogProduct[] = [];
    for (const p of list) {
      if (used.has(p.slug)) continue;
      picked.push(p);
      used.add(p.slug);
      if (picked.length >= count) break;
    }
    return picked;
  };

  const byPopularity = [...apiProducts].sort(
    (a, b) => b.reviews - a.reviews || b.rating - a.rating,
  );
  const topSellers = take(byPopularity, 8);

  const byRating = [...apiProducts].sort((a, b) => b.rating - a.rating);
  const featured = take(byRating, 8);

  const mostRecent = [...apiProducts].reverse();
  const newAndUpdated = take(mostRecent, 8);

  const rows: ShowcaseRow[] = [];
  if (topSellers.length) rows.push({ title: "Top Sellers", items: topSellers.map(toShowcaseItem) });
  if (featured.length) rows.push({ title: "Featured Products", items: featured.map(toShowcaseItem) });
  if (newAndUpdated.length)
    rows.push({ title: "New & Updated Products", items: newAndUpdated.map(toShowcaseItem) });
  return rows;
}

const SIDEBAR_CATEGORY_SLUGS: Set<string> = new Set(
  POPULAR_PRODUCT_CATEGORIES.map((category) => category.slug),
);

function sidebarCategoryForProduct(product: CatalogProduct): string | null {
  const category = product.category.slug.toLowerCase();
  if (SIDEBAR_CATEGORY_SLUGS.has(category)) return category;

  const text = `${category} ${product.name}`.toLowerCase();
  if (text.includes("business card")) return "business-cards";
  if (text.includes("postcard")) return "postcards";
  if (text.includes("sticker")) return "stickers";
  if (text.includes("label")) return "labels";
  if (text.includes("flyer")) return "flyers";
  if (
    /(brochure|leaflet|newsletter|magazine|rack card)/.test(text)
  ) {
    return "brochures";
  }
  if (/(banner|fabric display|pop-up display|backdrop)/.test(text)) {
    return "banners";
  }
  if (
    /(sign|decal|cling|floor graphic|flag|poster stand|foam board|counter card)/.test(
      text,
    )
  ) {
    return "signs";
  }
  if (text.includes("box")) return "boxes";
  if (
    /(packaging|mailer|packing tape|tissue paper|wrapping paper|ribbon|bow|gift bag|dvd)/.test(
      text,
    )
  ) {
    return "packaging";
  }
  if (/(t-shirt|apparel|shirt|sweat|jacket|hat|polo)/.test(text)) {
    return "apparel";
  }
  if (
    /(magnet|stamp|notepad|table tent|trading card|appointment card|event ticket|menu)/.test(
      text,
    )
  ) {
    return "promotional-products";
  }
  return null;
}

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

function ShowcaseRowCarousel({
  title,
  items,
}: {
  title: string;
  items: ShowcaseItem[];
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [items]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <h2 className="mb-3 text-lg font-bold text-secondary">{title}</h2>
      <div className="relative">
        {canPrev ? (
          <button
            type="button"
            aria-label={`Previous ${title}`}
            onClick={() => scrollByPage(-1)}
            className="absolute -left-2 top-[42%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-white/90 text-secondary shadow-soft hover:bg-white md:-left-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}
        {canNext ? (
          <button
            type="button"
            aria-label={`Next ${title}`}
            onClick={() => scrollByPage(1)}
            className="absolute -right-2 top-[42%] z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center bg-white/90 text-secondary shadow-soft hover:bg-white md:-right-3"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}

        <div
          ref={scrollerRef}
          className="scrollbar-thin flex gap-3 overflow-x-auto scroll-smooth pb-1 sm:gap-4"
        >
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              className="group w-[calc(50%-6px)] shrink-0 focus-ring sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)]"
            >
              <div className="relative overflow-hidden border border-border bg-[#f3f4f6]">
                <div className="relative aspect-square transition-[filter,transform] duration-300 ease-out group-hover:scale-[1.03] group-hover:blur-[2.5px]">
                  <ProductMedia
                    imageUrl={item.imageUrl ?? undefined}
                    fallbackVariant={item.categorySlug}
                    label={item.name}
                    className="absolute inset-0 h-full w-full"
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
              <p className="mt-2.5 px-0.5 text-left text-sm font-medium text-secondary transition duration-300 group-hover:bg-white group-hover:shadow-md">
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
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

  const showcaseRows = useMemo(
    () => buildShowcaseRows(apiProducts),
    [apiProducts],
  );

  const submenuByCategory = useMemo(() => {
    const map: Record<string, { label: string; href: string }[]> = {};
    for (const p of apiProducts) {
      const sidebarCategory = sidebarCategoryForProduct(p);
      if (!sidebarCategory) continue;
      if (!map[sidebarCategory]) map[sidebarCategory] = [];
      map[sidebarCategory].push({
        label: p.name,
        href: `/products/${p.slug}`,
      });
    }
    for (const items of Object.values(map)) {
      items.sort((a, b) => a.label.localeCompare(b.label));
    }
    return map;
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
                  const submenu = isBuilder
                    ? []
                    : (submenuByCategory[item.id] ?? []);
                  const hasSubmenu = !isBuilder && submenu.length > 0;
                  const hasExactCategory = apiProducts.some(
                    (product) => product.category.slug === item.id,
                  );
                  const isOpen = openId === item.id;

                  return (
                    <li
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenId(item.id)}
                    >
                      <Link
                        href={isBuilder || hasExactCategory ? item.href : "#"}
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
                            href={hasExactCategory ? item.href : "#"}
                            className="mt-1 block border-t border-border px-4 py-2 text-xs font-semibold text-primary hover:underline"
                          >
                            {`View all ${item.name}`}
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

          <div className="min-w-0 space-y-8">
            {showcaseRows.map((row) => (
              <ShowcaseRowCarousel
                key={row.title}
                title={row.title}
                items={row.items}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
