"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Heart,
  Package,
  Pencil,
  Share2,
  ShoppingCart,
  Upload,
} from "lucide-react";
import { useProductsOptional } from "@/lib/product-store";
import { DEFAULT_PRODUCT_FAQS } from "@/lib/product-faqs";
import { cn, formatCurrency, rebrandUprintingCopy } from "@/lib/utils";
import type { Product, ProductOptionGroup, ProductTab } from "@/types";
import { ProductMedia } from "@/components/shared/ProductMedia";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import {
  CUSTOM_SIZE_FALLBACK_INCHES,
  CUSTOM_SIZE_VALUE,
  customSizeUnit,
  displayUnitValue,
  findSizeOptionGroup,
  isCustomSizePilot,
  parseSizeLabelInches,
  resolveBaseSizeInches,
} from "@/lib/custom-size";
import {
  Accordion,
  Badge,
  Button,
  Container,
  EmptyState,
  Section,
  StarRating,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Misc";
import { RichTextContent } from "@/components/ui/RichTextEditor";
import {
  calcConfiguredPrice,
  calcMatrixFallbackPrice,
  defaultSelections,
  fetchConfiguredMatrixPrice,
  fetchProductBySlug,
} from "@/lib/products-api";
import {
  computedSheetQuantity,
  extractFeatureBullets,
  normalizeImportedSelections,
  visibleImportedOptions,
} from "@/lib/imported-product-rules";
import {
  addCustomerWishlist,
  createCustomerDesign,
  deleteCustomerDesign,
  fetchCustomerDesigns,
  fetchCustomerWishlist,
  removeCustomerWishlist,
} from "@/lib/customer-api";
import { getApiBaseUrl } from "@/lib/auth";
import { editorDesignUrl, openDesignStudio, parseQtyFromLabel } from "@/lib/editor-url";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCartOptional } from "@/lib/cart-store";
import { ProductReviews } from "@/components/products/ProductReviews";

function buildOptionsKey(selections: Record<string, string>) {
  return Object.keys(selections)
    .sort()
    .map((k) => `${k}=${selections[k]}`)
    .join("&");
}

function buildOptionsSummary(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
) {
  return options
    .map((g) => {
      const v = g.values.find((x) => x.value === selections[g.key]);
      return v ? `${g.label}: ${v.label}` : null;
    })
    .filter(Boolean)
    .join(" · ");
}

type FaqItem = { id: string; title: string; content: string };

const DEFAULT_FAQS: FaqItem[] = DEFAULT_PRODUCT_FAQS.map((f, i) => ({
  id: `faq-${i}`,
  title: f.question,
  content: f.answer,
}));

