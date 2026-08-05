"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  OptionUiType,
  ProductOptionGroup,
  ProductOptionValue,
} from "@/types";
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
  meta: ProductOptionValue["meta"];
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
    meta: null,
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
      meta: (v.meta ?? null) as ProductOptionValue["meta"],
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
      meta: v.meta ?? null,
    })),
  }));
}

type OptionPayload = {
  key: string;
  label: string;
  uiType: OptionUiType;
  helpText?: string;
  sortOrder: number;
  values: Array<{
    label: string;
    value: string;
    priceMod: number;
    meta?: Record<string, unknown>;
  }>;
};

export function optionGroupsToPayload(
  groups: FormOptionGroup[],
): OptionPayload[] {
  const usedKeys = new Set<string>();
  const payload: OptionPayload[] = [];

  groups.forEach((group, groupIndex) => {
    const label = group.label.trim();
    if (!label) return;
    let key = (group.key || slugKey(label)).trim();
    if (!key) key = `field_${groupIndex + 1}`;
    if (usedKeys.has(key)) key = `${key}_${groupIndex + 1}`;
    usedKeys.add(key);

    const values: OptionPayload["values"] = [];
    group.values.forEach((formValue) => {
      const valueLabel = formValue.label.trim();
      if (!valueLabel) return;
      const value =
        formValue.value.trim() ||
        slugifyProductName(valueLabel) ||
        `opt_${Math.random().toString(36).slice(2, 6)}`;
      const priceMod = Number(formValue.priceMod);
      values.push({
        label: valueLabel,
        value,
        priceMod:
          Number.isFinite(priceMod) && priceMod > 0 ? priceMod : 1,
        meta: formValue.meta
          ? ({ ...formValue.meta } as Record<string, unknown>)
          : undefined,
      });
    });

    if (values.length) {
      payload.push({
        key,
        label,
        uiType: group.uiType,
        helpText: group.helpText.trim() || undefined,
        sortOrder: groupIndex,
        values,
      });
    }
  });

  return payload;
}

const UI_TYPES: Array<{ value: OptionUiType; label: string }> = [
  { value: "SELECT", label: "Dropdown" },
  { value: "CARDS", label: "Choice cards" },
  { value: "NUMBER", label: "Number input" },
];

const TYPE_LABEL: Record<OptionUiType, string> = {
  SELECT: "Dropdown",
  CARDS: "Cards",
  NUMBER: "Number",
};

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
  const [openId, setOpenId] = useState<string | null>(null);

  function updateGroup(id: string, patch: Partial<FormOptionGroup>) {
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function updateValue(
    groupId: string,
    valueId: string,
    patch: Partial<FormOptionValue>,
  ) {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              values: g.values.map((v) =>
                v.id === valueId ? { ...v, ...patch } : v,
              ),
            }
          : g,
      ),
    );
  }

  function addField() {
    const group = emptyOptionGroup();
    onChange([...groups, group]);
    setOpenId(group.id);
  }

  function moveGroup(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-secondary">
            Questions customers answer
            {categoryName ? (
              <span className="font-medium text-text-secondary">
                {" "}
                · {categoryName}
              </span>
            ) : null}
          </p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-text-secondary">
            Add only the fields shown on the product page: Width, Height,
            Material, Quantity, etc. Pricing is configured separately in the
            next step.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange(optionGroupsFromCategory(categorySlug))
            }
          >
            Load category template
          </Button>
          <Button type="button" size="sm" onClick={addField} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add field
          </Button>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-card px-3 py-8 text-center text-xs text-text-secondary">
          No customer fields yet. Click <strong>Add field</strong>.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {groups.map((group, index) => {
            const open = openId === group.id;
            return (
              <li
                key={group.id}
                className={cn(
                  "overflow-hidden rounded-xl border bg-card shadow-soft",
                  open ? "border-primary/40" : "border-border",
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : group.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-sm text-text-primary">
                        {group.label || "Untitled field"}
                      </strong>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {TYPE_LABEL[group.uiType]}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {group.values.length} choices
                      </span>
                    </span>
                    {!open ? (
                      <span className="mt-0.5 block truncate text-xs text-text-secondary">
                        {group.values
                          .slice(0, 5)
                          .map((v) => v.label || "…")
                          .join(" · ")}
                        {group.values.length > 5 ? " …" : ""}
                      </span>
                    ) : null}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveGroup(index, -1)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-background disabled:opacity-30"
                    aria-label="Move field up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === groups.length - 1}
                    onClick={() => moveGroup(index, 1)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-background disabled:opacity-30"
                    aria-label="Move field down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange(groups.filter((g) => g.id !== group.id))
                    }
                    className="rounded-lg p-2 text-danger hover:bg-danger/10"
                    aria-label="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : group.id)}
                    className="rounded-lg p-2 text-text-secondary hover:bg-background"
                    aria-label={open ? "Close field" : "Edit field"}
                  >
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                </div>

                {open ? (
                  <div className="space-y-4 border-t border-border px-3 py-4 sm:px-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Customer-facing name"
                        value={group.label}
                        onChange={(e) => {
                          const label = e.target.value;
                          updateGroup(group.id, {
                            label,
                            key: group.keyLocked
                              ? group.key
                              : slugKey(label),
                          });
                        }}
                        placeholder="e.g. Width"
                        hint="This label appears on the product page"
                      />
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-text-primary">
                          Display as
                        </label>
                        <select
                          value={group.uiType}
                          onChange={(e) =>
                            updateGroup(group.id, {
                              uiType: e.target.value as OptionUiType,
                            })
                          }
                          className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium focus-ring"
                        >
                          {UI_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="Internal key"
                        value={group.key}
                        onChange={(e) =>
                          updateGroup(group.id, {
                            key: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, "_"),
                            keyLocked: true,
                          })
                        }
                        placeholder="width"
                        hint="Advanced: don't change on an existing product"
                      />
                      <Input
                        label="Help text"
                        value={group.helpText}
                        onChange={(e) =>
                          updateGroup(group.id, { helpText: e.target.value })
                        }
                        placeholder="Optional text shown below the field"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-bold text-secondary">
                          Choices ({group.values.length})
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateGroup(group.id, {
                              values: [...group.values, emptyOptionValue()],
                            })
                          }
                          className="gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add choice
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {group.values.map((value, valueIndex) => (
                          <div
                            key={value.id}
                            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_36px] items-end gap-2"
                          >
                            <Input
                              label={valueIndex === 0 ? "Customer sees" : undefined}
                              value={value.label}
                              onChange={(e) => {
                                const label = e.target.value;
                                updateValue(group.id, value.id, {
                                  label,
                                  value:
                                    value.value ||
                                    slugifyProductName(label) ||
                                    "",
                                });
                              }}
                              placeholder='e.g. 3.25"'
                            />
                            <Input
                              label={valueIndex === 0 ? "Internal value" : undefined}
                              value={value.value}
                              onChange={(e) =>
                                updateValue(group.id, value.id, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="3.25"
                            />
                            <button
                              type="button"
                              disabled={group.values.length <= 1}
                              onClick={() =>
                                updateGroup(group.id, {
                                  values: group.values.filter(
                                    (v) => v.id !== value.id,
                                  ),
                                })
                              }
                              className="mb-1 inline-flex h-12 w-9 items-center justify-center rounded-xl text-danger hover:bg-danger/10 disabled:opacity-30"
                              aria-label="Remove choice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
