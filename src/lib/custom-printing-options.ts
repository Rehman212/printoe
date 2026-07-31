/** Option sets mirroring UPrinting Custom Product Builder (Offset / Signs). */

export type BuilderMode = "offset" | "signs";

export type BuilderField = {
  key: string;
  label: string;
  helpText: string;
  options: { label: string; value: string }[];
  /** Show only for these modes; omit = both */
  modes?: BuilderMode[];
};

function inchOptions(min: number, max: number, step = 0.25) {
  const opts: { label: string; value: string }[] = [];
  for (let n = min; n <= max + 1e-9; n += step) {
    const v = Number(n.toFixed(2)).toString().replace(/\.?0+$/, "") || "0";
    const label = `${v}"`;
    opts.push({ label, value: v });
  }
  return opts;
}

const WIDTH_OPTS = inchOptions(2, 26);
const HEIGHT_OPTS = inchOptions(2, 18);

const OFFSET_PAPER = [
  "10 pt. Cardstock Gloss",
  "10 pt. Cardstock Matte",
  "10 pt. Cardstock Uncoated",
  "12 pt. Cardstock Gloss",
  "12 pt. Cardstock Matte",
  "14 pt. Cardstock Gloss",
  "14 pt. Cardstock Matte",
  "14 pt. Cardstock Uncoated",
  "14 pt. Cardstock High Gloss (UV)",
  "16 pt. Cardstock Gloss",
  "16 pt. Cardstock Matte",
  "17 pt. Cardstock Uncoated",
  "80 lb. Paper Gloss",
  "80 lb. Paper Matte",
  "100 lb. Paper Gloss",
  "100 lb. Paper Matte",
  "Matte White Paper",
  "Gloss White Paper",
  "Matte White BOPP",
  "Gloss White Outdoor BOPP",
].map((label) => ({ label, value: label }));

const SIGNS_MATERIAL = [
  '3/16" Corrugated Plastic',
  "White PVC Board",
  "20 mil. Styrene",
  "4mm Coroplast",
  "Acrylic",
  "Vinyl Banner",
  "Fabric Banner",
  "Foam Board",
].map((label) => ({ label, value: label }));

const FOLDING = [
  "None",
  "Half Fold",
  "Half Fold (with scoring)",
  "Half Fold (scored only)",
  "Tri-Fold/Letter Fold",
  "Z-Fold",
  "Gate Fold",
  "Tri-Fold/Letter Fold (with scoring)",
  "Z-Fold (with scoring)",
  "Gate Fold (with scoring)",
  "Accordion Fold (4 panels)",
  "Double Gate Fold",
  "Double Parallel Fold",
  "French Fold",
  "Roll Fold (4 panels)",
].map((label) => ({ label, value: label }));

const PRINTED_SIDE = [
  "Front Only",
  "Front and Back",
  "Outside Only",
  "Outside and Inside",
].map((label) => ({ label, value: label }));

const PERFORATION = [
  "None",
  "1 Line",
  "2 Parallel Lines",
  "3 Parallel Lines",
].map((label) => ({ label, value: label }));

const ROUNDED = [
  { label: "None", value: "None" },
  { label: "Yes", value: "Yes" },
];

const HOLE = [
  { label: "None", value: "None" },
  { label: '1/8"', value: "1/8" },
  { label: '3/16"', value: "3/16" },
  { label: '1/4"', value: "1/4" },
];

const HOLE_LOCATION = [
  "Top-Left",
  "Top-Center",
  "Top-Right",
  "Left-Center",
  "Right-Center",
  "Bottom-Left",
  "Bottom-Center",
  "Bottom-Right",
].map((label) => ({ label, value: label }));

const BUNDLING = [
  { label: "None", value: "None" },
  { label: "Shrink Wrapping", value: "Shrink Wrapping" },
];

const QUANTITY = [
  "25",
  "50",
  "75",
  "100",
  "150",
  "200",
  "250",
  "500",
  "1000",
  "2000",
  "5000",
  "10000",
].map((v) => ({
  label: Number(v).toLocaleString(),
  value: v,
}));

