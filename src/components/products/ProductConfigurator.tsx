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

export function ProductConfigurator({
  options,
  selections,
  onChange,
}: {
  options: ProductOptionGroup[];
  selections: Record<string, string>;
  onChange: (key: string, value: string) => void;
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
        const selected = selections[group.key] ?? "";

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
                        {v.label}
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

        // SELECT (default) — starts on "Select…" until customer picks
        return (
          <div key={group.id}>
            <Select
              label={group.label}
              value={selected}
              placeholder="Select…"
              onChange={(val) => onChange(group.key, val)}
              options={group.values.map((v) => ({
                label: v.label,
                value: v.value,
              }))}
            />
            {group.helpText ? (
              <p className="mt-1.5 text-xs text-text-secondary">{group.helpText}</p>
            ) : null}
          </div>
        );
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
