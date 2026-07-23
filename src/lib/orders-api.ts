import { getApiBaseUrl, getAccessToken } from "@/lib/auth";

export type OrderStatus =
  | "processing"
  | "printing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ApiOrderRow = {
  id: string;
  dbId: string;
  product: string;
  quantity: number;
  status: OrderStatus;
  date: string;
  total: number;
  customer: string;
  email: string;
  itemCount: number;
};

export type CheckoutPayload = {
  items?: Array<{
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
  }>;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  notes?: string;
  shippingName?: string;
  shippingEmail?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingMethod?: string;
  paymentMethod?: string;
  artworkFile?: string;
  clearCart?: boolean;
};

async function ordersFetch<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" = "GET",
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
    let message = `Order request failed (${res.status})`;
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

export function placeCheckout(payload: CheckoutPayload) {
  return ordersFetch<{
    success: boolean;
    message?: string;
    data: {
      orderId: string;
      id: string;
      status: OrderStatus;
      total: number;
      itemCount: number;
    };
  }>("/checkout", "POST", payload);
}

export function fetchMyOrders() {
  return ordersFetch<{ success: boolean; data: ApiOrderRow[] }>("/orders");
}

export function fetchAdminOrders(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return ordersFetch<{ success: boolean; data: ApiOrderRow[] }>(
    `/admin/orders${q}`,
  );
}

export function updateAdminOrderStatus(id: string, status: OrderStatus) {
  return ordersFetch<{ success: boolean; data: ApiOrderRow; message?: string }>(
    `/admin/orders/${encodeURIComponent(id)}/status`,
    "PATCH",
    { status: status.toUpperCase() },
  );
}

export type ApiOrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string | null;
  shippingName?: string | null;
  shippingEmail?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingZip?: string | null;
  shippingMethod?: string | null;
  paymentMethod?: string | null;
  artworkFile?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; email: string };
  items: Array<{
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
  }>;
};

export function fetchAdminOrder(id: string) {
  return ordersFetch<{ success: boolean; data: ApiOrderDetail }>(
    `/admin/orders/${encodeURIComponent(id)}`,
  );
}
