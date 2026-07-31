export type BannerField = {
  key: string;
  label: string;
  helpText?: string;
  options: { label: string; value: string }[];
};

export type BannerStyleOption = {
  id: string;
  label: string;
};

export type BannerProduct = {
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  basePrice: number;
  images: string[];
  features: string[];
  /** Card-style selector (e.g. Retractable: Standard / Premium / Deluxe / Outdoor) */
  styleOptions?: BannerStyleOption[];
  fields: BannerField[];
};

const BANNER_IMGS = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
];

const QTY = ["1", "2", "3", "4", "5", "10", "15", "20", "25", "50"].map((v) => ({
  label: v,
  value: v,
}));

const TURNAROUND = [
  "6 Business Days",
  "4 Business Days",
  "3 Business Days",
  "2 Business Days",
  "Next Business Day",
].map((label) => ({ label, value: label }));

function opts(...labels: string[]) {
  return labels.map((label) => ({ label, value: label }));
}

/** Popular Products → Banners flyout (UPrinting order). */
export const BANNERS_FLYOUT: { label: string; href: string }[] = [
  { label: "Vinyl Banners", href: "/products/banners/vinyl-banners" },
  { label: "Retractable Banners", href: "/products/banners/retractable-banners" },
  { label: "X Banner Stands", href: "/products/banners/x-banner-stands" },
  { label: "Table Banners", href: "/products/banners/table-banners" },
  { label: "Step and Repeat Banners", href: "/products/banners/step-and-repeat-banners" },
  { label: "Mesh Banners", href: "/products/banners/mesh-banners" },
  { label: "Pole Banners", href: "/products/banners/pole-banners" },
  { label: "Fabric Banners", href: "/products/banners/fabric-banners" },
  { label: "Table Top Banners", href: "/products/banners/table-top-banners" },
  { label: "Deluxe Retractable Banners", href: "/products/banners/deluxe-retractable-banners" },
  { label: "Premium Retractable Banners", href: "/products/banners/premium-retractable-banners" },
  { label: "Straight Tension Fabric Display", href: "/products/banners/straight-tension-fabric-display" },
  { label: "Curved Tension Fabric Display", href: "/products/banners/curved-tension-fabric-display" },
  { label: "Tension Fabric Banners", href: "/products/banners/tension-fabric-banners" },
  { label: "Backdrops", href: "/products/banners/backdrops" },
  { label: "Curved Pop-Up Display", href: "/products/banners/curved-pop-up-display" },
];

const VINYL_SIZES = opts(
  "2 ft. x 2 ft.",
  "3 ft. x 2 ft.",
  "4 ft. x 2 ft.",
  "5 ft. x 2 ft.",
  "6 ft. x 2.5 ft.",
  "8 ft. x 3 ft.",
  "10 ft. x 3 ft.",
  "10 ft. x 4 ft.",
  "Custom Size",
);

function vinylLike(
  slug: string,
  name: string,
  price: number,
  features: string[],
  materials: string[],
  imgOffset = 0,
): BannerProduct {
  return {
    slug,
    name,
    rating: 4.7,
    reviews: 1639,
    basePrice: price,
    images: [
      BANNER_IMGS[imgOffset % BANNER_IMGS.length]!,
      BANNER_IMGS[(imgOffset + 1) % BANNER_IMGS.length]!,
      BANNER_IMGS[(imgOffset + 2) % BANNER_IMGS.length]!,
      BANNER_IMGS[(imgOffset + 3) % BANNER_IMGS.length]!,
    ],
    features,
    fields: [
      { key: "size", label: "Size", helpText: "Choose a standard or custom size.", options: VINYL_SIZES },
      {
        key: "printedSide",
        label: "Printed Side",
        helpText: "Single- or double-sided printing.",
        options: opts("Front Only", "Front and Back"),
      },
      {
        key: "material",
        label: "Material",
        helpText: "Vinyl weight and finish for indoor/outdoor use.",
        options: opts(...materials),
      },
      {
        key: "hemming",
        label: "Hemming",
        helpText: "Reinforced edges for durability.",
        options: opts("None", "All Sides", "Top & Bottom", "Left & Right"),
      },
      {
        key: "polePocket",
        label: "Pole Pocket",
        helpText: "Optional pockets for hanging on poles.",
        options: opts("None", "Top", "Bottom", "Top & Bottom"),
      },
      {
        key: "grommets",
        label: "Grommets",
        helpText: "Metal grommets for tying or hanging.",
        options: opts("None", "Every 2 ft.", "Every 3 ft.", "Corners Only"),
      },
      { key: "quantity", label: "Quantity", options: QTY },
      {
        key: "turnaround",
        label: "Printing Time",
        helpText: "Production turnaround.",
        options: TURNAROUND,
      },
    ],
  };
}

