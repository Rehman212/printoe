import assert from "node:assert/strict";
import {
  importedDefaultSelections,
  normalizeImportedSelections,
  visibleImportedOptions,
} from "../src/lib/imported-product-rules.ts";

const options = [
  {
    id: "type",
    key: "attr0",
    label: "Business Cards Types",
    uiType: "CARDS",
    required: true,
    sortOrder: 0,
    values: [
      { id: "standard", label: "Standard", value: "standard", priceMod: 1, sortOrder: 0, meta: { default: true } },
      { id: "foil", label: "Foil", value: "foil", priceMod: 1, sortOrder: 1, meta: {} },
    ],
  },
  {
    id: "shape",
    key: "attr3",
    label: "Shape",
    uiType: "SELECT",
    required: true,
    sortOrder: 1,
    meta: { defaultsByProduct: { standard: "square", foil: "round" } },
    values: [
      { id: "square", label: "Square", value: "square", priceMod: 1, sortOrder: 0, meta: { allowedLinkedValues: ["standard"] } },
      { id: "round", label: "Round", value: "round", priceMod: 1, sortOrder: 1, meta: { allowedLinkedValues: ["standard", "foil"] } },
    ],
  },
  {
    id: "corners",
    key: "attr643",
    label: "Rounded Corners",
    uiType: "SELECT",
    required: true,
    sortOrder: 2,
    meta: { defaultsByProduct: { standard: "no", foil: "yes" } },
    values: [
      { id: "no", label: "No", value: "no", priceMod: 1, sortOrder: 0, meta: { allowedLinkedValues: ["standard"] } },
      {
        id: "yes",
        label: "Yes",
        value: "yes",
        priceMod: 1,
        sortOrder: 1,
        meta: {
          allowedLinkedValues: ["standard", "foil"],
          exclusionRulesByProduct: { standard: [{ attr3: "square" }] },
        },
      },
    ],
  },
];

const defaults = importedDefaultSelections(options);
assert.deepEqual(defaults, {
  attr0: "standard",
  attr3: "square",
  attr643: "no",
});
const rounded = visibleImportedOptions(options, defaults).find(
  (group) => group.key === "attr643",
);
assert.deepEqual(rounded.values.map((value) => value.label), ["No"]);

const foil = normalizeImportedSelections(
  options,
  { ...defaults, attr0: "foil" },
  "attr0",
);
assert.deepEqual(foil, {
  attr0: "foil",
  attr3: "round",
  attr643: "yes",
});

console.log("Imported product rule tests passed.");
