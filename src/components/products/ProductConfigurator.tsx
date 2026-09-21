"use client";

import {
  AppWindow,
  BookOpen,
  CircleDot,
  Clock,
  Copy,
  Droplets,
  FileText,
  HelpCircle,
  Layers,
  LayoutGrid,
  ListOrdered,
  Maximize2,
  Package,
  Palette,
  PanelTop,
  Printer,
  RefreshCw,
  Scissors,
  Settings,
  ShoppingBag,
  Sparkles,
  Square,
  Tag,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductOptionGroup } from "@/types";
import { Select, Tooltip } from "@/components/ui/Misc";
import {
  CUSTOM_SIZE_VALUE,
  customSizeUnit,
} from "@/lib/custom-size";

const ICON_MAP: Record<string, LucideIcon> = {
  Scissors,
  RefreshCw,
  LayoutGrid,
  Square,
  FileText,
};

const FIELD_LABEL_ICONS: { match: RegExp; icon: LucideIcon }[] = [
  { match: /customization/i, icon: LayoutGrid },
  { match: /gift bag|bag/i, icon: ShoppingBag },
  { match: /pouch|box|mailer|envelope|sleeve/i, icon: Package },
  { match: /style|shape/i, icon: Square },
  { match: /size|dimension|width|height|length/i, icon: Maximize2 },
  { match: /setup/i, icon: Settings },
  { match: /gusset/i, icon: PanelTop },
  { match: /window/i, icon: AppWindow },
  { match: /material|stock|paper|cardstock/i, icon: Layers },
  { match: /coating|finish|lamination|uv|varnish|foil/i, icon: Droplets },
  { match: /printed|print|sides|ink/i, icon: Copy },
  { match: /handle/i, icon: ShoppingBag },
  { match: /color|colour|pantone/i, icon: Palette },
  { match: /quantity|qty/i, icon: ListOrdered },
  { match: /production|turnaround|rush/i, icon: Clock },
  { match: /\btime\b/i, icon: Clock },
  { match: /pages|sheet/i, icon: BookOpen },
  { match: /cut|die|corner/i, icon: Scissors },
  { match: /font|text|copy/i, icon: Type },
  { match: /proof|file/i, icon: FileText },
  { match: /label|sticker/i, icon: Tag },
];

function fieldIconFor(label: string): LucideIcon {
  return FIELD_LABEL_ICONS.find((item) => item.match.test(label))?.icon ?? CircleDot;
}

const OPTION_CARD_ICONS: { match: RegExp; icon: LucideIcon }[] = [
  { match: /die[- ]?cut|cut/i, icon: Scissors },
  { match: /foil|metallic|gold|silver/i, icon: Sparkles },
  { match: /plastic|vinyl|poly/i, icon: Layers },
  { match: /silk|soft|matte|gloss|aq/i, icon: Droplets },
  { match: /print/i, icon: Printer },
  { match: /label/i, icon: Tag },
  { match: /standard|square/i, icon: Square },
  { match: /round|circle/i, icon: CircleDot },
  { match: /grid|sheet/i, icon: LayoutGrid },
  { match: /file|proof/i, icon: FileText },
];

