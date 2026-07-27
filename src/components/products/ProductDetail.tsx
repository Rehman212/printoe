"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Pencil,
  Share2,
  Upload,
} from "lucide-react";
import { useProductsOptional } from "@/lib/product-store";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product, ProductOptionGroup } from "@/types";
import { ProductMedia } from "@/components/shared/ProductMedia";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import {
  Accordion,
  Badge,
  Button,
  Container,
  EmptyState,
  Section,
  StarRating,
  useToast,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Misc";
import {
  calcConfiguredPrice,
  defaultSelections,
  fetchProductBySlug,
} from "@/lib/products-api";
import { createCustomerDesign } from "@/lib/customer-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProductReviews } from "@/components/products/ProductReviews";

const faqs = [
  {
    id: "faq-1",
    title: "What file formats do you accept?",
    content:
      "PDF, AI, EPS, and high-res PNG/JPG. PDF with bleed and embedded fonts is preferred.",
  },
  {
    id: "faq-2",
    title: "Do you check my artwork for free?",
    content:
      "Yes. Every order includes a complimentary preflight review before production.",
  },
  {
    id: "faq-3",
    title: "Can I change options after calculating?",
    content:
      "Absolutely. Update any option and the printing cost updates instantly.",
  },
];

/** Convert legacy local product fields into option groups (fallback). */
function legacyToOptions(product: Product): ProductOptionGroup[] {
  if (product.options?.length) return product.options;

  const groups: ProductOptionGroup[] = [];
  let order = 0;

  if (product.productTypes?.length) {
    groups.push({
      id: "legacy-type",
      key: "sticker_type",
      label: "Product Type",
      uiType: "CARDS",
      required: true,
      sortOrder: order++,
      values: product.productTypes.map((t, i) => ({
        id: `type-${i}`,
        label: t.label,
        value: t.value,
        priceMod: 1 + i * 0.05,
        sortOrder: i,
      })),
    });
  }

  if (product.sizes?.length) {
    groups.push({
      id: "legacy-size",
      key: "size",
      label: "Size",
      uiType: "SELECT",
      required: true,
      sortOrder: order++,
      values: product.sizes.map((s, i) => ({
        id: `size-${i}`,
        label: s,
        value: s,
        priceMod: 1 + i * 0.08,
        sortOrder: i,
      })),
    });
  }

  if (product.materials?.length) {
    groups.push({
      id: "legacy-material",
      key: "material",
      label: "Material",
      uiType: "SELECT",
      required: true,
      sortOrder: order++,
      values: product.materials.map((m, i) => ({
        id: `mat-${i}`,
        label: m,
        value: m,
        priceMod: 1 + i * 0.1,
        sortOrder: i,
      })),
    });
  }

  if (product.finishes?.length) {
    groups.push({
      id: "legacy-finish",
      key: "finish",
      label: "Finish",
      uiType: "SELECT",
      required: true,
      sortOrder: order++,
      values: product.finishes.map((f, i) => ({
        id: `fin-${i}`,
        label: f,
        value: f,
        priceMod: 1 + i * 0.07,
        sortOrder: i,
      })),
    });
  }

  if (product.bundling?.length) {
    groups.push({
      id: "legacy-bundling",
      key: "bundling",
      label: "Bundling",
      uiType: "SELECT",
      required: true,
      sortOrder: order++,
      values: product.bundling.map((b, i) => ({
        id: `bun-${i}`,
        label: b,
        value: b,
        priceMod: 1 + i * 0.03,
        sortOrder: i,
      })),
    });
  }

  groups.push({
    id: "legacy-qty",
    key: "quantity",
    label: "Quantity",
    uiType: "SELECT",
    required: true,
    sortOrder: order++,
    values: [100, 250, 500, 1000, 2500, 5000].map((q, i) => ({
      id: `qty-${q}`,
      label: q.toLocaleString(),
      value: String(q),
      priceMod:
        q >= 5000 ? 0.72 : q >= 2500 ? 0.78 : q >= 1000 ? 0.85 : q >= 500 ? 0.92 : 1,
      sortOrder: i,
    })),
  });

  if (product.turnaround?.length) {
    groups.push({
      id: "legacy-turn",
      key: "turnaround",
      label: "Printing Time",
      uiType: "SELECT",
      required: true,
      sortOrder: order++,
      values: product.turnaround.map((t, i) => ({
        id: `turn-${i}`,
        label: t,
        value: t,
        priceMod: 1 + i * 0.18,
        sortOrder: i,
      })),
    });
  }

  return groups;
}

export function ProductDetail({ slug }: { slug: string }) {
  const store = useProductsOptional();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const localProduct = store.getBySlug(slug);

  const [loading, setLoading] = useState(true);
  const [savingDesign, setSavingDesign] = useState(false);
  const [name, setName] = useState(localProduct?.name ?? "");
  const [description, setDescription] = useState(localProduct?.description ?? "");
  const [basePrice, setBasePrice] = useState(localProduct?.price ?? 0);
  const [rating, setRating] = useState(localProduct?.rating ?? 0);
  const [reviews, setReviews] = useState(localProduct?.reviews ?? 0);
  const [badge, setBadge] = useState(localProduct?.badge);
  const [categorySlug, setCategorySlug] = useState(localProduct?.category ?? "");
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState(localProduct?.imageUrl);
  const [gallery, setGallery] = useState<string[]>(
    localProduct?.galleryUrls?.length
      ? localProduct.galleryUrls
      : localProduct?.imageUrl
        ? [localProduct.imageUrl]
        : [],
  );
  const [fallbackImage, setFallbackImage] = useState(localProduct?.image ?? "default");
  const [options, setOptions] = useState<ProductOptionGroup[]>(
    localProduct ? legacyToOptions(localProduct) : [],
  );
  const [selections, setSelections] = useState<Record<string, string>>(
    localProduct ? defaultSelections(legacyToOptions(localProduct)) : {},
  );
  const [activeImage, setActiveImage] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetchProductBySlug(slug);
        if (cancelled) return;
        const { product, options: apiOptions } = res.data;
        setFromApi(true);
        setName(product.name);
        setDescription(product.description);
        setBasePrice(product.basePrice);
        setRating(product.rating);
        setReviews(product.reviews);
        setBadge(product.badge ?? undefined);
        setCategorySlug(product.category.slug);
        setCategoryName(product.category.name);
        setImageUrl(product.imageUrl ?? undefined);
        setGallery(
          product.galleryUrls?.length
            ? product.galleryUrls
            : product.imageUrl
              ? [product.imageUrl]
              : [],
        );
        setFallbackImage(product.category.slug);
        setOptions(apiOptions);
        setSelections(defaultSelections(apiOptions));
        setNotFound(false);
      } catch {
        if (cancelled) return;
        if (localProduct) {
          setFromApi(false);
          const opts = legacyToOptions(localProduct);
          setName(localProduct.name);
          setDescription(localProduct.description);
          setBasePrice(localProduct.price);
          setRating(localProduct.rating);
          setReviews(localProduct.reviews);
          setBadge(localProduct.badge);
          setCategorySlug(localProduct.category);
          setCategoryName(
            localProduct.category
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" "),
          );
          setImageUrl(localProduct.imageUrl);
          setGallery(
            localProduct.galleryUrls?.length
              ? localProduct.galleryUrls
              : localProduct.imageUrl
                ? [localProduct.imageUrl]
                : [],
          );
          setFallbackImage(localProduct.image);
          setOptions(opts);
          setSelections(defaultSelections(opts));
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const pricing = useMemo(
    () => calcConfiguredPrice(basePrice, options, selections),
    [basePrice, options, selections],
  );

  const onOptionChange = (key: string, value: string) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  async function saveCurrentDesign() {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Log in to save designs to your account.",
        tone: "warning",
      });
      return;
    }
    setSavingDesign(true);
    try {
      const summary = options
        .map((g) => {
          const v = g.values.find((x) => x.value === selections[g.key]);
          return v ? `${g.label}: ${v.label}` : null;
        })
        .filter(Boolean)
        .slice(0, 4)
        .join(" · ");
      await createCustomerDesign({
        name: `${name || slug} · ${new Date().toLocaleDateString()}`,
        productSlug: slug,
        productName: summary ? `${name} (${summary})` : name || slug,
      });
      toast({
        title: "Design saved",
        description: "Find it under Account → Saved Designs.",
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Could not save design",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setSavingDesign(false);
    }
  }

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-border/60" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-xl bg-border/60" />
              <div className="h-40 animate-pulse rounded-2xl bg-border/60" />
              <div className="h-24 animate-pulse rounded-2xl bg-border/60" />
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  if (notFound) {
    return (
      <Section>
        <Container size="narrow">
          <EmptyState
            title="Product not found"
            description="This product may have been moved."
            action={
              <Link href="/products">
                <Button>Browse products</Button>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  const nextImage = () =>
    setActiveImage((i) => (gallery.length ? (i + 1) % gallery.length : 0));
  const prevImage = () =>
    setActiveImage((i) =>
      gallery.length ? (i - 1 + gallery.length) % gallery.length : 0,
    );

  const query = new URLSearchParams({
    product: slug,
    total: pricing.total.toFixed(2),
    qty: String(pricing.quantity),
    ...selections,
  });

  return (
    <>
      <Section className="bg-white pb-16 pt-6">
        <Container size="wide">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              {
                label: categoryName || "Products",
                href: `/products?category=${categorySlug}`,
              },
              { label: name },
            ]}
          />

          <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <div className="relative overflow-hidden border border-border bg-[#f3f4f6]">
                <ProductMedia
                  imageUrl={gallery[activeImage] ?? imageUrl}
                  fallbackVariant={fallbackImage}
                  label={name}
                  className="aspect-[4/3] w-full"
                  priority
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 shadow-soft"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 shadow-soft"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {gallery.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((url, i) => (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden border-2",
                        activeImage === i
                          ? "border-primary"
                          : "border-border opacity-80 hover:opacity-100",
                      )}
                    >
                      <ProductMedia
                        imageUrl={url}
                        fallbackVariant={fallbackImage}
                        className="h-full w-full"
                        label={`${name} ${i + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}

              <ul className="mt-6 space-y-2.5">
                <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  Options are product-specific and update pricing live
                </li>
                {fromApi ? (
                  <li className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    Loaded from Printoe product options API
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-secondary md:text-3xl">
                    {name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <StarRating rating={rating} reviews={reviews} size="md" />
                    {badge ? <Badge variant="primary">{badge}</Badge> : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  <Share2 className="h-4 w-4" /> Share Product
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {description}
              </p>

              <div className="mt-5 border border-border bg-[#fafafa] p-4 sm:p-5">
                <ProductConfigurator
                  options={options}
                  selections={selections}
                  onChange={onOptionChange}
                />
              </div>

              <div className="mt-4 border border-border bg-white p-4">
                <p className="text-sm font-medium text-text-secondary">
                  Printing Cost:{" "}
                  <span className="text-2xl font-extrabold text-success">
                    {formatCurrency(pricing.total)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  ({formatCurrency(pricing.unit)} for each · qty {pricing.quantity})
                </p>
                {pricing.lines.length > 0 ? (
                  <details className="mt-3 group">
                    <summary className="cursor-pointer text-xs font-semibold text-primary hover:underline">
                      How price is calculated
                    </summary>
                    <div className="mt-2 space-y-1.5 rounded-lg border border-border bg-[#fafafa] p-3 text-xs text-text-secondary">
                      <p>
                        Base {formatCurrency(pricing.basePrice)}
                        {pricing.isPerUnit ? " (per unit)" : " (pack)"} × option
                        multipliers
                        {pricing.isPerUnit ? ` × qty ${pricing.quantity}` : ""}
                      </p>
                      <ul className="space-y-1">
                        {pricing.lines.map((line) => (
                          <li
                            key={line.key}
                            className="flex justify-between gap-3 border-b border-border/50 pb-1 last:border-0 last:pb-0"
                          >
                            <span>
                              {line.label}:{" "}
                              <span className="font-medium text-secondary">
                                {line.selectedLabel}
                              </span>
                            </span>
                            <span className="shrink-0 font-semibold tabular-nums">
                              ×{line.priceMod.toFixed(2)}
                              {line.key === "turnaround" && line.priceMod > 1
                                ? " rush"
                                : null}
                              {line.key === "quantity" && line.priceMod < 1
                                ? " volume"
                                : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="pt-1 font-semibold text-secondary">
                        Combined multiplier ×{pricing.mod.toFixed(3)} →{" "}
                        {formatCurrency(pricing.total)}
                      </p>
                    </div>
                  </details>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Link href={`/upload?${query.toString()}`} className="block">
                  <Button size="lg" className="w-full gap-2">
                    <Upload className="h-4 w-4" /> Upload Design
                  </Button>
                </Link>
                <Link href={`/editor?product=${encodeURIComponent(slug)}`} className="block">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
                  >
                    <Pencil className="h-4 w-4" /> Design Online
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  disabled={savingDesign}
                  onClick={() => void saveCurrentDesign()}
                >
                  <Bookmark className="h-4 w-4" />
                  {savingDesign ? "Saving…" : "Save Design"}
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-text-secondary">
                Saved designs appear in{" "}
                <Link
                  href="/dashboard/saved-designs"
                  className="font-semibold text-primary hover:underline"
                >
                  Your Account → Saved Designs
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="bg-white py-4">
        <Container size="wide">
          <ProductReviews
            slug={slug}
            rating={rating}
            reviewsCount={reviews}
            onStatsChange={({ rating: r, reviews: c }) => {
              setRating(r);
              setReviews(c);
            }}
          />
        </Container>
      </Section>

      <Section className="border-t border-border bg-background py-12">
        <Container size="narrow">
          <h2 className="mb-6 text-xl font-bold text-secondary">FAQs</h2>
          <Accordion items={faqs} />
        </Container>
      </Section>

      <Section className="bg-white py-12">
        <Container size="wide">
          <h2 className="mb-6 text-xl font-bold text-secondary">Related products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {store.products
              .filter((p) => p.slug !== slug)
              .slice(0, 4)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group border border-border bg-white transition hover:border-primary/40 hover:shadow-soft"
                >
                  <ProductMedia
                    imageUrl={p.imageUrl}
                    fallbackVariant={p.image}
                    label={p.name}
                    className="aspect-square"
                  />
                  <div className="border-t border-border p-3">
                    <p className="text-sm font-bold text-secondary group-hover:text-primary">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      From {formatCurrency(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
