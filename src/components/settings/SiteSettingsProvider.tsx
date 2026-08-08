"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SITE } from "@/lib/data";
import {
  defaultSiteSettings,
  fetchPublicSettings,
  type SiteSettings,
} from "@/lib/settings-api";

export type PublicSiteConfig = {
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  address: string;
  businessHours: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  currency: string;
  currencySymbol: string;
  timezone: string;
  seoTitleTemplate: string;
  seoDefaultDescription: string;
  seoOgImageUrl: string | null;
  googleAnalyticsId: string | null;
  googleSearchConsole: string | null;
  googleTagManagerId: string | null;
  metaPixelId: string | null;
  headerHtml: string | null;
  bodyHtml: string | null;
  social: {
    instagram: string | null;
    facebook: string | null;
    linkedin: string | null;
    twitter: string | null;
    youtube: string | null;
  };
  maintenanceMode: boolean;
  maintenanceMessage: string;
  requireProof: boolean;
  allowGuestCheckout: boolean;
  minOrderAmount: number;
  shippingNote: string | null;
  taxNote: string | null;
};

const fallbackConfig: PublicSiteConfig = {
  name: SITE.name,
  tagline: SITE.tagline,
  description: SITE.description,
  url: SITE.url,
  email: SITE.email,
  phone: SITE.phone,
  address: SITE.address,
  businessHours: defaultSiteSettings.businessHours,
  logoUrl: null,
  faviconUrl: null,
  currency: defaultSiteSettings.currency,
  currencySymbol: defaultSiteSettings.currencySymbol,
  timezone: defaultSiteSettings.timezone,
  seoTitleTemplate: defaultSiteSettings.seoTitleTemplate,
  seoDefaultDescription: defaultSiteSettings.seoDefaultDescription,
  seoOgImageUrl: null,
  googleAnalyticsId: null,
  googleSearchConsole: null,
  googleTagManagerId: null,
  metaPixelId: null,
  headerHtml: null,
  bodyHtml: null,
  social: {
    instagram: null,
    facebook: null,
    linkedin: null,
    twitter: null,
    youtube: null,
  },
  maintenanceMode: false,
  maintenanceMessage: defaultSiteSettings.maintenanceMessage,
  requireProof: true,
  allowGuestCheckout: false,
  minOrderAmount: 0,
  shippingNote: null,
  taxNote: null,
};

function mapSettings(s: Partial<SiteSettings>): PublicSiteConfig {
  return {
    name: s.storeName || fallbackConfig.name,
    tagline: s.tagline || fallbackConfig.tagline,
    description: s.description || fallbackConfig.description,
    url: s.websiteUrl || fallbackConfig.url,
    email: s.supportEmail || fallbackConfig.email,
    phone: s.supportPhone || fallbackConfig.phone,
    address: s.address || fallbackConfig.address,
    businessHours: s.businessHours || fallbackConfig.businessHours,
    logoUrl: s.logoUrl ?? null,
    faviconUrl: s.faviconUrl ?? null,
    currency: s.currency || fallbackConfig.currency,
    currencySymbol: s.currencySymbol || fallbackConfig.currencySymbol,
    timezone: s.timezone || fallbackConfig.timezone,
    seoTitleTemplate: s.seoTitleTemplate || fallbackConfig.seoTitleTemplate,
    seoDefaultDescription:
      s.seoDefaultDescription || fallbackConfig.seoDefaultDescription,
    seoOgImageUrl: s.seoOgImageUrl ?? null,
    googleAnalyticsId: s.googleAnalyticsId ?? null,
    googleSearchConsole: s.googleSearchConsole ?? null,
    googleTagManagerId: s.googleTagManagerId ?? null,
    metaPixelId: s.metaPixelId ?? null,
    headerHtml: s.headerHtml ?? null,
    bodyHtml: s.bodyHtml ?? null,
    social: {
      instagram: s.socialInstagram ?? null,
      facebook: s.socialFacebook ?? null,
      linkedin: s.socialLinkedin ?? null,
      twitter: s.socialTwitter ?? null,
      youtube: s.socialYoutube ?? null,
    },
    maintenanceMode: Boolean(s.maintenanceMode),
    maintenanceMessage:
      s.maintenanceMessage || fallbackConfig.maintenanceMessage,
    requireProof: s.requireProof ?? true,
    allowGuestCheckout: Boolean(s.allowGuestCheckout),
    minOrderAmount: Number(s.minOrderAmount ?? 0),
    shippingNote: s.shippingNote ?? null,
    taxNote: s.taxNote ?? null,
  };
}

type SiteSettingsContextValue = {
  site: PublicSiteConfig;
  loading: boolean;
  reload: () => Promise<void>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  site: fallbackConfig,
  loading: true,
  reload: async () => undefined,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<PublicSiteConfig>(fallbackConfig);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPublicSettings();
      setSite(mapSettings(data));
    } catch {
      /* keep fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({ site, loading, reload }),
    [site, loading, reload],
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext).site;
}

export function useSiteSettingsState() {
  return useContext(SiteSettingsContext);
}