function retractableLike(
  slug: string,
  name: string,
  price: number,
  features: string[],
  withStyles: boolean,
  imgOffset = 1,
): BannerProduct {
  return {
    slug,
    name,
    rating: 4.4,
    reviews: 519,
    basePrice: price,
    images: [
      BANNER_IMGS[imgOffset % BANNER_IMGS.length]!,
      BANNER_IMGS[(imgOffset + 1) % BANNER_IMGS.length]!,
      BANNER_IMGS[(imgOffset + 2) % BANNER_IMGS.length]!,
      BANNER_IMGS[(imgOffset + 3) % BANNER_IMGS.length]!,
    ],
    features,
    styleOptions: withStyles
      ? [
          { id: "standard", label: "Standard" },
          { id: "premium", label: "Premium" },
          { id: "deluxe", label: "Deluxe" },
          { id: "outdoor", label: "Outdoor" },
        ]
      : undefined,
    fields: [
      {
        key: "graphicSize",
        label: "Graphic Size",
        helpText: "Banner graphic dimensions.",
        options: opts('33.5" x 80"', '33.5" x 78"', '47" x 80"', '23.5" x 80"'),
      },
      {
        key: "displayOptions",
        label: "Display Options",
        helpText: "Stand and banner package.",
        options: opts(
          "Stand + 1 Banner (Single Sided)",
          "Stand + 1 Banner (Double Sided)",
          "Banner Only (Single Sided)",
          "Banner Only (Double Sided)",
        ),
      },
      {
        key: "material",
        label: "Material",
        helpText: "Choose vinyl or fabric graphic.",
        options: opts("13 oz Smooth Matte Vinyl", "UV Fabric"),
      },
      { key: "quantity", label: "Quantity", options: QTY },
      {
        key: "turnaround",
        label: "Printing Time",
        options: TURNAROUND,
      },
    ],
  };
}

