"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, RefreshCw, Tags, Trash2 } from "lucide-react";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategory,
} from "@/lib/products-api";
import { slugifyProductName } from "@/lib/option-templates";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

type FormState = {
  name: string;
  slug: string;
  description: string;
};

const emptyForm = (): FormState => ({
  name: "",
  slug: "",
  description: "",
});

export function AdminCategories() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminCategories();
      setItems(res.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load categories from API.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSlugTouched(false);
    setOpen(true);
  }

  function openEdit(cat: AdminCategory) {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
    });
    setSlugTouched(true);
    setOpen(true);
  }

  function onNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugifyProductName(name),
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast({
        title: "Missing fields",
        description: "Name and slug are required.",
        tone: "warning",
      });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateAdminCategory(editing.id, {
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
        });
        toast({
          title: "Category updated",
          description: form.name,
          tone: "success",
        });
      } else {
        await createAdminCategory({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || undefined,
        });
        toast({
          title: "Category created",
          description: `${form.name} → /products?category=${form.slug}`,
          tone: "success",
        });
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyForm());
      await load();
    } catch (err) {
      toast({
        title: "Save failed",
        description:
          err instanceof Error ? err.message : "Could not save category.",
        tone: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(cat: AdminCategory) {
    const count = cat._count?.products ?? 0;
    if (count > 0) {
      toast({
        title: "Cannot delete",
        description: `${count} product(s) still use “${cat.name}”. Move or delete those first.`,
        tone: "warning",
      });
      return;
    }
    if (!window.confirm(`Delete category “${cat.name}” from the database?`)) {
      return;
    }
    try {
      await deleteAdminCategory(cat.id);
      toast({
        title: "Category deleted",
        description: cat.name,
        tone: "info",
      });
      await load();
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err instanceof Error ? err.message : "Could not delete category.",
        tone: "danger",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Categories are stored in PostgreSQL and drive Popular Products +
          catalog filters.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-border/50"
            />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-text-secondary">
            <p className="font-semibold text-secondary">API / DB error</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2 text-xs">
              Sign in at{" "}
              <Link
                href="/admin/login"
                className="font-semibold text-primary hover:underline"
              >
                /admin/login
              </Link>{" "}
              and ensure the backend is running.
            </p>
          </CardContent>
        </Card>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-text-secondary">
            No categories in the database yet. Add one to appear in Popular
            Products.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c) => {
            const count = c._count?.products ?? 0;
            return (
              <Card key={c.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-text-primary">{c.name}</p>
                        <Badge variant="outline">{count} products</Badge>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">
                        {c.description || "No description"}
                      </p>
                      <p className="mt-3 text-xs font-medium text-text-secondary">
                        /{c.slug} ·{" "}
                        <Link
                          href={`/products?category=${c.slug}`}
                          className="text-primary hover:underline"
                        >
                          View catalog
                        </Link>
                      </p>
                    </div>
                    <Tags className="h-5 w-5 shrink-0 text-text-secondary/50" />
                  </div>
                  <div className="mt-4 flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void onDelete(c)}
                      aria-label={`Delete ${c.name}`}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit category" : "Add category"}
        description="Saved to PostgreSQL — shows in Popular Products & product upload."
        size="md"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Category name"
            value={form.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Brochures"
            required
          />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({
                ...f,
                slug: slugifyProductName(e.target.value) || e.target.value,
              }));
            }}
            placeholder="brochures"
            required
          />
          <p className="text-[11px] text-text-secondary">
            Catalog: /products?category={form.slug || "…"}
          </p>
          <div className="space-y-1.5">
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
              placeholder="Short description for admin & SEO…"
            />
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
                ? "Saving…"
                : editing
                  ? "Update category"
                  : "Create category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
