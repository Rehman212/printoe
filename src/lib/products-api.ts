import { getApiBaseUrl, getAccessToken } from "@/lib/auth";
import { showcaseImageForSlug } from "@/lib/homepage-showcase";
import type {
  CatalogProduct,
  ProductDetailPayload,
  ProductOptionGroup,
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
  basePrice: number;
  categoryId: string;
  deliveryDays?: number;
  badge?: string;
  imageUrl?: string;
  galleryUrls?: string[];
  featured?: boolean;
  active?: boolean;
  options?: Array<{
    key: string;
    label: string;
    uiType: "SELECT" | "CARDS" | "NUMBER";
    helpText?: string;
    sortOrder?: number;
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
    basePrice?: number;
    categoryId?: string;
    deliveryDays?: number;
    badge?: string;
    imageUrl?: string;
    galleryUrls?: string[];
    featured?: boolean;
    active?: boolean;
    options?: Array<{
      key: string;
      label: string;
      uiType: "SELECT" | "CARDS" | "NUMBER";
      helpText?: string;
      sortOrder?: number;
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
  let mod = 1;
  let quantity = 1;
  const lines: PriceBreakdownLine[] = [];

  for (const group of options) {
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

    if (group.key === "quantity") {
      const qty = Number(selected);
      if (!Number.isNaN(qty) && qty > 0) quantity = qty;
      mod *= value.priceMod;
    } else {
      mod *= value.priceMod;
    }
  }

  // Per-unit (stickers): base ≈ unit cost; qty multiplies after mods
  const isPerUnit = basePrice < 5;
  if (isPerUnit) {
    const unit = basePrice * mod;
    return {
      unit,
      total: unit * quantity,
      quantity,
      basePrice,
      mod,
      isPerUnit,
      lines,
    };
  }

  // Pack-style (banners/cards): base is pack price; qty + turnaround use priceMod
  const packQty = quantity;
  const total = basePrice * mod * (packQty > 1 ? packQty : 1);
  return {
    unit: packQty > 0 ? total / packQty : total,
    total,
    quantity: packQty,
    basePrice,
    mod,
    isPerUnit,
    lines,
  };
}

export function defaultSelections(options: ProductOptionGroup[]) {
  const selections: Record<string, string> = {};
  for (const group of options) {
    if (group.values[0]) selections[group.key] = group.values[0].value;
  }
  return selections;
}