export const BANNER_PRODUCTS: Record<string, BannerProduct> = {
  "vinyl-banners": vinylLike(
    "vinyl-banners",
    "Vinyl Banners",
    15.8,
    [
      "9 standard sizes plus custom size option",
      "3 vinyl options: standard, heavy-duty, and mesh",
      "No-glare matte finish for clear indoor and outdoor visibility",
    ],
    ["Standard 13 oz. Vinyl", "Heavy-Duty 15 oz. Vinyl", "Mesh Vinyl"],
    0,
  ),
  "retractable-banners": retractableLike(
    "retractable-banners",
    "Retractable Banners",
    111.52,
    [
      "4 banner stand styles: Standard, Premium, Deluxe, and Outdoor",
      "2 material options: smooth matte vinyl or UV fabric",
      "Includes stand and portable carrying case",
    ],
    true,
    1,
  ),
  "x-banner-stands": retractableLike(
    "x-banner-stands",
    "X Banner Stands",
    49.99,
    [
      "Lightweight X-frame display for events and retail",
      "Quick setup with interchangeable graphics",
      "Portable carry bag included",
    ],
    false,
    2,
  ),
  "table-banners": vinylLike(
    "table-banners",
    "Table Banners",
    39.5,
    [
      "Compact banners sized for tabletops and counters",
      "Durable vinyl with clean matte finish",
      "Optional hemming and grommets",
    ],
    ["Standard 13 oz. Vinyl", "Heavy-Duty 15 oz. Vinyl"],
    3,
  ),
  "step-and-repeat-banners": vinylLike(
    "step-and-repeat-banners",
    "Step and Repeat Banners",
    89.0,
    [
      "Large format backdrops for events and photo walls",
      "Logo-ready layouts with consistent repeat patterns",
      "Indoor/outdoor vinyl options",
    ],
    ["Standard 13 oz. Vinyl", "Heavy-Duty 15 oz. Vinyl", "Fabric"],
    4,
  ),
  "mesh-banners": vinylLike(
    "mesh-banners",
    "Mesh Banners",
    42.25,
    [
      "Wind-permeable mesh for outdoor installs",
      "Ideal for fences, scaffolding, and building wraps",
      "Grommets and hemming available",
    ],
    ["Mesh Vinyl", "Heavy-Duty Mesh"],
    5,
  ),
  "pole-banners": vinylLike(
    "pole-banners",
    "Pole Banners",
    55.0,
    [
      "Designed for light poles and street hardware",
      "Weather-resistant materials",
      "Pole pockets and finishing options",
    ],
    ["Standard 13 oz. Vinyl", "Heavy-Duty 15 oz. Vinyl", "Fabric"],
    0,
  ),
  "fabric-banners": vinylLike(
    "fabric-banners",
    "Fabric Banners",
    64.8,
    [
      "Soft fabric look with vibrant color",
      "Great for indoor retail and trade shows",
      "Hemming and pole pocket options",
    ],
    ["Polyester Fabric", "UV Fabric"],
    1,
  ),
  "table-top-banners": retractableLike(
    "table-top-banners",
    "Table Top Banners",
    59.99,
    [
      "Mini retractable displays for desks and counters",
      "Includes stand and graphic",
      "Easy swap graphics",
    ],
    false,
    2,
  ),
  "deluxe-retractable-banners": retractableLike(
    "deluxe-retractable-banners",
    "Deluxe Retractable Banners",
    149.0,
    [
      "Premium deluxe hardware with upgraded base",
      "Smooth matte vinyl or UV fabric graphics",
      "Stand and carrying case included",
    ],
    true,
    3,
  ),
  "premium-retractable-banners": retractableLike(
    "premium-retractable-banners",
    "Premium Retractable Banners",
    135.0,
    [
      "Premium stand construction for frequent use",
      "Vinyl or fabric graphic options",
      "Includes portable carrying case",
    ],
    true,
    4,
  ),
  "straight-tension-fabric-display": retractableLike(
    "straight-tension-fabric-display",
    "Straight Tension Fabric Display",
    289.0,
    [
      "Straight tension fabric backdrop system",
      "Pillowcase-style graphic fit",
      "Ideal for trade shows and lobbies",
    ],
    false,
    5,
  ),
  "curved-tension-fabric-display": retractableLike(
    "curved-tension-fabric-display",
    "Curved Tension Fabric Display",
    319.0,
    [
      "Curved tension fabric display for premium booths",
      "Seamless fabric graphic",
      "Portable frame with soft case options",
    ],
    false,
    0,
  ),
  "tension-fabric-banners": vinylLike(
    "tension-fabric-banners",
    "Tension Fabric Banners",
    120.0,
    [
      "Tensioned fabric for wrinkle-resistant displays",
      "Vibrant indoor color reproduction",
      "Finishing options for hanging hardware",
    ],
    ["Polyester Fabric", "UV Fabric"],
    1,
  ),
  backdrops: vinylLike(
    "backdrops",
    "Backdrops",
    199.0,
    [
      "Large backdrops for photos, stages, and events",
      "Vinyl or fabric material choices",
      "Custom sizes available",
    ],
    ["Standard 13 oz. Vinyl", "Heavy-Duty 15 oz. Vinyl", "Fabric"],
    2,
  ),
  "curved-pop-up-display": retractableLike(
    "curved-pop-up-display",
    "Curved Pop-Up Display",
    399.0,
    [
      "Pop-up curved frame with magnetic graphic panels",
      "Fast setup for exhibits and events",
      "Includes wheeled case options",
    ],
    false,
    3,
  ),
};

export function getBannerProduct(slug: string): BannerProduct | null {
  return BANNER_PRODUCTS[slug] ?? null;
}

export function estimateBannerPrice(
  product: BannerProduct,
  selections: Record<string, string>,
  styleId?: string,
): number {
  const qty = Number(selections.quantity) || 1;
  let mult = 1;
  if (selections.printedSide?.toLowerCase().includes("back")) mult *= 1.55;
  if (selections.material?.toLowerCase().includes("heavy")) mult *= 1.2;
  if (selections.material?.toLowerCase().includes("mesh")) mult *= 1.15;
  if (selections.material?.toLowerCase().includes("fabric")) mult *= 1.25;
  if (selections.turnaround?.includes("Next")) mult *= 1.4;
  else if (selections.turnaround?.includes("2 Business")) mult *= 1.2;
  if (styleId === "premium") mult *= 1.15;
  if (styleId === "deluxe") mult *= 1.3;
  if (styleId === "outdoor") mult *= 1.35;
  return Math.round(product.basePrice * qty * mult * 100) / 100;
}
