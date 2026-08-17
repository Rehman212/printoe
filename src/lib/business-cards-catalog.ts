export type BcField = {
  key: string;
  label: string;
  helpText?: string;
  /** Static text instead of dropdown */
  readonly?: boolean;
  options: { label: string; value: string }[];
};

export type BcProduct = {
  slug: string;
  name: string;
  section: "popular" | "premium" | "shape";
  rating: number;
  reviews: number;
  basePrice: number;
  images: string[];
  features: string[];
  /** Show Standard / Die-Cut / Foil / Plastic / Silk type switcher */
  showTypeTabs?: boolean;
  fields: BcField[];
};

const BC_IMGS = [
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
];

function opts(...labels: string[]) {
  return labels.map((label) => ({ label, value: label }));
}

const QTY = [
  "25",
  "50",
  "100",
  "250",
  "500",
  "1000",
  "2500",
  "5000",
].map((v) => ({ label: Number(v).toLocaleString(), value: v }));

const TURNAROUND = [
  "6 Business Days",
  "4 Business Days",
  "3 Business Days",
  "2 Business Days",
  "Next Business Day",
].map((label) => ({ label, value: label }));

const PAPER = opts(
  "14 pt. Cardstock Gloss",
  "14 pt. Cardstock Matte",
  "16 pt. Cardstock Gloss",
  "16 pt. Soft Touch",
  "18 pt. Cardstock Gloss",
  "100 lb. Cover Uncoated",
);

const PRINTED = opts("Front Only", "Front and Back");
const BUNDLING = opts("None", "25 per pack", "50 per pack", "100 per pack");
const ROUNDED = opts("No", "Yes");

/** Grouped flyout for Popular Products → Business Cards */
export const BUSINESS_CARDS_FLYOUT_SECTIONS: {
  title: string;
  items: { label: string; href: string; slug: string }[];
}[] = [
  {
    title: "Popular",
    items: [
      { label: "Standard", href: "/products/standard-business-cards", slug: "standard" },
      { label: "Square", href: "/products/square-business-cards", slug: "square" },
      {
        label: "Rounded Corner",
        href: "/products/rounded-corner-business-cards",
        slug: "rounded-corner",
      },
    ],
  },
  {
    title: "Premium",
    items: [
      { label: "Foil", href: "/products/foil-business-cards", slug: "foil" },
      { label: "Metal", href: "/products/metal-business-cards", slug: "metal" },
      {
        label: "Metallic Print",
        href: "/products/metallic-print-business-cards",
        slug: "metallic-print",
      },
      { label: "Plastic", href: "/products/plastic-business-cards", slug: "plastic" },
      {
        label: "Painted Edge",
        href: "/products/painted-edge-business-cards",
        slug: "painted-edge",
      },
      {
        label: "Raised Foil",
        href: "/products/raised-foil-business-cards",
        slug: "raised-foil",
      },
      {
        label: "Raised Spot UV",
        href: "/products/raised-spot-uv-business-cards",
        slug: "raised-spot-uv",
      },
      { label: "Silk", href: "/products/silk-business-cards", slug: "silk" },
      { label: "Spot UV", href: "/products/spot-uv-business-cards", slug: "spot-uv" },
      { label: "Velvet", href: "/products/velvet-business-cards", slug: "velvet" },
    ],
  },
  {
    title: "Shape",
    items: [
      { label: "Slim", href: "/products/slim-business-cards", slug: "slim" },
      {
        label: "Square Rounded Corner",
        href: "/products/square-rounded-corner-business-cards",
        slug: "square-rounded-corner",
      },
      { label: "Folded", href: "/products/folded-business-cards", slug: "folded" },
      { label: "Leaf", href: "/products/leaf-business-cards", slug: "leaf" },
      {
        label: "Slim Rounded Corner",
        href: "/products/slim-rounded-corner-business-cards",
        slug: "slim-rounded-corner",
      },
      { label: "Circle", href: "/products/circle-business-cards", slug: "circle" },
      {
        label: "Half-Circle",
        href: "/products/half-circle-business-cards",
        slug: "half-circle",
      },
      { label: "Oval", href: "/products/oval-business-cards", slug: "oval" },
      {
        label: "Single Rounded Corner",
        href: "/products/single-rounded-corner-business-cards",
        slug: "single-rounded-corner",
      },
      {
        label: "Die-Cut",
        href: "/products/die-cut-business-cards",
        slug: "die-cut",
      },
    ],
  },
];