const TURNAROUND = [
  "6 Business Days",
  "4 Business Days",
  "3 Business Days",
  "2 Business Days",
  "Next Business Day",
].map((label) => ({ label, value: label }));

export const BUILDER_FEATURES = [
  "Set any custom size by entering your width × height",
  "Multiple paper and cardstock options for different use cases",
  "4 finish options: gloss, matte, uncoated, and UV coating",
  "Optional folding and scoring for brochures, flyers, and handouts",
];

export const BUILDER_FIELDS: BuilderField[] = [
  {
    key: "width",
    label: "Width",
    helpText: "Choose width in inches (2\"–26\").",
    options: WIDTH_OPTS,
  },
  {
    key: "height",
    label: "Height",
    helpText: "Choose height in inches (2\"–18\").",
    options: HEIGHT_OPTS,
  },
  {
    key: "paper",
    label: "Paper Type",
    helpText: "Select paper or cardstock for offset printing.",
    options: OFFSET_PAPER,
    modes: ["offset"],
  },
  {
    key: "material",
    label: "Material",
    helpText: "Select substrate for signs and large-format prints.",
    options: SIGNS_MATERIAL,
    modes: ["signs"],
  },
  {
    key: "folding",
    label: "Folding",
    helpText: "Optional folding and scoring options.",
    options: FOLDING,
    modes: ["offset"],
  },
  {
    key: "printedSide",
    label: "Printed Side",
    helpText: "Single- or double-sided printing.",
    options: PRINTED_SIDE,
  },
  {
    key: "perforation",
    label: "Perforation",
    helpText: "Add tear-off perforation lines.",
    options: PERFORATION,
    modes: ["offset"],
  },
  {
    key: "roundedCorners",
    label: "Rounded Corners",
    helpText: "Apply rounded corner finishing.",
    options: ROUNDED,
    modes: ["offset"],
  },
  {
    key: "holeDrilling",
    label: "Hole Drilling",
    helpText: "Optional drill holes for hanging.",
    options: HOLE,
  },
  {
    key: "holeLocation",
    label: "Hole Location",
    helpText: "Where holes are placed when drilling is selected.",
    options: HOLE_LOCATION,
  },
  {
    key: "bundling",
    label: "Bundling",
    helpText: "How finished pieces are packaged.",
    options: BUNDLING,
  },
  {
    key: "quantity",
    label: "Quantity",
    helpText: "Order quantity.",
    options: QUANTITY,
  },
  {
    key: "turnaround",
    label: "Turnaround",
    helpText: "Production turnaround time.",
    options: TURNAROUND,
  },
];

export function defaultBuilderSelections(mode: BuilderMode): Record<string, string> {
  const fields = BUILDER_FIELDS.filter(
    (f) => !f.modes || f.modes.includes(mode),
  );
  const sel: Record<string, string> = {};
  for (const f of fields) {
    sel[f.key] = f.options[0]?.value ?? "";
  }
  // Match UPrinting screenshot defaults
  if (sel.width) sel.width = "2";
  if (sel.height) sel.height = "2";
  if (mode === "offset" && sel.paper) sel.paper = "14 pt. Cardstock Gloss";
  if (sel.quantity) sel.quantity = "250";
  return sel;
}

/** Simple estimate so the calculator feels live (not inventing a full pricing engine). */
export function estimateBuilderPrice(
  mode: BuilderMode,
  selections: Record<string, string>,
): number {
  const qty = Number(selections.quantity) || 250;
  const w = Number(selections.width) || 2;
  const h = Number(selections.height) || 2;
  const area = w * h;
  const base = mode === "signs" ? 0.12 : 0.045;
  const sides =
    selections.printedSide?.toLowerCase().includes("back") ||
    selections.printedSide?.toLowerCase().includes("inside")
      ? 1.55
      : 1;
  const rush = selections.turnaround?.includes("Next")
    ? 1.45
    : selections.turnaround?.includes("2 Business")
      ? 1.25
      : 1;
  return Math.max(19.99, Math.round(qty * area * base * sides * rush * 100) / 100);
}
