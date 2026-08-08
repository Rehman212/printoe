"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import {
  crmApi,
  publicPageUrl,
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
import { RichTextEditor } from "@/components/ui/RichTextEditor";
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

  function openPublicView(page: { slug: string; status: ContentStatus }) {
    if (page.status !== "PUBLISHED") {
      toast({
        title: "Not published yet",
        description: "Set status to Published, save, then View opens the live page.",
        tone: "warning",
      });
      return;
    }
    window.open(publicPageUrl(page.slug), "_blank", "noopener,noreferrer");
  }

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
            Static pages (About, Privacy…) — same WordPress-style editor as Posts.
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
              No pages yet. Add About, Privacy, Terms, etc.
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
                          title="View on site"
                          onClick={() => openPublicView(page)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Edit"
                          onClick={() => openEdit(page)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger"
                          title="Delete"
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
        title={editing ? "Edit page" : "Add new page"}
        description="Dark WordPress-style page editor — content + SEO."
        size="full"
        variant="dark"
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
            {editing ? (
              <Button
                type="button"
                variant="outline"
                className="border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
                onClick={() =>
                  openPublicView({
                    slug: form.slug,
                    status: form.status,
                  })
                }
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="crm-page-form" disabled={saving}>
              {saving
                ? "Saving…"
                : form.status === "PUBLISHED"
                  ? "Publish page"
                  : "Save draft"}
            </Button>
          </div>
        }
      >
        <form
          id="crm-page-form"
          onSubmit={onSubmit}
          className="grid gap-6 lg:grid-cols-[1fr_300px]"
        >
          <div className="min-w-0 space-y-4 rounded-2xl border border-zinc-800 bg-gradient-to-b from-[#1a1d26] to-[#12151c] p-5 shadow-lg">
            <input
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: slugTouched ? f.slug : slugifyProductName(title),
                  seoTitle: f.seoTitle || title,
                }));
              }}
              placeholder="Page title"
              required
              className="w-full border-0 bg-transparent text-3xl font-bold text-zinc-50 outline-none placeholder:text-zinc-600 focus:ring-0"
            />
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <Eye className="h-3.5 w-3.5" />
              URL:{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-primary">
                /pages/{form.slug || "…"}
              </code>
            </p>
            <RichTextEditor
              variant="full"
              value={form.content}
              onChange={(content) => setForm((f) => ({ ...f, content }))}
              placeholder="Write the page content… headings, lists, images, links."
              className="border-zinc-700 bg-[#0f1117] shadow-none"
            />
          </div>

          <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
            <div className="rounded-xl border border-zinc-800 bg-[#1a1d26] p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                Publish
              </h3>
              <div className="mt-3 space-y-1.5">
                <label className="block text-sm font-semibold text-zinc-200">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as ContentStatus,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-zinc-700 bg-[#12151c] px-3 text-sm font-medium text-zinc-100 focus-ring"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#1a1d26] p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                Permalink
              </h3>
              <div className="mt-3">
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
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#1a1d26] p-4">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
                SEO
              </h3>
              <div className="mt-3 space-y-3">
                <Input
                  label="SEO title"
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, seoTitle: e.target.value }))
                  }
                  placeholder="Title tag for Google"
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-zinc-200">
                    Meta description
                  </label>
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        seoDescription: e.target.value,
                      }))
                    }
                    rows={3}
                    maxLength={160}
                    className="w-full rounded-xl border border-zinc-700 bg-[#12151c] px-3 py-2 text-sm text-zinc-100 focus-ring"
                    placeholder="Up to ~160 characters"
                  />
                  <p className="text-[11px] text-zinc-500">
                    {form.seoDescription.length}/160
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </Modal>
    </div>
  );
}
