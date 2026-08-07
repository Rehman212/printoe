"use client";

import { useMemo, useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import type {
  FormOptionGroup,
  FormOptionValue,
} from "@/components/admin/AdminProductOptionEditor";

type AreaConfig = {
  type: "area";
  widthKey: string;
  heightKey: string;
  setupCost: number;
  rate: number;
  minimumPrice: number;
};

/** Size / package / garment sets the product price. Other fields only add extra $. */
function isBasePriceField(group: FormOptionGroup) {
  return /^(size|package|product_type|garment)$/i.test(group.key);
}

function isSkippedPricingField(group: FormOptionGroup) {
  return /^(quantity|turnaround|width|height)$/i.test(group.key);
}

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

function readExtraDollars(value: FormOptionValue): number {
  if (
    typeof value.meta?.priceAdd === "number" &&
    Number.isFinite(value.meta.priceAdd)
  ) {
    return value.meta.priceAdd;
  }
  // Legacy multiply → rough dollar hint is not shown; treat as $0 extra
  // unless they already had priceAdd / absoluteBasePrice.
  return 0;
}

function readAbsoluteDollars(value: FormOptionValue): number {
  if (
    typeof value.meta?.absoluteBasePrice === "number" &&
    Number.isFinite(value.meta.absoluteBasePrice)
  ) {
    return value.meta.absoluteBasePrice;
  }
  // Migrate old Extra $ on garment/size into absolute display
  if (
    typeof value.meta?.priceAdd === "number" &&
    Number.isFinite(value.meta.priceAdd)
  ) {
    return value.meta.priceAdd;
  }
  return 0;
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
  const [openGroup, setOpenGroup] = useState<string | null>(
    groups.find((g) => !isSkippedPricingField(g))?.id ?? null,
  );
  const base = Number(basePrice) || 0;

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
    minimumPrice: base,
  };

  const pricedGroups = groups.filter((g) => !isSkippedPricingField(g));

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

  /** Extra $ on top of base (Display Options, Shape, Material…). */
  function setExtraDollars(groupId: string, valueId: string, dollars: number) {
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
                const amount = Number.isFinite(dollars) ? dollars : 0;
                if (amount === 0) {
                  delete meta.priceAdd;
                } else {
                  meta.priceAdd = amount;
                }
                return {
                  ...value,
                  priceMod: "1",
                  meta: Object.keys(meta).length ? meta : null,
                };
              }),
            },
      ),
    );
  }

  /** Absolute price for a size / package choice. */
  function setSizePrice(groupId: string, valueId: string, dollars: number) {
    onChange(
      groups.map((group) =>
        group.id !== groupId
          ? group
          : {
              ...group,
              values: group.values.map((value) => {
                if (value.id !== valueId) return value;
                const meta = { ...(value.meta ?? {}) };
                delete meta.priceAdd;
                const amount = Number.isFinite(dollars) ? dollars : 0;
                if (amount > 0) {
                  meta.absoluteBasePrice = amount;
                } else {
                  delete meta.absoluteBasePrice;
                }
                return {
                  ...value,
                  priceMod: "1",
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

  // Live example from first choice of each priced field
  const exampleExtras = pricedGroups
    .filter((g) => !isBasePriceField(g))
    .map((g) => {
      const v = g.values[0];
      if (!v) return null;
      const extra = readExtraDollars(v);
      return { label: v.label, extra };
    })
    .filter(Boolean) as Array<{ label: string; extra: number }>;
  const exampleTotal =
    base + exampleExtras.reduce((sum, row) => sum + row.extra, 0);

  return (
    <div className="space-y-4">
      {/* Model picker — plain language */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-lg bg-primary/15 p-2 text-primary">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              Pricing
            </h3>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Garment / Size ke <strong>Price $</strong> Customer fields mein
              set karo. Yahan mostly starting price (ya W×H). Polo pehle Extra
              $ tha is liye 34+222=256 dikha — ab Price $ = seedha $222.
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
                ? "border-primary bg-background shadow-soft"
                : "border-border bg-background/50 hover:border-primary/40",
            )}
          >
            <strong className="block text-sm text-text-primary">
              Normal product
            </strong>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              Apparel, signs, cards — Price $ / Extra $ on choices.
            </span>
          </button>
          <button
            type="button"
            onClick={() => changeModel("area")}
            disabled={groups.length < 2}
            className={cn(
              "rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50",
              model === "area"
                ? "border-primary bg-background shadow-soft"
                : "border-border bg-background/50 hover:border-primary/40",
            )}
          >
            <strong className="block text-sm text-text-primary">
              Custom size (W × H)
            </strong>
            <span className="mt-1 block text-xs leading-5 text-text-secondary">
              Wall decals / banners priced by area.
            </span>
          </button>
        </div>
      </div>

      {model === "area" ? (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
          <h3 className="text-sm font-bold text-secondary">
            Area price formula
          </h3>
          <p className="mt-1 text-xs text-text-secondary">
            Price = Setup + (Width × Height × Rate per sq unit). Never below
            minimum.
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
                    {group.label}
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
                    {group.label}
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
            />
            <Input
              label="Rate per sq unit ($)"
              type="number"
              min="0"
              step="0.0001"
              value={String(area.rate)}
              onChange={(e) =>
                updateArea({ rate: Number(e.target.value) || 0 })
              }
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
            />
            <div className="rounded-xl border border-success/30 bg-success/5 p-3">
              <p className="text-xs font-semibold text-success">Example</p>
              <p className="mt-1 text-sm font-bold text-secondary">
                {sampleWidth || "W"} × {sampleHeight || "H"} ={" "}
                {formatCurrency(sampleAreaPrice)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
          <h3 className="text-sm font-bold text-secondary">Starting price</h3>
          <p className="mt-1 text-xs text-text-secondary">
            Default total when the customer keeps the first options (e.g.
            Sign Only + Rectangle + 12×18).
          </p>
          <div className="mt-3 max-w-xs">
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

      {/* Per-field simple dollar tables */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
        <h3 className="text-sm font-bold text-secondary">
          Price per dropdown choice
        </h3>
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          Yeh same Extra $ Customer fields step mein bhi set ho sakti hai
          (Garment → Hoodie = +$25). Yahan edit karo ya wahan — dono sync
          hain. Example: Sign Only = $0, Ground Stake = +$20.
        </p>

        {pricedGroups.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-text-secondary">
            Pehle Customer fields step mein Display Options / Shape add karo.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {pricedGroups.map((group) => {
              const open = openGroup === group.id;
              const asSize = isBasePriceField(group);
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
                        {asSize ? " · set full price" : " · extra $"}
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
                    <div className="border-t border-border">
                      <div className="grid grid-cols-[1fr_120px] gap-2 bg-background px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-text-secondary">
                        <span>Choice (customer sees)</span>
                        <span className="text-right">
                          {asSize ? "Price $" : "Extra $"}
                        </span>
                      </div>
                      <ul className="divide-y divide-border">
                        {group.values.map((value) => {
                          const amount = asSize
                            ? readAbsoluteDollars(value)
                            : readExtraDollars(value);
                          return (
                            <li
                              key={value.id}
                              className="grid grid-cols-[1fr_120px] items-center gap-2 px-3 py-2.5"
                            >
                              <span className="text-sm font-medium text-secondary">
                                {value.label || "Untitled"}
                              </span>
                              <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                                  $
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={amount}
                                  onChange={(e) => {
                                    const next = Number(e.target.value) || 0;
                                    if (asSize) {
                                      setSizePrice(group.id, value.id, next);
                                    } else {
                                      setExtraDollars(
                                        group.id,
                                        value.id,
                                        next,
                                      );
                                    }
                                  }}
                                  className="h-10 w-full rounded-xl border border-border bg-card pl-7 pr-2 text-sm font-semibold focus-ring"
                                  aria-label={`${value.label} price`}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="border-t border-border bg-background px-3 py-2 text-[11px] text-text-secondary">
                        {asSize
                          ? "Price $ = storefront pe yehi amount (Garment / Size). Save ke baad Extra $ migrate ho jati hai."
                          : "0 = no change. 20 = starting + $20."}
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {model === "standard" && pricedGroups.length > 0 ? (
          <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-3">
            <p className="text-xs font-semibold text-success">
              Example (pehli choice har field ki)
            </p>
            <p className="mt-1 text-sm text-secondary">
              Starting {formatCurrency(base)}
              {exampleExtras
                .filter((row) => row.extra !== 0)
                .map((row) => (
                  <span key={row.label}>
                    {" "}
                    + {row.label} {formatCurrency(row.extra)}
                  </span>
                ))}
              {" = "}
              <strong>{formatCurrency(exampleTotal)}</strong>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
