"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, Zap } from "lucide-react";
import {
  calcMatrixFallbackPrice,
  fetchConfiguredMatrixPrice,
  fetchProductBySlug,
  fetchProducts,
  fetchStoreCategories,
} from "@/lib/products-api";
import {
  importedDefaultSelections,
  normalizeImportedSelections,
  visibleImportedOptions,
} from "@/lib/imported-product-rules";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Misc";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import type { CatalogProduct, ProductOptionGroup } from "@/types";

type Cat = { name: string; slug: string };

function findGroup(
  options: ProductOptionGroup[],
  patterns: RegExp[],
  exclude: RegExp[] = [],
) {
  return options.find((group) => {
    const text = `${group.key} ${group.label}`;
    if (exclude.some((re) => re.test(text))) return false;
    return patterns.some((re) => re.test(group.key) || re.test(group.label));
  });
}

function optionChoices(group?: ProductOptionGroup) {
  return (group?.values ?? []).map((value) => ({
    label: value.label,
    value: value.value,
  }));
}

function buildMatrixSelections(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
) {
  const visible = visibleImportedOptions(options, selections);
  const visibleKeys = new Set(visible.map((group) => group.key));
  const visibleByKey = new Map(visible.map((group) => [group.key, group]));
  const result: Record<string, string> = {};
  for (const group of options) {
    const isVisible = visibleKeys.has(group.key);
    if (!isVisible && !group.meta?.keepWhenHidden) continue;
    let value = selections[group.key];
    if (!value) {
      const visibleGroup = visibleByKey.get(group.key);
      if (visibleGroup?.values.length === 1) {
        value = visibleGroup.values[0]?.value;
      }
    }
    if (value) result[group.key] = value;
  }
  if (selections.attr0) result.attr0 = selections.attr0;
  return result;
}

