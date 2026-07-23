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
} from "@/lib/products-api";
import {
  getOptionTemplateForCategory,
  POPULAR_PRODUCT_SECTIONS,
  slugifyProductName,
} from "@/lib/option-templates";
import { getStorefrontPlacement } from "@/lib/storefront-placement";
import { DynamicIcon } from "@/lib/icons";
import type { ProductDetailPayload } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { AdminProductOptionsPanel } from "@/components/admin/AdminProductOptionsPanel";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
};

type FormState = {
  name: string;
  categorySlug: string;
  categoryId: string;
  description: string;
  price: string;
  deliveryDays: string;
  badge: string;
  featured: boolean;
  active: boolean;
  imageUrl: string;
  previewDataUrl: string | null;
};

const emptyForm = (cats: ApiCategory[] = []): FormState => ({
  name: "",
  categorySlug: cats[0]?.slug ?? "stickers",
  categoryId: cats[0]?.id ?? "",
  description: "",
  price: "",
  deliveryDays: "3",
  badge: "",
  featured: false,
  active: true,
  imageUrl: "",
  previewDataUrl: null,
});

export function AdminProducts() {
  const { toast } = useToast();
  const fileId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDetailPayload | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
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
    setForm({
      name: row.product.name,
      categorySlug: row.product.category.slug,
      categoryId: row.product.category.id,
      description: row.product.description,
      price: String(row.product.basePrice),
      deliveryDays: String(row.product.deliveryDays),
      badge: row.product.badge ?? "",
      featured: Boolean(row.product.featured),
      active: row.product.active !== false,
      imageUrl: row.product.imageUrl ?? "",
      previewDataUrl: row.product.imageUrl ?? null,
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

  function onPickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please choose an image (PNG, JPG, WebP).",
        tone: "warning",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setForm((f) => ({
        ...f,
        previewDataUrl: dataUrl,
        imageUrl: dataUrl,
      }));
    };
    reader.readAsDataURL(file);
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
    if (!form.categoryId) {
      toast({
        title: "Category required",
        description: "Select a DB category (backend must be running).",
        tone: "warning",
      });
      return;
    }

    setSaving(true);
    const imageUrl = form.imageUrl.startsWith("data:")
      ? undefined
      : form.imageUrl || undefined;

    try {
      if (editing) {
        await updateAdminProduct(editing.product.id, {
          name: form.name.trim(),
          description:
            form.description.trim() || "Custom print product.",
          basePrice: Number(form.price),
          categoryId: form.categoryId,
          deliveryDays: Number(form.deliveryDays) || 3,
          badge: form.badge.trim() || undefined,
          featured: form.featured,
          active: form.active,
          imageUrl,
          options: buildOptionsPayload(),
        });
        toast({
          title: "Saved to database",
          description: form.name,
          tone: "success",
        });
      } else {
        const slugBase = slugifyProductName(form.name) || "product";
        const slug = `${slugBase}-${Date.now().toString(36).slice(-4)}`;
        const res = await createAdminProduct({
          name: form.name.trim(),
          slug,
          description:
            form.description.trim() ||
            "Custom print product with flexible options.",
          basePrice: Number(form.price),
          categoryId: form.categoryId,
          deliveryDays: Number(form.deliveryDays) || 3,
          badge: form.badge.trim() || undefined,
          imageUrl,
          featured: form.featured,
          active: form.active,
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
        size="lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Product name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="sm:col-span-2"
            />

            <div className="sm:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-text-primary">
                Popular Products section (pick where it goes)
              </label>
              <p className="text-xs text-text-secondary">
                Same list as homepage sidebar — click any section to add this
                product there.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
              label="Base price ($)"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
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

            <div className="sm:col-span-2 rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-secondary">
                <MapPin className="h-4 w-4 text-accent" />
                Yeh product yahan show hoga
              </p>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
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
                    : "Nahi (neeche “Feature on homepage” check karo)"}
                </li>
                <li>
                  <span className="font-semibold text-secondary">
                    Top Sellers →
                  </span>{" "}
                  Homepage Top Sellers grid (DB products)
                </li>
              </ul>
            </div>

            <Input
              label="Badge (optional)"
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              placeholder="Best Seller"
              className="sm:col-span-2"
            />

            <div className="sm:col-span-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-bold text-secondary">
                Storefront fields → DB option groups (
                {categoryOptions.find((c) => c.slug === form.categorySlug)
                  ?.name ?? form.categorySlug}
                )
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                These are saved on the product in Postgres and shown on{" "}
                <code className="rounded bg-white px-1">/products/…</code>.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
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

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-sm font-semibold text-text-primary">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium focus-ring"
                placeholder="Short product description for the storefront…"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">
              Product image URL
            </p>
            <div className="flex flex-wrap items-start gap-4">
              <label
                htmlFor={fileId}
                className={cn(
                  "flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-[#f5f6f8] transition hover:border-primary/50",
                )}
              >
                {form.previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.previewDataUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="h-7 w-7 text-text-secondary" />
                    <span className="mt-1 text-[11px] font-semibold text-text-secondary">
                      Preview
                    </span>
                  </>
                )}
              </label>
              <input
                id={fileId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onPickImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              <div className="min-w-0 flex-1 space-y-2">
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
                  placeholder="https://…"
                />
                <p className="text-[11px] text-text-secondary">
                  Local file preview is not uploaded yet — paste a public URL to
                  persist.
                </p>
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
                    className="inline-flex items-center gap-1 text-xs font-semibold text-danger"
                  >
                    <X className="h-3.5 w-3.5" /> Remove image
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
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
            <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Active (visible in store)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving to DB…"
                : editing
                  ? "Update in database"
                  : "Save to database"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
