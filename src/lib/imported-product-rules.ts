import type { ProductOptionGroup, ProductOptionValue } from "@/types";

type Rule = Record<string, string>;

function ruleMatches(rule: Rule, selections: Record<string, string>) {
  return Object.entries(rule).every(
    ([key, value]) => selections[key] === String(value),
  );
}

function activeProductId(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
) {
  if (selections.attr0) return selections.attr0;
  const linkedDefault = options
    .find((group) => group.key === "attr0")
    ?.values.find((value) => value.meta?.default === true)?.value;
  if (linkedDefault) return linkedDefault;
  for (const group of options) {
    const first = Object.keys(group.meta?.defaultsByProduct ?? {})[0];
    if (first) return first;
  }
  return "default";
}

function rulesForProduct(
  map: unknown,
  productId: string,
): Rule[] {
  if (!map || typeof map !== "object") return [];
  const rules = (map as Record<string, unknown>)[productId];
  return Array.isArray(rules) ? (rules as Rule[]) : [];
}

function valueAvailable(
  value: ProductOptionValue,
  productId: string,
  selections: Record<string, string>,
) {
  const allowed = value.meta?.allowedLinkedValues;
  if (
    Array.isArray(allowed) &&
    allowed.length > 0 &&
    !allowed.includes(productId)
  ) {
    return false;
  }
  return !rulesForProduct(
    value.meta?.exclusionRulesByProduct,
    productId,
  ).some((rule) => ruleMatches(rule, selections));
}

function availableValues(
  group: ProductOptionGroup,
  productId: string,
  selections: Record<string, string>,
) {
  if (group.key === "attr0") return group.values;
  return group.values.filter((value) =>
    valueAvailable(value, productId, selections),
  );
}

/** Parse "30 per sheet" (or similar) from a Label Size option label. */
export function parseLabelsPerSheet(label: string): number | null {
  const match = label.match(/(\d+)\s*per\s*sheet/i);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Sheet labels: Number of Labels = (labels per sheet) × (number of sheets).
 * Keeps attr5 in sync for matrix/live pricing while the UI can hide it.
 */
export function syncSheetLabelQuantity(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
): Record<string, string> {
  if (selections.attr0 !== "1508") return selections;
  const sizeGroup = options.find((group) => group.key === "attr3");
  const sheetsGroup = options.find((group) => group.key === "attr853");
  const qtyGroup = options.find((group) => group.key === "attr5");
  if (!sizeGroup || !sheetsGroup || !qtyGroup) return selections;

  const sizeLabel =
    sizeGroup.values.find((value) => value.value === selections.attr3)?.label ??
    "";
  const perSheet = parseLabelsPerSheet(sizeLabel);
  const sheetsLabel =
    sheetsGroup.values.find((value) => value.value === selections.attr853)
      ?.label ?? "";
  const sheets = Number.parseInt(sheetsLabel.replace(/,/g, ""), 10);
  if (!perSheet || !Number.isFinite(sheets) || sheets <= 0) return selections;

  const total = perSheet * sheets;
  const match = qtyGroup.values.find((value) => {
    const n = Number.parseInt(String(value.label).replace(/,/g, ""), 10);
    return n === total;
  });
  if (!match || selections.attr5 === match.value) return selections;
  return { ...selections, attr5: match.value };
}

export function computedSheetQuantity(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
): number | null {
  if (selections.attr0 !== "1508") return null;
  const sizeGroup = options.find((group) => group.key === "attr3");
  const sheetsGroup = options.find((group) => group.key === "attr853");
  if (!sizeGroup || !sheetsGroup) return null;
  const sizeLabel =
    sizeGroup.values.find((value) => value.value === selections.attr3)?.label ??
    "";
  const perSheet = parseLabelsPerSheet(sizeLabel);
  const sheetsLabel =
    sheetsGroup.values.find((value) => value.value === selections.attr853)
      ?.label ?? "";
  const sheets = Number.parseInt(sheetsLabel.replace(/,/g, ""), 10);
  if (!perSheet || !Number.isFinite(sheets) || sheets <= 0) return null;
  return perSheet * sheets;
}

export function visibleImportedOptions(
  options: ProductOptionGroup[],
  selections: Record<string, string>,
) {
  const productId = activeProductId(options, selections);
  return options
    .filter(
      (group) =>
        !rulesForProduct(
          group.meta?.hideRulesByProduct,
          productId,
        ).some((rule) => ruleMatches(rule, selections)),
    )
    .map((group) => ({
      ...group,
      values:
        group.key === "attr0"
          ? group.values
          : group.values.filter((value) =>
              valueAvailable(value, productId, selections),
            ),
    }))
    .filter((group) => group.values.length > 0);
}

function pickDefaultValue(
  group: ProductOptionGroup,
  productId: string,
  available: ProductOptionValue[],
) {
  const configuredDefault = group.meta?.defaultsByProduct?.[productId];
  return (
    available.find((value) => value.value === configuredDefault) ??
    available.find((value) => value.meta?.default === true) ??
    available[0]
  );
}

export function normalizeImportedSelections(
  options: ProductOptionGroup[],
  input: Record<string, string>,
  protectedKey = "",
) {
  let selections = { ...input };
  for (let pass = 0; pass < 8; pass += 1) {
    let changed = false;
    const visible = visibleImportedOptions(options, selections);
    const visibleKeys = new Set(visible.map((group) => group.key));
    for (const group of options) {
      if (!visibleKeys.has(group.key) && group.key in selections) {
        if (!group.meta?.keepWhenHidden) {
          delete selections[group.key];
          changed = true;
        }
      }
    }
    const productId = activeProductId(options, selections);
    for (const group of visible) {
      if (
        group.values.some((value) => value.value === selections[group.key])
      ) {
        continue;
      }
      if (group.key === protectedKey) continue;
      const fallback = pickDefaultValue(group, productId, group.values);
      if (fallback) {
        selections[group.key] = fallback.value;
        changed = true;
      }
    }
    // Hidden-but-priced fields (Sheet: Shape, Imprint, Number of Labels)
    for (const group of options) {
      if (!group.meta?.keepWhenHidden) continue;
      if (group.key === protectedKey) continue;
      if (visibleKeys.has(group.key)) continue;
      const available = availableValues(group, productId, selections);
      if (available.some((value) => value.value === selections[group.key])) {
        continue;
      }
      const fallback = pickDefaultValue(group, productId, available);
      if (fallback && selections[group.key] !== fallback.value) {
        selections[group.key] = fallback.value;
        changed = true;
      }
    }
    const synced = syncSheetLabelQuantity(options, selections);
    if (synced.attr5 !== selections.attr5) {
      selections = synced;
      changed = true;
    }
    if (!changed) break;
  }
  return syncSheetLabelQuantity(options, selections);
}

export function importedDefaultSelections(options: ProductOptionGroup[]) {
  const initial: Record<string, string> = {};
  const linked = options.find((group) => group.key === "attr0");
  const linkedDefault =
    linked?.values.find((value) => value.meta?.default === true) ??
    linked?.values[0];
  if (linkedDefault) initial.attr0 = linkedDefault.value;
  return normalizeImportedSelections(options, initial);
}

/** First checklist under the product gallery (from description HTML). */
export function extractFeatureBullets(html: string, limit = 8): string[] {
  if (!html) return [];
  const match = html.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (!match) return [];
  return [...match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((item) =>
      item[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean)
    .slice(0, limit);
}