/** Parse "Label" or "Label | 12.50" option lines. */
function parseTabOption(raw: string): { label: string; priceAdd: number } {
  const parts = raw.split("|").map((p) => p.trim());
  const label = parts[0] || raw;
  const priceAdd = parts[1] != null && parts[1] !== "" ? Number(parts[1]) : 0;
  return {
    label,
    priceAdd: Number.isFinite(priceAdd) ? priceAdd : 0,
  };
}

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
  const searchParams = useSearchParams();
  const cart = useCartOptional();
  const [cartBusy, setCartBusy] = useState(false);
  const { toast } = useToast();
  const openedEditor = useRef(false);
  const localProduct = store.getBySlug(slug);

  const [loading, setLoading] = useState(true);
  const [savingDesign, setSavingDesign] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);
  const [wishlistId, setWishlistId] = useState<string | null>(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [productId, setProductId] = useState<string | undefined>(
    localProduct?.id,
  );
  const [name, setName] = useState(localProduct?.name ?? "");
  const [description, setDescription] = useState(
    rebrandUprintingCopy(localProduct?.description ?? ""),
  );
  const [shortDescription, setShortDescription] = useState("");
  const [productFaqs, setProductFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [productTabs, setProductTabs] = useState<ProductTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [tabFieldValues, setTabFieldValues] = useState<Record<string, string>>(
    {},
  );
  const [basePrice, setBasePrice] = useState(localProduct?.price ?? 0);
  const [rating, setRating] = useState(localProduct?.rating ?? 0);
  const [reviews, setReviews] = useState(localProduct?.reviews ?? 0);
  const [badge, setBadge] = useState(localProduct?.badge);
  const [categorySlug, setCategorySlug] = useState(localProduct?.category ?? "");
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState(localProduct?.imageUrl);
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
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
  const [pricingMatrixEnabled, setPricingMatrixEnabled] = useState(false);
  const [matrixPrice, setMatrixPrice] = useState<null | {
    price: number;
    unitPrice: number;
    quantity: number;
    turnaroundDays?: number | null;
    inStock: boolean;
  }>(null);
  const [customSizeOn, setCustomSizeOn] = useState(false);
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetchProductBySlug(slug);
        if (cancelled) return;
        const { product, options: apiOptions } = res.data;
        setProductId(product.id);
        setName(product.name);
        setDescription(rebrandUprintingCopy(product.description));
        setShortDescription(rebrandUprintingCopy(product.shortDescription ?? ""));
        setProductFaqs(
          (() => {
            const valid =
              product.faqs?.filter(
                (f) =>
                  (f?.question ?? "").trim() && (f?.answer ?? "").trim(),
              ) ?? [];
            return valid.length
              ? valid.map((f, i) => ({
                  id: `faq-${i}`,
                  title: f.question,
                  content: f.answer,
                }))
              : DEFAULT_FAQS;
          })(),
        );
        const tabs = Array.isArray(product.productTabs)
          ? product.productTabs
          : [];
        setProductTabs(tabs);
        const firstTab = tabs[0];
        setActiveTabId(firstTab?.id ?? null);
        if (firstTab) {
          const defaults: Record<string, string> = {};
          for (const field of firstTab.fields ?? []) {
            defaults[field.id] =
              field.type === "select" ? (field.options?.[0] ?? "") : "";
          }
          setTabFieldValues(defaults);
        } else {
          setTabFieldValues({});
        }
        setBasePrice(product.basePrice);
        setPricingMatrixEnabled(Boolean(product.pricingMatrixEnabled));
        setMatrixPrice(null);
        setRating(product.rating);
        setReviews(product.reviews);
        setBadge(product.badge ?? undefined);
        setCategorySlug(product.category.slug);
        setCategoryName(product.category.name);
        setImageUrl(product.imageUrl ?? undefined);
        setVideoUrl(product.videoUrl ?? undefined);
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
        setCustomSizeOn(false);
        setCustomWidth("");
        setCustomHeight("");
        setNotFound(false);
      } catch {
        if (cancelled) return;
        if (localProduct) {
          const opts = legacyToOptions(localProduct);
          setProductId(localProduct.id);
          setName(localProduct.name);
          setDescription(rebrandUprintingCopy(localProduct.description));
          setShortDescription("");
          setProductFaqs(DEFAULT_FAQS);
          setProductTabs([]);
          setActiveTabId(null);
          setTabFieldValues({});
          setBasePrice(localProduct.price);
          setPricingMatrixEnabled(false);
          setMatrixPrice(null);
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
          setVideoUrl(undefined);
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
          setCustomSizeOn(false);
          setCustomWidth("");
          setCustomHeight("");
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

  const activeTab =
    productTabs.find((t) => t.id === activeTabId) ?? productTabs[0] ?? null;
  const hasCustomTabs = productTabs.length > 0;

  const visibleOptions = useMemo(() => {
    const base = visibleImportedOptions(options, selections);
    if (selections.attr0 !== "1508") return base;
    return base.map((group) => {
      if (group.key === "attr3") return { ...group, label: "Label Size" };
      if (group.key === "attr6") return { ...group, label: "Turnaround" };
      return group;
    });
  }, [options, selections]);

  const matrixSelections = useMemo(() => {
    const visibleKeys = new Set(visibleOptions.map((group) => group.key));
    const visibleByKey = new Map(
      visibleOptions.map((group) => [group.key, group]),
    );
    const result: Record<string, string> = {};
    for (const group of options) {
      const visible = visibleKeys.has(group.key);
      if (!visible && !group.meta?.keepWhenHidden) continue;
      let value = selections[group.key];
      // Single-option fields render as plain text and may not call onChange;
      // still send their only value so live pricing (e.g. Blank tissue) runs.
      if (!value) {
        const visibleGroup = visibleByKey.get(group.key);
        if (visibleGroup?.values.length === 1) {
          value = visibleGroup.values[0]?.value;
        }
      }
      if (value) result[group.key] = value;
    }
    // Linked Full Color / Blank (attr0) must always be sent for live price.
    if (selections.attr0) result.attr0 = selections.attr0;
    return result;
  }, [options, selections, visibleOptions]);

  const tabExtraPrice = useMemo(() => {
    if (!activeTab?.fields?.length) return 0;
    let extra = 0;
    for (const field of activeTab.fields) {
      if (field.type !== "select") continue;
      const selected = tabFieldValues[field.id];
      if (!selected) continue;
      const match = (field.options ?? []).find((o) => {
        const { label } = parseTabOption(o);
        return o === selected || label === selected;
      });
      if (match) extra += parseTabOption(match).priceAdd;
    }
    return extra;
  }, [activeTab, tabFieldValues]);

  const effectiveBasePrice = useMemo(() => {
    if (hasCustomTabs && activeTab && typeof activeTab.price === "number") {
      return activeTab.price + tabExtraPrice;
    }
    if (hasCustomTabs) return basePrice + tabExtraPrice;
    return basePrice;
  }, [hasCustomTabs, activeTab, basePrice, tabExtraPrice]);

  // Imported (pricing-matrix) products stamp every option value's meta with
  // the default combo's real scraped price - use that as the fallback's
  // starting point instead of basePrice (the catalog's "Starting At", i.e.
  // the matrix's cheapest row, not the default combo). Each option's
  // priceAdd is itself a delta off this same anchor, so the two combine
  // correctly - see the import-time comment in AdminProducts.tsx.
  const hasImportedFallbackPricing = useMemo(
    () =>
      options
        .flatMap((group) => group.values)
        .some(
          (value) =>
            typeof value.meta?.matrixAnchorPrice === "number" ||
            (value.meta?.pricingByProduct !== null &&
              typeof value.meta?.pricingByProduct === "object"),
        ),
    [options],
  );

  const fallbackPricing = useMemo(() => {
    if (hasImportedFallbackPricing) {
      return calcMatrixFallbackPrice(hasCustomTabs ? [] : visibleOptions, hasCustomTabs ? {} : matrixSelections);
    }
    return calcConfiguredPrice(effectiveBasePrice, hasCustomTabs ? [] : visibleOptions, hasCustomTabs ? {} : matrixSelections);
  }, [hasImportedFallbackPricing, effectiveBasePrice, hasCustomTabs, visibleOptions, matrixSelections]);

  useEffect(() => {
    let cancelled = false;
    if (
      !pricingMatrixEnabled ||
      hasCustomTabs ||
      visibleOptions.some((group) => !matrixSelections[group.key])
    ) {
      setMatrixPrice(null);
      return;
    }
    void fetchConfiguredMatrixPrice(
      slug,
      matrixSelections,
      customSizeOn && Number(customWidth) > 0 && Number(customHeight) > 0
        ? { width: Number(customWidth), height: Number(customHeight) }
        : undefined,
    )
      .then((result) => {
        if (cancelled) return;
        setMatrixPrice(result.data && typeof result.data.price === "number" && typeof result.data.unitPrice === "number" && typeof result.data.quantity === "number"
          ? { price: result.data.price, unitPrice: result.data.unitPrice, quantity: result.data.quantity, turnaroundDays: result.data.turnaroundDays, inStock: result.data.inStock ?? true }
          : null);
      })
      .catch(() => { if (!cancelled) setMatrixPrice(null); });
    return () => { cancelled = true; };
  }, [pricingMatrixEnabled, hasCustomTabs, matrixSelections, visibleOptions.length, slug, customSizeOn, customWidth, customHeight]);

  const pricing = useMemo(() => {
    if (!pricingMatrixEnabled || !matrixPrice) return fallbackPricing;
    return {
      ...fallbackPricing,
      total: matrixPrice.price,
      unit: matrixPrice.unitPrice,
      quantity: matrixPrice.quantity,
      isPerUnit: true,
      basePrice: matrixPrice.price,
      mod: 1,
    };
  }, [fallbackPricing, matrixPrice, pricingMatrixEnabled]);

  const optionsKey = useMemo(() => buildOptionsKey(selections), [selections]);
  const optionsSummary = useMemo(
    () => buildOptionsSummary(options, selections),
    [options, selections],
  );
  const designProductName = useMemo(
    () => (optionsSummary ? `${name} (${optionsSummary})` : name || slug),
    [name, optionsSummary, slug],
  );
  const featureBullets = useMemo(
    () => extractFeatureBullets(description),
    [description],
  );
  const sheetQuantity = useMemo(
    () => computedSheetQuantity(options, selections),
    [options, selections],
  );
  const selectedPrintedSides = useMemo(() => {
    const group = options.find(
      (item) =>
        item.key === "attr1795" || /^printed\s*sides$/i.test(item.label),
    );
    if (!group) return "";
    const selected = selections[group.key];
    return (
      group.values.find((value) => value.value === selected)?.label ?? ""
    );
  }, [options, selections]);
  const isBlankOrder = /^blank$/i.test(selectedPrintedSides.trim());
  const isBookShippingBoxes = slug === "book-shipping-boxes";
  const useBoxCheckoutUi = isBookShippingBoxes;
  const boxMainOptions = useMemo(() => {
    if (!useBoxCheckoutUi) return visibleOptions;
    return visibleOptions.filter(
      (group) => !/^production\s*time$/i.test(group.label),
    );
  }, [useBoxCheckoutUi, visibleOptions]);
  const boxTurnaroundOptions = useMemo(() => {
    if (!useBoxCheckoutUi) return [];
    return visibleOptions.filter((group) =>
      /^production\s*time$/i.test(group.label),
    );
  }, [useBoxCheckoutUi, visibleOptions]);

  const editorUrl = useMemo(() => {
    const qtyGroup = visibleOptions.find(
      (g) =>
        g.key === "quantity" ||
        /quantity|^qty$/i.test(g.label) ||
        /quantity|qty/i.test(g.key),
    );
    const details = visibleOptions
      .filter((g) => g.key !== qtyGroup?.key)
      .map((g) => {
        const v = g.values.find((x) => x.value === selections[g.key]);
        const sizeG = findSizeOptionGroup(visibleOptions);
        if (customSizeOn && sizeG && g.key === sizeG.key && customWidth && customHeight) {
          return {
            label: g.label,
            value: `${customWidth} × ${customHeight} ${customSizeUnit(slug)} (custom)`,
          };
        }
        const display =
          (typeof v?.meta?.displayLabel === "string" && v.meta.displayLabel.trim()) ||
          v?.label ||
          selections[g.key] ||
          "";
        return { label: g.label, value: display };
      })
      .filter((row) => row.value);
    if (
      customSizeOn &&
      !findSizeOptionGroup(visibleOptions) &&
      customWidth &&
      customHeight
    ) {
      details.unshift({
        label: "Size",
        value: `${customWidth} × ${customHeight} ${customSizeUnit(slug)} (custom)`,
      });
    }
    const quantities = (qtyGroup?.values ?? []).map((v) => {
      const qty = parseQtyFromLabel(v.label, Number(v.value) || 1);
      const unitPrice =
        typeof v.meta?.matrixUnitPrice === "number" ? v.meta.matrixUnitPrice : undefined;
      return {
        value: v.value,
        label: v.label,
        qty,
        unitPrice,
        total: unitPrice != null ? unitPrice * qty : undefined,
      };
    });
    return editorDesignUrl({
      slug,
      name,
      apiBase: getApiBaseUrl(),
      quantityKey: qtyGroup?.key ?? "quantity",
      selections,
      details,
      quantities:
        quantities.length > 0
          ? quantities
          : [
              {
                value: String(pricing.quantity),
                label: String(pricing.quantity),
                qty: pricing.quantity || 1,
                unitPrice: pricing.unit,
                total: pricing.total,
              },
            ],
      quantity: pricing.quantity || 1,
      unitPrice: pricing.unit,
      totalPrice: pricing.total,
    });
  }, [
    visibleOptions,
    selections,
    slug,
    name,
    pricing.quantity,
    pricing.unit,
    pricing.total,
    customSizeOn,
    customWidth,
    customHeight,
  ]);

  useEffect(() => {
    if (openedEditor.current) return;
    if (searchParams.get("designOnline") !== "1") return;
    if (!isAuthenticated || loading || notFound) return;
    openedEditor.current = true;
    openDesignStudio(editorUrl, `/products/${slug}?designOnline=1`);
  }, [searchParams, isAuthenticated, loading, notFound, editorUrl, slug]);

  const syncSavedState = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedDesignId(null);
      setWishlistId(null);
      return;
    }
    try {
      const [designsRes, wishlistRes] = await Promise.all([
        fetchCustomerDesigns(),
        fetchCustomerWishlist(),
      ]);
      const match = designsRes.data.find((d) => {
        if (d.productSlug !== slug) return false;
        if (d.previewUrl === `options:${optionsKey}`) return true;
        return d.productName === designProductName;
      });
      setSavedDesignId(match?.id ?? null);
      setWishlistId(
        wishlistRes.data.find((w) => w.productSlug === slug)?.id ?? null,
      );
    } catch {
      setSavedDesignId(null);
      setWishlistId(null);
    }
  }, [isAuthenticated, slug, optionsKey, designProductName]);

  useEffect(() => {
    void syncSavedState();
  }, [syncSavedState]);

  const sizeGroup = useMemo(() => findSizeOptionGroup(options), [options]);
  const customSizePilot =
    isCustomSizePilot(slug) && searchParams.get("legacy") !== "1";

  const onOptionChange = (key: string, value: string) => {
    if (customSizePilot && sizeGroup && key === sizeGroup.key) {
      if (value === CUSTOM_SIZE_VALUE) {
        const current = sizeGroup.values.find((v) => v.value === selections[sizeGroup.key]);
        const parsed = parseSizeLabelInches(current?.label ?? "");
        const unit = customSizeUnit(slug);
        if (parsed) {
          setCustomWidth(displayUnitValue(parsed.width, unit));
          setCustomHeight(displayUnitValue(parsed.height, unit));
        }
        setCustomSizeOn(true);
        return;
      }
      setCustomSizeOn(false);
    }
    setSelections((prev) => {
      // Switching Label Type should re-apply that type's defaults (Sheet vs Roll).
      if (key === "attr0" && value) {
        return normalizeImportedSelections(options, { attr0: value }, key);
      }
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;
      return normalizeImportedSelections(options, next, key);
    });
  };

  async function toggleWishlist() {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Log in to use wishlist.",
        tone: "warning",
      });
      return;
    }
    if (wishlistBusy) return;
    setWishlistBusy(true);
    try {
      if (wishlistId) {
        await removeCustomerWishlist(wishlistId);
        setWishlistId(null);
        toast({ title: "Removed from wishlist", tone: "success" });
        return;
      }
      const res = await addCustomerWishlist({
        productSlug: slug,
        name: name || slug,
        productId,
        imageUrl: imageUrl ?? gallery[0],
        basePrice: basePrice,
      });
      if (res.data?.id) {
        setWishlistId(res.data.id);
      } else {
        const list = await fetchCustomerWishlist();
        setWishlistId(
          list.data.find((w) => w.productSlug === slug)?.id ?? null,
        );
      }
      toast({ title: "Added to wishlist", tone: "success" });
    } catch (err) {
      toast({
        title: "Wishlist failed",
        description: err instanceof Error ? err.message : "Try again.",
        tone: "danger",
      });
    } finally {
      setWishlistBusy(false);
    }
  }

  async function toggleSaveDesign() {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Log in to save designs to your account.",
        tone: "warning",
      });
      return;
    }
    if (savingDesign) return;
    setSavingDesign(true);
    try {
      if (savedDesignId) {
        await deleteCustomerDesign(savedDesignId);
        setSavedDesignId(null);
        toast({
          title: "Unsaved",
          description: "Removed from Saved Designs.",
          tone: "success",
        });
        return;
      }

      const res = await createCustomerDesign({
        name: name || slug,
        productSlug: slug,
        productName: designProductName,
        optionsKey,
      });
      setSavedDesignId(res.data.id);
      toast({
        title: "Saved",
        description: "Added to Your Account → Saved Designs.",
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Could not update design",
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

  const plainDescription = description
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/@charset[^;]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const teaserText = (shortDescription || plainDescription).trim();

  async function addBlankToCart() {
    if (!cart || cartBusy) return;
    setCartBusy(true);
    try {
      const sizeLabel =
        options
          .find((g) => g.key === "attr1801" || /^size$/i.test(g.label))
          ?.values.find((v) => v.value === selections.attr1801)?.label ?? "";
      const materialLabel =
        options
          .find((g) => g.key === "attr1792" || /^material$/i.test(g.label))
          ?.values.find((v) => v.value === selections.attr1792)?.label ?? "";
      await cart.addItem({
        productId,
        productSlug: slug,
        name,
        imageUrl: gallery[0] ?? imageUrl,
        quantity: pricing.quantity || 1,
        unitPrice: pricing.unit,
        size: sizeLabel,
        material: materialLabel,
        finishing: selectedPrintedSides,
      });
      toast({
        title: "Added to cart",
        description: `${name} · blank boxes`,
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Could not add to cart",
        description: err instanceof Error ? err.message : "Try again",
        tone: "danger",
      });
    } finally {
      setCartBusy(false);
    }
  }

  function selectProductTab(tab: ProductTab) {
    setActiveTabId(tab.id);
    const defaults: Record<string, string> = {};
    for (const field of tab.fields ?? []) {
      defaults[field.id] =
        field.type === "select" ? (field.options?.[0] ?? "") : "";
    }
    setTabFieldValues(defaults);
  }

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
            <div className="min-w-0">
              <div className="relative overflow-hidden border border-border bg-[#f3f4f6]">
                <ProductMedia
                  imageUrl={gallery[activeImage] ?? imageUrl}
                  fallbackVariant={fallbackImage}
                  label={name}
                  className="aspect-square w-full sm:aspect-[5/4]"
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
                        fit="cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              {videoUrl && /^https?:\/\//i.test(videoUrl) ? (
                <div className="mt-4 aspect-video overflow-hidden border border-border bg-black">
                  {/youtube\.com\/embed|player\.vimeo\.com\/video/i.test(videoUrl) ? (
                    <iframe
                      src={videoUrl}
                      title={`${name} video`}
                      className="h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      preload="metadata"
                      className="h-full w-full object-contain"
                    >
                      Your browser does not support product video.
                    </video>
                  )}
                </div>
              ) : null}

              {featureBullets.length > 0 ? (
                <ul className="mt-6 space-y-2.5">
                  {featureBullets.map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-2.5 text-sm text-text-secondary"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1b5e20]" />
                      {text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-secondary md:text-3xl">
                    {name}
                  </h1>
                  <div className="mt-2">
                    <StarRating rating={rating} reviews={reviews} size="md" />
                  </div>
                  {badge ? (
                    <div className="mt-2">
                      <Badge variant="primary">{badge}</Badge>
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleWishlist()}
                    disabled={wishlistBusy}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                      wishlistId
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border text-text-secondary hover:border-primary/40 hover:text-primary",
                    )}
                    aria-pressed={Boolean(wishlistId)}
                    aria-label={
                      wishlistId ? "Remove from wishlist" : "Add to wishlist"
                    }
                  >
                    <Heart
                      className={cn("h-4 w-4", wishlistId && "fill-current")}
                    />
                    {wishlistId ? "Wishlisted" : "Wishlist"}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                  >
                    <Share2 className="h-4 w-4" /> Share Product
                  </button>
                </div>
              </div>

              {productTabs.length > 0 ? (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {productTabs.map((tab) => {
                      const active = tab.id === (activeTab?.id ?? "");
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => selectProductTab(tab)}
                          className={cn(
                            "flex min-w-[108px] flex-col items-center gap-1.5 rounded-md px-3 py-2.5 text-center transition",
                            active
                              ? "border-2 border-success bg-white"
                              : "border-2 border-transparent hover:bg-[#f7f8fa]",
                          )}
                        >
                          <span className="flex h-10 w-10 items-center justify-center overflow-hidden">
                            {tab.iconUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={tab.iconUrl}
                                alt=""
                                className="h-9 w-9 object-contain"
                              />
                            ) : (
                              <Package className="h-7 w-7 text-secondary" />
                            )}
                          </span>
                          <span
                            className={cn(
                              "text-xs font-semibold leading-tight",
                              active ? "text-secondary" : "text-accent",
                            )}
                          >
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-success" />
                </div>
              ) : null}

              {teaserText && !hasCustomTabs ? (
                <p className="mt-3 line-clamp-3 break-all text-sm leading-relaxed text-text-secondary">
                  {teaserText}
                </p>
              ) : null}

              <div
                className={cn(
                  "mt-5 border border-border bg-[#fafafa]",
                  !useBoxCheckoutUi && "p-4 sm:p-5",
                )}
              >
                {useBoxCheckoutUi ? (
                  <div className="border-b border-border bg-[#1b5e20] px-4 py-2.5">
                    <p className="text-sm font-bold tracking-wide text-white">
                      Customize &amp; Check Prices
                    </p>
                  </div>
                ) : null}
                <div className={useBoxCheckoutUi ? "p-4 sm:p-5" : undefined}>
                {hasCustomTabs ? (
                  activeTab && (activeTab.fields?.length ?? 0) > 0 ? (
                    <div className="space-y-3">
                      {activeTab.fields.map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-sm font-semibold text-secondary">
                            {field.label}
                          </label>
                          {field.type === "select" ? (
                            <select
                              value={tabFieldValues[field.id] ?? ""}
                              onChange={(e) =>
                                setTabFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium focus-ring"
                            >
                              {(field.options ?? []).map((opt) => {
                                const { label, priceAdd } = parseTabOption(opt);
                                return (
                                  <option key={opt} value={opt}>
                                    {priceAdd > 0
                                      ? `${label} (+$${priceAdd.toFixed(2)})`
                                      : label}
                                  </option>
                                );
                              })}
                            </select>
                          ) : (
                            <input
                              type={
                                field.type === "number" ? "number" : "text"
                              }
                              value={tabFieldValues[field.id] ?? ""}
                              onChange={(e) =>
                                setTabFieldValues((prev) => ({
                                  ...prev,
                                  [field.id]: e.target.value,
                                }))
                              }
                              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium focus-ring"
                            />
                          )}
                          {field.helpText ? (
                            <p className="text-xs text-text-secondary">
                              {field.helpText}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary">
                      No custom fields on this tab yet.
                    </p>
                  )
                ) : (
                  <ProductConfigurator
                    options={
                      useBoxCheckoutUi ? boxMainOptions : visibleOptions
                    }
                    selections={selections}
                    onChange={onOptionChange}
                    computedQuantity={sheetQuantity}
                    productSlug={slug}
                    customSize={
                      customSizePilot
                        ? {
                            groupKey: sizeGroup?.key ?? "",
                            enabled: customSizeOn,
                            width: customWidth,
                            height: customHeight,
                            onWidth: setCustomWidth,
                            onHeight: setCustomHeight,
                            onStandaloneCustom: () => {
                              const unit = customSizeUnit(slug);
                              const base = resolveBaseSizeInches(
                                slug,
                                options.map((g) => ({
                                  key: g.key,
                                  label: g.label,
                                  values: g.values.map((v) => ({
                                    value: v.value,
                                    label: v.label,
                                  })),
                                })),
                                selections,
                              );
                              if (base) {
                                setCustomWidth(displayUnitValue(base.width, unit));
                                setCustomHeight(displayUnitValue(base.height, unit));
                              }
                              setCustomSizeOn(true);
                            },
                            onStandaloneStandard: () => setCustomSizeOn(false),
                            standardLabel: CUSTOM_SIZE_FALLBACK_INCHES[slug]
                              ? `${CUSTOM_SIZE_FALLBACK_INCHES[slug].width}" × ${CUSTOM_SIZE_FALLBACK_INCHES[slug].height}"`
                              : "Standard",
                          }
                        : undefined
                    }
                  />
                )}
                </div>
              </div>

              <div
                className={cn(
                  "mt-4 border border-border bg-white p-4",
                  useBoxCheckoutUi && "text-right",
                )}
              >
                {useBoxCheckoutUi ? (
                  <>
                    {pricingMatrixEnabled && !matrixPrice && pricing.total === 0 ? (
                      <p className="text-2xl font-extrabold text-success">
                        Calculating…
                      </p>
                    ) : (
                      <>
                        <p className="text-2xl font-extrabold text-success md:text-3xl">
                          {formatCurrency(pricing.unit)}{" "}
                          <span className="text-lg font-bold">each</span>
                        </p>
                        <p className="mt-1 text-base font-semibold text-secondary">
                          Subtotal: {formatCurrency(pricing.total)}
                        </p>
                      </>
                    )}
                    {isBlankOrder ? (
                      <p className="mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-left text-sm font-semibold text-red-700">
                        Attention: You Are Ordering Non-Printed Boxes.
                      </p>
                    ) : null}
                    <p className="mt-1 text-left text-sm text-text-secondary">
                      {pricing.lines.length === 0 &&
                      !(pricingMatrixEnabled && matrixPrice) ? (
                        <>Select options above — price updates as you choose.</>
                      ) : (
                        <>qty {pricing.quantity}</>
                      )}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-text-secondary">
                      Printing Cost:{" "}
                      <span className="text-2xl font-extrabold text-success">
                        {pricingMatrixEnabled &&
                        !matrixPrice &&
                        pricing.total === 0
                          ? "Calculating…"
                          : formatCurrency(pricing.total)}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {hasCustomTabs && activeTab ? (
                        <>
                          {activeTab.label}
                          {typeof activeTab.price === "number"
                            ? ` · tab ${formatCurrency(activeTab.price)}`
                            : null}
                          {tabExtraPrice > 0
                            ? ` + options ${formatCurrency(tabExtraPrice)}`
                            : null}
                        </>
                      ) : pricing.lines.length === 0 &&
                        !(pricingMatrixEnabled && matrixPrice) ? (
                        <>Select options above — price updates as you choose.</>
                      ) : (
                        <>
                          ({formatCurrency(pricing.unit)} for each)
                        </>
                      )}
                    </p>
                  </>
                )}
                {!hasCustomTabs && pricing.lines.length > 0 ? (
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

              {useBoxCheckoutUi && boxTurnaroundOptions.length > 0 ? (
                <div className="mt-4 border border-border bg-[#fafafa] p-4 sm:p-5">
                  <ProductConfigurator
                    options={boxTurnaroundOptions}
                    selections={selections}
                    onChange={onOptionChange}
                    productSlug={slug}
                  />
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {useBoxCheckoutUi && isBlankOrder ? (
                  <Button
                    size="lg"
                    className="w-full gap-2 sm:col-span-3"
                    disabled={cartBusy || !cart || pricing.total <= 0}
                    onClick={() => void addBlankToCart()}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cartBusy ? "Adding…" : "Add to Cart"}
                  </Button>
                ) : (
                  <>
                    <Link href={`/upload?${query.toString()}`} className="block">
                      <Button size="lg" className="w-full gap-2">
                        <Upload className="h-4 w-4" /> Upload Design
                      </Button>
                    </Link>
                    <button
                      type="button"
                      className="block w-full"
                      onClick={() =>
                        openDesignStudio(
                          editorUrl,
                          `/products/${slug}?designOnline=1`,
                        )
                      }
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full gap-2 border-primary text-primary hover:bg-primary/5"
                      >
                        <Pencil className="h-4 w-4" /> Design Online
                      </Button>
                    </button>
                    <Button
                      variant={savedDesignId ? "primary" : "outline"}
                      size="lg"
                      className={cn(
                        "w-full gap-2",
                        savedDesignId
                          ? "bg-primary text-white hover:bg-primary-hover"
                          : undefined,
                      )}
                      disabled={savingDesign}
                      onClick={() => void toggleSaveDesign()}
                      aria-pressed={Boolean(savedDesignId)}
                    >
                      {savedDesignId ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                      {savingDesign
                        ? savedDesignId
                          ? "Unsaving…"
                          : "Saving…"
                        : savedDesignId
                          ? "Saved"
                          : "Save Design"}
                    </Button>
                  </>
                )}
              </div>
              {useBoxCheckoutUi && isBlankOrder ? (
                <p className="mt-2 text-center text-xs text-text-secondary">
                  Can&apos;t find what you&apos;re looking for?{" "}
                  <Link href="/quote" className="font-semibold text-primary hover:underline">
                    Get a Custom Quote
                  </Link>
                </p>
              ) : (
              <p className="mt-2 text-center text-xs text-text-secondary">
                {savedDesignId ? (
                  <>
                    Status: <span className="font-semibold text-primary">Saved</span>
                    {" · "}
                    Press again to unsave, or manage in{" "}
                    <Link
                      href="/dashboard/saved-designs"
                      className="font-semibold text-primary hover:underline"
                    >
                      Saved Designs
                    </Link>
                  </>
                ) : (
                  <>
                    Status: <span className="font-semibold">Unsaved</span>
                    {" · "}
                    Save to keep this setup in{" "}
                    <Link
                      href="/dashboard/saved-designs"
                      className="font-semibold text-primary hover:underline"
                    >
                      Your Account
                    </Link>
                  </>
                )}
              </p>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-white py-10">
        <Container size="wide">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start gap-0 rounded-none border-0 border-b border-border bg-transparent p-0">
              {(
                [
                  ["overview", "Overview"],
                  ["reviews", "Reviews"],
                  ["faqs", "FAQs"],
                ] as const
              ).map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="rounded-none border-b-2 border-transparent bg-transparent px-5 py-3 text-[15px] shadow-none data-[state=active]:border-success data-[state=active]:bg-transparent data-[state=active]:text-secondary data-[state=active]:shadow-none"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-8">
              {description.trim() ? (
                <div className="mx-auto max-w-4xl">
                  <RichTextContent html={description} />
                </div>
              ) : (
                <p className="text-center text-sm text-text-secondary">
                  No product overview yet. Add a full description from Admin →
                  Products.
                </p>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-8">
              <ProductReviews
                slug={slug}
                rating={rating}
                reviewsCount={reviews}
                onStatsChange={({ rating: r, reviews: c }) => {
                  setRating(r);
                  setReviews(c);
                }}
              />
            </TabsContent>

            <TabsContent value="faqs" className="mt-8">
              <div className="mx-auto max-w-3xl">
                <Accordion items={productFaqs} />
              </div>
            </TabsContent>
          </Tabs>
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
