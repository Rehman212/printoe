import { getApiBaseUrl, getAccessToken } from "@/lib/auth";
import { showcaseImageForSlug } from "@/lib/homepage-showcase";
import { importedDefaultSelections } from "@/lib/imported-product-rules";
import type {
  CatalogProduct,
  ProductDetailPayload,
  ProductOptionGroup,
  ProductTab,
} from "@/types";

function applyShowcaseImage<T extends {
  slug: string;
  imageUrl?: string | null;
  galleryUrls?: string[];
}>(product: T): T {
  const image = showcaseImageForSlug(product.slug);
  if (!image) return product;
  return {
    ...product,
    imageUrl: image,
    galleryUrls: [image, ...(product.galleryUrls ?? []).filter((u) => u !== image)],
  };
}
async function apiGet<T>(path: string, auth = false): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export async function fetchProducts(category?: string, featured?: boolean) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (featured) params.set("featured", "true");
  const q = params.toString() ? `?${params.toString()}` : "";
  const res = await apiGet<{ success: boolean; data: CatalogProduct[] }>(
    `/products${q}`,
  );
  return {
    ...res,
    data: res.data.map(applyShowcaseImage),
  };
}

export async function fetchStoreCategories() {
  return apiGet<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      productCount: number;
    }>;
  }>("/products/categories/list");
}

export async function fetchProductBySlug(slug: string) {
  const res = await apiGet<{ success: boolean; data: ProductDetailPayload }>(
    `/products/${encodeURIComponent(slug)}`,
  );
  return {
    ...res,
    data: {
      ...res.data,
      product: applyShowcaseImage(res.data.product),
    },
  };
}

export type ImportedVariationPrice = {
  selection: Record<string, string>;
  price: number;
  unitPrice: number;
  quantity: number;
  turnaroundDays?: number;
  inStock?: boolean;
};

export async function fetchConfiguredMatrixPrice(
  slug: string,
  selections: Record<string, string>,
) {
  return apiSend<{
    success: boolean;
    data: null | {
      price?: number;
      unitPrice?: number;
      quantity?: number;
      turnaroundDays?: number | null;
      inStock?: boolean;
      availableOptions: Record<string, string[]>;
    };
  }>(`/products/${encodeURIComponent(slug)}/price`, "POST", { selections });
}

export async function fetchAdminProducts() {
  return apiGet<{
    success: boolean;
    data: ProductDetailPayload[];
  }>("/admin/products", true);
}

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: { products: number };
};

export async function fetchAdminCategories() {
  return apiGet<{
    success: boolean;
    data: AdminCategory[];
  }>("/admin/categories", true);
}

export async function createAdminCategory(payload: {
  name: string;
  slug: string;
  description?: string;
}) {
  return apiSend<{
    success: boolean;
    data: AdminCategory;
    message?: string;
  }>("/admin/categories", "POST", payload);
}

export async function updateAdminCategory(
  id: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string;
  },
) {
  return apiSend<{
    success: boolean;
    data: AdminCategory;
    message?: string;
  }>(`/admin/categories/${id}`, "PATCH", payload);
}

export async function deleteAdminCategory(id: string) {
  return apiSend<{
    success: boolean;
    data: { id: string };
    message?: string;
  }>(`/admin/categories/${id}`, "DELETE");
}

export async function createAdminProduct(payload: {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  basePrice: number;
  categoryId: string;
  deliveryDays?: number;
  badge?: string;
  imageUrl?: string;
  videoUrl?: string;
  galleryUrls?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  productTabs?: ProductTab[];
  featured?: boolean;
  active?: boolean;
  options?: Array<{
    key: string;
    label: string;
    uiType: "SELECT" | "CARDS" | "NUMBER";
    helpText?: string;
    sortOrder?: number;
    meta?: Record<string, unknown>;
    values: Array<{
      label: string;
      value: string;
      priceMod?: number;
      meta?: Record<string, unknown>;
    }>;
  }>;
}) {
  return apiSend<{
    success: boolean;
    data: ProductDetailPayload;
    message?: string;
  }>("/admin/products", "POST", payload);
}

export async function updateAdminProduct(
  id: string,
  payload: {
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    seoTitle?: string;
    seoDescription?: string;
    basePrice?: number;
    categoryId?: string;
    deliveryDays?: number;
    badge?: string;
    imageUrl?: string;
    videoUrl?: string;
    galleryUrls?: string[];
    faqs?: Array<{ question: string; answer: string }>;
    productTabs?: ProductTab[];
    featured?: boolean;
    active?: boolean;
    options?: Array<{
      key: string;
      label: string;
      uiType: "SELECT" | "CARDS" | "NUMBER";
      helpText?: string;
      sortOrder?: number;
      meta?: Record<string, unknown>;
      values: Array<{
        label: string;
        value: string;
        priceMod?: number;
        meta?: Record<string, unknown>;
      }>;
    }>;
  },
) {
  return apiSend<{
    success: boolean;
    data: ProductDetailPayload;
    message?: string;
  }>(`/admin/products/${id}`, "PATCH", payload);
}

