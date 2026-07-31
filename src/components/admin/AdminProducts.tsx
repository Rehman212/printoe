"use client";

import { FormEvent, useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
  uploadAdminImage,
} from "@/lib/products-api";
import {
  getOptionTemplateForCategory,
  POPULAR_PRODUCT_SECTIONS,
  slugifyProductName,
} from "@/lib/option-templates";
import { DEFAULT_PRODUCT_FAQS } from "@/lib/product-faqs";
import { getStorefrontPlacement } from "@/lib/storefront-placement";
import { DynamicIcon } from "@/lib/icons";
import type { ProductDetailPayload, ProductTab } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useToast } from "@/components/ui/Toast";
import { AdminProductOptionsPanel } from "@/components/admin/AdminProductOptionsPanel";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
};

type FormFaq = { question: string; answer: string };

type FormTabField = {
  id: string;
  label: string;
  type: "select" | "text" | "number";
  optionsText: string;
  helpText: string;
};

type FormTab = {
  id: string;
  label: string;
  iconUrl: string;
  price: string;
  fields: FormTabField[];
};

type FormState = {
  name: string;
  slug: string;
  slugLocked: boolean;
  categorySlug: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  seoTitle: string;
  seoDescription: string;
  price: string;
  deliveryDays: string;
  badge: string;
  status: "published" | "draft";
  featured: boolean;
  active: boolean;
  imageUrl: string;
  previewDataUrl: string | null;
  faqs: FormFaq[];
  tabs: FormTab[];
};

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function emptyField(): FormTabField {
  return {
    id: newId("field"),
    label: "",
    type: "select",
    optionsText: "",
    helpText: "",
  };
}

function emptyTab(): FormTab {
  return {
    id: newId("tab"),
    label: "",
    iconUrl: "",
    price: "",
    fields: [emptyField()],
  };
}

function tabsFromProduct(tabs?: ProductTab[] | null): FormTab[] {
  if (!tabs?.length) return [];
  return tabs.map((tab) => ({
    id: tab.id || newId("tab"),
    label: tab.label ?? "",
    iconUrl: tab.iconUrl ?? "",
    price:
      typeof tab.price === "number" && Number.isFinite(tab.price)
        ? String(tab.price)
        : "",
    fields: tab.fields?.length
      ? tab.fields.map((f) => ({
          id: f.id || newId("field"),
          label: f.label ?? "",
          type: f.type ?? "select",
          optionsText: (f.options ?? []).join("\n"),
          helpText: f.helpText ?? "",
        }))
      : [emptyField()],
  }));
}

function tabsToPayload(tabs: FormTab[]): ProductTab[] {
  return tabs
    .map((tab) => {
      const priceNum = Number(tab.price);
      return {
        id: tab.id,
        label: (tab.label ?? "").trim(),
        iconUrl: (tab.iconUrl ?? "").trim() || undefined,
        price:
          tab.price.trim() !== "" && Number.isFinite(priceNum) && priceNum >= 0
            ? priceNum
            : undefined,
        fields: (tab.fields ?? [])
          .map((f) => ({
            id: f.id,
            label: (f.label ?? "").trim(),
            type: f.type ?? "select",
            options:
              (f.type ?? "select") === "select"
                ? (f.optionsText ?? "")
                    .split("\n")
                    .map((o) => o.trim())
                    .filter(Boolean)
                : undefined,
            helpText: (f.helpText ?? "").trim() || undefined,
          }))
          .filter((f) => f.label),
      };
    })
    .filter((tab) => tab.label);
}

const emptyForm = (cats: ApiCategory[] = []): FormState => ({
  name: "",
  slug: "",
  slugLocked: false,
  categorySlug: cats[0]?.slug ?? "stickers",
  categoryId: cats[0]?.id ?? "",
  description: "",
  shortDescription: "",
  seoTitle: "",
  seoDescription: "",
  price: "",
  deliveryDays: "3",
  badge: "",
  status: "published",
  featured: false,
  active: true,
  imageUrl: "",
  previewDataUrl: null,
  faqs: DEFAULT_PRODUCT_FAQS.map((f) => ({
    question: f.question,
    answer: f.answer,
  })),
  tabs: [],
});

