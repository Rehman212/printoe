/**
 * Remaining Popular Products flyouts + PDP data
 * (Flyers, Labels, Packaging, Postcards, Promo, Signs, Stickers, Brochures)
 */

export type ShopField = {
  key: string;
  label: string;
  helpText?: string;
  options: { label: string; value: string }[];
};

export type ShopProduct = {
  category: string;
  slug: string;
  name: string;
  rating: number;
  reviews: number;
  basePrice: number;
  images: string[];
  features: string[];
  fields: ShopField[];
};

export type FlyoutSection = {
  title?: string;
  header?: string;
  items: { label: string; href: string; slug: string }[];
};

function opts(...labels: string[]) {
  return labels.map((label) => ({ label, value: label }));
}

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/®/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const QTY = ["25", "50", "100", "250", "500", "1000", "2500"].map((v) => ({
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

const IMGS = [
  "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
];

function product(
  category: string,
  name: string,
  price: number,
  features: string[],
  fieldExtras: ShopField[],
  img = 0,
): ShopProduct {
  const slug = slugify(name);
  return {
    category,
    slug,
    name,
    rating: 4.2 + ((img % 6) * 0.1),
    reviews: 80 + img * 37,
    basePrice: price,
    images: [
      IMGS[img % IMGS.length]!,
      IMGS[(img + 1) % IMGS.length]!,
      IMGS[(img + 2) % IMGS.length]!,
      IMGS[(img + 3) % IMGS.length]!,
    ],
    features,
    fields: [
      ...fieldExtras,
      { key: "quantity", label: "Quantity", options: QTY },
      { key: "turnaround", label: "Printing Time", options: TURNAROUND },
    ],
  };
}

function printFields(sizes: string[], papers: string[]): ShopField[] {
  return [
    { key: "size", label: "Size", options: opts(...sizes, "Custom Size") },
    {
      key: "printedSide",
      label: "Printed Side",
      options: opts("Front Only", "Front and Back"),
    },
    { key: "paperType", label: "Paper / Material", options: opts(...papers) },
    {
      key: "finishing",
      label: "Finishing",
      options: opts("None", "Matte Aqueous", "Gloss Aqueous", "UV Coating"),
    },
  ];
}

function items(
  category: string,
  labels: string[],
): { label: string; href: string; slug: string }[] {
  return labels.map((label) => {
    const slug = slugify(label);
    return {
      label,
      slug,
      href: `/products/${slug}`,
    };
  });
}

/** Grouped / flat flyouts keyed by Popular Products id */
export const SHOP_FLYOUTS: Record<string, FlyoutSection[]> = {
  flyers: [
    {
      items: items("flyers", [
        "Business Flyers",
        "Die-Cut Flyers",
        "Foil Flyers",
        "Silk Flyers",
        "Metallic Flyers",
      ]),
    },
  ],
  brochures: [
    {
      items: items("brochures", [
        "Bi-Fold Brochures",
        "Tri-Fold Brochures",
        "Booklets",
        "Z-Fold Brochures",
        "Gate Fold Brochures",
      ]),
    },
  ],
  labels: [
    {
      header: "Custom Labels",
      title: "Shop by Type",
      items: items("labels", [
        "Roll Labels",
        "Cut-to-size Single Labels",
        "Label Sets",
        "Blank Sheet Labels",
        "Sheet Labels",
      ]),
    },
    {
      title: "Shop by Material",
      items: items("labels", [
        "Vinyl Labels",
        "Clear Labels",
        "Foil Labels",
        "Metallic Labels",
        "Kraft Labels",
        "Waterproof Labels",
      ]),
    },
    {
      title: "Shop by Popular Use",
      items: items("labels", [
        "Address Labels",
        "Beer Labels",
        "Candle Labels",
        "Food Labels",
        "Jar Labels",
        "Lip Balm Labels",
        "QR Code Stickers",
        "Return Address Labels",
        "Name Labels",
        "Shipping and Mailing Labels",
        "Warning Labels",
        "Water Bottle Labels",
        "Wine Labels",
      ]),
    },
  ],
  packaging: [
    {
      items: items("packaging", [
        "Custom Boxes",
        "Custom Packaging Tape",
        "DVD Packaging",
        "Gift Bags",
        "Header Cards",
        "Labels",
        "Packaging Sleeves",
        "Paper Bags",
        "Plastic Bags",
        "Poly Mailers",
        "Poly Packing Tape",
        "Ribbons and Bows",
        "Rigid Mailers",
        "Pouches",
        "Tissue Paper",
        "Wrapping Paper",
      ]),
    },
  ],
  postcards: [
    {
      items: items("postcards", [
        "Standard Postcards",
        "Folded Postcards",
        "Every Door Direct Mail®",
        "Foil Postcards",
        "Spot UV Postcard",
        "Metallic Postcard",
        "Raised Spot UV Postcards",
        "Silk Postcards",
        "Velvet Postcards",
        "Die-Cut Postcards",
      ]),
    },
  ],
  "promotional-products": [
    {
      items: items("promotional-products", [
        "Apparel",
        "Bags & Totes",
        "Bookmarks",
        "Buttons",
        "Calendars",
        "Drinkware",
        "Magnets",
        "Notepads",
        "Pens",
        "Sticky Notes",
      ]),
    },
  ],
  signs: [
    {
      items: items("signs", [
        "Outdoor Signs",
        "A-Frame Signs",
        "Acrylic Signs",
        "Aluminum Signs",
        "Car Magnets",
        "Feather Flags",
        "Foam Boards",
        "Parking Signs",
        "Pole Banners",
        "Poster Signs",
        "Property Signs",
        "Real Estate Signs",
        "Reflective Adhesive Vinyl",
        "Teardrop Flags",
        "Vehicle Decals",
        "Vinyl Banners",
        "Vinyl Lettering",
        "Window Clings",
      ]),
    },
  ],
  stickers: [
    {
      header: "Custom Stickers",
      title: "Shop by Type",
      items: items("stickers", [
        "Sticker Singles",
        "Die-Cut Stickers",
        "Kiss-Cut Stickers",
        "Sticker Sheets",
        "Transfer Stickers",
        "Roll Stickers",
        "DTF Transfers",
      ]),
    },
    {
      title: "Shop by Material",
      items: items("stickers", [
        "Vinyl Stickers",
        "Kraft Stickers",
        "Clear Stickers",
        "Foil Stickers",
        "Metallic Stickers",
        "Rainbow Holographic Stickers",
      ]),
    },
    {
      title: "Shop by Popular Use",
      items: items("stickers", [
        "Bulk Stickers",
        "Bumper Stickers",
        "Campaign & Political Stickers",
        "Name Stickers",
        "Envelope Seals",
        "QR Code Stickers",
        "Safety Stickers",
        "Sealing Stickers",
      ]),
    },
  ],
};

const FLYER_SIZES = ['8.5" x 11"', '5.5" x 8.5"', '4" x 6"', '11" x 17"'];
const FLYER_PAPER = [
  "100 lb. Gloss Cover",
  "100 lb. Matte Cover",
  "14 pt. Cardstock Gloss",
  "14 pt. Cardstock Matte",
];

function buildProducts(): Record<string, ShopProduct> {
  const map: Record<string, ShopProduct> = {};
  const add = (p: ShopProduct) => {
    map[`${p.category}/${p.slug}`] = p;
  };

  const flyerNames = [
    "Business Flyers",
    "Die-Cut Flyers",
    "Foil Flyers",
    "Silk Flyers",
    "Metallic Flyers",
  ];
  flyerNames.forEach((n, i) =>
    add(
      product(
        "flyers",
        n,
        29.99 + i * 12,
        [
          "Full-color flyer printing",
          "Multiple sizes and paper stocks",
          "Fast turnaround options",
        ],
        printFields(FLYER_SIZES, FLYER_PAPER),
        i,
      ),
    ),
  );

  [
    "Bi-Fold Brochures",
    "Tri-Fold Brochures",
    "Booklets",
    "Z-Fold Brochures",
    "Gate Fold Brochures",
  ].forEach((n, i) =>
    add(
      product(
        "brochures",
        n,
        49.99 + i * 15,
        [
          "Professional brochure folding",
          "Premium paper options",
          "Full-color printing",
        ],
        [
          ...printFields(
            ['8.5" x 11"', '11" x 17"', '5.5" x 8.5"'],
            FLYER_PAPER,
          ),
          {
            key: "folding",
            label: "Folding",
            options: opts("None", "Bi-Fold", "Tri-Fold", "Z-Fold", "Gate Fold"),
          },
        ],
        i,
      ),
    ),
  );

  const labelNames = [
    "Roll Labels",
    "Cut-to-size Single Labels",
    "Label Sets",
    "Blank Sheet Labels",
    "Sheet Labels",
    "Vinyl Labels",
    "Clear Labels",
    "Foil Labels",
    "Metallic Labels",
    "Kraft Labels",
    "Waterproof Labels",
    "Address Labels",
    "Beer Labels",
    "Candle Labels",
    "Food Labels",
    "Jar Labels",
    "Lip Balm Labels",
    "QR Code Stickers",
    "Return Address Labels",
    "Name Labels",
    "Shipping and Mailing Labels",
    "Warning Labels",
    "Water Bottle Labels",
    "Wine Labels",
  ];
  labelNames.forEach((n, i) =>
    add(
      product(
        "labels",
        n,
        34.99 + i * 5,
        [
          "Custom label sizes and shapes",
          "Indoor and outdoor materials",
          "Roll or sheet formats available",
        ],
        [
          {
            key: "size",
            label: "Size",
            options: opts('2" x 1"', '3" x 2"', '4" x 2"', "Custom Size"),
          },
          {
            key: "material",
            label: "Material",
            options: opts(
              "White Vinyl",
              "Clear Vinyl",
              "Kraft",
              "Foil",
              "Waterproof BOPP",
            ),
          },
          {
            key: "shape",
            label: "Shape",
            options: opts("Rectangle", "Square", "Circle", "Custom Die-Cut"),
          },
        ],
        i,
      ),
    ),
  );

  // Packaging "Labels" conflicts with labels/labels — use packaging-labels slug
  const packagingList = [
    ["Custom Boxes", "custom-boxes"],
    ["Custom Packaging Tape", "custom-packaging-tape"],
    ["DVD Packaging", "dvd-packaging"],
    ["Gift Bags", "gift-bags"],
    ["Header Cards", "header-cards"],
    ["Labels", "packaging-labels"],
    ["Packaging Sleeves", "packaging-sleeves"],
    ["Paper Bags", "paper-bags"],
    ["Plastic Bags", "plastic-bags"],
    ["Poly Mailers", "poly-mailers"],
    ["Poly Packing Tape", "poly-packing-tape"],
    ["Ribbons and Bows", "ribbons-and-bows"],
    ["Rigid Mailers", "rigid-mailers"],
    ["Pouches", "pouches"],
    ["Tissue Paper", "tissue-paper"],
    ["Wrapping Paper", "wrapping-paper"],
  ] as const;

  // Fix packaging flyout Labels href
  const packagingFlyout = SHOP_FLYOUTS.packaging![0]!;
  packagingFlyout.items = packagingList.map(([label, slug]) => ({
    label,
    slug,
    href: `/products/packaging/${slug}`,
  }));

  packagingList.forEach(([name, slug], i) => {
    const p = product(
      "packaging",
      name,
      19.99 + i * 4,
      [
        "Custom packaging for shipping and retail",
        "Brandable materials and finishes",
        "Bulk quantity pricing",
      ],
      [
        {
          key: "size",
          label: "Size",
          options: opts("Small", "Medium", "Large", "Custom Size"),
        },
        {
          key: "material",
          label: "Material",
          options: opts("Standard", "Premium", "Eco-Friendly"),
        },
        {
          key: "printing",
          label: "Printing",
          options: opts("Full Color", "1 Color", "Blank"),
        },
      ],
      i,
    );
    p.slug = slug;
    p.name = name === "Labels" ? "Packaging Labels" : name;
    add(p);
  });

  [
    "Standard Postcards",
    "Folded Postcards",
    "Every Door Direct Mail®",
    "Foil Postcards",
    "Spot UV Postcard",
    "Metallic Postcard",
    "Raised Spot UV Postcards",
    "Silk Postcards",
    "Velvet Postcards",
    "Die-Cut Postcards",
  ].forEach((n, i) =>
    add(
      product(
        "postcards",
        n,
        39.99 + i * 8,
        [
          "Direct mail ready postcard printing",
          "Premium stocks and specialty finishes",
          "USPS-friendly sizes available",
        ],
        printFields(
          ['4" x 6"', '5" x 7"', '6" x 9"', '6.25" x 9" (EDDM)'],
          [
            "14 pt. Cardstock Gloss",
            "14 pt. Cardstock Matte",
            "16 pt. Soft Touch",
            "100 lb. Cover",
          ],
        ),
        i,
      ),
    ),
  );

  // Fix EDDM slug - slugify removes ® already; "Every Door Direct Mail" -> every-door-direct-mail
  // flyout item used Every Door Direct Mail without ®

  [
    ["Apparel", "apparel"],
    ["Bags & Totes", "bags-totes"],
    ["Bookmarks", "bookmarks"],
    ["Buttons", "buttons"],
    ["Calendars", "calendars"],
    ["Drinkware", "drinkware"],
    ["Magnets", "magnets"],
    ["Notepads", "notepads"],
    ["Pens", "pens"],
    ["Sticky Notes", "sticky-notes"],
  ].forEach(([name, slug], i) => {
    // Apparel promo links to apparel category page
    if (slug === "apparel") {
      const p = product(
        "promotional-products",
        "Apparel",
        14.99,
        [
          "Custom branded apparel and wearables",
          "Print or embroidery decoration",
          "Wide size and color ranges",
        ],
        [
          {
            key: "decoration",
            label: "Decoration",
            options: opts("Screen Print", "Embroidery", "DTG"),
          },
          {
            key: "color",
            label: "Color",
            options: opts("White", "Black", "Navy", "Gray"),
          },
        ],
        i,
      );
      p.slug = "apparel";
      add(p);
      return;
    }
    const p = product(
      "promotional-products",
      name,
      9.99 + i * 3,
      [
        "Branded promotional products",
        "Ideal for events and giveaways",
        "Custom imprint options",
      ],
      [
        {
          key: "imprint",
          label: "Imprint",
          options: opts("1 Color", "Full Color", "Laser Engrave"),
        },
        {
          key: "color",
          label: "Color",
          options: opts("White", "Black", "Blue", "Red", "Assorted"),
        },
      ],
      i,
    );
    p.slug = slug;
    add(p);
  });

  // Fix promo flyout Bags & Totes href
  const promoFlyout = SHOP_FLYOUTS["promotional-products"]![0]!;
  promoFlyout.items = promoFlyout.items.map((it) =>
    it.label === "Bags & Totes"
      ? { ...it, slug: "bags-totes", href: "/products/promotional-products/bags-totes" }
      : it.label === "Apparel"
        ? {
            ...it,
            href: "/products/apparel/t-shirts",
          }
        : it,
  );

  const signNames = [
    "Outdoor Signs",
    "A-Frame Signs",
    "Acrylic Signs",
    "Aluminum Signs",
    "Car Magnets",
    "Feather Flags",
    "Foam Boards",
    "Parking Signs",
    "Pole Banners",
    "Poster Signs",
    "Property Signs",
    "Real Estate Signs",
    "Reflective Adhesive Vinyl",
    "Teardrop Flags",
    "Vehicle Decals",
    "Vinyl Banners",
    "Vinyl Lettering",
    "Window Clings",
  ];
  signNames.forEach((n, i) => {
    const p = product(
      "signs",
      n,
      24.99 + i * 6,
      [
        "Indoor and outdoor signage options",
        "Durable weather-resistant materials",
        "Custom sizes available",
      ],
      [
        {
          key: "size",
          label: "Size",
          options: opts(
            '12" x 18"',
            '18" x 24"',
            '24" x 36"',
            "Custom Size",
          ),
        },
        {
          key: "material",
          label: "Material",
          options: opts(
            "Corrugated Plastic",
            "Aluminum",
            "Acrylic",
            "Foam Board",
            "Vinyl",
          ),
        },
        {
          key: "printedSide",
          label: "Printed Side",
          options: opts("Front Only", "Front and Back"),
        },
      ],
      i,
    );
    // Vinyl Banners under signs → banners page
    if (n === "Vinyl Banners") {
      // still create signs/vinyl-banners but flyout will point to banners
    }
    if (n === "Pole Banners") {
      // flyout can keep signs path or banners - keep signs path for menu consistency
    }
    add(p);
  });

  // Point Vinyl Banners in signs flyout to banners product
  const signsFlyout = SHOP_FLYOUTS.signs![0]!;
  signsFlyout.items = signsFlyout.items.map((it) =>
    it.label === "Vinyl Banners"
      ? { ...it, href: "/products/banners/vinyl-banners" }
      : it.label === "Pole Banners"
        ? { ...it, href: "/products/banners/pole-banners" }
        : it,
  );

  const stickerNames = [
    "Sticker Singles",
    "Die-Cut Stickers",
    "Kiss-Cut Stickers",
    "Sticker Sheets",
    "Transfer Stickers",
    "Roll Stickers",
    "DTF Transfers",
    "Vinyl Stickers",
    "Kraft Stickers",
    "Clear Stickers",
    "Foil Stickers",
    "Metallic Stickers",
    "Rainbow Holographic Stickers",
    "Bulk Stickers",
    "Bumper Stickers",
    "Campaign & Political Stickers",
    "Name Stickers",
    "Envelope Seals",
    "QR Code Stickers",
    "Safety Stickers",
    "Sealing Stickers",
  ];
  stickerNames.forEach((n, i) =>
    add(
      product(
        "stickers",
        n,
        19.99 + i * 4,
        [
          "Custom shapes and sizes",
          "Indoor/outdoor vinyl options",
          "Kiss-cut or die-cut finishing",
        ],
        [
          {
            key: "size",
            label: "Size",
            options: opts('2" x 2"', '3" x 3"', '4" x 4"', "Custom Size"),
          },
          {
            key: "material",
            label: "Material",
            options: opts(
              "White Vinyl",
              "Clear Vinyl",
              "Kraft",
              "Holographic",
              "Foil",
            ),
          },
          {
            key: "cut",
            label: "Cut Type",
            options: opts("Kiss-Cut", "Die-Cut", "Sheet"),
          },
        ],
        i,
      ),
    ),
  );

  // Marketing Materials mega-menu products that have no home in the
  // subtype-specific categories above.
  const marketingNames = [
    "Rack Cards",
    "Leaflets",
    "Catalogs",
    "Newsletters",
    "Magazines",
    "Invitations",
    "Event Tickets",
    "Thank You Cards",
    "Greeting Cards",
    "Carbonless Forms",
    "Letterhead",
    "Envelopes",
    "Hang Tags",
    "Door Hangers",
    "Folders",
    "Appointment Cards",
    "Notebooks",
    "Rubber Stamps",
  ];
  marketingNames.forEach((n, i) =>
    add(
      product(
        "marketing",
        n,
        24.99 + i * 5,
        [
          "Full-color offset and digital printing",
          "Premium paper stocks and finishes",
          "Fast turnaround options",
        ],
        printFields(
          ['8.5" x 11"', '5.5" x 8.5"', '4" x 9"', '6" x 9"'],
          [
            "100 lb. Gloss Cover",
            "100 lb. Matte Cover",
            "14 pt. Cardstock Gloss",
            "70 lb. Uncoated Text",
          ],
        ),
        i,
      ),
    ),
  );

  return map;
}

export const SHOP_PRODUCTS = buildProducts();

export function getShopProduct(
  category: string,
  slug: string,
): ShopProduct | null {
  return SHOP_PRODUCTS[`${category}/${slug}`] ?? null;
}

export function getShopSlugs(category: string): string[] {
  return Object.values(SHOP_PRODUCTS)
    .filter((p) => p.category === category)
    .map((p) => p.slug);
}

export function estimateShopPrice(
  product: ShopProduct,
  selections: Record<string, string>,
): number {
  const qty = Number(selections.quantity) || 250;
  let mult = Math.max(0.4, qty / 250);
  if (selections.printedSide?.toLowerCase().includes("back")) mult *= 1.4;
  if (selections.finishing?.toLowerCase().includes("uv")) mult *= 1.15;
  if (selections.turnaround?.includes("Next")) mult *= 1.4;
  else if (selections.turnaround?.includes("2 Business")) mult *= 1.2;
  return Math.round(product.basePrice * mult * 100) / 100;
}

export const SHOP_STATIC_CATEGORIES = [
  "flyers",
  "brochures",
  "labels",
  "packaging",
  "postcards",
  "promotional-products",
  "signs",
  "stickers",
] as const;
