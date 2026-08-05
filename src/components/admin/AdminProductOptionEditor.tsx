"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { OptionUiType, ProductOptionGroup } from "@/types";
import type { OptionTemplateGroup } from "@/lib/option-templates";
import {
  getOptionTemplateForCategory,
  slugifyProductName,
} from "@/lib/option-templates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type FormOptionValue = {
  id: string;
  label: string;
  value: string;
  priceMod: string;
};

export type FormOptionGroup = {
  id: string;
  key: string;
  keyLocked: boolean;
  label: string;
  uiType: OptionUiType;
  helpText: string;
  values: FormOptionValue[];
};

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function emptyOptionValue(): FormOptionValue {
  return {
    id: newId("oval"),
    label: "",
    value: "",
    priceMod: "1",
  };
}

export function emptyOptionGroup(): FormOptionGroup {
  return {
    id: newId("ogrp"),
    key: "",
    keyLocked: false,
    label: "",
    uiType: "SELECT",
    helpText: "",
    values: [emptyOptionValue(), emptyOptionValue()],
  };
}

function slugKey(raw: string) {
  return (
    slugifyProductName(raw).replace(/-/g, "_").slice(0, 48) ||
    `field_${Math.random().toString(36).slice(2, 7)}`
  );
}

export function optionGroupsFromTemplates(
  templates: OptionTemplateGroup[],
): FormOptionGroup[] {
  return templates.map((g) => ({
    id: newId("ogrp"),
    key: g.key,
    keyLocked: true,
    label: g.label,
    uiType: g.uiType,
    helpText: g.helpText ?? "",
    values: g.values.map((v) => ({
      id: newId("oval"),
      label: v.label,
      value: v.value,
      priceMod: String(v.priceMod ?? 1),
    })),
  }));
}

export function optionGroupsFromCategory(
  categorySlug: string,
): FormOptionGroup[] {
  return optionGroupsFromTemplates(getOptionTemplateForCategory(categorySlug));
}

export function optionGroupsFromApi(
  options: ProductOptionGroup[],
): FormOptionGroup[] {
  if (!options?.length) return [];
  return options.map((g) => ({
    id: g.id || newId("ogrp"),
    key: g.key,
    keyLocked: true,
    label: g.label,
    uiType: g.uiType,
    helpText: g.helpText ?? "",
    values: (g.values ?? []).map((v) => ({
      id: v.id || newId("oval"),
      label: v.label,
      value: v.value,
      priceMod: String(v.priceMod ?? 1),
    })),
  }));
}

export function optionGroupsToPayload(groups: FormOptionGroup[]) {
  const usedKeys = new Set<string>();
  return groups
    .map((g, i) => {
      const label = (g.label ?? "").trim();
      if (!label) return null;
      let key = (g.key || slugKey(label)).trim();
      if (!key) key = `field_${i + 1}`;
      if (usedKeys.has(key)) key = `${key}_${i + 1}`;
      usedKeys.add(key);

      const values = (g.values ?? [])
        .map((v) => {
          const vLabel = (v.label ?? "").trim();
          if (!vLabel) return null;
          const value =
            (v.value ?? "").trim() ||
            slugifyProductName(vLabel) ||
            `opt_${Math.random().toString(36).slice(2, 6)}`;
          const priceMod = Number(v.priceMod);
          return {
            label: vLabel,
            value,
            priceMod: Number.isFinite(priceMod) && priceMod > 0 ? priceMod : 1,
          };
        })
        .filter(Boolean) as Array<{
        label: string;
        value: string;
        priceMod: number;
      }>;

      if (!values.length) return null;

      return {
        key,
        label,
        uiType: g.uiType,
        helpText: (g.helpText ?? "").trim() || undefined,
        sortOrder: i,
        values,
      };
    })
    .filter(Boolean) as Array<{
    key: string;
    label: string;
    uiType: OptionUiType;
    helpText?: string;
    sortOrder: number;
    values: Array<{ label: string; value: string; priceMod: number }>;
  }>;
}

const UI_TYPES: Array<{ value: OptionUiType; label: string }> = [
  { value: "SELECT", label: "Dropdown (single)" },
  { value: "CARDS", label: "Cards (single)" },
  { value: "NUMBER", label: "Number input" },
];

