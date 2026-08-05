"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import type {
  FormOptionGroup,
  FormOptionValue,
} from "@/components/admin/AdminProductOptionEditor";

type PriceMode = "multiply" | "add" | "fixed";

type AreaConfig = {
  type: "area";
  widthKey: string;
  heightKey: string;
  setupCost: number;
  rate: number;
  minimumPrice: number;
};

function findAreaConfig(groups: FormOptionGroup[]): AreaConfig | null {
  for (const group of groups) {
    for (const value of group.values) {
      const config = value.meta?.pricingConfig;
      if (config?.type === "area") return config;
    }
  }
  return null;
}

function numericValue(value?: FormOptionValue): number {
  if (!value) return 0;
  if (
    typeof value.meta?.dimension === "number" &&
    Number.isFinite(value.meta.dimension)
  ) {
    return value.meta.dimension;
  }
  const parsed = Number.parseFloat(value.value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function pricingFor(value: FormOptionValue): {
  mode: PriceMode;
  amount: number;
} {
  if (
    typeof value.meta?.absoluteBasePrice === "number" &&
    Number.isFinite(value.meta.absoluteBasePrice)
  ) {
    return { mode: "fixed", amount: value.meta.absoluteBasePrice };
  }
  if (
    typeof value.meta?.priceAdd === "number" &&
    Number.isFinite(value.meta.priceAdd)
  ) {
    return { mode: "add", amount: value.meta.priceAdd };
  }
  const amount = Number(value.priceMod);
  return {
    mode: "multiply",
    amount: Number.isFinite(amount) && amount > 0 ? amount : 1,
  };
}

function clearAreaConfig(groups: FormOptionGroup[]): FormOptionGroup[] {
  return groups.map((group) => ({
    ...group,
    values: group.values.map((value) => {
      if (!value.meta?.pricingConfig) return value;
      const meta = { ...value.meta };
      delete meta.pricingConfig;
      return { ...value, meta: Object.keys(meta).length ? meta : null };
    }),
  }));
}

function putAreaConfig(
  groups: FormOptionGroup[],
  config: AreaConfig,
): FormOptionGroup[] {
  const cleared = clearAreaConfig(groups);
  const hostIndex = Math.max(
    0,
    cleared.findIndex((group) => group.key === config.widthKey),
  );
  return cleared.map((group, groupIndex) => {
    if (groupIndex !== hostIndex || !group.values[0]) return group;
    return {
      ...group,
      values: group.values.map((value, valueIndex) =>
        valueIndex === 0
          ? {
              ...value,
              meta: {
                ...(value.meta ?? {}),
                pricingConfig: config,
              },
            }
          : value,
      ),
    };
  });
}

export function AdminProductPricingEditor({
  basePrice,
  onBasePriceChange,
  groups,
  onChange,
}: {
  basePrice: string;
  onBasePriceChange: (value: string) => void;
  groups: FormOptionGroup[];
  onChange: (groups: FormOptionGroup[]) => void;
}) {
  const savedArea = useMemo(() => findAreaConfig(groups), [groups]);
  const model: "standard" | "area" = savedArea ? "area" : "standard";
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const selectableGroups = groups.filter((group) => group.values.length > 0);
  const defaultWidth =
    groups.find((group) => /width/i.test(group.key + group.label))?.key ??
    groups[0]?.key ??
    "";
  const defaultHeight =
    groups.find((group) => /height/i.test(group.key + group.label))?.key ??
    groups[1]?.key ??
    defaultWidth;
  const area: AreaConfig = savedArea ?? {
    type: "area",
    widthKey: defaultWidth,
    heightKey: defaultHeight,
    setupCost: 0,
    rate: 1,
    minimumPrice: Number(basePrice) || 0,
  };

  function changeModel(next: "standard" | "area") {
    if (next === "standard") {
      onChange(clearAreaConfig(groups));
      return;
    }
    onChange(putAreaConfig(groups, area));
  }

  function updateArea(patch: Partial<AreaConfig>) {
    onChange(putAreaConfig(groups, { ...area, ...patch }));
  }

  function updateChoice(
    groupId: string,
    valueId: string,
    mode: PriceMode,
    amount: number,
  ) {
    onChange(
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              values: group.values.map((value) => {
                if (value.id !== valueId) return value;
                const meta = { ...(value.meta ?? {}) };
                delete meta.absoluteBasePrice;
                delete meta.priceAdd;
                if (mode === "fixed") meta.absoluteBasePrice = amount;
                if (mode === "add") meta.priceAdd = amount;
                return {
                  ...value,
                  priceMod:
                    mode === "multiply"
                      ? String(amount > 0 ? amount : 1)
                      : "1",
                  meta: Object.keys(meta).length ? meta : null,
                };
              }),
            },
      ),
    );
  }

  const sampleWidth = numericValue(
    groups.find((group) => group.key === area.widthKey)?.values[0],
  );
  const sampleHeight = numericValue(
    groups.find((group) => group.key === area.heightKey)?.values[0],
  );
  const sampleAreaPrice = Math.max(
    area.minimumPrice,
    area.setupCost + sampleWidth * sampleHeight * area.rate,
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary/10 p-2 text-primary">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-secondary">
              How should this product calculate its price?
            </h3>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Choose one model here. Customer fields stay separate and simple.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => changeModel("standard")}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              model === "standard"
                ? "border-primary bg-card shadow-soft"
                : "border-border bg-card/70 hover:border-primary/40",
            )}
          >
            <strong className="block text-sm text-secondary">
              Fixed / option pricing
            </strong>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              Cards, flags and products with predefined sizes or packages.
            </span>
          </button>
          <button
            type="button"
            onClick={() => changeModel("area")}
            disabled={groups.length < 2}
            className={cn(
              "rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
              model === "area"
                ? "border-primary bg-card shadow-soft"
                : "border-border bg-card/70 hover:border-primary/40",
            )}
          >
            <strong className="block text-sm text-secondary">
              Width × Height
            </strong>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              Banners, decals and custom-size printing.
            </span>
          </button>
        </div>
      </div>

      {model === "area" ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
          <h3 className="text-sm font-bold text-secondary">
            Width × Height formula
          </h3>
          <p className="mt-1 rounded-lg bg-background px-3 py-2 font-mono text-xs text-text-secondary">
            Price = Setup cost + (Width × Height × Area rate), but never below
            Minimum price
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-text-primary">
                Width field
              </label>
              <select
                value={area.widthKey}
                onChange={(e) => updateArea({ widthKey: e.target.value })}
                className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium focus-ring"
              >
                {selectableGroups.map((group) => (
                  <option key={group.id} value={group.key}>
                    {group.label} ({group.key})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-text-primary">
                Height field
              </label>
              <select
                value={area.heightKey}
                onChange={(e) => updateArea({ heightKey: e.target.value })}
                className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm font-medium focus-ring"
              >
                {selectableGroups.map((group) => (
                  <option key={group.id} value={group.key}>
                    {group.label} ({group.key})
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Setup cost ($)"
              type="number"
              min="0"
              step="0.01"
              value={String(area.setupCost)}
              onChange={(e) =>
                updateArea({ setupCost: Number(e.target.value) || 0 })
              }
              hint="Charged once per printed unit"
            />
            <Input
              label="Area rate ($)"
              type="number"
              min="0"
              step="0.0001"
              value={String(area.rate)}
              onChange={(e) =>
                updateArea({ rate: Number(e.target.value) || 0 })
              }
              hint="Price per square unit"
            />
            <Input
              label="Minimum price ($)"
              type="number"
              min="0"
              step="0.01"
              value={String(area.minimumPrice)}
              onChange={(e) =>
                updateArea({ minimumPrice: Number(e.target.value) || 0 })
              }
              hint="Small sizes cannot go below this"
            />
            <div className="rounded-xl border border-success/30 bg-success/5 p-3">
              <p className="text-xs font-semibold text-success">
                Live example
              </p>
              <p className="mt-1 text-sm font-bold text-secondary">
                {sampleWidth || "Width"} × {sampleHeight || "Height"} ={" "}
                {formatCurrency(sampleAreaPrice)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                Uses the first choice from each selected field.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
          <h3 className="text-sm font-bold text-secondary">Base price</h3>
          <p className="mt-1 text-xs text-text-secondary">
            The default price before the customer changes any options.
          </p>
          <div className="mt-3 max-w-sm">
            <Input
              label="Starting price ($)"
              type="number"
              min="0"
              step="0.01"
              value={basePrice}
              onChange={(e) => onBasePriceChange(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
        <h3 className="text-sm font-bold text-secondary">
          Option price adjustments
        </h3>
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          Optional. Leave choices at × 1 for no price change. Open only the
          field whose pricing you need to adjust.
        </p>
        <div className="mt-4 space-y-2">
          {groups.map((group) => {
            const open = openGroup === group.id;
            return (
              <div
                key={group.id}
                className="overflow-hidden rounded-xl border border-border"
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : group.id)}
                  className="flex w-full items-center justify-between px-3 py-3 text-left hover:bg-background"
                >
                  <span>
                    <strong className="text-sm text-secondary">
                      {group.label}
                    </strong>
                    <span className="ml-2 text-xs text-text-secondary">
                      {group.values.length} choices
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-text-secondary transition",
                      open && "rotate-180",
                    )}
                  />
                </button>
                {open ? (
                  <div className="space-y-2 border-t border-border p-3">
                    {group.values.map((value) => {
                      const pricing = pricingFor(value);
                      return (
                        <div
                          key={value.id}
                          className="grid gap-2 rounded-lg bg-background p-2 sm:grid-cols-[minmax(140px,1fr)_150px_120px]"
                        >
                          <span className="self-center text-sm font-medium text-secondary">
                            {value.label}
                          </span>
                          <select
                            value={pricing.mode}
                            onChange={(e) =>
                              updateChoice(
                                group.id,
                                value.id,
                                e.target.value as PriceMode,
                                pricing.amount,
                              )
                            }
                            className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-medium"
                          >
                            <option value="multiply">Multiply (×)</option>
                            <option value="add">Add amount (+$)</option>
                            <option value="fixed">Fixed price (=$)</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={pricing.amount}
                            onChange={(e) =>
                              updateChoice(
                                group.id,
                                value.id,
                                pricing.mode,
                                Number(e.target.value) || 0,
                              )
                            }
                            className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
                            aria-label={`${value.label} price amount`}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