export function AdminProducts() {
  const { toast } = useToast();
  const fileId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDetailPayload | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductDetailPayload[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [optionsRefreshKey, setOptionsRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, catsRes] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminCategories(),
      ]);
      setItems(productsRes.data);
      setApiCategories(catsRes.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load products from API / database.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryOptions = useMemo(() => {
    // Popular Products sidebar order; merge API ids
    return POPULAR_PRODUCT_SECTIONS.map((section) => {
      const api = apiCategories.find((c) => c.slug === section.slug);
      return {
        id: api?.id ?? section.slug,
        slug: section.slug,
        name: section.name,
        icon: section.icon,
        inDb: Boolean(api),
      };
    }).filter((c) => c.inDb || apiCategories.length === 0);
  }, [apiCategories]);

  const optionPreview = useMemo(
    () => getOptionTemplateForCategory(form.categorySlug),
    [form.categorySlug],
  );

  const placement = useMemo(
    () => getStorefrontPlacement(form.categorySlug),
    [form.categorySlug],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(({ product }) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.category.slug.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(apiCategories));
    setOpen(true);
  }

  function openEdit(row: ProductDetailPayload) {
    setEditing(row);
    const loadedFaqs =
      row.product.faqs
        ?.filter((f) => (f?.question ?? "").trim() || (f?.answer ?? "").trim())
        .map((f) => ({
          question: f.question ?? "",
          answer: f.answer ?? "",
        })) ?? [];
    setForm({
      name: row.product.name,
      slug: row.product.slug,
      slugLocked: true,
      categorySlug: row.product.category.slug,
      categoryId: row.product.category.id,
      description: row.product.description,
      shortDescription: row.product.shortDescription ?? "",
      seoTitle: row.product.seoTitle ?? "",
      seoDescription: row.product.seoDescription ?? "",
      price: String(row.product.basePrice),
      deliveryDays: String(row.product.deliveryDays),
      badge: row.product.badge ?? "",
      status: row.product.active !== false ? "published" : "draft",
      featured: Boolean(row.product.featured),
      active: row.product.active !== false,
      imageUrl: row.product.imageUrl ?? "",
      previewDataUrl: row.product.imageUrl ?? null,
      faqs: loadedFaqs.length
        ? loadedFaqs
        : DEFAULT_PRODUCT_FAQS.map((f) => ({
            question: f.question,
            answer: f.answer,
          })),
      tabs: tabsFromProduct(row.product.productTabs),
    });
    setOpen(true);
  }

  function onCategoryChange(slug: string) {
    const cat = apiCategories.find((c) => c.slug === slug);
    setForm((f) => ({
      ...f,
      categorySlug: slug,
      categoryId: cat?.id ?? "",
    }));
  }

  async function onPickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image (PNG, JPG, WebP).",
        tone: "warning",
      });
      return;
    }

    // Local preview immediately
    const localPreview = URL.createObjectURL(file);
    setForm((f) => ({
      ...f,
      previewDataUrl: localPreview,
    }));

    setUploading(true);
    try {
      const res = await uploadAdminImage(file);
      const url = res.data.url;
      setForm((f) => ({
        ...f,
        imageUrl: url,
        previewDataUrl: url,
      }));

      // If editing an existing product, persist image to DB immediately
      if (editing?.product?.id) {
        await updateAdminProduct(editing.product.id, {
          imageUrl: url,
          galleryUrls: [url],
        });
        await load();
        toast({
          title: "Image saved",
          description: "Uploaded to public/uploads and stored on this product.",
          tone: "success",
        });
      } else {
        toast({
          title: "Image uploaded",
          description: "Saved to uploads — click Save to attach to the new product.",
          tone: "success",
        });
      }
    } catch (err) {
      setForm((f) => ({
        ...f,
        previewDataUrl: f.imageUrl || null,
      }));
      toast({
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Could not upload image.",
        tone: "danger",
      });
    } finally {
      setUploading(false);
    }
  }

  function buildOptionsPayload() {
    const templates = getOptionTemplateForCategory(form.categorySlug);
    return templates.map((g, i) => ({
      key: g.key,
      label: g.label,
      uiType: g.uiType,
      helpText: g.helpText,
      sortOrder: i,
      values: g.values.map((v) => ({
        label: v.label,
        value: v.value,
        priceMod: v.priceMod ?? 1,
        meta: v.meta,
      })),
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast({
        title: "Missing fields",
        description: "Name and price are required.",
        tone: "warning",
      });
      return;
    }
    const slug =
      slugifyProductName(form.slug || form.name) ||
      `product-${Date.now().toString(36).slice(-4)}`;
    if (!slug) {
      toast({
        title: "Slug required",
        description: "Enter a valid URL slug (letters, numbers, hyphens).",
        tone: "warning",
      });
      return;
    }
    if (!form.categoryId) {
      toast({
        title: "Category required",
        description: "Select a DB category (backend must be running).",
        tone: "warning",
      });
      return;
    }

    setSaving(true);
    // Persist public/uploaded URL; never send data: previews
    const imageUrl =
      form.imageUrl && !form.imageUrl.startsWith("data:")
        ? form.imageUrl.trim()
        : "";

    if (form.previewDataUrl?.startsWith("blob:") && !imageUrl) {
      setSaving(false);
      toast({
        title: "Image not uploaded",
        description: "Wait for upload to finish, or paste a public image URL.",
        tone: "warning",
      });
      return;
    }

    try {
      const faqs = form.faqs
        .map((f) => ({
          question: (f.question ?? "").trim(),
          answer: (f.answer ?? "").trim(),
        }))
        .filter((f) => f.question && f.answer);
      const productTabs = tabsToPayload(form.tabs ?? []);
      const isPublished = form.status === "published";

      if (editing) {
        await updateAdminProduct(editing.product.id, {
          name: form.name.trim(),
          slug,
          description:
            form.description.trim() || "Custom print product.",
          shortDescription: form.shortDescription.trim() || undefined,
          seoTitle: form.seoTitle.trim() || undefined,
          seoDescription: form.seoDescription.trim() || undefined,
          basePrice: Number(form.price),
          categoryId: form.categoryId,
          deliveryDays: Number(form.deliveryDays) || 3,
          badge: form.badge.trim() || undefined,
          featured: form.featured,
          active: isPublished,
          imageUrl,
          galleryUrls: imageUrl ? [imageUrl] : [],
          faqs,
          productTabs,
          options: buildOptionsPayload(),
        });
        toast({
          title: "Saved to database",
          description: form.name,
          tone: "success",
        });
      } else {
        const res = await createAdminProduct({
          name: form.name.trim(),
          slug,
          description:
            form.description.trim() ||
            "Custom print product with flexible options.",
          shortDescription: form.shortDescription.trim() || undefined,
          seoTitle: form.seoTitle.trim() || undefined,
          seoDescription: form.seoDescription.trim() || undefined,
          basePrice: Number(form.price),
          categoryId: form.categoryId,
          deliveryDays: Number(form.deliveryDays) || 3,
          badge: form.badge.trim() || undefined,
          imageUrl: imageUrl || undefined,
          galleryUrls: imageUrl ? [imageUrl] : undefined,
          faqs,
          productTabs,
          featured: form.featured,
          active: isPublished,
          options: buildOptionsPayload(),
        });
        toast({
          title: "Stored in database",
          description: `${form.name} → /products/${res.data.product.slug}`,
          tone: "success",
        });
      }

      setOptionsRefreshKey((k) => k + 1);
      setOpen(false);
      setEditing(null);
      setForm(emptyForm(apiCategories));
      await load();
    } catch (err) {
      toast({
        title: "Database save failed",
        description:
          err instanceof Error ? err.message : "Could not save product.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: ProductDetailPayload) {
    if (
      !window.confirm(
        `Delete “${row.product.name}” from the database? This cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await deleteAdminProduct(row.product.id);
      toast({
        title: "Deleted from database",
        description: row.product.name,
        tone: "info",
      });
      setOptionsRefreshKey((k) => k + 1);
      await load();
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err instanceof Error ? err.message : "Could not delete product.",
        tone: "danger",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            {loading
              ? "Loading from PostgreSQL…"
              : `${items.length} product${items.length === 1 ? "" : "s"} in database · Edit / Delete below`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Upload product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-secondary">
                All products (database)
              </h2>
              <p className="mt-0.5 text-xs text-text-secondary">
                Search, edit price/image, or delete. Changes save to PostgreSQL.
              </p>
            </div>
            <div className="relative max-w-md flex-1 sm:min-w-[240px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search database products…"
                className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium focus-ring"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-border/50"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-text-secondary">
              <p className="font-semibold text-secondary">API / DB error</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-xs">
                Start backend on :4000 and sign in at{" "}
                <Link
                  href="/admin/login"
                  className="font-semibold text-primary hover:underline"
                >
                  /admin/login
                </Link>
                .
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-y border-border bg-secondary/[0.02] text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Options</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const p = row.product;
                  const img = p.imageUrl || p.galleryUrls?.[0];
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#eceef2]">
                            {img ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-text-secondary">
                                DB
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">
                              {p.name}
                            </p>
                            <Link
                              href={`/products/${p.slug}`}
                              className="text-xs text-primary hover:underline"
                            >
                              /products/{p.slug}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 capitalize text-text-secondary">
                        {p.category.name}
                      </td>
                      <td className="px-6 py-3 font-semibold">
                        {formatCurrency(p.basePrice)}
                      </td>
                      <td className="px-6 py-3 text-text-secondary">
                        {row.options.length} fields
                      </td>
                      <td className="px-6 py-3">
                        {p.active === false ? (
                          <Badge variant="outline">Inactive</Badge>
                        ) : p.featured ? (
                          <Badge variant="primary">Featured</Badge>
                        ) : (
                          <Badge>Live</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(row)}
                            className="gap-1.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => void onDelete(row)}
                            className="gap-1.5 text-danger hover:text-danger"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-semibold text-primary hover:underline"
                          >
                            View
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && !error && filtered.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-text-secondary">
              No products in the database yet. Upload one to store it in
              PostgreSQL.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <AdminProductOptionsPanel refreshKey={optionsRefreshKey} />

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit product (DB)" : "Upload product (DB)"}
        description="Saved to PostgreSQL with category option templates for the storefront."
        size="full"
        bodyClassName="bg-[#f7f8fa] p-4 sm:p-5"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Feature on homepage
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="admin-product-form"
                disabled={saving || uploading}
              >
                {saving
                  ? "Saving to DB…"
                  : uploading
                    ? "Uploading image…"
                    : editing
                      ? "Update in database"
                      : "Save to database"}
              </Button>
            </div>
          </div>
        }
      >
        <form
          id="admin-product-form"
          onSubmit={onSubmit}
          className="grid gap-5 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]"
        >
          {/* Live storefront preview */}
          <aside className="lg:sticky lg:top-0 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="relative aspect-square bg-[#f3f4f6]">
                {form.previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.previewDataUrl}
                    alt="Preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-text-secondary">
                    <ImagePlus className="h-10 w-10 opacity-50" />
                    <span className="text-xs font-semibold">No image yet</span>
                  </div>
                )}
                {form.badge ? (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-soft">
                    {form.badge}
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  {categoryOptions.find((c) => c.slug === form.categorySlug)?.name ??
                    "Category"}
                </p>
                <h4 className="text-base font-bold leading-snug text-secondary">
                  {form.name.trim() || "Product name"}
                </h4>
                <p className="line-clamp-2 text-xs text-text-secondary">
                  {form.shortDescription.trim() ||
                    form.description
                      .replace(/<[^>]+>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim() ||
                    "Short description will appear on the storefront."}
                </p>
                <div className="flex items-baseline justify-between gap-2 pt-1">
                  <span className="text-lg font-extrabold text-secondary">
                    {form.price
                      ? `From ${formatCurrency(Number(form.price) || 0)}`
                      : "From $—"}
                  </span>
                  <span className="text-[11px] font-medium text-text-secondary">
                    {form.deliveryDays || "3"}-day delivery
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.featured ? (
                    <Badge variant="primary">Homepage featured</Badge>
                  ) : null}
                  <Badge
                    variant={form.status === "published" ? "success" : "outline"}
                  >
                    {form.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>
            </div>
          </aside>

          {/* Form panels */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
              <h4 className="text-sm font-bold text-secondary">Product image</h4>
              <p className="mt-1 text-xs text-text-secondary">
                Drop a file into{" "}
                <code className="rounded bg-[#f5f6f8] px-1">public/uploads</code>{" "}
                or paste a public URL.
              </p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-stretch">
                <label
                  htmlFor={fileId}
                  className={cn(
                    "relative flex min-h-[140px] flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-[#f5f6f8] px-4 py-6 text-center transition hover:border-primary/50 hover:bg-primary/5",
                    uploading && "pointer-events-none opacity-70",
                  )}
                >
                  <ImagePlus className="h-8 w-8 text-primary" />
                  <span className="text-sm font-bold text-secondary">
                    {uploading ? "Uploading…" : "Upload image"}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    PNG, JPG, WebP · recommended square
                  </span>
                </label>
                <input
                  id={fileId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading || saving}
                  onChange={(e) => {
                    void onPickImage(e.target.files?.[0] ?? null);
                    e.target.value = "";
                  }}
                />
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                  <Input
                    label="Image URL (stored in DB)"
                    value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        imageUrl: e.target.value,
                        previewDataUrl: e.target.value || f.previewDataUrl,
                      }))
                    }
                    placeholder="https://… or pick a file to upload"
                  />
                  {form.previewDataUrl ? (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          imageUrl: "",
                          previewDataUrl: null,
                        }))
                      }
                      className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-danger"
                    >
                      <X className="h-3.5 w-3.5" /> Remove image
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
              <h4 className="text-sm font-bold text-secondary">
                Product information
              </h4>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Product name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: f.slugLocked
                          ? f.slug
                          : slugifyProductName(name),
                      }));
                    }}
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Input
                    label="URL slug (custom URL)"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        slug: slugifyProductName(e.target.value) || e.target.value,
                        slugLocked: true,
                      }))
                    }
                    placeholder="custom-product-boxes"
                    required
                  />
                  <p className="text-xs text-text-secondary">
                    Storefront URL:{" "}
                    <span className="font-semibold text-secondary">
                      /products/{form.slug || "…"}
                    </span>
                  </p>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-sm font-semibold text-text-primary">
                      SEO title
                    </label>
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        form.seoTitle.length >= 60
                          ? "text-danger"
                          : "text-text-secondary",
                      )}
                    >
                      {form.seoTitle.length}/60
                    </span>
                  </div>
                  <input
                    value={form.seoTitle}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        seoTitle: e.target.value.slice(0, 60),
                      }))
                    }
                    maxLength={60}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                    placeholder={form.name.trim() || "Browser tab / Google title"}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-sm font-semibold text-text-primary">
                      Meta description
                    </label>
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        form.seoDescription.length >= 150
                          ? "text-danger"
                          : "text-text-secondary",
                      )}
                    >
                      {form.seoDescription.length}/150
                    </span>
                  </div>
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        seoDescription: e.target.value.slice(0, 150),
                      }))
                    }
                    maxLength={150}
                    rows={2}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                    placeholder="Short SEO blurb for search results…"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-text-primary">
                    Popular Products section
                  </label>
                  <p className="text-xs text-text-secondary">
                    Same list as homepage sidebar — pick where this product goes.
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {categoryOptions.map((c) => {
                      const active = form.categorySlug === c.slug;
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => onCategoryChange(c.slug)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition focus-ring",
                            active
                              ? "border-primary bg-primary/5 text-primary shadow-soft"
                              : "border-border bg-card text-secondary hover:border-primary/40 hover:bg-[#e8f4fc]",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              active ? "bg-primary/10" : "bg-[#f3f4f6]",
                            )}
                          >
                            <DynamicIcon name={c.icon} className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-semibold leading-tight">
                            {c.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Starting from ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  required
                  hint="Shown on storefront as “From $…”"
                />
                <Input
                  label="Delivery days"
                  type="number"
                  min="1"
                  value={form.deliveryDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deliveryDays: e.target.value }))
                  }
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-text-primary">
                    Publish status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as "published" | "draft",
                        active: e.target.value === "published",
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium text-text-primary shadow-soft focus-ring focus:border-primary/50"
                  >
                    <option value="published">Published (live in store)</option>
                    <option value="draft">Draft (hidden from store)</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <Input
                    label="Badge (optional)"
                    value={form.badge}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, badge: e.target.value }))
                    }
                    placeholder="Best Seller"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-sm font-semibold text-text-primary">
                      Product short description
                    </label>
                    <span
                      className={cn(
                        "text-[11px] font-semibold",
                        form.shortDescription.length >= 200
                          ? "text-danger"
                          : "text-text-secondary",
                      )}
                    >
                      {form.shortDescription.length}/200
                    </span>
                  </div>
                  <textarea
                    value={form.shortDescription}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        shortDescription: e.target.value.slice(0, 200),
                      }))
                    }
                    maxLength={200}
                    rows={2}
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                    placeholder="One or two lines under the product title…"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-sm font-semibold text-text-primary">
                    Full description
                  </label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(html) =>
                      setForm((f) => ({ ...f, description: html }))
                    }
                    placeholder="Write headings, bold text, lists, links…"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-secondary">
                    Custom FAQs
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary">
                    Same FAQs as the storefront FAQs tab. Edit or add your own —
                    empty rows are ignored on save.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      faqs: [...f.faqs, { question: "", answer: "" }],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add FAQ
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {form.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-[#f7f8fa] p-3 sm:p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-text-secondary">
                        FAQ {index + 1}
                      </span>
                      {form.faqs.length > 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              faqs: f.faqs.filter((_, i) => i !== index),
                            }))
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Question"
                        value={faq.question}
                        onChange={(e) =>
                          setForm((f) => {
                            const faqs = [...f.faqs];
                            faqs[index] = {
                              ...faqs[index]!,
                              question: e.target.value,
                            };
                            return { ...f, faqs };
                          })
                        }
                        placeholder="What file formats do you accept?"
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-text-primary">
                          Answer
                        </label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) =>
                            setForm((f) => {
                              const faqs = [...f.faqs];
                              faqs[index] = {
                                ...faqs[index]!,
                                answer: e.target.value,
                              };
                              return { ...f, faqs };
                            })
                          }
                          rows={2}
                          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                          placeholder="PDF, AI, EPS, and high-res PNG/JPG…"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-secondary">
                    Product tabs
                  </h4>
                  <p className="mt-1 text-xs text-text-secondary">
                    Optional UPrinting-style tabs under the product title. Each
                    tab has its own label and custom fields.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      tabs: [...f.tabs, emptyTab()],
                    }))
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Tab
                </Button>
              </div>

              {form.tabs.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-border bg-[#f7f8fa] px-4 py-6 text-center text-xs text-text-secondary">
                  No tabs yet. Click <strong>Add Tab</strong> if this product
                  needs Mailer / Product / Shipping style switchers.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {form.tabs.map((tab, tabIndex) => (
                    <div
                      key={tab.id}
                      className="rounded-xl border border-border bg-[#f7f8fa] p-3 sm:p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-text-secondary">
                          Tab {tabIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              tabs: f.tabs.filter((_, i) => i !== tabIndex),
                            }))
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove tab
                        </button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          label="Tab label"
                          value={tab.label}
                          onChange={(e) =>
                            setForm((f) => {
                              const tabs = [...f.tabs];
                              tabs[tabIndex] = {
                                ...tabs[tabIndex]!,
                                label: e.target.value,
                              };
                              return { ...f, tabs };
                            })
                          }
                          placeholder="Product Boxes"
                        />
                        <Input
                          label="Tab price ($)"
                          type="number"
                          min={0}
                          step="0.01"
                          value={tab.price}
                          onChange={(e) =>
                            setForm((f) => {
                              const tabs = [...f.tabs];
                              tabs[tabIndex] = {
                                ...tabs[tabIndex]!,
                                price: e.target.value,
                              };
                              return { ...f, tabs };
                            })
                          }
                          placeholder="e.g. 29.99"
                        />
                        <div className="sm:col-span-2">
                          <Input
                            label="Icon URL (optional)"
                            value={tab.iconUrl}
                            onChange={(e) =>
                              setForm((f) => {
                                const tabs = [...f.tabs];
                                tabs[tabIndex] = {
                                  ...tabs[tabIndex]!,
                                  iconUrl: e.target.value,
                                };
                                return { ...f, tabs };
                              })
                            }
                            placeholder="https://… or /uploads/…"
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] text-text-secondary">
                        Tab price shows on the storefront when this tab is
                        selected. Dropdown options can add extra with{" "}
                        <code className="rounded bg-white px-1">Label | 5</code>{" "}
                        (adds $5).
                      </p>

                      <div className="mt-4 space-y-3 border-t border-border pt-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-bold text-secondary">
                            Custom fields for this tab
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setForm((f) => {
                                const tabs = [...f.tabs];
                                const current = tabs[tabIndex]!;
                                tabs[tabIndex] = {
                                  ...current,
                                  fields: [...current.fields, emptyField()],
                                };
                                return { ...f, tabs };
                              })
                            }
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add field
                          </Button>
                        </div>
                        {tab.fields.map((field, fieldIndex) => (
                          <div
                            key={field.id}
                            className="rounded-lg border border-border bg-card p-3"
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-[11px] font-semibold text-text-secondary">
                                Field {fieldIndex + 1}
                              </span>
                              {tab.fields.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setForm((f) => {
                                      const tabs = [...f.tabs];
                                      const current = tabs[tabIndex]!;
                                      tabs[tabIndex] = {
                                        ...current,
                                        fields: current.fields.filter(
                                          (_, i) => i !== fieldIndex,
                                        ),
                                      };
                                      return { ...f, tabs };
                                    })
                                  }
                                  className="text-[11px] font-semibold text-danger"
                                >
                                  Remove
                                </button>
                              ) : null}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <Input
                                label="Field label"
                                value={field.label}
                                onChange={(e) =>
                                  setForm((f) => {
                                    const tabs = [...f.tabs];
                                    const current = tabs[tabIndex]!;
                                    const fields = [...current.fields];
                                    fields[fieldIndex] = {
                                      ...fields[fieldIndex]!,
                                      label: e.target.value,
                                    };
                                    tabs[tabIndex] = { ...current, fields };
                                    return { ...f, tabs };
                                  })
                                }
                                placeholder="Box size"
                              />
                              <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-text-primary">
                                  Field type
                                </label>
                                <select
                                  value={field.type}
                                  onChange={(e) =>
                                    setForm((f) => {
                                      const tabs = [...f.tabs];
                                      const current = tabs[tabIndex]!;
                                      const fields = [...current.fields];
                                      fields[fieldIndex] = {
                                        ...fields[fieldIndex]!,
                                        type: e.target.value as FormTabField["type"],
                                      };
                                      tabs[tabIndex] = { ...current, fields };
                                      return { ...f, tabs };
                                    })
                                  }
                                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                                >
                                  <option value="select">Dropdown</option>
                                  <option value="text">Text</option>
                                  <option value="number">Number</option>
                                </select>
                              </div>
                            </div>
                            {field.type === "select" ? (
                              <div className="mt-2 space-y-1.5">
                                <label className="block text-sm font-semibold text-text-primary">
                                  Options (one per line)
                                </label>
                                <textarea
                                  value={field.optionsText}
                                  onChange={(e) =>
                                    setForm((f) => {
                                      const tabs = [...f.tabs];
                                      const current = tabs[tabIndex]!;
                                      const fields = [...current.fields];
                                      fields[fieldIndex] = {
                                        ...fields[fieldIndex]!,
                                        optionsText: e.target.value,
                                      };
                                      tabs[tabIndex] = { ...current, fields };
                                      return { ...f, tabs };
                                    })
                                  }
                                  rows={3}
                                  className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                                  placeholder={"Small\nMedium | 5\nLarge | 12"}
                                />
                                <p className="text-[11px] text-text-secondary">
                                  Optional price addon:{" "}
                                  <code className="rounded bg-[#f7f8fa] px-1">
                                    Large | 12
                                  </code>
                                </p>
                              </div>
                            ) : null}
                            <div className="mt-2">
                              <Input
                                label="Help text (optional)"
                                value={field.helpText}
                                onChange={(e) =>
                                  setForm((f) => {
                                    const tabs = [...f.tabs];
                                    const current = tabs[tabIndex]!;
                                    const fields = [...current.fields];
                                    fields[fieldIndex] = {
                                      ...fields[fieldIndex]!,
                                      helpText: e.target.value,
                                    };
                                    tabs[tabIndex] = { ...current, fields };
                                    return { ...f, tabs };
                                  })
                                }
                                placeholder="Shown under the field"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 sm:p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-secondary">
                <MapPin className="h-4 w-4 text-accent" />
                Yeh product yahan show hoga
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                <li>
                  <span className="font-semibold text-secondary">
                    Popular Products →
                  </span>{" "}
                  {placement.popularName} (sidebar flyout)
                </li>
                <li>
                  <span className="font-semibold text-secondary">Top nav →</span>{" "}
                  {placement.navLabel}
                </li>
                <li>
                  <span className="font-semibold text-secondary">
                    Catalog page →
                  </span>{" "}
                  <Link
                    href={placement.catalogPath}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    {placement.catalogLabel}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </li>
                <li>
                  <span className="font-semibold text-secondary">
                    Featured Products →
                  </span>{" "}
                  {form.featured
                    ? "Haan — homepage Featured section"
                    : "Nahi (footer mein “Feature on homepage” check karo)"}
                </li>
                <li className="sm:col-span-2">
                  <span className="font-semibold text-secondary">
                    Top Sellers →
                  </span>{" "}
                  Homepage Top Sellers grid (DB products)
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
              <p className="text-sm font-bold text-secondary">
                Storefront fields → DB option groups (
                {categoryOptions.find((c) => c.slug === form.categorySlug)?.name ??
                  form.categorySlug}
                )
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                These are saved on the product in Postgres and shown on{" "}
                <code className="rounded bg-white px-1">/products/…</code>.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {optionPreview.map((g) => (
                  <li
                    key={g.key}
                    className="rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <p className="text-xs font-bold text-secondary">
                      {g.label}{" "}
                      <span className="font-medium text-text-secondary">
                        ({g.uiType})
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                      {g.values.map((v) => v.label).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
