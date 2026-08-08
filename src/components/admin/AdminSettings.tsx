"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Code2,
  Globe2,
  Loader2,
  Paintbrush,
  RefreshCw,
  Save,
  Share2,
  ShieldAlert,
  ShoppingCart,
} from "lucide-react";
import {
  defaultSiteSettings,
  settingsApi,
  type SiteSettings,
} from "@/lib/settings-api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useSiteSettingsState } from "@/components/settings/SiteSettingsProvider";

type TabId =
  | "branding"
  | "contact"
  | "seo"
  | "widgets"
  | "notifications"
  | "checkout"
  | "social"
  | "maintenance";

const TABS: Array<{ id: TabId; label: string; icon: typeof Building2 }> = [
  { id: "branding", label: "Branding", icon: Paintbrush },
  { id: "contact", label: "Contact", icon: Building2 },
  { id: "seo", label: "SEO", icon: Globe2 },
  { id: "widgets", label: "Code widgets", icon: Code2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "checkout", label: "Checkout & ops", icon: ShoppingCart },
  { id: "social", label: "Social", icon: Share2 },
  { id: "maintenance", label: "Maintenance", icon: ShieldAlert },
];

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
      />
      <span>
        <span className="block text-sm font-semibold text-text-primary">
          {label}
        </span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-text-secondary">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

