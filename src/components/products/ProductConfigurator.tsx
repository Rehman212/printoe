"use client";

import {
  FileText,
  HelpCircle,
  LayoutGrid,
  RefreshCw,
  Scissors,
  Square,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductOptionGroup } from "@/types";
import { Select, Tooltip } from "@/components/ui/Misc";

const ICON_MAP: Record<string, LucideIcon> = {
  Scissors,
  RefreshCw,
  LayoutGrid,
  Square,
  FileText,
};

function optionLabel(value: ProductOptionGroup["values"][number]) {
  const display = value.meta?.displayLabel;
  return typeof display === "string" && display.trim()
    ? display.trim()
    : value.label;
}

function isRadioGroup(group: ProductOptionGroup) {
  // Opt-in only — never infer from label (would change every product).
  return group.meta?.presentation === "radio";
}

export function ProductConfigurator({
  options,
  selections,
  onChange,
  computedQuantity,
}: {
  options: ProductOptionGroup[];
  selections: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Sheet labels: show Quantity as read-only text (UPrinting style). */
  computedQuantity?: number | null;
}) {
  if (!options.length) {
    return (
      <p className="text-sm text-text-secondary">
        No configuration options for this product yet.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {options.map((group) => {
        if (group.values.length === 0) return null;
        const selected = selections[group.key] ?? "";
        const readOnly = group.values.length === 1;

        if (isRadioGroup(group) && group.values.length > 1) {
          return (
            <div key={group.id} className="space-y-2.5">
              <FieldLabel label={group.label} helpText={group.helpText} />
              <div className="space-y-2 rounded-xl border border-[#1b5e20]/40 bg-[#f4faf4] p-3">
                {group.values.map((v) => {
                  const active = selected === v.value;
                  return (
                    <label
                      key={v.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition",
                        active
                          ? "bg-white font-semibold text-secondary shadow-sm"
                          : "text-text-secondary hover:bg-white/70",
                      )}
                    >
                      <input
                        type="radio"
                        name={group.key}
                        value={v.value}
                        checked={active}
                        onChange={() => onChange(group.key, v.value)}
                        className="h-4 w-4 accent-[#1b5e20]"
                      />
                      <span>{optionLabel(v)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        }

        if (group.uiType === "CARDS") {
          return (
            <div key={group.id} className="space-y-2.5">
              <FieldLabel label={group.label} helpText={group.helpText} />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {group.values.map((v) => {
                  const Icon =
                    ICON_MAP[(v.meta as { icon?: string } | null)?.icon || ""] ||
                    Square;
                  const active = selected === v.value;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onChange(group.key, v.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition focus-ring",
                        active
                          ? "border-primary bg-primary/5 text-primary shadow-soft"
                          : "border-border bg-card text-text-secondary hover:border-primary/40",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-semibold leading-tight">
                        {optionLabel(v)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        if (group.uiType === "NUMBER") {
          return (
            <div key={group.id} className="space-y-2.5">
              <FieldLabel label={group.label} helpText={group.helpText} />
              <input
                type="number"
                min={1}
                value={selected}
                placeholder="Enter…"
                onChange={(e) => onChange(group.key, e.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium shadow-soft focus-ring placeholder:text-text-secondary"
              />
            </div>
          );
        }

        if (readOnly && !group.meta?.forceSelect) {
          const only = group.values[0];
          return (
            <div key={group.id} className="space-y-1.5">
              <FieldLabel label={group.label} helpText={group.helpText} />
              <p className="text-sm font-medium text-secondary">
                {optionLabel(only)}
              </p>
            </div>
          );
        }

        const field = (
          <div>
            <Select
              label={group.label}
              value={selected}
              placeholder="Select…"
              onChange={(val) => onChange(group.key, val)}
              options={group.values.map((v) => {
                const optionGroup = v.meta?.optionGroup;
                return {
                  label: optionLabel(v),
                  value: v.value,
                  ...(typeof optionGroup === "string" && optionGroup.trim()
                    ? { group: optionGroup.trim() }
                    : {}),
                };
              })}
            />
            {group.helpText ? (
              <p className="mt-1.5 text-xs text-text-secondary">{group.helpText}</p>
            ) : null}
          </div>
        );

        if (
          group.key === "attr853" &&
          typeof computedQuantity === "number" &&
          computedQuantity > 0
        ) {
          return (
            <div key={group.id} className="space-y-4">
              {field}
              <div className="space-y-1.5">
                <FieldLabel label="Quantity" />
                <p className="text-sm font-medium text-secondary">
                  {computedQuantity.toLocaleString()}
                </p>
              </div>
            </div>
          );
        }

        return <div key={group.id}>{field}</div>;
      })}
    </div>
  );
}

function FieldLabel({
  label,
  helpText,
}: {
  label: string;
  helpText?: string | null;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      {helpText ? (
        <Tooltip content={helpText}>
          <HelpCircle className="h-3.5 w-3.5 text-text-secondary" />
        </Tooltip>
      ) : null}
    </div>
  );
}
