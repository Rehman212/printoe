import { getApiBaseUrl, getAccessToken } from "@/lib/auth";

export type AdminCustomerRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  orders: number;
  spent: number;
  status: "active" | "inactive" | string;
  joined: string;
};

export type AdminProofRow = {
  id: string;
  proofId: string;
  orderId: string;
  customer: string;
  email?: string;
  fileName: string;
  status: "awaiting" | "approved" | "changes";
  submitted: string;
};

export type AdminQuoteRow = {
  id: string;
  dbId: string;
  customer: string;
  email?: string | null;
  company?: string | null;
  product: string;
  qty: number;
  total: number;
  status: "pending" | "approved" | "declined";
  date: string;
};

export type AdminStats = {
  revenue: number;
  openOrders: number;
  customers: number;
  products: number;
  orders: number;
  awaitingProofs: number;
  pendingQuotes: number;
};

async function adminFetch<T>(
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
    let message = `Admin request failed (${res.status})`;
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

export function fetchAdminStats() {
  return adminFetch<{ success: boolean; data: AdminStats }>("/admin/stats");
}

export function fetchAdminCustomers() {
  return adminFetch<{ success: boolean; data: AdminCustomerRow[] }>(
    "/admin/customers",
  );
}

export function fetchAdminProofs() {
  return adminFetch<{ success: boolean; data: AdminProofRow[] }>(
    "/admin/proofs",
  );
}

export function updateAdminProofStatus(
  id: string,
  status: "awaiting" | "approved" | "changes",
) {
  return adminFetch<{
    success: boolean;
    message?: string;
    data: AdminProofRow;
  }>(`/admin/proofs/${encodeURIComponent(id)}`, "PATCH", {
    status: status.toUpperCase(),
  });
}

export function fetchAdminQuotes() {
  return adminFetch<{ success: boolean; data: AdminQuoteRow[] }>(
    "/admin/quotes",
  );
}

export function updateAdminQuoteStatus(
  id: string,
  status: "pending" | "approved" | "declined",
) {
  return adminFetch<{
    success: boolean;
    message?: string;
    data: AdminQuoteRow;
  }>(`/admin/quotes/${encodeURIComponent(id)}/status`, "PATCH", {
    status: status.toUpperCase(),
  });
}