export function PriceCalculator() {
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [pricingBusy, setPricingBusy] = useState(false);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [categorySlug, setCategorySlug] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [options, setOptions] = useState<ProductOptionGroup[]>([]);
  const [pricingMatrixEnabled, setPricingMatrixEnabled] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [productName, setProductName] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [livePrice, setLivePrice] = useState<null | {
    price: number;
    unitPrice: number;
    quantity: number;
    turnaroundDays?: number | null;
  }>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingCatalog(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          fetchStoreCategories(),
          fetchProducts(),
        ]);
        if (cancelled) return;
        const cats = (catRes.data ?? [])
          .filter((c) => c.productCount > 0)
          .map((c) => ({ name: c.name, slug: c.slug }));
        const prods = prodRes.data ?? [];
        setCategories(cats);
        setAllProducts(prods);

        const preferred =
          prods.find((p) => p.slug === "silk-business-cards") ??
          prods.find((p) => p.slug === "plastic-business-cards") ??
          prods.find((p) => p.category?.slug === "business-cards") ??
          prods[0];
        const cat =
          preferred?.category?.slug ||
          cats.find((c) => prods.some((p) => p.category?.slug === c.slug))
            ?.slug ||
          cats[0]?.slug ||
          "";
        setCategorySlug(cat);
        if (preferred) {
          setProductSlug(preferred.slug);
          setProductName(preferred.name);
          setDeliveryDays(preferred.deliveryDays ?? 5);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
          setAllProducts([]);
        }
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryProducts = useMemo(() => {
    if (!categorySlug) return allProducts;
    return allProducts.filter((p) => p.category?.slug === categorySlug);
  }, [allProducts, categorySlug]);

  const selectedProduct = useMemo(
    () =>
      categoryProducts.find((p) => p.slug === productSlug) ??
      categoryProducts[0] ??
      allProducts.find((p) => p.slug === productSlug) ??
      null,
    [allProducts, categoryProducts, productSlug],
  );

  useEffect(() => {
    const slug = selectedProduct?.slug;
    if (!slug) {
      setOptions([]);
      setSelections({});
      setLivePrice(null);
      return;
    }
    let cancelled = false;
    setLoadingProduct(true);
    setLivePrice(null);
    void fetchProductBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        const groups = res.data.options ?? [];
        const product = res.data.product;
        setOptions(groups);
        setPricingMatrixEnabled(Boolean(product.pricingMatrixEnabled));
        setProductName(product.name);
        setDeliveryDays(product.deliveryDays ?? 5);
        setSelections(importedDefaultSelections(groups));
      })
      .catch(() => {
        if (!cancelled) {
          setOptions([]);
          setSelections({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProduct?.slug]);

  const visibleOptions = useMemo(
    () => visibleImportedOptions(options, selections),
    [options, selections],
  );

  const sizeGroup = useMemo(
    () =>
      findGroup(
        visibleOptions,
        [/size/i, /dimension/i],
        [/table size|pack size|can size|frame size/i],
      ),
    [visibleOptions],
  );
  const materialGroup = useMemo(
    () =>
      findGroup(visibleOptions, [
        /material/i,
        /stock/i,
        /paper/i,
        /substrate/i,
      ]),
    [visibleOptions],
  );
  const quantityGroup = useMemo(
    () => findGroup(visibleOptions, [/^quantity$/i, /quantity/i]),
    [visibleOptions],
  );
  const finishingGroup = useMemo(
    () =>
      findGroup(visibleOptions, [
        /finish/i,
        /coating/i,
        /laminat/i,
        /spot\s*uv/i,
        /foil/i,
      ]),
    [visibleOptions],
  );
  const turnaroundGroup = useMemo(
    () =>
      findGroup(visibleOptions, [
        /print(ing)?\s*time/i,
        /turnaround/i,
        /production\s*time/i,
      ]),
    [visibleOptions],
  );

  const matrixSelections = useMemo(
    () => buildMatrixSelections(options, selections),
    [options, selections],
  );

  const fallback = useMemo(
    () => calcMatrixFallbackPrice(visibleOptions, matrixSelections),
    [visibleOptions, matrixSelections],
  );

  useEffect(() => {
    const slug = selectedProduct?.slug;
    if (!slug || !options.length) {
      setLivePrice(null);
      return;
    }
    const incomplete = visibleOptions.some(
      (group) => !matrixSelections[group.key],
    );
    if (incomplete) {
      setLivePrice(null);
      return;
    }

    let cancelled = false;
    setPricingBusy(true);
    const timer = window.setTimeout(() => {
      void fetchConfiguredMatrixPrice(slug, matrixSelections)
        .then((result) => {
          if (cancelled) return;
          const data = result.data;
          if (
            data &&
            typeof data.price === "number" &&
            typeof data.unitPrice === "number" &&
            typeof data.quantity === "number"
          ) {
            setLivePrice({
              price: data.price,
              unitPrice: data.unitPrice,
              quantity: data.quantity,
              turnaroundDays: data.turnaroundDays,
            });
          } else {
            setLivePrice(null);
          }
        })
        .catch(() => {
          if (!cancelled) setLivePrice(null);
        })
        .finally(() => {
          if (!cancelled) setPricingBusy(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    selectedProduct?.slug,
    options.length,
    matrixSelections,
    visibleOptions,
    pricingMatrixEnabled,
  ]);

  const total =
    livePrice?.price ??
    (fallback.total > 0
      ? fallback.total
      : selectedProduct?.basePrice ?? 0);
  const unit =
    livePrice?.unitPrice ??
    (fallback.unit > 0
      ? fallback.unit
      : selectedProduct
        ? selectedProduct.basePrice /
          Math.max(1, fallback.quantity || 1)
        : 0);
  const quantity =
    livePrice?.quantity ??
    fallback.quantity ??
    1;
  const delivery =
    livePrice?.turnaroundDays ??
    deliveryDays;

  const onCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const list = slug
      ? allProducts.filter((p) => p.category?.slug === slug)
      : allProducts;
    const next = list[0];
    setProductSlug(next?.slug ?? "");
    setProductName(next?.name ?? "");
    setLivePrice(null);
  };

  const onProductChange = (slug: string) => {
    setProductSlug(slug);
    const match = allProducts.find((p) => p.slug === slug);
    if (match) {
      setProductName(match.name);
      if (match.category?.slug) setCategorySlug(match.category.slug);
    }
    setLivePrice(null);
  };

  const onOptionChange = (key: string, value: string) => {
    setSelections((prev) =>
      normalizeImportedSelections(
        options,
        value ? { ...prev, [key]: value } : (() => {
          const next = { ...prev };
          delete next[key];
          return next;
        })(),
        key,
      ),
    );
  };

  const busy = loadingCatalog || loadingProduct;
  const showCalculating =
    pricingBusy && pricingMatrixEnabled && !livePrice && fallback.total <= 0;

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Instant pricing"
          title="Calculate your print cost live"
          description="Configure quantity, stock, and finishing to see transparent pricing before you upload artwork."
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <Card className="lg:col-span-3 p-6 md:p-8">
            {busy && !selectedProduct ? (
              <p className="text-sm font-medium text-text-secondary">
                Loading catalog…
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Product type"
                  value={categorySlug}
                  onChange={onCategoryChange}
                  options={categories.map((c) => ({
                    label: c.name,
                    value: c.slug,
                  }))}
                />

                <Select
                  label="Product"
                  value={selectedProduct?.slug ?? productSlug}
                  onChange={onProductChange}
                  options={categoryProducts.map((p) => ({
                    label: p.name,
                    value: p.slug,
                  }))}
                />

                {quantityGroup ? (
                  <Select
                    label={quantityGroup.label}
                    value={selections[quantityGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(quantityGroup.key, v)}
                    options={optionChoices(quantityGroup)}
                  />
                ) : null}

                {sizeGroup ? (
                  <Select
                    label={sizeGroup.label}
                    value={selections[sizeGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(sizeGroup.key, v)}
                    options={optionChoices(sizeGroup)}
                  />
                ) : null}

                {materialGroup ? (
                  <Select
                    label={materialGroup.label}
                    value={selections[materialGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(materialGroup.key, v)}
                    options={optionChoices(materialGroup)}
                  />
                ) : null}

                {finishingGroup ? (
                  <Select
                    label={finishingGroup.label}
                    value={selections[finishingGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(finishingGroup.key, v)}
                    options={optionChoices(finishingGroup)}
                  />
                ) : null}

                {turnaroundGroup ? (
                  <Select
                    label={turnaroundGroup.label}
                    value={selections[turnaroundGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(turnaroundGroup.key, v)}
                    className="sm:col-span-2"
                    options={optionChoices(turnaroundGroup)}
                  />
                ) : null}

                {loadingProduct ? (
                  <p className="sm:col-span-2 text-sm text-text-secondary">
                    Loading product options…
                  </p>
                ) : null}
              </div>
            )}
          </Card>

          <Card className="gradient-mesh flex flex-col justify-between p-6 md:p-8 lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Calculator className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-secondary">
                    Estimated total
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-text-primary">
                    {showCalculating ? "Calculating…" : formatCurrency(total)}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Unit price</dt>
                  <dd className="font-semibold text-text-primary">
                    {showCalculating ? "—" : formatCurrency(unit)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Quantity</dt>
                  <dd className="font-semibold text-text-primary">
                    {Number(quantity).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Delivery</dt>
                  <dd className="font-semibold text-text-primary">
                    {delivery} business days
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-text-secondary">Product</dt>
                  <dd className="max-w-[160px] truncate text-right font-semibold text-text-primary">
                    {productName || selectedProduct?.name || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 space-y-3">
              {selectedProduct?.slug ? (
                <Link href={`/products/${selectedProduct.slug}`} className="block">
                  <Button className="w-full gap-2" size="lg">
                    <Zap className="h-4 w-4" />
                    Get this quote
                  </Button>
                </Link>
              ) : (
                <Button className="w-full gap-2" size="lg" disabled>
                  <Zap className="h-4 w-4" />
                  Get this quote
                </Button>
              )}
              <p className="text-center text-xs font-medium text-text-secondary">
                {livePrice
                  ? "Live storefront pricing for your selection."
                  : "Prices update as you change options."}
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