export async function deleteAdminProduct(id: string) {
  return apiSend<{
    success: boolean;
    data: { id: string };
    message?: string;
  }>(`/admin/products/${id}`, "DELETE");
}

export function beginAdminPricingMatrix(id: string, sourceUrl?: string) {
  return apiSend<{ success: boolean; data: { importedRows: number } }>(
    `/admin/products/${id}/pricing-matrix/begin`, "POST", { sourceUrl },
  );
}

export function uploadAdminPricingChunk(id: string, rows: ImportedVariationPrice[]) {
  return apiSend<{ success: boolean; data: { importedRows: number } }>(
    `/admin/products/${id}/pricing-matrix/chunk`, "POST", { rows },
  );
}

export function completeAdminPricingMatrix(id: string, expectedRows: number) {
  return apiSend<{ success: boolean; data: { importedRows: number; enabled: boolean } }>(
    `/admin/products/${id}/pricing-matrix/complete`, "POST", { expectedRows },
  );
}

/** Upload product image → saved under printoe/public/uploads */
export async function uploadAdminImage(file: File) {
  const headers: HeadersInit = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = new FormData();
  body.append("file", file);

  // Prefer Next.js upload (same app as public/uploads). Fall back to Nest API.
  const attempts: Array<{ url: string; label: string }> = [
    { url: "/api/uploads", label: "frontend" },
    { url: `${getApiBaseUrl()}/admin/uploads`, label: "backend" },
  ];

  let lastError = "Upload failed";
  for (const attempt of attempts) {
    try {
      const res = await fetch(attempt.url, {
        method: "POST",
        headers,
        body,
      });

      if (!res.ok) {
        let message = `Upload failed (${res.status})`;
        try {
          const err = (await res.json()) as { message?: string | string[] };
          if (Array.isArray(err.message)) message = err.message.join(", ");
          else if (typeof err.message === "string") message = err.message;
        } catch {
          /* ignore */
        }
        lastError = message;
        continue;
      }

      return res.json() as Promise<{
        success: boolean;
        message?: string;
        data: { url: string; filename: string };
      }>;
    } catch (err) {
      lastError =
        err instanceof Error ? err.message : `Upload via ${attempt.label} failed`;
    }
  }

  throw new Error(lastError);
}

async function apiSend<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(err.message)) message = err.message.join(", ");
      else if (typeof err.message === "string") message = err.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export type PriceBreakdownLine = {
  key: string;
  label: string;
  selectedLabel: string;
  priceMod: number;
};

