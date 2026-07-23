import { getApiBaseUrl, getAccessToken } from "@/lib/auth";

export type ProductReviewItem = {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  authorName: string;
  createdAt: string;
  userId?: string | null;
};

export type ProductReviewsPayload = {
  product: {
    id: string;
    slug: string;
    name: string;
    rating: number;
    reviews: number;
  };
  items: ProductReviewItem[];
};

async function reviewsFetch<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
  auth = false,
): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Review request failed (${res.status})`;
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

export function fetchProductReviews(slug: string) {
  return reviewsFetch<{ success: boolean; data: ProductReviewsPayload }>(
    `/products/${encodeURIComponent(slug)}/reviews`,
  );
}

export function submitProductReview(
  slug: string,
  payload: {
    rating: number;
    body: string;
    title?: string;
    authorName?: string;
  },
) {
  return reviewsFetch<{
    success: boolean;
    message?: string;
    data: {
      review: ProductReviewItem;
      product: { id: string; slug: string; rating: number; reviews: number };
    };
  }>(
    `/products/${encodeURIComponent(slug)}/reviews`,
    "POST",
    payload,
    true,
  );
}