export const BUSINESS_CARDS_FLYOUT = BUSINESS_CARDS_FLYOUT_SECTIONS.flatMap(
  (s) => s.items.map((i) => ({ label: i.label, href: i.href })),
);

/** Type switcher on Standard-style pages */
export const BC_TYPE_TABS = [
  { slug: "standard", label: "Standard", href: "/products/business-cards/standard" },
  { slug: "rounded-corner", label: "Die-Cut", href: "/products/business-cards/rounded-corner" },
  { slug: "foil", label: "Foil", href: "/products/business-cards/foil" },
  { slug: "plastic", label: "Plastic", href: "/products/business-cards/plastic" },
  { slug: "silk", label: "Silk", href: "/products/business-cards/silk" },
] as const;

function baseFields(
  sizeDefault: string,
  extras: BcField[] = [],
): BcField[] {
  return [
    {
      key: "size",
      label: "Size",
      helpText: "Enter Custom Dimension",
      options: opts(
        sizeDefault,
        '2" x 3.5" (U.S. Standard)',
        '2.5" x 2.5" (Square)',
        '3.5" x 1.5" (Slim)',
        "Custom Size",
      ),
    },
    ...extras,
    {
      key: "roundedCorners",
      label: "Rounded Corners",
      helpText: "Apply rounded corner finishing.",
      options: ROUNDED,
    },
    { key: "printedSide", label: "Printed Side", options: PRINTED },
    {
      key: "bundling",
      label: "Bundling",
      helpText: "How finished cards are packaged.",
      options: BUNDLING,
    },
    { key: "paperType", label: "Paper Type", options: PAPER },
    { key: "quantity", label: "Quantity", options: QTY },
    { key: "turnaround", label: "Printing Time", options: TURNAROUND },
  ];
}

function card(
  slug: string,
  name: string,
  section: BcProduct["section"],
  price: number,
  features: string[],
  optsCfg: {
    size: string;
    showTypeTabs?: boolean;
    rating?: number;
    reviews?: number;
    img?: number;
    fields?: BcField[];
    roundedDefault?: string;
  },
): BcProduct {
  const img = optsCfg.img ?? 0;
  return {
    slug,
    name,
    section,
    rating: optsCfg.rating ?? 4.3,
    reviews: optsCfg.reviews ?? 1904,
    basePrice: price,
    images: [
      BC_IMGS[img % BC_IMGS.length]!,
      BC_IMGS[(img + 1) % BC_IMGS.length]!,
      BC_IMGS[(img + 2) % BC_IMGS.length]!,
      BC_IMGS[(img + 3) % BC_IMGS.length]!,
    ],
    features,
    showTypeTabs: optsCfg.showTypeTabs,
    fields:
      optsCfg.fields ??
      baseFields(optsCfg.size).map((f) => {
        if (f.key === "roundedCorners" && optsCfg.roundedDefault) {
          return { ...f, options: ROUNDED };
        }
        return f;
      }),
  };
}