export function AdminSettings() {
  const { toast } = useToast();
  const { reload: reloadPublic } = useSiteSettingsState();
  const [tab, setTab] = useState<TabId>("branding");
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const patch = useCallback((partial: Partial<SiteSettings>) => {
    setForm((f) => ({ ...f, ...partial }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getAdmin();
      setForm({ ...defaultSiteSettings, ...res.data });
    } catch (err) {
      toast({
        title: "Could not load settings",
        description: err instanceof Error ? err.message : "API error",
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsApi.update(form);
      setForm({ ...defaultSiteSettings, ...res.data });
      await reloadPublic();
      toast({
        title: "Settings saved",
        description: "Store settings updated in the database.",
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Error",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-text-secondary">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Settings
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Branding, contact, SEO, code widgets, notifications, checkout,
            social &amp; maintenance — saved to the database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" />
            Reload
          </Button>
          <Button
            size="sm"
            form="admin-settings-form"
            type="submit"
            disabled={saving}
            className="gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save settings
          </Button>
        </div>
      </div>

      <form
        id="admin-settings-form"
        onSubmit={onSubmit}
        className="grid gap-5 lg:grid-cols-[220px_1fr]"
      >
        <nav className="h-fit overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-soft lg:sticky lg:top-4">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition last:mb-0",
                  active
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-background hover:text-text-primary",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
          {tab === "branding" ? (
            <div className="space-y-4">
              <SectionTitle
                title="Branding"
                hint="How Printoe appears across the storefront and admin."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Store name"
                  value={form.storeName}
                  onChange={(e) => patch({ storeName: e.target.value })}
                />
                <Input
                  label="Tagline"
                  value={form.tagline}
                  onChange={(e) => patch({ tagline: e.target.value })}
                />
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold">
                    Short description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    rows={3}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus-ring"
                  />
                </div>
                <Input
                  label="Logo URL"
                  value={form.logoUrl ?? ""}
                  onChange={(e) => patch({ logoUrl: e.target.value })}
                  placeholder="https://…"
                />
                <Input
                  label="Favicon URL"
                  value={form.faviconUrl ?? ""}
                  onChange={(e) => patch({ faviconUrl: e.target.value })}
                  placeholder="https://…"
                />
              </div>
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl}
                  alt="Logo preview"
                  className="h-12 rounded-lg border border-border bg-background object-contain p-2"
                />
              ) : null}
            </div>
          ) : null}

          {tab === "contact" ? (
            <div className="space-y-4">
              <SectionTitle
                title="Contact"
                hint="Shown in header, footer, and customer support surfaces."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Support email"
                  type="email"
                  value={form.supportEmail}
                  onChange={(e) => patch({ supportEmail: e.target.value })}
                />
                <Input
                  label="Support phone"
                  value={form.supportPhone}
                  onChange={(e) => patch({ supportPhone: e.target.value })}
                />
                <Input
                  label="Business hours"
                  value={form.businessHours}
                  onChange={(e) => patch({ businessHours: e.target.value })}
                  className="sm:col-span-2"
                />
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold">Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => patch({ address: e.target.value })}
                    rows={2}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus-ring"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {tab === "seo" ? (
            <div className="space-y-4">
              <SectionTitle
                title="SEO & analytics"
                hint="Defaults for search engines and social share cards."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Title template"
                  value={form.seoTitleTemplate}
                  onChange={(e) => patch({ seoTitleTemplate: e.target.value })}
                  hint="Use %s for the page title"
                  className="sm:col-span-2"
                />
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold">
                    Default meta description
                  </label>
                  <textarea
                    value={form.seoDefaultDescription}
                    onChange={(e) =>
                      patch({ seoDefaultDescription: e.target.value })
                    }
                    rows={3}
                    maxLength={170}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus-ring"
                  />
                  <p className="text-[11px] text-text-secondary">
                    {form.seoDefaultDescription.length}/170
                  </p>
                </div>
                <Input
                  label="Open Graph image URL"
                  value={form.seoOgImageUrl ?? ""}
                  onChange={(e) => patch({ seoOgImageUrl: e.target.value })}
                  placeholder="https://…"
                  className="sm:col-span-2"
                />
              </div>
            </div>
          ) : null}

          {tab === "widgets" ? (
            <div className="space-y-4">
              <SectionTitle
                title="Code widgets"
                hint="Paste verification, analytics, and tracking snippets — injected into the live storefront head/body."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Google Search Console"
                  value={form.googleSearchConsole ?? ""}
                  onChange={(e) =>
                    patch({ googleSearchConsole: e.target.value })
                  }
                  placeholder="Verification token or full meta tag"
                  hint="Paste the content token or the full <meta …> tag"
                  className="sm:col-span-2"
                />
                <Input
                  label="Google Analytics ID"
                  value={form.googleAnalyticsId ?? ""}
                  onChange={(e) =>
                    patch({ googleAnalyticsId: e.target.value })
                  }
                  placeholder="G-XXXXXXXX"
                />
                <Input
                  label="Google Tag Manager ID"
                  value={form.googleTagManagerId ?? ""}
                  onChange={(e) =>
                    patch({ googleTagManagerId: e.target.value })
                  }
                  placeholder="GTM-XXXXXXX"
                />
                <Input
                  label="Meta (Facebook) Pixel ID"
                  value={form.metaPixelId ?? ""}
                  onChange={(e) => patch({ metaPixelId: e.target.value })}
                  placeholder="1234567890"
                  className="sm:col-span-2"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold">
                  Custom header code
                </label>
                <p className="text-xs text-text-secondary">
                  Injected into {"<head>"} — meta tags, scripts, chat widgets,
                  etc.
                </p>
                <textarea
                  value={form.headerHtml ?? ""}
                  onChange={(e) => patch({ headerHtml: e.target.value })}
                  rows={6}
                  spellCheck={false}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-mono text-xs focus-ring"
                  placeholder={'<!-- e.g. <script>…</script> or <meta …> -->'}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold">
                  Custom body code
                </label>
                <p className="text-xs text-text-secondary">
                  Injected at the end of {"<body>"} — pixels, chat, remarketing
                  noscript tags.
                </p>
                <textarea
                  value={form.bodyHtml ?? ""}
                  onChange={(e) => patch({ bodyHtml: e.target.value })}
                  rows={6}
                  spellCheck={false}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-mono text-xs focus-ring"
                  placeholder={"<!-- e.g. <noscript>…</noscript> -->"}
                />
              </div>
              <div className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-text-secondary">
                Scripts run on the public storefront after Save. Prefer IDs for
                GA / GTM / Pixel; use custom fields for any other vendor snippet.
              </div>
            </div>
          ) : null}

          {tab === "notifications" ? (
            <div className="space-y-4">
              <SectionTitle
                title="Notifications"
                hint="Who gets emailed when store events happen."
              />
              <Input
                label="Admin notify emails"
                value={form.adminNotifyEmails ?? ""}
                onChange={(e) => patch({ adminNotifyEmails: e.target.value })}
                placeholder="ops@printoe.com, sales@printoe.com"
                hint="Comma-separated list"
              />
              <div className="grid gap-3 sm:grid-cols-1">
                <Toggle
                  checked={form.emailOnOrders}
                  onChange={(emailOnOrders) => patch({ emailOnOrders })}
                  label="Email admin on new orders"
                  hint="Send alert when a customer places an order."
                />
                <Toggle
                  checked={form.emailOnQuotes}
                  onChange={(emailOnQuotes) => patch({ emailOnQuotes })}
                  label="Email admin on new quotes"
                  hint="Alert when a quote request is submitted."
                />
                <Toggle
                  checked={form.emailOnProofs}
                  onChange={(emailOnProofs) => patch({ emailOnProofs })}
                  label="Email admin on artwork proofs"
                  hint="Alert when a proof is uploaded or needs review."
                />
              </div>
            </div>
          ) : null}

          {tab === "checkout" ? (
            <div className="space-y-4">
              <SectionTitle
                title="Checkout & operations"
                hint="Currency, minimums, proofs, and guest checkout."
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="Currency"
                  value={form.currency}
                  onChange={(e) => patch({ currency: e.target.value })}
                />
                <Input
                  label="Currency symbol"
                  value={form.currencySymbol}
                  onChange={(e) => patch({ currencySymbol: e.target.value })}
                />
                <Input
                  label="Timezone"
                  value={form.timezone}
                  onChange={(e) => patch({ timezone: e.target.value })}
                />
                <Input
                  label="Minimum order ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(form.minOrderAmount ?? 0)}
                  onChange={(e) =>
                    patch({ minOrderAmount: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold">Tax note</label>
                  <textarea
                    value={form.taxNote ?? ""}
                    onChange={(e) => patch({ taxNote: e.target.value })}
                    rows={2}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus-ring"
                    placeholder="e.g. Sales tax calculated at checkout"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold">
                    Shipping note
                  </label>
                  <textarea
                    value={form.shippingNote ?? ""}
                    onChange={(e) => patch({ shippingNote: e.target.value })}
                    rows={2}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus-ring"
                    placeholder="e.g. Free shipping over $150"
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <Toggle
                  checked={form.requireProof}
                  onChange={(requireProof) => patch({ requireProof })}
                  label="Require PDF proof for custom artwork"
                  hint="Customers must upload/approve a proof before production."
                />
                <Toggle
                  checked={form.allowGuestCheckout}
                  onChange={(allowGuestCheckout) =>
                    patch({ allowGuestCheckout })
                  }
                  label="Allow guest checkout"
                  hint="Let shoppers checkout without creating an account."
                />
              </div>
            </div>
          ) : null}

          {tab === "social" ? (
            <div className="space-y-4">
              <SectionTitle
                title="Social links"
                hint="Footer and share destinations."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Instagram"
                  value={form.socialInstagram ?? ""}
                  onChange={(e) => patch({ socialInstagram: e.target.value })}
                  placeholder="https://instagram.com/…"
                />
                <Input
                  label="Facebook"
                  value={form.socialFacebook ?? ""}
                  onChange={(e) => patch({ socialFacebook: e.target.value })}
                  placeholder="https://facebook.com/…"
                />
                <Input
                  label="LinkedIn"
                  value={form.socialLinkedin ?? ""}
                  onChange={(e) => patch({ socialLinkedin: e.target.value })}
                  placeholder="https://linkedin.com/…"
                />
                <Input
                  label="X / Twitter"
                  value={form.socialTwitter ?? ""}
                  onChange={(e) => patch({ socialTwitter: e.target.value })}
                  placeholder="https://x.com/…"
                />
                <Input
                  label="YouTube"
                  value={form.socialYoutube ?? ""}
                  onChange={(e) => patch({ socialYoutube: e.target.value })}
                  placeholder="https://youtube.com/…"
                  className="sm:col-span-2"
                />
              </div>
            </div>
          ) : null}

          {tab === "maintenance" ? (
            <div className="space-y-4">
              <SectionTitle
                title="Maintenance mode"
                hint="Take the storefront offline for customers while admins keep working."
              />
              <Toggle
                checked={form.maintenanceMode}
                onChange={(maintenanceMode) => patch({ maintenanceMode })}
                label="Enable maintenance mode"
                hint="Public visitors see the message below. Admins can still use /admin."
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold">
                  Maintenance message
                </label>
                <textarea
                  value={form.maintenanceMessage}
                  onChange={(e) =>
                    patch({ maintenanceMessage: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus-ring"
                />
              </div>
              {form.maintenanceMode ? (
                <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-semibold text-secondary">
                  Maintenance is ON — storefront customers will see the
                  maintenance message.
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-text-primary">{title}</h2>
      <p className="mt-0.5 text-xs text-text-secondary">{hint}</p>
    </div>
  );
}
