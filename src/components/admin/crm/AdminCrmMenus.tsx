"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Download, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { crmApi, type CrmMenu } from "@/lib/crm-api";
import {
  countTreeLinks,
  flattenMenuTree,
  getFooterMenuBlueprint,
  getHeaderMenuBlueprint,
  type SiteMenuBlueprint,
} from "@/lib/site-menus";
import {
  AdminMenuTreeEditor,
  editableToPlain,
  treeFromBlueprint,
  treeFromFlatItems,
  type EditableMenuNode,
} from "@/components/admin/crm/AdminMenuTreeEditor";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

type EditorState = {
  name: string;
  location: string;
  active: boolean;
  tree: EditableMenuNode[];
};

export function AdminCrmMenus() {
  const { toast } = useToast();
  const [items, setItems] = useState<CrmMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CrmMenu | null>(null);
  const [form, setForm] = useState<EditorState>({
    name: "",
    location: "header",
    active: true,
    tree: [],
  });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const headerBp = useMemo(() => getHeaderMenuBlueprint(), []);
  const footerBp = useMemo(() => getFooterMenuBlueprint(), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmApi.listMenus();
      setItems(res.data);
    } catch (err) {
      toast({
        title: "Failed to load menus",
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
    setForm({ name: "", location: "custom", active: true, tree: [] });
    setOpen(true);
  }

  function openEdit(menu: CrmMenu) {
    setEditing(menu);
    setForm({
      name: menu.name,
      location: menu.location,
      active: menu.active,
      tree: treeFromFlatItems(menu.items),
    });
    setOpen(true);
  }

  function openBlueprint(bp: SiteMenuBlueprint) {
    setEditing(
      items.find((m) => m.location === bp.location && m.name === bp.name) ??
        null,
    );
    setForm({
      name: bp.name,
      location: bp.location,
      active: true,
      tree: treeFromBlueprint(bp.tree),
    });
    setOpen(true);
  }

  async function seedBlueprint(bp: SiteMenuBlueprint) {
    setSeeding(true);
    try {
      const existing = items.find(
        (m) => m.location === bp.location && m.name === bp.name,
      );
      const payload = {
        name: bp.name,
        location: bp.location,
        active: true,
        items: flattenMenuTree(bp.tree),
      };
      if (existing) {
        await crmApi.updateMenu(existing.id, payload);
        toast({ title: `${bp.name} updated`, tone: "success" });
      } else {
        await crmApi.createMenu(payload);
        toast({ title: `${bp.name} saved to DB`, tone: "success" });
      }
      await load();
    } catch (err) {
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Error",
        tone: "danger",
      });
    } finally {
      setSeeding(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Name required", tone: "warning" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location,
        active: form.active,
        items: flattenMenuTree(editableToPlain(form.tree)),
      };
      if (editing) {
        await crmApi.updateMenu(editing.id, payload);
        toast({ title: "Menu updated", tone: "success" });
      } else {
        await crmApi.createMenu(payload);
        toast({ title: "Menu created", tone: "success" });
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

  async function onDelete(menu: CrmMenu) {
    if (!window.confirm(`Delete menu “${menu.name}”?`)) return;
    try {
      await crmApi.deleteMenu(menu.id);
      toast({ title: "Menu deleted", tone: "info" });
      await load();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Error",
        tone: "danger",
      });
    }
  }

  function BlueprintCard({
    bp,
    accent,
  }: {
    bp: SiteMenuBlueprint;
    accent: "pink" | "slate";
  }) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-2xl border shadow-soft",
          accent === "pink"
            ? "border-primary/30 bg-gradient-to-br from-[#1a1220] to-[#12151c]"
            : "border-zinc-700 bg-gradient-to-br from-[#141820] to-[#12151c]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-100">{bp.name}</h2>
              <Badge variant={accent === "pink" ? "primary" : "outline"}>
                {bp.location}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-zinc-400">
              {countTreeLinks(bp.tree)} links · {bp.tree.length} sections
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
              onClick={() => openBlueprint(bp)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Drag & edit
            </Button>
            <Button
              size="sm"
              disabled={seeding}
              onClick={() => void seedBlueprint(bp)}
            >
              <Download className="h-3.5 w-3.5" />
              Save to DB
            </Button>
          </div>
        </div>
        <div className="max-h-[280px] overflow-y-auto p-3">
          <ul className="space-y-1">
            {bp.tree.map((section) => (
              <li
                key={section.label}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2"
              >
                <p className="text-sm font-semibold text-zinc-100">
                  {section.label}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {(section.children?.length ?? 0) > 0
                    ? `${section.children!.length} sub-items`
                    : section.href}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            CRM · Menus
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">
            Drag-and-drop menu builder — same header & footer as the homepage.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Custom menu
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <BlueprintCard bp={headerBp} accent="pink" />
        <BlueprintCard bp={footerBp} accent="slate" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">
          Saved in database
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-border/50"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-text-secondary">
              No menus saved yet. Use <strong>Drag & edit</strong> or{" "}
              <strong>Save to DB</strong>.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((menu) => (
              <Card key={menu.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-text-primary">{menu.name}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {menu.location} · {menu.items.length} items
                      </p>
                    </div>
                    <Badge variant={menu.active ? "success" : "outline"}>
                      {menu.active ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(menu)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => void onDelete(menu)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit menu" : "Menu builder"}
        description="Drag the grip handle to reorder. + adds a submenu under that link."
        size="full"
        variant="dark"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-600 bg-transparent text-zinc-200 hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" form="crm-menu-form" disabled={saving}>
              {saving ? "Saving…" : "Save menu"}
            </Button>
          </div>
        }
      >
        <form id="crm-menu-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
            <Input
              label="Menu name"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-zinc-200">
                Location
              </label>
              <select
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                className="h-12 w-full rounded-2xl border border-zinc-700 bg-[#12151c] px-4 text-sm font-medium text-zinc-100 focus-ring"
              >
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <label className="flex items-end gap-2 pb-3 text-sm font-semibold text-zinc-200">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm((f) => ({ ...f, active: e.target.checked }))
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Active
            </label>
          </div>

          <AdminMenuTreeEditor
            value={form.tree}
            onChange={(tree) => setForm((f) => ({ ...f, tree }))}
          />
        </form>
      </Modal>
    </div>
  );
}
