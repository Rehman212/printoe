import { getApiBaseUrl, getAccessToken } from "@/lib/auth";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type CrmMenuItem = {
  id?: string;
  label: string;
  href: string;
  sortOrder?: number;
};

export type CrmMenu = {
  id: string;
  name: string;
  location: string;
  active: boolean;
  items: CrmMenuItem[];
  updatedAt?: string;
};

export type CrmPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  status: ContentStatus;
  publishedAt?: string | null;
  updatedAt?: string;
};

export type CrmPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status: ContentStatus;
  updatedAt?: string;
  createdAt?: string;
};

async function apiSend<T>(
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

export const crmApi = {
  listMenus: () =>
    apiSend<{ success: boolean; data: CrmMenu[] }>("/admin/crm/menus"),
  createMenu: (payload: {
    name: string;
    location?: string;
    active?: boolean;
    items?: CrmMenuItem[];
  }) =>
    apiSend<{ success: boolean; data: CrmMenu }>("/admin/crm/menus", "POST", payload),
  updateMenu: (
    id: string,
    payload: {
      name?: string;
      location?: string;
      active?: boolean;
      items?: CrmMenuItem[];
    },
  ) =>
    apiSend<{ success: boolean; data: CrmMenu }>(
      `/admin/crm/menus/${id}`,
      "PATCH",
      payload,
    ),
  deleteMenu: (id: string) =>
    apiSend<{ success: boolean }>(`/admin/crm/menus/${id}`, "DELETE"),

  listPosts: () =>
    apiSend<{ success: boolean; data: CrmPost[] }>("/admin/crm/posts"),
  createPost: (payload: Partial<CrmPost> & { title: string; slug: string; content: string }) =>
    apiSend<{ success: boolean; data: CrmPost }>("/admin/crm/posts", "POST", payload),
  updatePost: (id: string, payload: Partial<CrmPost>) =>
    apiSend<{ success: boolean; data: CrmPost }>(
      `/admin/crm/posts/${id}`,
      "PATCH",
      payload,
    ),
  deletePost: (id: string) =>
    apiSend<{ success: boolean }>(`/admin/crm/posts/${id}`, "DELETE"),

  listPages: () =>
    apiSend<{ success: boolean; data: CrmPage[] }>("/admin/crm/pages"),
  createPage: (payload: Partial<CrmPage> & { title: string; slug: string; content: string }) =>
    apiSend<{ success: boolean; data: CrmPage }>("/admin/crm/pages", "POST", payload),
  updatePage: (id: string, payload: Partial<CrmPage>) =>
    apiSend<{ success: boolean; data: CrmPage }>(
      `/admin/crm/pages/${id}`,
      "PATCH",
      payload,
    ),
  deletePage: (id: string) =>
    apiSend<{ success: boolean }>(`/admin/crm/pages/${id}`, "DELETE"),
};

/** Public (no auth) — published content only */
export async function fetchPublicPost(slug: string): Promise<CrmPost> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/crm/posts/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Post not found");
  const json = (await res.json()) as { data: CrmPost };
  return json.data;
}

export async function fetchPublicPage(slug: string): Promise<CrmPage> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/crm/pages/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Page not found");
  const json = (await res.json()) as { data: CrmPage };
  return json.data;
}

export function publicPostUrl(slug: string) {
  return `/blog/${slug}`;
}

export function publicPageUrl(slug: string) {
  return `/pages/${slug}`;
}