export const BUSINESS_CARD_PRODUCTS: Record<string, BcProduct> = {
  standard: card(
    "standard",
    "Standard Business Cards",
    "popular",
    32.12,
    [
      'Standard 3.5" x 2" business card size + other sizes',
      "Thick, premium cardstock",
    ],
    {
      size: '2" x 3.5" (U.S. Standard)',
      showTypeTabs: true,
      rating: 4.3,
      reviews: 1904,
      img: 0,
    },
  ),
  square: card(
    "square",
    "Square Business Cards",
    "popular",
    42.92,
    [
      "Modern and functional design",
      "Choose cardstock thickness",
      "Print front and back or front only",
    ],
    {
      size: '2.5" x 2.5" (Square)',
      rating: 4.2,
      reviews: 292,
      img: 1,
    },
  ),
  "rounded-corner": {
    slug: "rounded-corner",
    name: "Rounded Corner Business Cards",
    section: "popular",
    rating: 4.1,
    reviews: 89,
    basePrice: 37.24,
    images: [BC_IMGS[2]!, BC_IMGS[0]!, BC_IMGS[1]!, BC_IMGS[3]!],
    features: [
      "Unique, eye-catching shapes",
      "Vibrant full-color printing",
      "Printed on thick, premium cardstock",
    ],
    showTypeTabs: true,
    fields: [
      {
        key: "size",
        label: "Size",
        readonly: true,
        options: opts('2" x 3.5" (U.S. Standard)'),
      },
      {
        key: "shape",
        label: "Shape",
        readonly: true,
        options: opts("Rectangle/Square (Rounded Corners)"),
      },
      { key: "printedSide", label: "Printed Side", options: PRINTED },
      { key: "foil", label: "Foil", options: opts("None", "Gold", "Silver", "Rose Gold") },
      { key: "spotUv", label: "Spot UV", options: opts("No", "Yes") },
      { key: "paperType", label: "Paper Type", options: PAPER },
      { key: "quantity", label: "Quantity", options: QTY },
      { key: "turnaround", label: "Printing Time", options: TURNAROUND },
    ],
  },
  foil: card("foil", "Foil Business Cards", "premium", 68.5, [
    "Metallic foil accents for a premium look",
    "Multiple foil color options",
    "Thick cardstock substrates",
  ], { size: '2" x 3.5" (U.S. Standard)', showTypeTabs: true, img: 2, rating: 4.6, reviews: 410 }),
  metal: card("metal", "Metal Business Cards", "premium", 189.0, [
    "Durable metal cards that stand out",
    "Engraved or printed finishes",
    "Ideal for luxury brands",
  ], { size: '2" x 3.5" (U.S. Standard)', img: 3, rating: 4.8, reviews: 76 }),
  "metallic-print": card(
    "metallic-print",
    "Metallic Print Business Cards",
    "premium",
    54.0,
    [
      "Shimmer metallic inks",
      "Full-color CMYK + metallic",
      "Premium cardstock options",
    ],
    { size: '2" x 3.5" (U.S. Standard)', img: 4, rating: 4.4, reviews: 120 },
  ),
  plastic: card("plastic", "Plastic Business Cards", "premium", 79.0, [
    "Waterproof plastic cards",
    "Crystal clear or opaque whites",
    "Long-lasting durability",
  ], { size: '2" x 3.5" (U.S. Standard)', showTypeTabs: true, img: 5, rating: 4.5, reviews: 210 }),
  "painted-edge": card(
    "painted-edge",
    "Painted Edge Business Cards",
    "premium",
    62.0,
    [
      "Colored edge painting for a bold look",
      "Multiple edge color choices",
      "Thick cardstock",
    ],
    { size: '2" x 3.5" (U.S. Standard)', img: 0, rating: 4.7, reviews: 95 },
  ),
  "raised-foil": card(
    "raised-foil",
    "Raised Foil Business Cards",
    "premium",
    88.0,
    [
      "Tactile raised foil details",
      "Gold, silver, and specialty foils",
      "Soft-touch and gloss stocks",
    ],
    { size: '2" x 3.5" (U.S. Standard)', img: 1, rating: 4.6, reviews: 140 },
  ),
  "raised-spot-uv": card(
    "raised-spot-uv",
    "Raised Spot UV Business Cards",
    "premium",
    72.0,
    [
      "Raised UV coating for texture and shine",
      "Highlight logos and type",
      "Premium soft-touch options",
    ],
    { size: '2" x 3.5" (U.S. Standard)', img: 2, rating: 4.5, reviews: 160 },
  ),
  silk: card("silk", "Silk Business Cards", "premium", 48.0, [
    "Soft-touch silk laminate",
    "Fingerprint-resistant finish",
    "Luxury brand first impressions",
  ], { size: '2" x 3.5" (U.S. Standard)', showTypeTabs: true, img: 3, rating: 4.9, reviews: 1284 }),
  "spot-uv": card("spot-uv", "Spot UV Business Cards", "premium", 58.0, [
    "High-gloss spot UV accents",
    "Contrast with matte backgrounds",
    "Thick premium stocks",
  ], { size: '2" x 3.5" (U.S. Standard)', img: 4, rating: 4.6, reviews: 330 }),
  velvet: card("velvet", "Velvet Business Cards", "premium", 64.0, [
    "Ultra-soft velvet laminate",
    "Rich color reproduction",
    "Memorable tactile finish",
  ], { size: '2" x 3.5" (U.S. Standard)', img: 5, rating: 4.7, reviews: 188 }),
  slim: card("slim", "Slim Business Cards", "shape", 36.5, [
    "Sleek slim format",
    "Fits modern wallets",
    "Full-color printing",
  ], { size: '3.5" x 1.5" (Slim)', img: 0, rating: 4.3, reviews: 102 }),
  "square-rounded-corner": card(
    "square-rounded-corner",
    "Square Rounded Corner Business Cards",
    "shape",
    46.0,
    [
      "Square format with rounded corners",
      "Modern silhouette",
      "Premium cardstock",
    ],
    {
      size: '2.5" x 2.5" (Square)',
      roundedDefault: "Yes",
      img: 1,
      rating: 4.2,
      reviews: 74,
    },
  ),
  folded: card("folded", "Folded Business Cards", "shape", 52.0, [
    "Folded cards with extra panel space",
    "Great for menus and offers",
    "Multiple fold styles",
  ], { size: '2" x 3.5" (U.S. Standard)', img: 2, rating: 4.4, reviews: 58 }),
  leaf: card("leaf", "Leaf Business Cards", "shape", 49.0, [
    "Distinctive leaf-shaped die-cut",
    "Stand out from standard rectangles",
    "Full-color printing",
  ], { size: "Leaf Die-Cut", img: 3, rating: 4.1, reviews: 41 }),
  "slim-rounded-corner": card(
    "slim-rounded-corner",
    "Slim Rounded Corner Business Cards",
    "shape",
    39.5,
    [
      "Slim profile with soft rounded corners",
      "Premium cardstock options",
      "Front and back printing",
    ],
    {
      size: '3.5" x 1.5" (Slim)',
      roundedDefault: "Yes",
      img: 4,
      rating: 4.3,
      reviews: 66,
    },
  ),
  circle: card("circle", "Circle Business Cards", "shape", 44.0, [
    "Round die-cut business cards",
    "Unique and memorable shape",
    "Thick premium stocks",
  ], { size: '2.5" Diameter (Circle)', img: 5, rating: 4.2, reviews: 83 }),
  "half-circle": card(
    "half-circle",
    "Half-Circle Business Cards",
    "shape",
    46.5,
    [
      "Distinctive half-circle die-cut",
      "Memorable silhouette for networking",
      "Full-color printing on premium stock",
    ],
    { size: '3.5" x 2" (Half-Circle)', img: 0, rating: 4.1, reviews: 37 },
  ),
  oval: card("oval", "Oval Business Cards", "shape", 45.0, [
    "Smooth oval die-cut profile",
    "Soft, modern look that stands out",
    "Thick premium cardstock options",
  ], { size: '3.5" x 2" (Oval)', img: 1, rating: 4.2, reviews: 52 }),
  "single-rounded-corner": card(
    "single-rounded-corner",
    "Single Rounded Corner Business Cards",
    "shape",
    38.5,
    [
      "One rounded corner for a subtle twist",
      "Standard wallet-friendly size",
      "Premium cardstock printing",
    ],
    {
      size: '2" x 3.5" (U.S. Standard)',
      roundedDefault: "Yes",
      img: 2,
      rating: 4.0,
      reviews: 29,
    },
  ),
  "die-cut": card("die-cut", "Die-Cut Business Cards", "shape", 54.0, [
    "Custom contour die-cut to your artwork",
    "Unique shapes beyond standard rectangles",
    "Vibrant full-color printing",
  ], { size: "Custom Die-Cut", img: 3, rating: 4.4, reviews: 118 }),
};

export function getBusinessCardProduct(slug: string): BcProduct | null {
  return BUSINESS_CARD_PRODUCTS[slug] ?? null;
}

export function estimateBusinessCardPrice(
  product: BcProduct,
  selections: Record<string, string>,
): number {
  const qty = Number(selections.quantity) || 250;
  let mult = qty / 250;
  if (selections.printedSide?.toLowerCase().includes("back")) mult *= 1.35;
  if (selections.paperType?.toLowerCase().includes("soft")) mult *= 1.15;
  if (selections.paperType?.toLowerCase().includes("18")) mult *= 1.2;
  if (selections.foil && selections.foil !== "None") mult *= 1.4;
  if (selections.spotUv === "Yes") mult *= 1.25;
  if (selections.turnaround?.includes("Next")) mult *= 1.45;
  else if (selections.turnaround?.includes("2 Business")) mult *= 1.2;
  return Math.round(product.basePrice * Math.max(0.35, mult) * 100) / 100;
}
