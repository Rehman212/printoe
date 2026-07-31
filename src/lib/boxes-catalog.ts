export type BoxField = {
  key: string;
  label: string;
  helpText?: string;
  options: { label: string; value: string }[];
};

export type BoxProduct = {
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  unitPrice: number;
  caption: string;
  images: string[];
  /** Show Mailer / Product / Shipping switcher tabs */
  showFamilyTabs?: boolean;
  /** Show Length/Width/Depth inputs when size is Custom Size */
  customDimensions?: boolean;
  fields: BoxField[];
};

const BOX_IMGS = [
  "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=1200&q=80",
];

function opts(...labels: string[]) {
  return labels.map((label) => ({ label, value: label }));
}

const QTY = ["25", "50", "75", "100", "150", "200", "250", "500", "1000"].map(
  (v) => ({ label: v, value: v }),
);

/** Popular Products → Boxes flyout (UPrinting order). */
export const BOXES_FLYOUT: { label: string; href: string; slug: string }[] = [
  { label: "Mailer Boxes", href: "/products/boxes/mailer-boxes", slug: "mailer-boxes" },
  { label: "Product Boxes", href: "/products/boxes/product-boxes", slug: "product-boxes" },
  { label: "Shipping Boxes", href: "/products/boxes/shipping-boxes", slug: "shipping-boxes" },
  { label: "Folding Cartons", href: "/products/boxes/folding-cartons", slug: "folding-cartons" },
  { label: "Wine Mailer Boxes", href: "/products/boxes/wine-mailer-boxes", slug: "wine-mailer-boxes" },
];

/** Family tabs shown on Mailer / Product / Shipping pages. */
export const BOX_FAMILY_TABS = [
  { slug: "mailer-boxes", label: "Mailer Boxes", href: "/products/boxes/mailer-boxes" },
  { slug: "product-boxes", label: "Product Boxes", href: "/products/boxes/product-boxes" },
  { slug: "shipping-boxes", label: "Shipping Boxes", href: "/products/boxes/shipping-boxes" },
] as const;

