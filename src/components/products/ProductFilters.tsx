"use client";

import { RotateCcw, SlidersHorizontal, Star } from "lucide-react";
import { categories, products } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Misc";

export type ProductFiltersState = {
  category: string;
  size: string;
  material: string;
  finishing: string;
  quantity: string;
  deliveryTime: string;
  priceMin: number;
  priceMax: number;
  minRating: number;
  sort: string;
};

export const defaultProductFilters: ProductFiltersState = {
  category: "all",
  size: "all",
  material: "all",
  finishing: "all",
  quantity: "all",
  deliveryTime: "all",
  priceMin: 0,
  priceMax: 200,
  minRating: 0,
  sort: "featured",
};

const allSizes = [...new Set(products.flatMap((p) => p.sizes))].sort();
const allMaterials = [...new Set(products.flatMap((p) => p.materials))].sort();
const allFinishes = [...new Set(products.flatMap((p) => p.finishes))].sort();

const quantityOptions = [
  { label: "Any quantity", value: "all" },
  { label: "100+", value: "100" },
  { label: "250+", value: "250" },
  { label: "500+", value: "500" },
  { label: "1,000+", value: "1000" },
];

const deliveryOptions = [
  { label: "Any delivery", value: "all" },
  { label: "1–2 business days", value: "fast" },
  { label: "3–5 business days", value: "standard" },
  { label: "5+ business days", value: "extended" },
];

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
  { label: "Fastest Delivery", value: "delivery" },
];

const ratingOptions = [
  { label: "Any rating", value: "0" },
  { label: "4.0+ stars", value: "4" },
  { label: "4.5+ stars", value: "4.5" },
  { label: "4.8+ stars", value: "4.8" },
];

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-border pb-5 last:border-0 last:pb-0">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-text-secondary">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all focus-ring",
            value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-text-secondary hover:border-primary/30 hover:text-text-primary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ProductFilters({
  filters,
  onChange,
  onReset,
  className,
}: {
  filters: ProductFiltersState;
  onChange: (filters: ProductFiltersState) => void;
  onReset: () => void;
  className?: string;
}) {
  const update = (patch: Partial<ProductFiltersState>) =>
    onChange({ ...filters, ...patch });

  const categoryOptions = [
    { label: "All categories", value: "all" },
    ...categories.map((c) => ({ label: c.name, value: c.slug })),
  ];

  const sizeOptions = [
    { label: "All sizes", value: "all" },
    ...allSizes.map((s) => ({ label: s, value: s })),
  ];

  const materialOptions = [
    { label: "All materials", value: "all" },
    ...allMaterials.map((m) => ({ label: m, value: m })),
  ];

  const finishOptions = [
    { label: "All finishes", value: "all" },
    ...allFinishes.map((f) => ({ label: f, value: f })),
  ];

  return (
    <aside
      className={cn(
        "sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-soft scrollbar-thin",
        className,
      )}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-text-primary">Filters</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="space-y-5">
        <FilterSection title="Sort by">
          <Select
            options={sortOptions}
            value={filters.sort}
            onChange={(sort) => update({ sort })}
          />
        </FilterSection>

        <FilterSection title="Category">
          <ChipGroup
            options={categoryOptions.slice(0, 7)}
            value={filters.category}
            onChange={(category) => update({ category })}
          />
          {categoryOptions.length > 7 ? (
            <Select
              options={categoryOptions}
              value={filters.category}
              onChange={(category) => update({ category })}
            />
          ) : null}
        </FilterSection>

        <FilterSection title="Size">
          <Select
            options={sizeOptions}
            value={filters.size}
            onChange={(size) => update({ size })}
          />
        </FilterSection>

        <FilterSection title="Paper / Material">
          <Select
            options={materialOptions}
            value={filters.material}
            onChange={(material) => update({ material })}
          />
        </FilterSection>

        <FilterSection title="Finishing">
          <Select
            options={finishOptions}
            value={filters.finishing}
            onChange={(finishing) => update({ finishing })}
          />
        </FilterSection>

        <FilterSection title="Quantity">
          <Select
            options={quantityOptions}
            value={filters.quantity}
            onChange={(quantity) => update({ quantity })}
          />
        </FilterSection>

        <FilterSection title="Delivery time">
          <Select
            options={deliveryOptions}
            value={filters.deliveryTime}
            onChange={(deliveryTime) => update({ deliveryTime })}
          />
        </FilterSection>

        <FilterSection title="Price range">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-text-primary">
              <span>{formatCurrency(filters.priceMin)}</span>
              <span>{formatCurrency(filters.priceMax)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={filters.priceMax}
              onChange={(e) => update({ priceMax: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
            />
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={filters.priceMin}
              onChange={(e) =>
                update({
                  priceMin: Math.min(Number(e.target.value), filters.priceMax),
                })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
            />
          </div>
        </FilterSection>

        <FilterSection title="Ratings">
          <div className="space-y-2">
            {ratingOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ minRating: Number(opt.value) })}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-all focus-ring",
                  filters.minRating === Number(opt.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-text-secondary hover:border-primary/30",
                )}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    filters.minRating === Number(opt.value)
                      ? "fill-warning text-warning"
                      : "text-border",
                  )}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}