export function AdminProductOptionEditor({
  groups,
  onChange,
  categorySlug,
  categoryName,
}: {
  groups: FormOptionGroup[];
  onChange: (next: FormOptionGroup[]) => void;
  categorySlug: string;
  categoryName?: string;
}) {
  function updateGroup(id: string, patch: Partial<FormOptionGroup>) {
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function updateValue(
    groupId: string,
    valueId: string,
    patch: Partial<FormOptionValue>,
  ) {
    onChange(
      groups.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          values: g.values.map((v) =>
            v.id === valueId ? { ...v, ...patch } : v,
          ),
        };
      }),
    );
  }

  function loadCategoryTemplate() {
    onChange(optionGroupsFromCategory(categorySlug));
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-secondary">
            Storefront options
            {categoryName ? (
              <span className="font-medium text-text-secondary">
                {" "}
                · {categoryName}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            These become Size / Material / Quantity fields on{" "}
            <code className="rounded bg-white px-1">/products/…</code>. Each
            field is single-select (dropdown or cards).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={loadCategoryTemplate}
          >
            Load category template
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onChange([...groups, emptyOptionGroup()])}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add field
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-card px-3 py-8 text-center text-xs text-text-secondary">
          No option fields yet. Click <strong>Add field</strong> or{" "}
          <strong>Load category template</strong>.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {groups.map((g, gi) => (
            <li
              key={g.id}
              className="rounded-xl border border-border bg-card p-3 shadow-soft sm:p-4"
            >
              <div className="flex items-start gap-2">
                <GripVertical className="mt-3 h-4 w-4 shrink-0 text-text-secondary/50" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-text-secondary">
                      Field {gi + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onChange(groups.filter((x) => x.id !== g.id))
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove field
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Field label"
                      value={g.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        updateGroup(g.id, {
                          label,
                          key: g.keyLocked ? g.key : slugKey(label),
                        });
                      }}
                      placeholder="e.g. Size"
                    />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-text-primary">
                        Field type
                      </label>
                      <select
                        value={g.uiType}
                        onChange={(e) =>
                          updateGroup(g.id, {
                            uiType: e.target.value as OptionUiType,
                          })
                        }
                        className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium focus-ring"
                      >
                        {UI_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Key (API)"
                      value={g.key}
                      onChange={(e) =>
                        updateGroup(g.id, {
                          key: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_]/g, "_"),
                          keyLocked: true,
                        })
                      }
                      placeholder="size"
                      hint="Unique per product · used in pricing"
                    />
                    <Input
                      label="Help text (optional)"
                      value={g.helpText}
                      onChange={(e) =>
                        updateGroup(g.id, { helpText: e.target.value })
                      }
                      placeholder="Shown under the field on storefront"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-secondary">
                        Choices ({g.values.length})
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateGroup(g.id, {
                            values: [...g.values, emptyOptionValue()],
                          })
                        }
                        className="gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add choice
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {g.values.map((v, vi) => (
                        <div
                          key={v.id}
                          className="grid grid-cols-[1fr_1fr_88px_36px] items-end gap-2"
                        >
                          <Input
                            label={vi === 0 ? "Label" : undefined}
                            value={v.label}
                            onChange={(e) => {
                              const label = e.target.value;
                              updateValue(g.id, v.id, {
                                label,
                                value:
                                  v.value || slugifyProductName(label) || "",
                              });
                            }}
                            placeholder='3.5" × 2"'
                          />
                          <Input
                            label={vi === 0 ? "Value" : undefined}
                            value={v.value}
                            onChange={(e) =>
                              updateValue(g.id, v.id, {
                                value: e.target.value,
                              })
                            }
                            placeholder="3-5x2"
                          />
                          <Input
                            label={vi === 0 ? "Price ×" : undefined}
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.priceMod}
                            onChange={(e) =>
                              updateValue(g.id, v.id, {
                                priceMod: e.target.value,
                              })
                            }
                            placeholder="1"
                          />
                          <button
                            type="button"
                            disabled={g.values.length <= 1}
                            onClick={() =>
                              updateGroup(g.id, {
                                values: g.values.filter((x) => x.id !== v.id),
                              })
                            }
                            className={cn(
                              "mb-1 inline-flex h-12 w-9 items-center justify-center rounded-xl text-danger hover:bg-danger/10",
                              g.values.length <= 1 &&
                                "cursor-not-allowed opacity-40",
                            )}
                            aria-label="Remove choice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-text-secondary">
                      Price × multiplies base price (1 = no change, 1.2 = +20%).
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
