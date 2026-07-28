"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Search, Sparkles, Truck } from "lucide-react";
import { createCustomerQuote } from "@/lib/customer-api";
import {
  fetchProductBySlug,
  fetchProducts,
  fetchStoreCategories,
} from "@/lib/products-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatCurrency } from "@/lib/utils";
import type { CatalogProduct, ProductOptionGroup } from "@/types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  Input,
  Section,
  SectionHeader,
  useToast,
} from "@/components/ui";
import { Breadcrumbs, Select } from "@/components/ui/Misc";

const quantityPresets = [100, 250, 500, 1000, 2500];

type QuoteProduct = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  deliveryDays: number;
  imageUrl?: string | null;
};

function mapCatalog(p: CatalogProduct): QuoteProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categorySlug: p.category?.slug ?? "",
    price: p.basePrice,
    deliveryDays: p.deliveryDays ?? 5,
    imageUrl: p.imageUrl,
  };
}

function optionLabels(group?: ProductOptionGroup) {
  return (group?.values ?? []).map((v) => ({
    label: v.label,
    value: v.value,
  }));
}

export function InstantQuote() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<
    Array<{ name: string; slug: string }>
  >([]);
  const [allProducts, setAllProducts] = useState<QuoteProduct[]>([]);
  const [category, setCategory] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [productOpen, setProductOpen] = useState(false);
  const [quantity, setQuantity] = useState(500);
  const [options, setOptions] = useState<ProductOptionGroup[]>([]);
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [finishing, setFinishing] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchStoreCategories(),
          fetchProducts(),
        ]);
        if (cancelled) return;
        const cats = (catRes.data ?? [])
          .filter((c) => c.productCount > 0)
          .map((c) => ({ name: c.name, slug: c.slug }));
        const prods = (prodRes.data ?? []).map(mapCatalog);
        setCategories(cats);
        setAllProducts(prods);
        const firstCat =
          cats.find((c) => prods.some((p) => p.categorySlug === c.slug))?.slug ||
          cats[0]?.slug ||
          "";
        setCategory(firstCat);
        const firstProd = prods.find((p) => p.categorySlug === firstCat) ?? prods[0];
        if (firstProd) {
          setProductSlug(firstProd.slug);
          setProductQuery(firstProd.name);
        }
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Could not load catalog",
            description: err instanceof Error ? err.message : "Try again.",
            tone: "danger",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const categoryProducts = useMemo(() => {
    if (!category) return allProducts;
    return allProducts.filter((p) => p.categorySlug === category);
  }, [allProducts, category]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return categoryProducts;
    return categoryProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [categoryProducts, productQuery]);

  const product = useMemo(
    () =>
      categoryProducts.find((p) => p.slug === productSlug) ??
      filteredProducts[0] ??
      categoryProducts[0],
    [categoryProducts, filteredProducts, productSlug],
  );

  useEffect(() => {
    if (!product?.slug) {
      setOptions([]);
      return;
    }
    let cancelled = false;
    void fetchProductBySlug(product.slug)
      .then((res) => {
        if (cancelled) return;
        const groups = res.data.options ?? [];
        setOptions(groups);
        const sizeG = groups.find((g) => /size/i.test(g.key) || /size/i.test(g.label));
        const matG = groups.find(
          (g) => /material|stock|paper/i.test(g.key) || /material|stock|paper/i.test(g.label),
        );
        const finG = groups.find(
          (g) => /finish|coating|lamination/i.test(g.key) || /finish|coating/i.test(g.label),
        );
        setSize(sizeG?.values[0]?.value ?? "");
        setMaterial(matG?.values[0]?.value ?? "");
        setFinishing(finG?.values[0]?.value ?? "");
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.slug]);

  const sizeGroup = options.find(
    (g) => /size/i.test(g.key) || /size/i.test(g.label),
  );
  const materialGroup = options.find(
    (g) => /material|stock|paper/i.test(g.key) || /material|stock|paper/i.test(g.label),
  );
  const finishGroup = options.find(
    (g) => /finish|coating|lamination/i.test(g.key) || /finish|coating/i.test(g.label),
  );

  const estimate = useMemo(() => {
    if (!product) return 0;
    const volumeDiscount =
      quantity >= 1000 ? 0.82 : quantity >= 500 ? 0.88 : quantity >= 250 ? 0.93 : 1;
    return product.price * quantity * volumeDiscount;
  }, [product, quantity]);

  const unitPrice = product && quantity ? estimate / quantity : 0;

  function pickProduct(p: QuoteProduct) {
    setProductSlug(p.slug);
    setProductQuery(p.name);
    setProductOpen(false);
    if (p.categorySlug && p.categorySlug !== category) {
      setCategory(p.categorySlug);
    }
  }

  return (
    <Section className="pb-20 pt-8">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Instant quote" },
          ]}
        />

        <SectionHeader
          align="left"
          eyebrow="Pricing"
          title="Instant quote calculator"
          description="Configure your print job and get an estimated price in seconds — no account required."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center gap-2 text-primary">
                <Calculator className="h-5 w-5" />
                <h2 className="text-lg font-bold text-text-primary">
                  Configure your job
                </h2>
              </div>

              {loading ? (
                <p className="text-sm text-text-secondary">Loading catalog…</p>
              ) : (
                <>
                  <Select
                    label="Category"
                    options={[
                      { label: "All categories", value: "" },
                      ...categories.map((c) => ({
                        label: c.name,
                        value: c.slug,
                      })),
                    ]}
                    value={category}
                    onChange={(value) => {
                      setCategory(value);
                      const list = value
                        ? allProducts.filter((p) => p.categorySlug === value)
                        : allProducts;
                      const first = list[0];
                      if (first) {
                        setProductSlug(first.slug);
                        setProductQuery(first.name);
                      } else {
                        setProductSlug("");
                        setProductQuery("");
                      }
                      setProductOpen(false);
                    }}
                  />

                  <div className="relative space-y-1.5">
                    <span className="text-sm font-semibold text-text-primary">
                      Product
                    </span>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                      <input
                        value={productQuery}
                        onChange={(e) => {
                          setProductQuery(e.target.value);
                          setProductOpen(true);
                        }}
                        onFocus={() => setProductOpen(true)}
                        placeholder="Search products (e.g. bag toppers, menus)…"
                        className="h-12 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-sm font-medium text-text-primary shadow-soft focus-ring"
                        autoComplete="off"
                      />
                    </div>
                    {productOpen ? (
                      <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-2xl border border-border bg-card shadow-card">
                        {filteredProducts.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-text-secondary">
                            No products match “{productQuery}”
                          </p>
                        ) : (
                          filteredProducts.slice(0, 40).map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-primary/5"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => pickProduct(p)}
                            >
                              <span className="font-semibold text-text-primary">
                                {p.name}
                              </span>
                              <span className="shrink-0 text-xs text-text-secondary">
                                from {formatCurrency(p.price)}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                    {product ? (
                      <p className="text-xs text-text-secondary">
                        Selected:{" "}
                        <span className="font-semibold text-text-primary">
                          {product.name}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  {sizeGroup && optionLabels(sizeGroup).length > 0 ? (
                    <Select
                      label={sizeGroup.label}
                      options={optionLabels(sizeGroup)}
                      value={size}
                      onChange={setSize}
                    />
                  ) : null}
                  {materialGroup && optionLabels(materialGroup).length > 0 ? (
                    <Select
                      label={materialGroup.label}
                      options={optionLabels(materialGroup)}
                      value={material}
                      onChange={setMaterial}
                    />
                  ) : null}
                  {finishGroup && optionLabels(finishGroup).length > 0 ? (
                    <Select
                      label={finishGroup.label}
                      options={optionLabels(finishGroup)}
                      value={finishing}
                      onChange={setFinishing}
                    />
                  ) : null}

                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-text-primary">
                      Quantity
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quantityPresets.map((q) => (
                        <Button
                          key={q}
                          variant={quantity === q ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setQuantity(q)}
                        >
                          {q.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      min={50}
                      step={50}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(50, Number(e.target.value) || 50))
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <Card className="overflow-hidden border-primary/20">
              <div className="gradient-cta px-6 py-5 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Your estimate</h2>
                </div>
              </div>
              <CardContent className="space-y-5 pt-6">
                {product ? (
                  <>
                    <div>
                      <p className="text-3xl font-bold text-text-primary">
                        {formatCurrency(estimate)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-text-secondary">
                        {formatCurrency(unitPrice)} per unit ·{" "}
                        {quantity.toLocaleString()} qty
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{product.name}</Badge>
                      {size ? <Badge variant="outline">{size}</Badge> : null}
                      {material ? <Badge variant="outline">{material}</Badge> : null}
                      {finishing ? (
                        <Badge variant="outline">{finishing}</Badge>
                      ) : null}
                    </div>

                    <p className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                      <Truck className="h-4 w-4 text-primary" />
                      Est. {product.deliveryDays} business day production
                    </p>

                    <Link href={`/products/${product.slug}`}>
                      <Button className="w-full">Configure & order</Button>
                    </Link>
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={submitting}
                        onClick={() => {
                          setSubmitting(true);
                          void createCustomerQuote({
                            productName: product.name,
                            quantity,
                            total: Number(estimate.toFixed(2)),
                            notes: [size, material, finishing]
                              .filter(Boolean)
                              .join(" · "),
                          })
                            .then(() => {
                              toast({
                                title: "Quote submitted",
                                description:
                                  "Saved to your dashboard · Quotations",
                                tone: "success",
                              });
                            })
                            .catch((err) =>
                              toast({
                                title: "Quote failed",
                                description:
                                  err instanceof Error
                                    ? err.message
                                    : "Could not save quote",
                                tone: "danger",
                              }),
                            )
                            .finally(() => setSubmitting(false));
                        }}
                      >
                        {submitting ? "Submitting…" : "Save quote to account"}
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Sign in to save quote
                        </Button>
                      </Link>
                    )}
                    <Link href={`/products/${product.slug}`}>
                      <Button variant="ghost" className="w-full">
                        Open product page
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm font-medium text-text-secondary">
                    {loading
                      ? "Loading products…"
                      : "Select or search a product to begin."}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
