"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, Zap } from "lucide-react";
import {
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
  exactLabel?: RegExp,
) {
  if (exactLabel) {
    const exact = options.find(
      (group) =>
        exactLabel.test(group.label) &&
        !exclude.some((re) => re.test(`${group.key} ${group.label}`)),
    );
    if (exact) return exact;
  }
  return options.find((group) => {
    const text = `${group.key} ${group.label}`;
    if (exclude.some((re) => re.test(text))) return false;
    return patterns.some((re) => re.test(group.key) || re.test(group.label));
  });
}

function optionChoices(
  group?: ProductOptionGroup,
  allowed?: string[],
) {
  const values = group?.values ?? [];
  const filtered =
    allowed && allowed.length > 0
      ? values.filter((value) => allowed.includes(value.value))
      : values;
  // Duplicate labels (e.g. two "500" qty ids) — prefer allowed/matrix ids first.
  const seen = new Set<string>();
  const out: { label: string; value: string }[] = [];
  for (const value of filtered) {
    if (seen.has(value.label)) continue;
    seen.add(value.label);
    out.push({ label: value.label, value: value.value });
  }
  return out;
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

function snapToAvailable(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
  available: Record<string, string[]>,
) {
  let next = { ...selections };
  let changed = false;
  for (const [key, allowed] of Object.entries(available)) {
    if (!allowed.length) continue;
    if (!next[key] || !allowed.includes(next[key])) {
      // Prefer current label's alternate id when duplicates exist.
      const group = options.find((item) => item.key === key);
      const currentLabel = group?.values.find(
        (value) => value.value === selections[key],
      )?.label;
      const sameLabel = group?.values.find(
        (value) =>
          value.label === currentLabel && allowed.includes(value.value),
      );
      next[key] = sameLabel?.value ?? allowed[0];
      changed = true;
    }
  }
  if (!changed) return selections;
  return normalizeImportedSelections(options, next);
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
  const [deliveryDays, setDeliveryDays] = useState(5);
  const [productName, setProductName] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [availableOptions, setAvailableOptions] = useState<
    Record<string, string[]>
  >({});
  const [livePrice, setLivePrice] = useState<null | {
    price: number;
    unitPrice: number;
    quantity: number;
    turnaroundDays?: number | null;
    pricingMode?: string;
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
      setAvailableOptions({});
      setLivePrice(null);
      return;
    }
    let cancelled = false;
    setLoadingProduct(true);
    setLivePrice(null);
    setAvailableOptions({});
    void fetchProductBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        const groups = res.data.options ?? [];
        const product = res.data.product;
        setOptions(groups);
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
        [/table size|pack size|can size|frame size|pouch size/i],
        /^size$/i,
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
    () => findGroup(visibleOptions, [/^quantity$/i], [], /^quantity$/i),
    [visibleOptions],
  );
  const finishingGroup = useMemo(
    () =>
      findGroup(visibleOptions, [
        /^lamination$/i,
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
      findGroup(
        visibleOptions,
        [/print(ing)?\s*time/i, /turnaround/i, /production\s*time/i],
        [],
        /^(printing time|production time|turnaround)$/i,
      ),
    [visibleOptions],
  );

  const matrixSelections = useMemo(
    () => buildMatrixSelections(options, selections),
    [options, selections],
  );

  useEffect(() => {
    const slug = selectedProduct?.slug;
    if (!slug || !options.length) {
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
          const available = data?.availableOptions ?? {};
          setAvailableOptions(available);

          if (Object.keys(available).length > 0) {
            const snapped = snapToAvailable(options, selections, available);
            const unchanged =
              Object.keys(snapped).length === Object.keys(selections).length &&
              Object.entries(snapped).every(
                ([key, value]) => selections[key] === value,
              );
            if (!unchanged) {
              setSelections(snapped);
              return;
            }
          }

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
              pricingMode:
                typeof (data as { pricingMode?: string }).pricingMode ===
                "string"
                  ? (data as { pricingMode?: string }).pricingMode
                  : "matrix",
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
  }, [selectedProduct?.slug, options, matrixSelections, selections]);

  const turnaroundLabel = turnaroundGroup
    ? turnaroundGroup.values.find(
        (value) => value.value === selections[turnaroundGroup.key],
      )?.label
    : undefined;
  const turnaroundFromLabel = (() => {
    const match = String(turnaroundLabel || "").match(/(\d+)/);
    if (!match) return null;
    const days = Number(match[1]);
    return Number.isFinite(days) && days > 0 ? days : null;
  })();

  const hasExactPrice = Boolean(livePrice);
  const total = livePrice?.price ?? 0;
  const unit = livePrice?.unitPrice ?? 0;
  const quantity = livePrice?.quantity ?? 0;
  const delivery =
    livePrice?.turnaroundDays ?? turnaroundFromLabel ?? deliveryDays;

  const onCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const list = slug
      ? allProducts.filter((p) => p.category?.slug === slug)
      : allProducts;
    const next = list[0];
    setProductSlug(next?.slug ?? "");
    setProductName(next?.name ?? "");
    setLivePrice(null);
    setAvailableOptions({});
  };

  const onProductChange = (slug: string) => {
    setProductSlug(slug);
    const match = allProducts.find((p) => p.slug === slug);
    if (match) {
      setProductName(match.name);
      if (match.category?.slug) setCategorySlug(match.category.slug);
    }
    setLivePrice(null);
    setAvailableOptions({});
  };

  const onOptionChange = (key: string, value: string) => {
    setSelections((prev) =>
      normalizeImportedSelections(
        options,
        value
          ? { ...prev, [key]: value }
          : (() => {
              const next = { ...prev };
              delete next[key];
              return next;
            })(),
        key,
      ),
    );
  };

  const busy = loadingCatalog || loadingProduct;
  const showCalculating = pricingBusy && !livePrice;

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
                    options={optionChoices(
                      quantityGroup,
                      availableOptions[quantityGroup.key],
                    )}
                  />
                ) : null}

                {sizeGroup ? (
                  <Select
                    label={sizeGroup.label}
                    value={selections[sizeGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(sizeGroup.key, v)}
                    options={optionChoices(
                      sizeGroup,
                      availableOptions[sizeGroup.key],
                    )}
                  />
                ) : null}

                {materialGroup ? (
                  <Select
                    label={materialGroup.label}
                    value={selections[materialGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(materialGroup.key, v)}
                    options={optionChoices(
                      materialGroup,
                      availableOptions[materialGroup.key],
                    )}
                  />
                ) : null}

                {finishingGroup ? (
                  <Select
                    label={finishingGroup.label}
                    value={selections[finishingGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(finishingGroup.key, v)}
                    options={optionChoices(
                      finishingGroup,
                      availableOptions[finishingGroup.key],
                    )}
                  />
                ) : null}

                {turnaroundGroup ? (
                  <Select
                    label={turnaroundGroup.label}
                    value={selections[turnaroundGroup.key] ?? ""}
                    onChange={(v) => onOptionChange(turnaroundGroup.key, v)}
                    className="sm:col-span-2"
                    options={optionChoices(
                      turnaroundGroup,
                      availableOptions[turnaroundGroup.key],
                    )}
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
                    {showCalculating
                      ? "Calculating…"
                      : hasExactPrice
                        ? formatCurrency(total)
                        : "—"}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Unit price</dt>
                  <dd className="font-semibold text-text-primary">
                    {hasExactPrice ? formatCurrency(unit) : "—"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Quantity</dt>
                  <dd className="font-semibold text-text-primary">
                    {hasExactPrice
                      ? Number(quantity).toLocaleString()
                      : "—"}
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
                <Link
                  href={`/products/${selectedProduct.slug}`}
                  className="block"
                >
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
                {hasExactPrice
                  ? livePrice?.pricingMode === "live"
                    ? "Live UPrinting price for this selection."
                    : "Exact scraped matrix price for this selection."
                  : pricingBusy
                    ? "Updating price…"
                    : "No exact price for this combo — open the product page."}
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
