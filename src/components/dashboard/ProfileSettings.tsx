"use client";

import { useEffect, useMemo, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { updateProfileRequest } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type TabId = "personal" | "company" | "preferences" | "danger";

const TABS: { id: TabId; label: string; icon: typeof UserRound }[] = [
  { id: "personal", label: "Personal", icon: UserRound },
  { id: "company", label: "Company", icon: Building2 },
  { id: "preferences", label: "Preferences", icon: Globe },
  { id: "danger", label: "Account", icon: Shield },
];

function splitName(full?: string | null) {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || "",
    last: parts.slice(1).join(" ") || "",
  };
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/25">
      <span>
        <span className="block text-sm font-bold text-text-primary">{label}</span>
        <span className="mt-0.5 block text-xs font-medium text-text-secondary">
          {description}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked && "translate-x-5",
          )}
        />
      </button>
    </label>
  );
}

export function ProfileSettings() {
  const { user, setUserProfile } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const initial = useMemo(() => {
    const { first, last } = splitName(user?.name);
    return {
      firstName: first || "",
      lastName: last || "",
      email: user?.email || "",
      phone: user?.phone || "",
      jobTitle: user?.jobTitle || "",
      company: user?.company || "",
      website: user?.website || "",
      industry: user?.industry || "Marketing & Branding",
      employees: user?.employees || "11–50",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zip: user?.zip || "",
      country: user?.country || "United States",
      timezone: user?.timezone || "America/Los_Angeles",
      language: user?.language || "English",
      currency: user?.currency || "USD",
    };
  }, [user]);

  const [tab, setTab] = useState<TabId>("personal");
  const [form, setForm] = useState(initial);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    orderEmail: user?.notifyOrderEmail ?? true,
    marketing: user?.notifyMarketing ?? false,
    sms: user?.notifySms ?? true,
    weeklyDigest: user?.notifyWeeklyDigest ?? true,
  });

  useEffect(() => {
    setForm(initial);
    setAvatarUrl(user?.avatarUrl || null);
    setPrefs({
      orderEmail: user?.notifyOrderEmail ?? true,
      marketing: user?.notifyMarketing ?? false,
      sms: user?.notifySms ?? true,
      weeklyDigest: user?.notifyWeeklyDigest ?? true,
    });
  }, [initial, user]);

  const initials =
    `${form.firstName[0] || ""}${form.lastName[0] || form.firstName[1] || ""}`.toUpperCase() ||
    "U";

  const completeness = useMemo(() => {
    const checks = [
      Boolean(form.firstName),
      Boolean(form.lastName),
      Boolean(form.email),
      Boolean(form.phone),
      Boolean(form.company),
      Boolean(form.jobTitle),
      Boolean(form.address),
      Boolean(avatarUrl),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, avatarUrl]);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onAvatarChange(file?: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", tone: "danger" });
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    toast({ title: "Photo updated", description: "Remember to save your changes.", tone: "info" });
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) {
      toast({
        title: "Missing required fields",
        description: "First name and email are required.",
        tone: "warning",
      });
      setTab("personal");
      return;
    }
    setSaving(true);
    try {
      const res = await updateProfileRequest({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        jobTitle: form.jobTitle,
        company: form.company,
        website: form.website,
        industry: form.industry,
        employees: form.employees,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        timezone: form.timezone,
        language: form.language,
        currency: form.currency,
        avatarUrl: avatarUrl && !avatarUrl.startsWith("blob:") ? avatarUrl : undefined,
        notifyOrderEmail: prefs.orderEmail,
        notifySms: prefs.sms,
        notifyWeeklyDigest: prefs.weeklyDigest,
        notifyMarketing: prefs.marketing,
      });
      setUserProfile(res.data);
      toast({
        title: "Profile saved",
        description: "Your details are updated in the database.",
        tone: "success",
      });
    } catch (err) {
      toast({
        title: "Could not save profile",
        description: err instanceof Error ? err.message : "Please try again.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm(initial);
    toast({ title: "Changes discarded", tone: "info" });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Profile Settings
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Manage your personal details, company profile, and communication preferences.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/account-security">
            <Button variant="outline" className="gap-2">
              <Lock className="h-4 w-4" />
              Security
            </Button>
          </Link>
          <Button type="submit" form="profile-settings-form" loading={saving} className="gap-2">
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-primary via-accent to-brand-yellow" />
            <CardContent className="space-y-4 px-5 pb-5 pt-0">
              <div className="-mt-8 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-card">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 rounded-xl bg-secondary p-2 text-white shadow-soft transition hover:bg-secondary/90"
                    aria-label="Change photo"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onAvatarChange(e.target.files?.[0])}
                  />
                </div>

                <p className="w-full break-words text-base font-bold leading-snug text-text-primary">
                  {[form.firstName, form.lastName].filter(Boolean).join(" ") || "Your name"}
                </p>
                <p
                  className="mt-1 w-full break-all text-xs font-medium leading-relaxed text-text-secondary"
                  title={form.email || undefined}
                >
                  {form.email || "email@example.com"}
                </p>
                <Badge variant="success" className="mt-2.5 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified account
                </Badge>
              </div>

              <div className="border-t border-border pt-4">
                <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-semibold">
                  <span className="text-text-secondary">Profile completeness</span>
                  <span className="shrink-0 text-primary">{completeness}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-text-secondary">
                  Add phone, company address, and a photo to reach 100%.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-text-primary transition hover:border-primary/30 hover:bg-primary/5"
                >
                  Upload photo
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-bold text-text-secondary transition hover:bg-secondary/5"
                >
                  Remove
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1 p-2">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                    tab === id
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-secondary/5 hover:text-text-primary",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4 text-xs font-medium text-text-secondary">
              <p className="font-bold text-text-primary">Quick links</p>
              <Link href="/dashboard/addresses" className="flex items-center gap-2 hover:text-primary">
                <MapPin className="h-3.5 w-3.5" /> Shipping addresses
              </Link>
              <Link
                href="/dashboard/payment-methods"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Building2 className="h-3.5 w-3.5" /> Billing & payments
              </Link>
              <Link
                href="/dashboard/account-security"
                className="flex items-center gap-2 hover:text-primary"
              >
                <Lock className="h-3.5 w-3.5" /> Password & 2FA
              </Link>
            </CardContent>
          </Card>
        </div>

        <form id="profile-settings-form" onSubmit={onSave} className="space-y-5">
          {tab === "personal" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-text-primary">Personal information</h2>
                <p className="text-xs font-medium text-text-secondary">
                  This appears on invoices, quotes, and support tickets.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="First name"
                    name="firstName"
                    value={form.firstName}
                    onChange={(e) => setField("firstName", e.target.value)}
                    required
                  />
                  <Input
                    label="Last name"
                    name="lastName"
                    value={form.lastName}
                    onChange={(e) => setField("lastName", e.target.value)}
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    leftIcon={<Mail className="h-4 w-4" />}
                    hint="Used for order updates and login."
                    required
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    leftIcon={<Phone className="h-4 w-4" />}
                    placeholder="+1 (555) 000-0000"
                  />
                  <Input
                    label="Job title"
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={(e) => setField("jobTitle", e.target.value)}
                    placeholder="e.g. Marketing Manager"
                    className="sm:col-span-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "company" && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-text-primary">Company profile</h2>
                <p className="text-xs font-medium text-text-secondary">
                  Helps us tailor print recommendations and volume pricing.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Company name"
                    name="company"
                    value={form.company}
                    onChange={(e) => setField("company", e.target.value)}
                    leftIcon={<Building2 className="h-4 w-4" />}
                    className="sm:col-span-2"
                  />
                  <Input
                    label="Website"
                    name="website"
                    value={form.website}
                    onChange={(e) => setField("website", e.target.value)}
                    placeholder="https://"
                    leftIcon={<Globe className="h-4 w-4" />}
                  />
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-semibold text-text-primary">Industry</label>
                    <select
                      value={form.industry}
                      onChange={(e) => setField("industry", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                    >
                      {[
                        "Marketing & Branding",
                        "Retail",
                        "Food & Beverage",
                        "Education",
                        "Healthcare",
                        "Other",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-semibold text-text-primary">
                      Company size
                    </label>
                    <select
                      value={form.employees}
                      onChange={(e) => setField("employees", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                    >
                      {["1–10", "11–50", "51–200", "201–1000", "1000+"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt} employees
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Street address"
                    name="address"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    className="sm:col-span-2"
                    placeholder="Street, suite, unit"
                  />
                  <Input
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                  <Input
                    label="State / Province"
                    name="state"
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                  />
                  <Input
                    label="ZIP / Postal"
                    name="zip"
                    value={form.zip}
                    onChange={(e) => setField("zip", e.target.value)}
                  />
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-semibold text-text-primary">Country</label>
                    <select
                      value={form.country}
                      onChange={(e) => setField("country", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                    >
                      {["United States", "Canada", "United Kingdom", "Australia", "Other"].map(
                        (opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "preferences" && (
            <>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-bold text-text-primary">Regional settings</h2>
                  <p className="text-xs font-medium text-text-secondary">
                    Controls how dates, currency, and language appear in your dashboard.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-4 pt-0 sm:grid-cols-3">
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-semibold text-text-primary">Timezone</label>
                    <select
                      value={form.timezone}
                      onChange={(e) => setField("timezone", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                    >
                      {[
                        "America/Los_Angeles",
                        "America/Denver",
                        "America/Chicago",
                        "America/New_York",
                        "UTC",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-semibold text-text-primary">Language</label>
                    <select
                      value={form.language}
                      onChange={(e) => setField("language", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                    >
                      {["English", "Spanish", "French"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-semibold text-text-primary">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setField("currency", e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                    >
                      {["USD", "CAD", "GBP", "EUR"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-bold text-text-primary">Communication</h2>
                  <p className="text-xs font-medium text-text-secondary">
                    Choose how Printoe keeps you updated.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <Toggle
                    checked={prefs.orderEmail}
                    onChange={(v) => setPrefs((p) => ({ ...p, orderEmail: v }))}
                    label="Order & production emails"
                    description="Proofs ready, printing started, shipped, and delivery updates."
                  />
                  <Toggle
                    checked={prefs.sms}
                    onChange={(v) => setPrefs((p) => ({ ...p, sms: v }))}
                    label="SMS alerts"
                    description="Critical shipping updates to your phone number."
                  />
                  <Toggle
                    checked={prefs.weeklyDigest}
                    onChange={(v) => setPrefs((p) => ({ ...p, weeklyDigest: v }))}
                    label="Weekly account digest"
                    description="Summary of open orders, quotes, and invoices."
                  />
                  <Toggle
                    checked={prefs.marketing}
                    onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                    label="Offers & product news"
                    description="Occasional promotions and new product announcements."
                  />
                </CardContent>
              </Card>
            </>
          )}

          {tab === "danger" && (
            <Card className="border-danger/20">
              <CardHeader>
                <h2 className="text-lg font-bold text-text-primary">Account controls</h2>
                <p className="text-xs font-medium text-text-secondary">
                  Sensitive actions for your Printoe customer account.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Export account data</p>
                    <p className="text-xs font-medium text-text-secondary">
                      Download orders, invoices, and profile details as CSV/PDF.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast({
                        title: "Export started",
                        description: "We'll email you when the file is ready.",
                        tone: "info",
                      })
                    }
                  >
                    Request export
                  </Button>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-danger/25 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-danger">Delete account</p>
                    <p className="text-xs font-medium text-text-secondary">
                      Permanently remove your profile and cancel open quotes. Orders already in
                      production are not deleted.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="gap-1.5"
                    onClick={() =>
                      toast({
                        title: "Contact support to delete",
                        description: "Account deletion requires identity verification.",
                        tone: "warning",
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <p className="text-xs font-medium text-text-secondary">
              Changes apply to invoices, quotes, and team visibility.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
