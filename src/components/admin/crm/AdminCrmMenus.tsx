"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { crmApi, type CrmMenu, type CrmMenuItem } from "@/lib/crm-api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

type FormState = {
  name: string;
  location: string;
  active: boolean;
  itemsText: string;
};

const emptyForm = (): FormState => ({
  name: "",
  location: "header",
  active: true,
  itemsText: "Home|/\nProducts|/products\nAbout|/about",
});

function parseItems(text: string): CrmMenuItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [label, href] = line.split("|").map((s) => s.trim());
      return {
        label: label || `Item ${i + 1}`,
        href: href || "/",
        sortOrder: i,
      };
    });
}

function itemsToText(items: CrmMenuItem[]) {
  return items.map((i) => `${i.label}|${i.href}`).join("\n");
}

export function AdminCrmMenus() {
  const { toast } = useToast();
  const [items, setItems] = useState<CrmMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CrmMenu | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

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
    setForm(emptyForm());
    setOpen(true);
  }

  function openEdit(menu: CrmMenu) {
    setEditing(menu);
    setForm({
      name: menu.name,
      location: menu.location,
      active: menu.active,
      itemsText: itemsToText(menu.items),
    });
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location,
        active: form.active,
        items: parseItems(form.itemsText),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            CRM · Menus
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Navigation menus for header, footer, and custom locations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add menu
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-border/50" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-text-secondary">
            No menus yet. Create a header or footer menu.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((menu) => (
            <Card key={menu.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-text-primary">{menu.name}</p>
                      <Badge variant="outline">{menu.location}</Badge>
                      {menu.active ? (
                        <Badge variant="primary">Active</Badge>
                      ) : (
                        <Badge>Inactive</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-text-secondary">
                      {menu.items.length} links ·{" "}
                      {menu.items.map((i) => i.label).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(menu)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => void onDelete(menu)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit menu" : "Add menu"}
        description="One link per line: Label|/path"
        size="md"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Menu name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold">Location</label>
            <select
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium focus-ring"
            >
              <option value="header">Header</option>
              <option value="footer">Footer</option>
              <option value="sidebar">Sidebar</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold">
              Links (Label|/href per line)
            </label>
            <textarea
              value={form.itemsText}
              onChange={(e) =>
                setForm((f) => ({ ...f, itemsText: e.target.value }))
              }
              rows={6}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 font-mono text-sm focus-ring"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
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
