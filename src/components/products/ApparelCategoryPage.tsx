"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ApparelCategory } from "@/lib/apparel-catalog";
import { APPAREL_FLYOUT } from "@/lib/apparel-catalog";
import { cn, formatCurrency } from "@/lib/utils";
import { Breadcrumbs, Container, Section } from "@/components/ui";

const PAGE_SIZE = 9;

export function ApparelCategoryPage({
  category,
  initialType,
}: {
  category: ApparelCategory;
  initialType?: string;
}) {
  const [type, setType] = useState(initialType ?? "all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (type === "all") return category.products;
    return category.products.filter((p) => p.type === type);
  }, [category.products, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const selectType = (next: string) => {
    setType(next);
    setPage(1);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#ebe4f5]">
        <Container size="wide" className="relative py-10 md:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-secondary md:text-4xl">
                {category.title}
              </h1>
              <p className="mt-3 max-w-md text-sm font-medium italic text-text-secondary md:text-base">
                {category.tagline}
              </p>
              <ul className="mt-5 space-y-2">
                {category.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-sm text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mx-auto flex h-[220px] w-full max-w-lg items-end justify-center sm:h-[280px]">
              {category.heroImages.map((src, i) => (
                <div
                  key={src + i}
                  className={cn(
                    "absolute bottom-0 overflow-hidden rounded-sm shadow-card",
                    i === 0 && "left-[8%] z-[1] h-[78%] w-[34%] -rotate-6",
                    i === 1 && "left-1/2 z-[2] h-[92%] w-[36%] -translate-x-1/2",
                    i === 2 && "right-[8%] z-[1] h-[78%] w-[34%] rotate-6",
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                    priority={i === 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </Container>
        <div className="border-t border-white/50 bg-white/55 backdrop-blur-sm">
          <Container size="wide">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 py-3">
              {category.brands.map((brand) => (
                <span
                  key={brand}
                  className="text-[11px] font-bold uppercase tracking-wider text-secondary/55"
                >
                  {brand}
                </span>
              ))}
            </div>
          </Container>
        </div>
      </section>

      <Section className="bg-white py-8 md:py-10">
        <Container size="wide">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Apparel", href: "/products?category=apparel" },
              { label: category.name },
            ]}
          />

          {/* Sibling apparel links */}
          <div className="mb-6 flex flex-wrap gap-2">
            {APPAREL_FLYOUT.map((item) => {
              const active = item.href.endsWith(`/${category.slug}`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-secondary hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            {/* Left subtype sidebar */}
            <aside>
              <nav
                className="border border-border bg-white"
                aria-label={`${category.name} types`}
              >
                <h2 className="border-b border-border bg-[#f5f5f5] px-4 py-3 text-sm font-bold text-secondary">
                  {category.sidebarTitle}
                </h2>
                <ul className="divide-y divide-border">
                  <li>
                    <button
                      type="button"
                      onClick={() => selectType("all")}
                      className={cn(
                        "block w-full px-4 py-2.5 text-left text-sm transition",
                        type === "all"
                          ? "bg-[#e8f4fc] font-semibold text-primary"
                          : "text-secondary hover:bg-[#e8f4fc] hover:text-primary",
                      )}
                    >
                      All {category.name}
                    </button>
                  </li>
                  {category.sidebar.map((item) => (
                    <li key={item.slug}>
                      <button
                        type="button"
                        onClick={() => selectType(item.slug)}
                        className={cn(
                          "block w-full px-4 py-2.5 text-left text-sm transition",
                          type === item.slug
                            ? "bg-[#e8f4fc] font-semibold text-primary"
                            : "text-secondary hover:bg-[#e8f4fc] hover:text-primary",
                        )}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Product grid */}
            <div>
              <div className="mb-4 flex items-center justify-end gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={cn(
                        "flex h-8 min-w-8 items-center justify-center border px-2 text-sm font-semibold",
                        currentPage === n
                          ? "border-secondary bg-secondary text-white"
                          : "border-border text-secondary hover:border-primary hover:text-primary",
                      )}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center border border-border text-secondary disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="flex h-8 w-8 items-center justify-center border border-border text-secondary disabled:opacity-40"
                  aria-label="Last page"
                >
                  <ChevronRight className="h-4 w-4" />
                  <ChevronRight className="-ml-2.5 h-4 w-4" />
                </button>
              </div>

              {paginated.length === 0 ? (
                <p className="py-16 text-center text-sm text-text-secondary">
                  No products in this type yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {paginated.map((product) => (
                    <Link
                      key={product.id}
                      href={`/custom-printing?product=${encodeURIComponent(product.slug)}&category=apparel`}
                      className="group border border-border bg-white transition hover:border-primary/40 hover:shadow-soft focus-ring"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#f3f4f6]">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                      <div className="space-y-1 px-3 py-4 text-center">
                        <h3 className="text-sm font-bold text-accent group-hover:text-primary">
                          {product.name}
                        </h3>
                        <p className="text-xs font-medium italic text-text-secondary">
                          from {formatCurrency(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-secondary disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <span className="text-sm text-text-secondary">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-secondary disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