export function calcConfiguredPrice(
  basePrice: number,
  options: ProductOptionGroup[],
  selections: Record<string, string>,
) {
  let configuredBasePrice = basePrice;
  let mod = 1;
  let quantity = 1;
  let unitAdd = 0;
  const lines: PriceBreakdownLine[] = [];

  const selectedValue = (key: string) => {
    const group = options.find((option) => option.key === key);
    const selected = selections[key];
    if (!selected) return undefined;
    return group?.values.find((value) => value.value === selected);
  };

  const isAbsoluteKey = (key: string) =>
    /^(size|package|product_type|garment)$/i.test(key);

  const hiddenGroups = new Set(
    options.flatMap(
      (group) => selectedValue(group.key)?.meta?.hideGroups ?? [],
    ),
  );

  const areaConfig = options
    .flatMap((group) => group.values)
    .map((value) => value.meta?.pricingConfig)
    .find((config) => config?.type === "area");

  let usesAreaPricing = false;
  if (areaConfig) {
    const dimension = (key: string) => {
      const value = selectedValue(key);
      const explicit = value?.meta?.dimension ?? value?.meta?.dimensionInches;
      if (typeof explicit === "number" && Number.isFinite(explicit)) {
        return explicit;
      }
      const parsed = Number.parseFloat(
        (value?.value ?? "").replace(/[^\d.-]/g, ""),
      );
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const width = dimension(areaConfig.widthKey);
    const height = dimension(areaConfig.heightKey);
    if (width > 0 && height > 0) {
      configuredBasePrice = Math.max(
        areaConfig.minimumPrice,
        areaConfig.setupCost + width * height * areaConfig.rate,
      );
      usesAreaPricing = true;
    }
  } else {
    // Backwards compatibility with products synced before the Pricing step
    // existed (for example Custom Wall Decals).
    const size = selectedValue("size");
    if (
      typeof size?.meta?.absoluteBasePrice === "number" &&
      Number.isFinite(size.meta.absoluteBasePrice)
    ) {
      configuredBasePrice = size.meta.absoluteBasePrice;
    } else if (
      typeof size?.meta?.priceAdd === "number" &&
      Number.isFinite(size.meta.priceAdd)
    ) {
      configuredBasePrice = size.meta.priceAdd;
    } else if (size?.meta?.areaPricing) {
      const width =
        selectedValue("width")?.meta?.dimensionInches ??
        Number.parseFloat(selectedValue("width")?.value ?? "0");
      const height =
        selectedValue("height")?.meta?.dimensionInches ??
        Number.parseFloat(selectedValue("height")?.value ?? "0");
      if (
        Number.isFinite(width) &&
        Number.isFinite(height) &&
        (width as number) > 0 &&
        (height as number) > 0
      ) {
        configuredBasePrice =
          size.meta.areaPricing.fixed +
          size.meta.areaPricing.perSquareInch *
            (width as number) *
            (height as number);
        usesAreaPricing = true;
      }
    }
  }

  for (const group of options) {
    if (hiddenGroups.has(group.key)) continue;
    const selected = selections[group.key];
    if (!selected) continue;
    const value = group.values.find((v) => v.value === selected);
    if (!value) continue;

    lines.push({
      key: group.key,
      label: group.label,
      selectedLabel: value.label,
      priceMod: value.priceMod,
    });

    if (group.key === "quantity" || /^quantity$/i.test(group.label)) {
      // Imported (uprinting) groups key their Quantity group "attrN", not
      // "quantity" - the real number lives in the option's label ("100"),
      // since value.value is that source system's opaque option id.
      const qty = Number(group.key === "quantity" ? selected : value.label);
      if (!Number.isNaN(qty) && qty > 0) quantity = qty;
      mod *= value.priceMod;
      continue;
    }

    // Width and height determine the area; their option multipliers must not
    // also change the price a second time.
    if (
      areaConfig &&
      (group.key === areaConfig.widthKey ||
        group.key === areaConfig.heightKey)
    ) {
      continue;
    }

    const absolute =
      typeof value.meta?.absoluteBasePrice === "number" &&
      Number.isFinite(value.meta.absoluteBasePrice)
        ? value.meta.absoluteBasePrice
        : null;
    const priceAdd =
      typeof value.meta?.priceAdd === "number" &&
      Number.isFinite(value.meta.priceAdd)
        ? value.meta.priceAdd
        : null;

    // Garment / Size / Package: number IS the price (not +extra).
    // Old Extra $ on garment → Polo 222 shows $222, not start+222.
    if (isAbsoluteKey(group.key)) {
      if (absolute != null) configuredBasePrice = absolute;
      else if (priceAdd != null) configuredBasePrice = priceAdd;
      continue;
    }

    if (absolute != null) {
      configuredBasePrice = absolute;
    }
    if (priceAdd != null) {
      unitAdd += priceAdd;
    } else {
      mod *= value.priceMod;
    }
  }

  configuredBasePrice += unitAdd;

  if (usesAreaPricing) {
    const unit = configuredBasePrice * mod;
    return {
      unit,
      total: unit * quantity,
      quantity,
      basePrice: configuredBasePrice,
      mod,
      isPerUnit: true,
      lines,
    };
  }

  // Per-unit (stickers): base ≈ unit cost; qty multiplies after mods
  const isPerUnit = configuredBasePrice < 5;
  if (isPerUnit) {
    const unit = configuredBasePrice * mod;
    return {
      unit,
      total: unit * quantity,
      quantity,
      basePrice: configuredBasePrice,
      mod,
      isPerUnit,
      lines,
    };
  }

  // Pack-style (banners/cards): base is pack price; qty + turnaround use priceMod
  const packQty = quantity;
  const size = selectedValue("size");
  const setupCost =
    size?.meta?.quantitySetupCost ?? size?.meta?.areaPricing?.fixed;
  const quantityBase =
    packQty > 1 &&
    setupCost != null &&
    Number.isFinite(setupCost) &&
    setupCost >= 0 &&
    setupCost < configuredBasePrice
      ? setupCost + (configuredBasePrice - setupCost) * packQty
      : configuredBasePrice * (packQty > 1 ? packQty : 1);
  const total = quantityBase * mod;
  return {
    unit: packQty > 0 ? total / packQty : total,
    total,
    quantity: packQty,
    basePrice: configuredBasePrice,
    mod,
    isPerUnit,
    lines,
  };
}

/**
 * Fallback pricing for imported (pricing-matrix) products when the exact
 * combination isn't in the matrix. Every option value here carries
 * meta.matrixAnchorPrice (the default combo's real scraped price) and,
 * where the scraper tested that single change, meta.priceAdd (the dollar
 * delta vs. the anchor) - see the import-time comment in AdminProducts.tsx.
 *
 * Quantity is handled separately from every other option: its scraped rows
 * are real bulk-discount totals (e.g. qty 100 costs $28.85/unit, not the
 * qty-1 rate of $44.63/unit), not a flat per-unit add. So when the selected
 * quantity has real scraped data (meta.matrixUnitPrice), that becomes the
 * per-unit anchor in place of the qty-1 default - other options' deltas
 * then add on top of that discounted rate, and the qty-1 anchor is never
 * multiplied by the quantity a second time.
 */
export function calcMatrixFallbackPrice(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
) {
  const selectedValues = options
    .map((group) => ({ group, value: group.values.find((v) => v.value === selections[group.key]) }))
    .filter(
      (entry): entry is { group: ProductOptionGroup; value: (typeof entry)["value"] & object } =>
        Boolean(entry.value),
    );

  const productId = selections.attr0 ?? "default";
  const pricingEntries = selectedValues
    .map((entry) => {
      const byProduct = entry.value.meta?.pricingByProduct;
      if (!byProduct || typeof byProduct !== "object") return null;
      const pricing = (byProduct as Record<string, unknown>)[productId];
      return pricing && typeof pricing === "object"
        ? (pricing as {
            anchorPrice?: number;
            anchorUnitPrice?: number;
            matrixUnitPrice?: number;
            unitPriceAdd?: number;
          })
        : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  if (pricingEntries.length) {
    const quantityEntry = selectedValues.find((entry) =>
      /^quantity$/i.test(entry.group.label),
    );
    const quantity = (() => {
      const parsed = quantityEntry
        ? Number.parseInt(quantityEntry.value.label, 10)
        : NaN;
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    })();
    const quantityPricing = (() => {
      const byProduct = quantityEntry?.value.meta?.pricingByProduct;
      const value =
        byProduct && typeof byProduct === "object"
          ? (byProduct as Record<string, unknown>)[productId]
          : null;
      return value && typeof value === "object"
        ? (value as { matrixUnitPrice?: number })
        : null;
    })();
    const anchorUnit =
      typeof quantityPricing?.matrixUnitPrice === "number"
        ? quantityPricing.matrixUnitPrice
        : (pricingEntries
            .map((entry) => entry.anchorUnitPrice)
            .find((value): value is number => typeof value === "number") ?? 0);
    const unitDelta = pricingEntries.reduce(
      (sum, entry) =>
        sum +
        (typeof entry.unitPriceAdd === "number" ? entry.unitPriceAdd : 0),
      0,
    );
    const unit = Math.max(0, anchorUnit + unitDelta);
    return {
      unit,
      total: unit * quantity,
      quantity,
      basePrice: unit,
      mod: 1,
      isPerUnit: true,
      lines: [] as PriceBreakdownLine[],
    };
  }

  const anchorPrice =
    selectedValues
      .map((entry) => entry.value.meta?.matrixAnchorPrice)
      .find((price): price is number => typeof price === "number") ?? 0;

  const quantityEntry = selectedValues.find((entry) => /^quantity$/i.test(entry.group.label));
  const quantityUnitOverride = quantityEntry?.value.meta?.matrixUnitPrice;
  const matrixAnchorUnitPrice = selectedValues
    .map((entry) => entry.value.meta?.matrixAnchorUnitPrice)
    .find((price): price is number => typeof price === "number");
  const unitAnchor =
    typeof quantityUnitOverride === "number"
      ? quantityUnitOverride
      : (matrixAnchorUnitPrice ?? anchorPrice);

  const delta = selectedValues.reduce((sum, entry) => {
    if (entry === quantityEntry) return sum;
    const add =
      typeof entry.value.meta?.unitPriceAdd === "number"
        ? entry.value.meta.unitPriceAdd
        : entry.value.meta?.priceAdd;
    return sum + (typeof add === "number" ? add : 0);
  }, 0);

  const quantity = (() => {
    const parsed = quantityEntry ? Number.parseInt(quantityEntry.value.label, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  })();

  const unit = unitAnchor + delta;
  const total = unit * quantity;
  return { unit, total, quantity, basePrice: unit, mod: 1, isPerUnit: true, lines: [] as PriceBreakdownLine[] };
}

/** Empty on load — customer picks each field; price updates on select. */
export function defaultSelections(_options: ProductOptionGroup[]) {
  return importedDefaultSelections(_options);
}
