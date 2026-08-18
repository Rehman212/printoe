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

export function normalizeImportedSelections(
  options: ProductOptionGroup[],
  input: Record<string, string>,
  protectedKey = "",
) {
  const selections = { ...input };
  for (let pass = 0; pass < 8; pass += 1) {
    let changed = false;
    const visible = visibleImportedOptions(options, selections);
    const visibleKeys = new Set(visible.map((group) => group.key));
    for (const group of options) {
      if (!visibleKeys.has(group.key) && group.key in selections) {
        delete selections[group.key];
        changed = true;
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
      const configuredDefault = group.meta?.defaultsByProduct?.[productId];
      const fallback =
        group.values.find((value) => value.value === configuredDefault) ??
        group.values.find((value) => value.meta?.default === true) ??
        group.values[0];
      if (fallback) {
        selections[group.key] = fallback.value;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return selections;
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
