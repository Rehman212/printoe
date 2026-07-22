"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  crmApi,
  type ContentStatus,
  type CrmPage,
} from "@/lib/crm-api";
import { slugifyProductName } from "@/lib/option-templates";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

type FormState = {
  title: string;
  slug: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: ContentStatus;
};

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  status: "DRAFT",
});

function StatusBadge({ status }: { status: ContentStatus }) {
  if (status === "PUBLISHED") return <Badge variant="primary">Published</Badge>;
  if (status === "ARCHIVED") return <Badge variant="outline">Archived</Badge>;
  return <Badge>Draft</Badge>;
}

export function AdminCrmPages() {
  const { toast } = useToast();
  const [items, setItems] = useState<CrmPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CrmPage | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmApi.listPages();
      setItems(res.data);
    } catch (err) {
      toast({
        title: "Failed to load pages",
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

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSlugTouched(false);
    setOpen(true);
  }

  function openEdit(page: CrmPage) {
    setEditing(page);
    setForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      seoTitle: page.seoTitle ?? "",
      seoDescription: page.seoDescription ?? "",
      status: page.status,
    });
    setSlugTouched(true);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      toast({
        title: "Missing fields",
        description: "Title, slug, and content are required.",
        tone: "warning",
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        content: form.content.trim(),
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        status: form.status,
      };
      if (editing) {
        await crmApi.updatePage(editing.id, payload);
        toast({ title: "Page updated", tone: "success" });
      } else {
        await crmApi.createPage(payload);
        toast({ title: "Page created", tone: "success" });
      }
      setOpen(false);
      await load();
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

  async function onDelete(page: CrmPage) {
    if (!window.confirm(`Delete page “${page.title}”?`)) return;
    try {
      await crmApi.deletePage(page.id);
      toast({ title: "Page deleted", tone: "info" });
      await load();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Error",
        tone: "danger",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            CRM · Pages
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Static pages — About, Contact, Policies, etc.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add page
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-border/50" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="p-8 text-center text-sm text-text-secondary">
              No pages yet.
            </p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((page) => (
                  <tr key={page.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 font-semibold text-text-primary">
                      {page.title}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">/{page.slug}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={page.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(page)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger"
                          onClick={() => void onDelete(page)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit page" : "Add page"}
        size="lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: slugTouched ? f.slug : slugifyProductName(title),
              }));
            }}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({
                ...f,
                slug: slugifyProductName(e.target.value) || e.target.value,
              }));
            }}
            required
          />
          <Input
            label="SEO title"
            value={form.seoTitle}
            onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
          />
          <Input
            label="SEO description"
            value={form.seoDescription}
            onChange={(e) =>
              setForm((f) => ({ ...f, seoDescription: e.target.value }))
            }
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ContentStatus,
                }))
              }
              className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium focus-ring"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold">Content</label>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              rows={8}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus-ring"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
