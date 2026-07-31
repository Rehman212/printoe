"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Package,
  Play,
  Upload,
} from "lucide-react";
import {
  BOX_FAMILY_TABS,
  estimateBoxPrice,
  type BoxProduct,
} from "@/lib/boxes-catalog";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Breadcrumbs,
  Container,
  Section,
  StarRating,
  Tooltip,
} from "@/components/ui";

const TAB_ICONS: Record<string, typeof Box> = {
  "mailer-boxes": Package,
  "product-boxes": Box,
  "shipping-boxes": Package,
};

export function BoxesProductPage({ product }: { product: BoxProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const [dims, setDims] = useState({ length: 4, width: 4, depth: 4 });
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of product.fields) {
      init[f.key] = f.options[0]?.value ?? "";
    }
    if (product.slug === "mailer-boxes") {
      init.printing = "Full Color";
      init.size = '10" x 8" x 4"';
      init.material = "Standard White with Matte Ink (HD Print)";
      init.printedSides = "Outside";
      init.quantity = "100";
    }
    if (product.slug === "product-boxes") {
      init.boxType = "Cardstock";
      init.size = "Custom Size";
      init.material = "18pt Cardstock";
      init.quantity = "100";
    }
    return init;
  });

  const showCustomDims =
    Boolean(product.customDimensions) && selections.size === "Custom Size";

  const pricing = useMemo(
    () =>
      estimateBoxPrice(
        product,
        selections,
        showCustomDims ? dims : undefined,
      ),
    [product, selections, showCustomDims, dims],
  );

  const query = new URLSearchParams({
    product: product.slug,
    ...selections,
    ...(showCustomDims
      ? {
          length: String(dims.length),
          width: String(dims.width),
          depth: String(dims.depth),
        }
      : {}),
  }).toString();

  const prevImage = () =>
    setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
  const nextImage = () =>
    setActiveImage((i) => (i + 1) % product.images.length);

  return (
    <>
      <div className="bg-[#1e4d8c] px-4 py-2.5 text-center text-sm font-medium text-white">
        Good news! We now offer Rush Production on custom box orders.
      </div>

      <Section className="bg-white py-6 md:py-10">
        <Container size="wide">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Custom Packaging", href: "/products?category=packaging" },
              { label: "Custom Boxes", href: "/products?category=boxes" },
              { label: product.name.replace(/^Custom\s+/i, "") },
            ]}
          />

          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(480px,48%)] xl:grid-cols-[1fr_minmax(540px,50%)] lg:items-start lg:gap-10">
            {/* Left gallery */}
            <div>
              <div className="relative overflow-hidden border border-border bg-[#f3f4f6]">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={product.images[activeImage]!}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevImage}
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-secondary hover:border-primary"
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
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {i === 2 ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                          <Play className="h-5 w-5 fill-white text-white" />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextImage}
                  className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-secondary hover:border-primary"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-4 text-sm font-medium text-text-secondary">
                {product.caption}
              </p>
            </div>

            {/* Right configurator */}
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-secondary md:text-3xl">
                {product.name}
              </h1>
              <div className="mt-2">
                <StarRating
                  rating={product.rating}
                  reviews={product.reviews}
                  size="md"
                />
              </div>

              {product.showFamilyTabs ? (
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {BOX_FAMILY_TABS.map((tab) => {
                    const active = tab.slug === product.slug;
                    const Icon = TAB_ICONS[tab.slug] ?? Box;
                    return (
                      <Link
                        key={tab.slug}
                        href={tab.href}
                        className={cn(
                          "flex flex-col items-center gap-2 border-2 bg-white px-2 py-3 text-center transition",
                          active
                            ? "border-[#1b5e20] text-secondary"
                            : "border-border text-text-secondary hover:border-border",
                        )}
                      >
                        <Icon className="h-7 w-7" strokeWidth={1.5} />
                        <span
                          className={cn(
                            "text-xs font-semibold leading-tight",
                            active && "font-bold",
                          )}
                        >
                          {tab.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-5 overflow-hidden border border-border">
                <div className="bg-[#1b5e20] px-4 py-2.5 text-center text-sm font-bold uppercase tracking-wide text-white">
                  ↓ Customize &amp; Check Prices
                </div>

                <div className="space-y-3.5 bg-white p-4 sm:p-5">
                  {product.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block space-y-1.5">
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

                      {field.key === "size" && showCustomDims ? (
                        <div className="mt-3">
                          <p className="mb-2 text-sm font-semibold text-secondary">
                            Enter Interior Dimensions
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {(
                              [
                                ["length", "Length (in)"],
                                ["width", "Width (in)"],
                                ["depth", "Depth (in)"],
                              ] as const
                            ).map(([key, label]) => (
                              <label key={key} className="space-y-1">
                                <span className="block text-xs font-medium text-text-secondary">
                                  {label}
                                </span>
                                <input
                                  type="number"
                                  min={1}
                                  max={48}
                                  step={0.25}
                                  value={dims[key]}
                                  onChange={(e) =>
                                    setDims((d) => ({
                                      ...d,
                                      [key]: Number(e.target.value) || 1,
                                    }))
                                  }
                                  className="h-11 w-full border border-border bg-white px-2 text-sm font-medium outline-none focus:border-primary focus-ring"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {field.key === "quantity" ? (
                        <p className="mt-1.5 text-xs font-medium text-accent">
                          Custom quantities
                        </p>
                      ) : null}
                    </div>
                  ))}

                  <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <p className="text-2xl font-extrabold text-[#1b5e20]">
                        {formatCurrency(pricing.unit)}{" "}
                        <span className="text-base font-bold">each</span>
                      </p>
                      <p className="mt-1 text-sm font-medium text-text-secondary">
                        Subtotal: {formatCurrency(pricing.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/upload?${query}`}
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 bg-[#1b5e20] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#144a19] focus-ring"
              >
                <Upload className="h-4 w-4" />
                Upload Design
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
