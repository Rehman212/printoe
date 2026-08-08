import { getApiBaseUrl, getAccessToken } from "@/lib/auth";

export type SiteSettings = {
  id?: string;
  storeName: string;
  tagline: string;
  description: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  businessHours: string;
  websiteUrl: string;
  seoTitleTemplate: string;
  seoDefaultDescription: string;
  seoOgImageUrl?: string | null;
  googleAnalyticsId?: string | null;
  googleSearchConsole?: string | null;
  googleTagManagerId?: string | null;
  metaPixelId?: string | null;
  headerHtml?: string | null;
  bodyHtml?: string | null;
  currency: string;
  currencySymbol: string;
  timezone: string;
  taxNote?: string | null;
  shippingNote?: string | null;
  minOrderAmount: number;
  emailOnOrders: boolean;
  emailOnQuotes: boolean;
  emailOnProofs: boolean;
  adminNotifyEmails?: string | null;
  requireProof: boolean;
  allowGuestCheckout: boolean;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
  socialLinkedin?: string | null;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  updatedAt?: string;
};

export const defaultSiteSettings: SiteSettings = {
  storeName: "Printoe",
  tagline: "Enterprise print, perfected.",
  description:
    "Custom business cards, packaging, banners, and more — print that looks as good as it sells.",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#e6007a",
  supportEmail: "hello@printoe.com",
  supportPhone: "+1 (888) 555-0199",
  address: "450 Market Street, Suite 1200, San Francisco, CA 94105",
  businessHours: "Mon–Fri 9am–6pm PT",
  websiteUrl: "https://printoe.com",
  seoTitleTemplate: "%s | Printoe",
  seoDefaultDescription:
    "Custom printing for business cards, packaging, banners, apparel, and more.",
  seoOgImageUrl: "",
  googleAnalyticsId: "",
  googleSearchConsole: "",
  googleTagManagerId: "",
  metaPixelId: "",
  headerHtml: "",
  bodyHtml: "",
  currency: "USD",
  currencySymbol: "$",
  timezone: "America/Los_Angeles",
  taxNote: "",
  shippingNote: "",
  minOrderAmount: 0,
  emailOnOrders: true,
  emailOnQuotes: true,
  emailOnProofs: true,
  adminNotifyEmails: "",
  requireProof: true,
  allowGuestCheckout: false,
  socialInstagram: "",
  socialFacebook: "",
  socialLinkedin: "",
  socialTwitter: "",
  socialYoutube: "",
  maintenanceMode: false,
  maintenanceMessage:
    "We're upgrading our systems. Please check back shortly.",
};

async function apiSend<T>(
  path: string,
  method: "GET" | "PUT" = "GET",
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

export const settingsApi = {
  getAdmin: () =>
    apiSend<{ success: boolean; data: SiteSettings }>("/admin/settings"),
  update: (payload: Partial<SiteSettings>) =>
    apiSend<{ success: boolean; data: SiteSettings; message?: string }>(
      "/admin/settings",
      "PUT",
      toUpdatePayload(payload),
    ),
};

/** Strip Prisma meta + removed admin fields Nest ValidationPipe rejects. */
export function toUpdatePayload(
  settings: Partial<SiteSettings> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  },
): Partial<SiteSettings> {
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    primaryColor: _primaryColor,
    websiteUrl: _websiteUrl,
    ...payload
  } = settings;
  return payload;
}

export async function fetchPublicSettings(): Promise<Partial<SiteSettings>> {
  const res = await fetch(`${getApiBaseUrl()}/settings`, { cache: "no-store" });
  if (!res.ok) return defaultSiteSettings;
  const json = (await res.json()) as { data: SiteSettings };
  return json.data;
}
