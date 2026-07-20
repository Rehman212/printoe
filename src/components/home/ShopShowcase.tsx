"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { categories, products } from "@/lib/data";
import { DynamicIcon } from "@/lib/icons";
import { Container } from "@/components/ui/Section";
import { ProductVisual } from "@/components/shared/ProductVisual";
import { cn } from "@/lib/utils";

const popular = [
  { name: "Custom Product Builder", href: "/editor", icon: "Sparkles" },
  ...categories.slice(0, 8).map((c) => ({
    name: c.name,
    href: `/products?category=${c.slug}`,
    icon: c.icon,
  })),
];

const topSellers = [
  { name: "Menus", slug: "tri-fold-brochures", image: "brochures" },
  { name: "Coasters", slug: "die-cut-stickers", image: "stickers" },
  { name: "Bottle Labels", slug: "roll-labels", image: "labels" },
  { name: "Vinyl Banners", slug: "vinyl-banners", image: "banners" },
  { name: "Business Cards", slug: "silk-business-cards", image: "business-cards" },
  { name: "Posters", slug: "event-posters", image: "posters" },
];

export function ShopShowcase() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollNext = () => {
    scrollerRef.current?.scrollBy({ left: 280, behavior: "smooth" });
  };

  return (
    <section className="border-b border-border bg-white py-8 md:py-10">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
          {/* Popular Products sidebar */}
          <aside>
            <h2 className="mb-3 text-lg font-bold text-secondary">
              Popular Products
            </h2>
            <nav
              className="divide-y divide-border border border-border bg-white"
              aria-label="Popular products"
            >
              {popular.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center gap-3 px-3.5 py-3 transition hover:bg-background focus-ring"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center text-text-secondary group-hover:text-primary">
                    <DynamicIcon name={item.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-secondary group-hover:text-primary">
                    {item.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text-secondary/70" />
                </Link>
              ))}
            </nav>
          </aside>

          {/* Top Sellers */}
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

            <div className="relative">
              <div
                ref={scrollerRef}
                className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-thin"
              >
                {topSellers.map((item) => {
                  const product = products.find((p) => p.slug === item.slug);
                  return (
                    <Link
                      key={item.name}
                      href={`/products/${item.slug}`}
                      className="group w-[200px] shrink-0 focus-ring sm:w-[220px]"
                    >
                      <div className="overflow-hidden border border-border bg-[#f3f4f6] transition group-hover:border-primary/40 group-hover:shadow-soft">
                        <ProductVisual
                          variant={item.image}
                          className="aspect-square rounded-none"
                          label={item.name}
                          style="catalog"
                        />
                      </div>
                      <p className="mt-2.5 text-center text-sm font-semibold text-secondary group-hover:text-primary">
                        {item.name}
                      </p>
                      {product ? (
                        <p className="text-center text-xs font-medium text-text-secondary">
                          From ${product.price.toFixed(2)}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={scrollNext}
                className={cn(
                  "absolute -right-2 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center",
                  "rounded-full border border-border bg-white text-secondary shadow-soft",
                  "transition hover:border-primary hover:text-primary md:flex focus-ring",
                )}
                aria-label="See more top sellers"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
