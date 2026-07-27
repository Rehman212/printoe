import { getApiBaseUrl, getAccessToken } from "@/lib/auth";

async function customerFetch<T>(
  path: string,
  method: "GET" | "POST" | "DELETE" = "GET",
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

export type CustomerOverview = {
  metrics: {
    activeOrders: number;
    spend30d: number;
    savedDesigns: number;
    openQuotes: number;
    wishlist: number;
    openTickets: number;
  };
  statusBreakdown: Record<string, number>;
  monthlySpend: Array<{ month: string; spend: number }>;
  recentOrders: Array<{
    id: string;
    dbId: string;
    product: string;
    quantity: number;
    status: string;
    date: string;
    total: number;
  }>;
  activity: Array<{ id: string; text: string; time: string; color: string }>;
  quotes: Array<{
    id: string;
    product: string;
    qty: number;
    total: number;
    status: string;
    date: string;
  }>;
};

export function fetchCustomerOverview() {
  return customerFetch<{ success: boolean; data: CustomerOverview }>(
    "/customer/overview",
  );
}

export function fetchCustomerQuotes() {
  return customerFetch<{
    success: boolean;
    data: Array<{
      id: string;
      dbId: string;
      product: string;
      qty: number;
      total: number;
      status: string;
      date: string;
    }>;
  }>("/customer/quotes");
}

export function createCustomerQuote(payload: {
  productName: string;
  quantity: number;
  total: number;
  notes?: string;
  company?: string;
}) {
  return customerFetch<{ success: boolean; data: unknown; message?: string }>(
    "/customer/quotes",
    "POST",
    payload,
  );
}

export function fetchCustomerDownloads() {
  return customerFetch<{
    success: boolean;
    data: Array<{
      id: string;
      orderId: string;
      fileName: string;
      proofStatus: string;
      status: string;
      date: string;
    }>;
  }>("/customer/downloads");
}

export function fetchCustomerInvoices() {
  return customerFetch<{
    success: boolean;
    data: Array<{
      id: string;
      orderId: string;
      date: string;
      amount: number;
      status: string;
    }>;
  }>("/customer/invoices");
}

export function fetchCustomerNotifications() {
  return customerFetch<{
    success: boolean;
    data: Array<{
      id: string;
      title: string;
      read: boolean;
      createdAt: string;
    }>;
  }>("/customer/notifications");
}

export function fetchCustomerWishlist() {
  return customerFetch<{
    success: boolean;
    data: Array<{
      id: string;
      productSlug: string;
      name: string;
      imageUrl?: string | null;
      basePrice?: number | null;
    }>;
  }>("/customer/wishlist");
}

export function addCustomerWishlist(payload: {
  productSlug: string;
  name: string;
  productId?: string;
  imageUrl?: string;
  basePrice?: number;
}) {
  return customerFetch<{ success: boolean; message?: string }>(
    "/customer/wishlist",
    "POST",
    payload,
  );
}

export function removeCustomerWishlist(id: string) {
  return customerFetch<{ success: boolean }>(
    `/customer/wishlist/${encodeURIComponent(id)}`,
    "DELETE",
  );
}

export function fetchCustomerTickets() {
  return customerFetch<{
    success: boolean;
    data: Array<{
      id: string;
      ticketNumber: string;
      subject: string;
      message: string;
      status: string;
      createdAt: string;
    }>;
  }>("/customer/tickets");
}

export function createCustomerTicket(payload: {
  subject: string;
  message: string;
}) {
  return customerFetch<{ success: boolean; message?: string }>(
    "/customer/tickets",
    "POST",
    payload,
  );
}

export function fetchCustomerDesigns() {
  return customerFetch<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      productName?: string | null;
      productSlug?: string | null;
      updatedAt: string;
    }>;
  }>("/customer/designs");
}

export function createCustomerDesign(payload: {
  name: string;
  productSlug?: string;
  productName?: string;
}) {
  return customerFetch<{
    success: boolean;
    data: {
      id: string;
      name: string;
      productName?: string | null;
      productSlug?: string | null;
      updatedAt: string;
    };
  }>("/customer/designs", "POST", payload);
}
