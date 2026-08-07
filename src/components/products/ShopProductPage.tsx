"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Pencil,
  Play,
  Share2,
  Upload,
} from "lucide-react";
import {
  estimateShopPrice,
  type ShopProduct,
} from "@/lib/shop-catalog";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Breadcrumbs,
  Container,
  Section,
  StarRating,
  Tooltip,
} from "@/components/ui";

const CATEGORY_LABELS: Record<string, string> = {
  flyers: "Flyers",
  brochures: "Brochures",
  labels: "Labels",
  packaging: "Packaging",
  postcards: "Postcards",
  "promotional-products": "Promotional Products",
  signs: "Signs",
  stickers: "Stickers",
};

export function ShopProductPage({ product }: { product: ShopProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of product.fields) {
      init[f.key] = f.options[0]?.value ?? "";
    }
    init.quantity = init.quantity || "250";
    init.turnaround = init.turnaround || "3 Business Days";
    return init;
  });

  const price = useMemo(
    () => estimateShopPrice(product, selections),
    [product, selections],
  );
  const qty = Number(selections.quantity) || 250;
  const each = Math.round((price / qty) * 100) / 100;

  const query = new URLSearchParams({
    product: `${product.category}/${product.slug}`,
    ...selections,
  }).toString();

  const catLabel = CATEGORY_LABELS[product.category] ?? product.category;

  return (
    <Section className="bg-white py-6 md:py-10">
      <Container size="wide">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            {
              label: catLabel,
              href: `/products?category=${product.category}`,
            },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(480px,46%)] xl:grid-cols-[1fr_minmax(540px,48%)] lg:items-start lg:gap-10">
          <div>
            <div className="relative overflow-hidden border border-border bg-[#f3f4f6]">
              <div className="relative aspect-square w-full sm:aspect-[5/4]">
                <Image
                  src={product.images[activeImage]!}
                  alt={product.name}
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveImage(
                    (i) =>
                      (i - 1 + product.images.length) % product.images.length,
                  )
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-secondary"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
                {product.images.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative h-16 w-20 shrink-0 overflow-hidden border-2 bg-[#f3f4f6] sm:h-20 sm:w-24",
                      activeImage === i
                        ? "border-[#1b5e20]"
                        : "border-border opacity-80 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {i === 2 ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setActiveImage((i) => (i + 1) % product.images.length)
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-secondary"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-6 space-y-2.5">
              {product.features.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-2.5 text-sm text-text-secondary"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1b5e20]" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-secondary md:text-3xl">
                  {product.name}
                </h1>
                <div className="mt-2">
                  <StarRating
                    rating={Number(product.rating.toFixed(1))}
                    reviews={product.reviews}
                    size="md"
                  />
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
                Share Product
              </button>
            </div>

            <div className="mt-5 border border-border bg-[#f7f7f7] p-4 sm:p-5">
              <div className="space-y-3.5">
                {product.fields.map((field) => (
                  <label key={field.key} className="block space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary">
                      {field.label}
                      {field.helpText ? (
                        <Tooltip content={field.helpText}>
                          <button
                            type="button"
                            className="text-text-secondary/70"
                            aria-label={`Help: ${field.label}`}
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </button>
                        </Tooltip>
                      ) : null}
                    </span>
                    <select
                      value={selections[field.key] ?? field.options[0]?.value}
                      onChange={(e) =>
                        setSelections((s) => ({
                          ...s,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="h-11 w-full border border-border bg-white px-3 text-sm font-medium text-secondary outline-none focus:border-primary focus-ring"
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/60 pt-4">
                <div>
                  <p className="text-sm font-semibold text-secondary">
                    Printing Cost:
                  </p>
                  <p className="text-xs text-text-secondary">
                    ({formatCurrency(each)} for each)
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-[#1b5e20] md:text-3xl">
                  {formatCurrency(price)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              <Link
                href={`/upload?${query}`}
                className="inline-flex h-12 items-center justify-center gap-2 bg-[#1b5e20] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#144a19] focus-ring"
              >
                <Upload className="h-4 w-4" />
                Upload Design
              </Link>
              <Link
                href={`/editor?${query}`}
                className="inline-flex h-12 items-center justify-center gap-2 border-2 border-[#1b5e20] bg-white text-sm font-bold uppercase tracking-wider text-[#1b5e20] transition hover:bg-[#1b5e20] hover:text-white focus-ring"
              >
                <Pencil className="h-4 w-4" />
                Design Online
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