function optionCardIcon(
  value: ProductOptionGroup["values"][number],
): LucideIcon {
  const label = optionLabel(value);
  const fromLabel = OPTION_CARD_ICONS.find((item) => item.match.test(label))?.icon;
  if (fromLabel) return fromLabel;
  const fromMeta = ICON_MAP[(value.meta as { icon?: string } | null)?.icon || ""];
  return fromMeta || CircleDot;
}

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
  productSlug,
  customSize,
}: {
  options: ProductOptionGroup[];
  selections: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Sheet labels: show Quantity as read-only text (UPrinting style). */
  computedQuantity?: number | null;
  productSlug?: string;
  customSize?: {
    groupKey: string;
    enabled: boolean;
    width: string;
    height: string;
    onWidth: (value: string) => void;
    onHeight: (value: string) => void;
    onStandaloneCustom?: () => void;
    onStandaloneStandard?: () => void;
    standardLabel?: string;
  };
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
        const isCustomSizeGroup =
          Boolean(customSize) && group.key === customSize?.groupKey;
        const readOnly = group.values.length === 1 && !isCustomSizeGroup;

        if (isRadioGroup(group) && group.values.length > 1) {
          return (
            <div key={group.id} className="space-y-2.5">
              <FieldLabel
                label={group.label}
                helpText={group.helpText}
                Icon={fieldIconFor(group.label)}
              />
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
              <FieldLabel
                label={group.label}
                helpText={group.helpText}
                Icon={fieldIconFor(group.label)}
              />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {group.values.map((v) => {
                  const Icon = optionCardIcon(v);
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
              <FieldLabel
                label={group.label}
                helpText={group.helpText}
                Icon={fieldIconFor(group.label)}
              />
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
              <FieldLabel
                label={group.label}
                helpText={group.helpText}
                Icon={fieldIconFor(group.label)}
              />
              <p className="text-sm font-medium text-secondary">
                {optionLabel(only)}
              </p>
            </div>
          );
        }

        const selectOptions = isCustomSizeGroup
          ? [
              ...group.values.map((v) => {
                const optionGroup = v.meta?.optionGroup;
                return {
                  label: optionLabel(v),
                  value: v.value,
                  ...(typeof optionGroup === "string" && optionGroup.trim()
                    ? { group: optionGroup.trim() }
                    : {}),
                };
              }),
              { label: "Custom Size", value: CUSTOM_SIZE_VALUE },
            ]
          : group.values.map((v) => {
              const optionGroup = v.meta?.optionGroup;
              return {
                label: optionLabel(v),
                value: v.value,
                ...(typeof optionGroup === "string" && optionGroup.trim()
                  ? { group: optionGroup.trim() }
                  : {}),
              };
            });
        const selectValue =
          isCustomSizeGroup && customSize?.enabled
            ? CUSTOM_SIZE_VALUE
            : selected;
        const unit = customSizeUnit(productSlug ?? "");
        const unitLabel = unit === "ft" ? "ft" : "in";

        const field = (
          <div>
            <Select
              label={group.label}
              labelIcon={fieldIconFor(group.label)}
              value={selectValue}
              placeholder="Select…"
              onChange={(val) => onChange(group.key, val)}
              options={selectOptions}
            />
            {isCustomSizeGroup && customSize?.enabled ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-secondary">
                    Width ({unitLabel})
                  </span>
                  <input
                    type="number"
                    min={0.25}
                    step="0.25"
                    value={customSize.width}
                    onChange={(e) => customSize.onWidth(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium focus-ring"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-secondary">
                    Height ({unitLabel})
                  </span>
                  <input
                    type="number"
                    min={0.25}
                    step="0.25"
                    value={customSize.height}
                    onChange={(e) => customSize.onHeight(e.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium focus-ring"
                  />
                </label>
              </div>
            ) : null}
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
                <FieldLabel
                  label="Quantity"
                  Icon={fieldIconFor("Quantity")}
                />
                <p className="text-sm font-medium text-secondary">
                  {computedQuantity.toLocaleString()}
                </p>
              </div>
            </div>
          );
        }

        return <div key={group.id}>{field}</div>;
      })}
      {customSize && !options.some((g) => g.key === customSize.groupKey) ? (
        <div>
          <Select
            label="Size"
            labelIcon={fieldIconFor("Size")}
            value={customSize.enabled ? CUSTOM_SIZE_VALUE : "standard"}
            placeholder="Select…"
            onChange={(val) => {
              if (val === CUSTOM_SIZE_VALUE) customSize.onStandaloneCustom?.();
              else customSize.onStandaloneStandard?.();
            }}
            options={[
              { label: customSize.standardLabel || "Standard", value: "standard" },
              { label: "Custom Size", value: CUSTOM_SIZE_VALUE },
            ]}
          />
          {customSize.enabled ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-secondary">
                  Width ({customSizeUnit(productSlug ?? "") === "ft" ? "ft" : "in"})
                </span>
                <input
                  type="number"
                  min={0.25}
                  step="0.25"
                  value={customSize.width}
                  onChange={(e) => customSize.onWidth(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium focus-ring"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-secondary">
                  Height ({customSizeUnit(productSlug ?? "") === "ft" ? "ft" : "in"})
                </span>
                <input
                  type="number"
                  min={0.25}
                  step="0.25"
                  value={customSize.height}
                  onChange={(e) => customSize.onHeight(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium focus-ring"
                />
              </label>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FieldLabel({
  label,
  helpText,
  Icon,
}: {
  label: string;
  helpText?: string | null;
  Icon?: LucideIcon | null;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Icon ? <Icon className="h-4 w-4 text-text-secondary" /> : null}
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      {helpText ? (
        <Tooltip content={helpText}>
          <HelpCircle className="h-3.5 w-3.5 text-text-secondary" />
        </Tooltip>
      ) : null}
    </div>
  );
}
