import { getApiBaseUrl, getAccessToken } from "@/lib/auth";
import type { CartItem } from "@/types";

export type ApiCartItem = {
  id: string;
  productId?: string | null;
  productSlug?: string | null;
  name: string;
  image: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  size: string;
  material: string;
  finishing: string;
};

export type CartPayload = {
  items: ApiCartItem[];
  itemCount: number;
  subtotal: number;
};

export type AddCartPayload = {
  productId?: string;
  productSlug?: string;
  name: string;
  image?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  size?: string;
  material?: string;
  finishing?: string;
};

async function cartFetch<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: unknown,
): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Cart request failed (${res.status})`;
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

export function mapApiCartItem(item: ApiCartItem): CartItem {
  return {
    id: item.id,
    productId: item.productId ?? item.productSlug ?? item.id,
    name: item.name,
    image: item.image || "default",
    imageUrl: item.imageUrl ?? undefined,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    size: item.size || "—",
    material: item.material || "—",
    finishing: item.finishing || "—",
  };
}

export const cartApi = {
  get: () =>
    cartFetch<{ success: boolean; data: CartPayload }>("/cart"),
  add: (payload: AddCartPayload) =>
    cartFetch<{ success: boolean; data: CartPayload & { item: ApiCartItem } }>(
      "/cart/items",
      "POST",
      payload,
    ),
  updateQty: (id: string, quantity: number) =>
    cartFetch<{ success: boolean; data: CartPayload }>(
      `/cart/items/${id}`,
      "PATCH",
      { quantity },
    ),
  remove: (id: string) =>
    cartFetch<{ success: boolean; data: CartPayload }>(
      `/cart/items/${id}`,
      "DELETE",
    ),
  clear: () =>
    cartFetch<{ success: boolean; data: CartPayload }>("/cart", "DELETE"),
};