export const BOX_PRODUCTS: Record<string, BoxProduct> = {
  "mailer-boxes": {
    slug: "mailer-boxes",
    name: "Mailer Boxes",
    rating: 4.3,
    reviews: 347,
    unitPrice: 5.4,
    caption:
      "Easy to assemble mailer boxes deliver your products with style and protection.",
    images: [BOX_IMGS[0]!, BOX_IMGS[1]!, BOX_IMGS[2]!, BOX_IMGS[3]!],
    showFamilyTabs: true,
    fields: [
      {
        key: "printing",
        label: "Printing",
        helpText: "Choose print coverage for your box.",
        options: opts("Full Color", "1 Color", "2 Color", "Blank (No Printing)"),
      },
      {
        key: "size",
        label: "Size (L x W x D)",
        helpText: "Interior dimensions of the assembled box.",
        options: opts(
          '6" x 4" x 2"',
          '8" x 6" x 3"',
          '10" x 8" x 4"',
          '12" x 9" x 4"',
          '12" x 12" x 6"',
          "Custom Size",
        ),
      },
      {
        key: "material",
        label: "Material",
        helpText: "Board grade and ink finish.",
        options: opts(
          "Standard White with Matte Ink (HD Print)",
          "Standard White with Gloss Ink",
          "Kraft with Matte Ink",
          "Kraft Unprinted",
        ),
      },
      {
        key: "printedSides",
        label: "Printed Sides",
        options: opts("Outside", "Outside & Inside", "Inside Only"),
      },
      { key: "quantity", label: "Quantity", options: QTY },
    ],
  },
  "product-boxes": {
    slug: "product-boxes",
    name: "Custom Product Boxes",
    rating: 3.9,
    reviews: 47,
    unitPrice: 2.85,
    caption:
      "Retail-ready product boxes with custom sizes, materials, and full-color branding.",
    images: [BOX_IMGS[4]!, BOX_IMGS[5]!, BOX_IMGS[0]!, BOX_IMGS[1]!],
    showFamilyTabs: true,
    customDimensions: true,
    fields: [
      {
        key: "boxType",
        label: "Box Type",
        options: opts("Cardstock", "Corrugated", "Rigid"),
      },
      {
        key: "size",
        label: "Size",
        options: opts(
          "Custom Size",
          '4" x 4" x 4"',
          '6" x 4" x 2"',
          '8" x 6" x 3"',
          '10" x 8" x 4"',
        ),
      },
      {
        key: "material",
        label: "Material",
        options: opts(
          "18pt Cardstock",
          "24pt Cardstock",
          "E-Flute Corrugated",
          "B-Flute Corrugated",
        ),
      },
      {
        key: "printedSides",
        label: "Printed Sides",
        options: opts("Outside", "Outside & Inside"),
      },
      { key: "quantity", label: "Quantity", options: QTY },
    ],
  },
  "shipping-boxes": {
    slug: "shipping-boxes",
    name: "Shipping Boxes",
    rating: 4.5,
    reviews: 128,
    unitPrice: 1.95,
    caption:
      "Sturdy corrugated shipping boxes built for transit — brand the outside for unboxing impact.",
    images: [BOX_IMGS[2]!, BOX_IMGS[3]!, BOX_IMGS[4]!, BOX_IMGS[5]!],
    showFamilyTabs: true,
    customDimensions: true,
    fields: [
      {
        key: "boxType",
        label: "Box Type",
        options: opts("RSC Shipping", "FOL Shipping", "Telescope"),
      },
      {
        key: "size",
        label: "Size",
        options: opts(
          "Custom Size",
          '12" x 9" x 6"',
          '14" x 10" x 8"',
          '16" x 12" x 10"',
          '18" x 14" x 12"',
        ),
      },
      {
        key: "material",
        label: "Material",
        options: opts(
          "32 ECT Corrugated",
          "44 ECT Corrugated",
          "E-Flute Corrugated",
        ),
      },
      {
        key: "printedSides",
        label: "Printed Sides",
        options: opts("Outside", "Blank (No Printing)"),
      },
      { key: "quantity", label: "Quantity", options: QTY },
    ],
  },
  "folding-cartons": {
    slug: "folding-cartons",
    name: "Folding Cartons",
    rating: 4.6,
    reviews: 89,
    unitPrice: 1.25,
    caption:
      "Lightweight folding cartons for retail packaging, cosmetics, and small goods.",
    images: [BOX_IMGS[1]!, BOX_IMGS[0]!, BOX_IMGS[5]!, BOX_IMGS[4]!],
    fields: [
      {
        key: "printing",
        label: "Printing",
        options: opts("Full Color", "1 Color", "Blank (No Printing)"),
      },
      {
        key: "size",
        label: "Size (L x W x D)",
        options: opts(
          '3" x 2" x 5"',
          '4" x 2" x 6"',
          '5" x 3" x 7"',
          "Custom Size",
        ),
      },
      {
        key: "material",
        label: "Material",
        options: opts("14pt Cardstock", "16pt Cardstock", "18pt Cardstock"),
      },
      {
        key: "finish",
        label: "Finish",
        options: opts("Matte", "Gloss", "Soft Touch"),
      },
      { key: "quantity", label: "Quantity", options: QTY },
    ],
  },
  "wine-mailer-boxes": {
    slug: "wine-mailer-boxes",
    name: "Wine Mailer Boxes",
    rating: 4.8,
    reviews: 62,
    unitPrice: 8.75,
    caption:
      "Protective wine and bottle mailers with custom branding for DTC and gift shipping.",
    images: [BOX_IMGS[3]!, BOX_IMGS[2]!, BOX_IMGS[1]!, BOX_IMGS[0]!],
    fields: [
      {
        key: "bottleCount",
        label: "Bottle Capacity",
        options: opts("1 Bottle", "2 Bottles", "3 Bottles", "4 Bottles"),
      },
      {
        key: "printing",
        label: "Printing",
        options: opts("Full Color", "1 Color", "Blank (No Printing)"),
      },
      {
        key: "material",
        label: "Material",
        options: opts(
          "Corrugated White",
          "Corrugated Kraft",
          "Heavy-Duty Corrugated",
        ),
      },
      {
        key: "printedSides",
        label: "Printed Sides",
        options: opts("Outside", "Outside & Inside"),
      },
      { key: "quantity", label: "Quantity", options: QTY },
    ],
  },
};

export function getBoxProduct(slug: string): BoxProduct | null {
  return BOX_PRODUCTS[slug] ?? null;
}

export function estimateBoxPrice(
  product: BoxProduct,
  selections: Record<string, string>,
  dims?: { length: number; width: number; depth: number },
): { unit: number; subtotal: number } {
  const qty = Number(selections.quantity) || 100;
  let mult = 1;
  if (selections.printedSides?.toLowerCase().includes("inside")) mult *= 1.35;
  if (selections.material?.toLowerCase().includes("kraft")) mult *= 0.95;
  if (selections.material?.toLowerCase().includes("gloss")) mult *= 1.08;
  if (selections.material?.toLowerCase().includes("heavy")) mult *= 1.2;
  if (selections.printing?.toLowerCase().includes("blank")) mult *= 0.7;
  if (selections.size === "Custom Size" && dims) {
    const volume = Math.max(1, dims.length * dims.width * dims.depth);
    mult *= 1 + Math.min(1.5, volume / 800);
  }
  const unit = Math.round(product.unitPrice * mult * 100) / 100;
  const subtotal = Math.round(unit * qty * 100) / 100;
  return { unit, subtotal };
}
