/**
 * UPrinting-aligned top navigation + Popular Products sidebar IA.
 * Links use catalog category filters or known product slugs.
 */

import { SHOP_FLYOUTS } from "./shop-catalog";

export type NavLink = { label: string; href: string };

/** Link inside a mega-menu column; `all` renders as the trailing "All …" row. */
export type MegaLink = NavLink & {
  badge?: "Best Seller" | "New";
  all?: boolean;
};

export type MegaColumn = {
  title: string;
  href: string;
  image: string;
  links: MegaLink[];
};

export type NavGroup = {
  label: string;
  href: string;
  children: NavLink[];
  /** Full-width panel shown instead of the plain dropdown list. */
  mega?: MegaColumn[];
};

/** Real product shots from the catalogue so each column matches its section. */
const MEGA_IMG = {
  businessCards:
    "https://staticecp.uprinting.com/16666/530x530/Standard_Business_Cards_Marketing_Material_A_Compress.jpg",
  brochures:
    "https://staticecp.uprinting.com/5028/700x700/Brochures_Marketing_Materials_A.jpg",
  booklets:
    "https://staticecp.uprinting.com/15872/700x700/UP_Laminated_Dine-in_Menus.jpg",
  postcards:
    "https://staticecp.uprinting.com/11181/530x530/UP_B33-Postcards.png",
  cards:
    "https://s2.uprinting.com/SmsImages/UP/product-page/112064/active/jpeg/event-postcards_1400x1400.jpg",
  forms: "https://staticecp.uprinting.com/215/700x700/Notepads_Personal_A.jpg",
  promotion:
    "https://staticecp.uprinting.com/253/700x700/Poster_Signs_Marketing_Materials_A.jpg",
  office:
    "https://staticecp.uprinting.com/894/700x700/Wall_Calendar_Marketing_Materials_A.webp",
  stickerTypes: "/mega/sticker-types.jpg",
  popularStickers: "/mega/popular-stickers.jpg",
  stickerShapes: "/mega/sticker-shapes.jpg",
  stickerMaterials: "/mega/sticker-materials.jpg",
  labelTypes: "/mega/label-types.jpg",
  productLabels: "/mega/product-labels.jpg",
  businessLabels: "/mega/business-labels.jpg",
  labelMaterials: "/mega/label-materials.jpg",
  customBoxes: "/mega/custom-boxes.jpg",
  customPouches: "/mega/custom-pouches.jpg",
  productPackaging: "/mega/product-packaging.jpg",
  shippingSupplies: "/mega/shipping-supplies.jpg",
  shoppingBags: "/mega/shopping-bags.jpg",
  giftWrapping: "/mega/gift-wrapping.jpg",
  shopByIndustry: "/mega/shop-by-industry.jpg",
  banners: "/mega/banners.jpg",
  signs: "/mega/signs.jpg",
  magnetsDecals: "/mega/magnets-decals.jpg",
  aframesStands: "/mega/aframes-stands.jpg",
  displays: "/mega/displays.jpg",
  flags: "/mega/flags.jpg",
  fabric: "/mega/fabric.jpg",
  prints: "/mega/prints.jpg",
  apparel: "/mega/apparel.jpg",
  promoProducts: "/mega/promo-products.jpg",
  topBrands: "/mega/top-brands.jpg",
  gifts: "/mega/gifts.jpg",
  hats: "/mega/hats.jpg",
  tshirts: "/mega/tshirts.jpg",
  jackets: "/mega/jackets.jpg",
  tradeShows: "/mega/trade-shows.jpg",
  restaurants: "/mega/restaurants.jpg",
  featuredCollections: "/mega/featured-collections.jpg",
};

const MARKETING_MEGA: MegaColumn[] = [
  {
    title: "Business Cards",
    href: "/products?category=business-cards",
    image: MEGA_IMG.businessCards,
    links: [
      {
        label: "Standard Business Cards",
        href: "/products/business-cards/standard",
        badge: "Best Seller",
      },
      { label: "Die-Cut Business Cards", href: "/products/business-cards/die-cut" },
      { label: "Plastic Business Cards", href: "/products/business-cards/plastic" },
      { label: "Folded Business Cards", href: "/products/business-cards/folded" },
      {
        label: "All Business Cards",
        href: "/products?category=business-cards",
        all: true,
      },
    ],
  },
  {
    title: "Brochures & Flyers",
    href: "/products?category=brochures",
    image: MEGA_IMG.brochures,
    links: [
      { label: "Brochures", href: "/products?category=brochures" },
      {
        label: "Flyers",
        href: "/products?category=flyers",
        badge: "Best Seller",
      },
      { label: "Business Flyers", href: "/products/flyers/business-flyers" },
      { label: "Rack Cards", href: "/products/marketing/rack-cards" },
      { label: "Leaflets", href: "/products/marketing/leaflets" },
    ],
  },
  {
    title: "Booklets and Catalogs",
    href: "/products?category=brochures",
    image: MEGA_IMG.booklets,
    links: [
      {
        label: "Booklets",
        href: "/products/brochures/booklets",
        badge: "Best Seller",
      },
      { label: "Catalogs", href: "/products/marketing/catalogs" },
      { label: "Newsletters", href: "/products/marketing/newsletters" },
      { label: "Magazines", href: "/products/marketing/magazines" },
      {
        label: "All Booklets & Catalogs",
        href: "/products?category=brochures",
        all: true,
      },
    ],
  },
  {
    title: "Postcards",
    href: "/products?category=postcards",
    image: MEGA_IMG.postcards,
    links: [
      {
        label: "Standard Postcards",
        href: "/products/postcards/standard-postcards",
        badge: "Best Seller",
      },
      { label: "Die Cut Postcards", href: "/products/postcards/die-cut-postcards" },
      {
        label: "EDDM Postcards",
        href: "/products/postcards/every-door-direct-mail",
        badge: "New",
      },
      { label: "Foil Postcards", href: "/products/postcards/foil-postcards" },
      {
        label: "All Postcards",
        href: "/products?category=postcards",
        all: true,
      },
    ],
  },
  {
    title: "Cards & Events",
    href: "/products?category=postcards",
    image: MEGA_IMG.cards,
    links: [
      { label: "Invitations", href: "/products/marketing/invitations" },
      {
        label: "Event Tickets",
        href: "/products/marketing/event-tickets",
        badge: "Best Seller",
      },
      { label: "Thank you Cards", href: "/products/marketing/thank-you-cards" },
      { label: "Greeting Cards", href: "/products/marketing/greeting-cards" },
      {
        label: "All Cards & Events",
        href: "/products?category=postcards",
        all: true,
      },
    ],
  },
  {
    title: "Forms & Stationery",
    href: "/products?category=marketing-materials",
    image: MEGA_IMG.forms,
    links: [
      {
        label: "Carbonless Forms",
        href: "/products/marketing/carbonless-forms",
        badge: "Best Seller",
      },
      { label: "Letterhead", href: "/products/marketing/letterhead" },
      { label: "Envelopes", href: "/products/marketing/envelopes" },
      { label: "Notepads", href: "/products/promotional-products/notepads" },
      { label: "Bookmarks", href: "/products/promotional-products/bookmarks" },
    ],
  },
  {
    title: "Marketing & Promotion",
    href: "/products?category=marketing-materials",
    image: MEGA_IMG.promotion,
    links: [
      { label: "Posters", href: "/products/signs/poster-signs" },
      { label: "Hang Tags", href: "/products/marketing/hang-tags" },
      { label: "Door Hangers", href: "/products/marketing/door-hangers" },
      { label: "Magnets", href: "/products/promotional-products/magnets" },
      {
        label: "All Marketing",
        href: "/products?category=marketing-materials",
        all: true,
      },
    ],
  },
  {
    title: "Branded Office Supplies",
    href: "/products?category=marketing-materials",
    image: MEGA_IMG.office,
    links: [
      { label: "Folders", href: "/products/marketing/folders" },
      {
        label: "Appointment Cards",
        href: "/products/marketing/appointment-cards",
      },
      { label: "Notebooks", href: "/products/marketing/notebooks" },
      { label: "Rubber Stamps", href: "/products/marketing/rubber-stamps" },
      {
        label: "All Office Supplies",
        href: "/products?category=marketing-materials",
        all: true,
      },
    ],
  },
];

/** Sidebar Popular Products (UPrinting order; excludes Marketing Materials / Posters). */
export const POPULAR_PRODUCT_CATEGORIES = [
  { id: "apparel", name: "Apparel", slug: "apparel", icon: "Shirt" },
  { id: "banners", name: "Banners", slug: "banners", icon: "Flag" },
  { id: "boxes", name: "Boxes", slug: "boxes", icon: "Box" },
  { id: "brochures", name: "Brochures", slug: "brochures", icon: "BookOpen" },
  {
    id: "business-cards",
    name: "Business Cards",
    slug: "business-cards",
    icon: "CreditCard",
  },
  { id: "flyers", name: "Flyers", slug: "flyers", icon: "FileText" },
  { id: "labels", name: "Labels", slug: "labels", icon: "Tag" },
  { id: "packaging", name: "Packaging", slug: "packaging", icon: "Package" },
  { id: "postcards", name: "Postcards", slug: "postcards", icon: "Image" },
  {
    id: "promotional-products",
    name: "Promotional Products",
    slug: "promotional-products",
    icon: "Gift",
  },
  { id: "signs", name: "Signs", slug: "signs", icon: "Megaphone" },
  { id: "stickers", name: "Stickers", slug: "stickers", icon: "Sticker" },
] as const;

export const POPULAR_FOOTER_LINKS: (NavLink & { chevron?: boolean; bold?: boolean })[] =
  [
    { label: "Custom Quote", href: "/quote" },
    { label: "Direct Mail", href: "/direct-mail" },
    { label: "Design Service", href: "/services" },
    { label: "See More Products", href: "/products", chevron: true, bold: true   },
];

const STICKERS_LABELS_MEGA: MegaColumn[] = [
  {
    title: "Sticker Types",
    href: "/products?category=stickers",
    image: MEGA_IMG.stickerTypes,
    links: [
      { label: "Custom Stickers", href: "/products/custom-stickers" },
      {
        label: "Die-Cut Sticker Singles",
        href: "/products/die-cut-stickers",
        badge: "Best Seller",
      },
      { label: "Sticker Sheets", href: "/products/sticker-sheets" },
      { label: "Kiss Cut Stickers", href: "/products/kiss-cut-stickers" },
      {
        label: "Transfer Stickers",
        href: "/products/transfer-stickers",
        badge: "New",
      },
      {
        label: "All Stickers",
        href: "/products?category=stickers",
        all: true,
      },
    ],
  },
  {
    title: "Popular Stickers",
    href: "/products?category=stickers",
    image: MEGA_IMG.popularStickers,
    links: [
      { label: "Bumper Stickers", href: "/products/bumper-stickers" },
      { label: "Bulk Stickers", href: "/products/bulk-stickers" },
      {
        label: "Campaign & Political Stickers",
        href: "/products/campaign-political-stickers",
      },
      {
        label: "QR Code Stickers",
        href: "/products/qr-code-stickers",
        badge: "New",
      },
      {
        label: "Safety Stickers",
        href: "/products/safety-stickers",
        badge: "New",
      },
      { label: "Sealing Stickers", href: "/products/sealing-stickers" },
    ],
  },
  {
    title: "Sticker Shapes",
    href: "/products?category=stickers",
    image: MEGA_IMG.stickerShapes,
    links: [
      { label: "Custom Shape Stickers", href: "/products/custom-shape-stickers" },
      {
        label: "Square/Rectangle Stickers",
        href: "/products/square-rectangle-stickers",
      },
      { label: "Round Circle Stickers", href: "/products/round-circle-stickers" },
      { label: "Oval Shape Stickers", href: "/products/oval-shape-stickers" },
      { label: "Arch Shape Stickers", href: "/products/arch-shape-stickers" },
      { label: "Starburst Stickers", href: "/products/starburst-stickers" },
    ],
  },
  {
    title: "Sticker Materials",
    href: "/products?category=stickers",
    image: MEGA_IMG.stickerMaterials,
    links: [
      {
        label: "Vinyl Stickers",
        href: "/products/vinyl-stickers",
        badge: "Best Seller",
      },
      {
        label: "BOPP Stickers",
        href: "/products/bopp-stickers",
        badge: "Best Seller",
      },
      { label: "Paper Stickers", href: "/products/paper-stickers" },
      {
        label: "Kraft Paper Stickers",
        href: "/products/kraft-paper-stickers",
        badge: "New",
      },
      { label: "Holographic Stickers", href: "/products/holographic-stickers" },
      { label: "Metallic Stickers", href: "/products/metallic-stickers" },
    ],
  },
  {
    title: "Label Types",
    href: "/products?category=labels",
    image: MEGA_IMG.labelTypes,
    links: [
      { label: "Custom Labels", href: "/products/custom-labels" },
      {
        label: "Roll Labels",
        href: "/products/roll-labels",
        badge: "Best Seller",
      },
      { label: "Die-Cut Label Singles", href: "/products/die-cut-label-singles" },
      {
        label: "Label Sets",
        href: "/products/label-sets",
        badge: "New",
      },
      {
        label: "Blank Sheet Labels",
        href: "/products/blank-sheet-labels",
        badge: "New",
      },
      {
        label: "All Labels",
        href: "/products?category=labels",
        all: true,
      },
    ],
  },
  {
    title: "Product Labels",
    href: "/products?category=labels",
    image: MEGA_IMG.productLabels,
    links: [
      { label: "Bottle Labels", href: "/products/bottle-labels" },
      { label: "Food Labels", href: "/products/food-labels" },
      { label: "Candle Labels", href: "/products/candle-labels" },
      { label: "Jar Labels", href: "/products/jar-labels" },
      { label: "Cosmetic Labels", href: "/products/cosmetic-labels" },
      { label: "Lip Balm Labels", href: "/products/lip-balm-labels" },
    ],
  },
  {
    title: "Business Labels",
    href: "/products?category=labels",
    image: MEGA_IMG.businessLabels,
    links: [
      {
        label: "Address Labels/Return Address Labels",
        href: "/products/address-labels",
      },
      {
        label: "Shipping And Mailing Labels",
        href: "/products/shipping-mailing-labels",
      },
      {
        label: "Envelope Seals",
        href: "/products/envelope-seals",
        badge: "New",
      },
      { label: "Barcode Labels", href: "/products/barcode-labels" },
      { label: "Packaging Labels", href: "/products/packaging-labels" },
      { label: "Warning Labels", href: "/products/warning-labels" },
    ],
  },
  {
    title: "Label Materials",
    href: "/products?category=labels",
    image: MEGA_IMG.labelMaterials,
    links: [
      { label: "BOPP Labels", href: "/products/bopp-labels" },
      { label: "Clear Labels", href: "/products/clear-labels" },
      { label: "Foil Labels", href: "/products/foil-labels" },
      { label: "Paper Labels", href: "/products/paper-labels" },
      { label: "Metallic Labels", href: "/products/metallic-labels" },
      { label: "Waterproof Labels", href: "/products/waterproof-labels" },
    ],
  },
];

const BOXES_PACKAGING_MEGA: MegaColumn[] = [
  {
    title: "Custom Boxes",
    href: "/products?category=boxes",
    image: MEGA_IMG.customBoxes,
    links: [
      { label: "Mailer Boxes", href: "/products/boxes/mailer-boxes" },
      { label: "Shipping Boxes", href: "/products/boxes/shipping-boxes" },
      { label: "Product Boxes", href: "/products/boxes/product-boxes" },
      { label: "Folding Cartons", href: "/products/boxes/folding-cartons" },
      {
        label: "All Custom Boxes",
        href: "/products?category=boxes",
        all: true,
      },
    ],
  },
  {
    title: "Custom Pouches",
    href: "/products/pouches",
    image: MEGA_IMG.customPouches,
    links: [
      { label: "Flat Pouches", href: "/products/pouches/flat-pouches" },
      { label: "Stand Up Pouches", href: "/products/pouches/stand-up-pouches" },
      {
        label: "All Custom Pouches",
        href: "/products/pouches",
        all: true,
      },
    ],
  },
  {
    title: "Product Packaging",
    href: "/products?category=packaging",
    image: MEGA_IMG.productPackaging,
    links: [
      { label: "Backing Cards", href: "/products/backing-cards" },
      { label: "Bag Toppers", href: "/products/bag-toppers" },
      {
        label: "Food & Beverage Packaging",
        href: "/products/food-beverage-packaging",
      },
      { label: "Hang Tags", href: "/products/hang-tags" },
      {
        label: "All Product Packaging",
        href: "/products?category=packaging",
        all: true,
      },
    ],
  },
  {
    title: "Shipping Supplies",
    href: "/products?category=packaging",
    image: MEGA_IMG.shippingSupplies,
    links: [
      { label: "Bubble Mailers", href: "/products/bubble-mailers" },
      { label: "Packing Tape", href: "/products/poly-packing-tape" },
      { label: "Poly Mailers", href: "/products/poly-mailers" },
      { label: "Rigid Mailers", href: "/products/rigid-mailers" },
      {
        label: "All Shipping Supplies",
        href: "/products?category=packaging",
        all: true,
      },
    ],
  },
  {
    title: "Shopping Bags",
    href: "/products?category=packaging",
    image: MEGA_IMG.shoppingBags,
    links: [
      { label: "Paper Bags", href: "/products/paper-bags" },
      { label: "Plastic Bags", href: "/products/plastic-bags" },
      { label: "Tote Bags", href: "/products/tote-bags" },
      {
        label: "All Shopping Bags",
        href: "/products?category=packaging",
        all: true,
      },
    ],
  },
  {
    title: "Gift Wrapping",
    href: "/products?category=packaging",
    image: MEGA_IMG.giftWrapping,
    links: [
      { label: "Bows & Ribbons", href: "/products/bows-ribbons" },
      { label: "Gift Bags", href: "/products/gift-bags" },
      { label: "Gift Tags", href: "/products/gift-tags" },
      { label: "Tissue Paper", href: "/products/tissue-paper" },
      {
        label: "All Gift Wrapping",
        href: "/products?category=packaging",
        all: true,
      },
    ],
  },
  {
    title: "Shop By Industry",
    href: "/products?category=packaging",
    image: MEGA_IMG.shopByIndustry,
    links: [
      {
        label: "Cannabis, CBD, And Supplements",
        href: "/products?industry=cannabis-cbd-supplements",
      },
      { label: "eCommerce", href: "/products?industry=ecommerce" },
      {
        label: "Food & beverage",
        href: "/products?industry=food-beverage",
      },
      { label: "Restaurant", href: "/products?industry=restaurant" },
      { label: "Retail", href: "/products?industry=retail" },
    ],
  },
];

const SIGNS_BANNERS_MEGA: MegaColumn[] = [
  {
    title: "Banners",
    href: "/products?category=banners",
    image: MEGA_IMG.banners,
    links: [
      {
        label: "Vinyl Banners",
        href: "/products/banners/vinyl-banners",
        badge: "Best Seller",
      },
      {
        label: "Retractable Banners",
        href: "/products/banners/retractable-banners",
      },
      {
        label: "Step and Repeat Banners",
        href: "/products/banners/step-and-repeat-banners",
      },
      { label: "Fabric Banners", href: "/products/banners/fabric-banners" },
      {
        label: "Tabletop Banners",
        href: "/products/banners/table-top-banners",
      },
    ],
  },
  {
    title: "Signs",
    href: "/products?category=signs",
    image: MEGA_IMG.signs,
    links: [
      { label: "Yard Signs", href: "/products/yard-signs" },
      { label: "Aluminum Signs", href: "/products/aluminum-signs" },
      {
        label: "Regulatory Signs",
        href: "/products/regulatory-signs",
        badge: "New",
      },
      { label: "Foam Boards", href: "/products/foam-boards" },
      { label: "Plastic Signs", href: "/products/plastic-signs" },
    ],
  },
  {
    title: "Magnets, Decals & Clings",
    href: "/products?category=decals",
    image: MEGA_IMG.magnetsDecals,
    links: [
      { label: "Car Magnets", href: "/products/car-magnets" },
      {
        label: "Outdoor Wall Decals",
        href: "/products/outdoor-wall-decals",
        badge: "New",
      },
      { label: "Window Clings", href: "/products/window-clings" },
      { label: "Wall Decals", href: "/products/wall-decals" },
      {
        label: "Window Decals",
        href: "/products/window-decals",
        badge: "Best Seller",
      },
      { label: "Vinyl Lettering", href: "/products/vinyl-lettering" },
    ],
  },
  {
    title: "A-Frames & Stands",
    href: "/products?category=banners",
    image: MEGA_IMG.aframesStands,
    links: [
      { label: "A-Frames", href: "/products/a-frames" },
      {
        label: "Tension Fabric Banners",
        href: "/products/banners/tension-fabric-banners",
        badge: "Best Seller",
      },
      {
        label: "X Banner Stands",
        href: "/products/banners/x-banner-stands",
      },
      { label: "Poster Stands", href: "/products/poster-stands" },
      { label: "SEG Stands", href: "/products/seg-stands" },
    ],
  },
  {
    title: "Displays",
    href: "/products?category=banners",
    image: MEGA_IMG.displays,
    links: [
      { label: "Backdrops", href: "/products/banners/backdrops" },
      {
        label: "Tension Fabric Displays",
        href: "/products/banners/straight-tension-fabric-display",
        badge: "Best Seller",
      },
      { label: "Event Tents", href: "/products/event-tents" },
      {
        label: "Pop Up Displays",
        href: "/products/banners/curved-pop-up-display",
      },
      { label: "SEG Displays", href: "/products/seg-displays" },
    ],
  },
  {
    title: "Flags",
    href: "/products?category=banners",
    image: MEGA_IMG.flags,
    links: [
      { label: "Feather Flags", href: "/products/feather-flags" },
      { label: "Angled Flag Banners", href: "/products/angled-flag-banners" },
      { label: "Rectangle Flags", href: "/products/rectangle-flags" },
      { label: "Teardrop Flags", href: "/products/teardrop-flags" },
      { label: "Pole Flags", href: "/products/banners/pole-banners" },
    ],
  },
  {
    title: "Fabric",
    href: "/products?category=banners",
    image: MEGA_IMG.fabric,
    links: [
      { label: "Tablecloths", href: "/products/tablecloths" },
      {
        label: "Stretch Table Covers",
        href: "/products/stretch-table-covers",
      },
      { label: "Fabric Banners", href: "/products/banners/fabric-banners" },
      { label: "Event Tents", href: "/products/event-tents" },
      { label: "Table Runners", href: "/products/table-runners" },
    ],
  },
  {
    title: "Prints",
    href: "/products?category=prints",
    image: MEGA_IMG.prints,
    links: [
      { label: "Rolled Canvas Prints", href: "/products/rolled-canvas-prints" },
      { label: "Canvas Prints", href: "/products/canvas-prints" },
      { label: "Acrylic Prints", href: "/products/acrylic-prints" },
      { label: "Framed Prints", href: "/products/framed-prints" },
      { label: "Metal Prints", href: "/products/metal-prints" },
    ],
  },
];

const APPAREL_PROMO_MEGA: MegaColumn[] = [
  {
    title: "Apparel",
    href: "/products?category=apparel",
    image: MEGA_IMG.apparel,
    links: [
      { label: "T-Shirts", href: "/products/apparel/t-shirts" },
      {
        label: "Hats",
        href: "/products/apparel/hats",
        badge: "Best Seller",
      },
      { label: "Sweats", href: "/products/apparel/sweatshirts" },
      { label: "Polos", href: "/products/apparel/polo-shirts" },
      {
        label: "All Apparel",
        href: "/products?category=apparel",
        all: true,
      },
    ],
  },
  {
    title: "Promotional Products",
    href: "/products?category=promotional-products",
    image: MEGA_IMG.promoProducts,
    links: [
      {
        label: "Bags & Totes",
        href: "/products/branded-tote-bags",
        badge: "Best Seller",
      },
      { label: "Drinkware", href: "/products/drinkware" },
      { label: "Notebooks", href: "/products/notebooks" },
      { label: "Notepads", href: "/products/notepads" },
      {
        label: "All Promotional Products",
        href: "/products?category=promotional-products",
        all: true,
      },
    ],
  },
  {
    title: "Top Brands",
    href: "/products?category=apparel",
    image: MEGA_IMG.topBrands,
    links: [
      { label: "Adidas", href: "/products?brand=adidas" },
      { label: "Carhartt", href: "/products?brand=carhartt" },
      { label: "Nike", href: "/products?brand=nike" },
      { label: "Richardson", href: "/products?brand=richardson" },
      { label: "The North Face", href: "/products?brand=the-north-face" },
    ],
  },
  {
    title: "Gifts",
    href: "/products?category=promotional-products",
    image: MEGA_IMG.gifts,
    links: [
      { label: "Notebooks", href: "/products/notebooks" },
      { label: "Jackets", href: "/products/apparel/jackets" },
      { label: "Hats", href: "/products/apparel/hats" },
      { label: "Bags & Totes", href: "/products/branded-tote-bags" },
      { label: "Drinkware", href: "/products/drinkware" },
    ],
  },
  {
    title: "Hats",
    href: "/products/apparel/hats",
    image: MEGA_IMG.hats,
    links: [
      { label: "Trucker Hats", href: "/products/apparel/hats?type=trucker" },
      {
        label: "Unstructured Hats",
        href: "/products/apparel/hats?type=unstructured",
      },
      { label: "Beanies", href: "/products/apparel/hats?type=beanies" },
      {
        label: "Structured hats",
        href: "/products/apparel/hats?type=structured",
      },
      { label: "Cotton Caps", href: "/products/apparel/hats?type=cotton" },
    ],
  },
  {
    title: "T-Shirts",
    href: "/products/apparel/t-shirts",
    image: MEGA_IMG.tshirts,
    links: [
      {
        label: "Men's T-Shirts",
        href: "/products/apparel/t-shirts?type=mens",
      },
      {
        label: "Ladies T-Shirts",
        href: "/products/apparel/t-shirts?type=ladies",
      },
      {
        label: "Short Sleeve T-Shirts",
        href: "/products/apparel/t-shirts?type=short-sleeve",
      },
      {
        label: "Long Sleeve T-Shirts",
        href: "/products/apparel/t-shirts?type=long-sleeve",
      },
      {
        label: "Dry Performance T-Shirts",
        href: "/products/apparel/t-shirts?type=performance",
      },
    ],
  },
  {
    title: "Jackets",
    href: "/products/apparel/jackets",
    image: MEGA_IMG.jackets,
    links: [
      {
        label: "Men's Jackets",
        href: "/products/apparel/jackets?type=mens",
      },
      {
        label: "Ladies Jackets",
        href: "/products/apparel/jackets?type=ladies",
      },
      {
        label: "Soft Shell Jackets",
        href: "/products/apparel/jackets?type=soft-shell",
      },
      {
        label: "Fleece Jackets",
        href: "/products/apparel/jackets?type=fleece",
      },
      { label: "Vests", href: "/products/apparel/jackets?type=vests" },
    ],
  },
];

const FEATURED_COLLECTIONS_MEGA: MegaColumn[] = [
  {
    title: "Trade Shows & Events",
    href: "/products?collection=trade-shows-events",
    image: MEGA_IMG.tradeShows,
    links: [
      { label: "Advertising Flags", href: "/products/feather-flags" },
      { label: "A-Frame Signs", href: "/products/a-frames" },
      { label: "Backdrops", href: "/products/banners/backdrops" },
      { label: "Banners", href: "/products?category=banners" },
      {
        label: "All Trade Show & Events",
        href: "/products?collection=trade-shows-events",
        all: true,
      },
    ],
  },
  {
    title: "Restaurants",
    href: "/products?collection=restaurants",
    image: MEGA_IMG.restaurants,
    links: [
      { label: "Menus", href: "/products/menus" },
      { label: "Table Tents", href: "/products/table-tents" },
      { label: "Placemats", href: "/products/placemats" },
      { label: "Coasters", href: "/products/coasters" },
      {
        label: "All Restaurant",
        href: "/products?collection=restaurants",
        all: true,
      },
    ],
  },
  {
    title: "Featured Collections",
    href: "/products?collection=featured",
    image: MEGA_IMG.featuredCollections,
    links: [
      {
        label: "Holiday Collections",
        href: "/products?collection=holiday",
      },
      {
        label: "Advertising Materials",
        href: "/products?collection=advertising",
      },
      {
        label: "Premium Products",
        href: "/products?collection=premium",
      },
      {
        label: "Shipping Supplies",
        href: "/products?category=packaging",
      },
      {
        label: "All Collections",
        href: "/products?collection=featured",
        all: true,
      },
    ],
  },
];

/** Header mega-menu groups (UPrinting top nav). */
export const HEADER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Marketing Materials",
    href: "/products?category=marketing-materials",
    mega: MARKETING_MEGA,
    children: [
      { label: "Standard Business Cards", href: "/products/business-cards/standard" },
      { label: "Square Business Cards", href: "/products/business-cards/square" },
      { label: "Rounded Corner Cards", href: "/products/business-cards/rounded-corner" },
      { label: "Silk Business Cards", href: "/products/business-cards/silk" },
      { label: "Foil Business Cards", href: "/products/business-cards/foil" },
      { label: "Menus", href: "/products/menus" },
      { label: "Notepads", href: "/products/notepads" },
      { label: "Carbonless Forms", href: "/products/carbonless-forms" },
      { label: "Coasters", href: "/products/coasters" },
      { label: "Table Tents", href: "/products/table-tents" },
      { label: "Postcards", href: "/products?category=postcards" },
      { label: "Brochures", href: "/products?category=brochures" },
      { label: "Flyers", href: "/products?category=flyers" },
      {
        label: "View all Marketing Materials",
        href: "/products?category=marketing-materials",
      },
    ],
  },
  {
    label: "Stickers & Labels",
    href: "/products?category=stickers",
    mega: STICKERS_LABELS_MEGA,
    children: [
      { label: "Custom Stickers", href: "/products/custom-stickers" },
      { label: "Die-Cut Stickers", href: "/products/die-cut-stickers" },
      { label: "Bottle Labels", href: "/products/bottle-labels" },
      { label: "Roll Labels", href: "/products/roll-labels" },
      { label: "All Stickers", href: "/products?category=stickers" },
      { label: "All Labels", href: "/products?category=labels" },
    ],
  },
  {
    label: "Boxes & Packaging",
    href: "/products?category=packaging",
    mega: BOXES_PACKAGING_MEGA,
    children: [
      { label: "Mailer Boxes", href: "/products/boxes/mailer-boxes" },
      { label: "Product Boxes", href: "/products/boxes/product-boxes" },
      { label: "Shipping Boxes", href: "/products/boxes/shipping-boxes" },
      { label: "Folding Cartons", href: "/products/boxes/folding-cartons" },
      { label: "Wine Mailer Boxes", href: "/products/boxes/wine-mailer-boxes" },
      { label: "Take-out Bags", href: "/products/take-out-bags" },
      { label: "Bag Toppers", href: "/products/bag-toppers" },
      { label: "Pouches", href: "/products/pouches" },
      { label: "All Boxes", href: "/products?category=boxes" },
      { label: "All Packaging", href: "/products?category=packaging" },
    ],
  },
  {
    label: "Signs & Banners",
    href: "/products?category=banners",
    mega: SIGNS_BANNERS_MEGA,
    children: [
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
      { label: "Awesome X-Banner Stand", href: "/products/banners/awesome-x-banner-stand" },
      { label: "All Banners", href: "/products?category=banners" },
      { label: "All Signs", href: "/products?category=signs" },
    ],
  },
  {
    label: "Apparel & Promo",
    href: "/products?category=apparel",
    mega: APPAREL_PROMO_MEGA,
    children: [
      { label: "T-Shirts", href: "/products/apparel/t-shirts" },
      { label: "Polo Shirts", href: "/products/apparel/polo-shirts" },
      { label: "Jackets", href: "/products/apparel/jackets" },
      { label: "Sweatshirts", href: "/products/apparel/sweatshirts" },
      { label: "Hats", href: "/products/apparel/hats" },
      { label: "Workwear", href: "/products/apparel/workwear" },
      { label: "Branded Tote Bags", href: "/products/branded-tote-bags" },
      { label: "All Apparel", href: "/products?category=apparel" },
      {
        label: "Promotional Products",
        href: "/products?category=promotional-products",
      },
    ],
  },
  {
    label: "Featured Collections",
    href: "/products?collection=featured",
    mega: FEATURED_COLLECTIONS_MEGA,
    children: [
      { label: "Custom Product Builder", href: "/custom-printing" },
      { label: "Silk Business Cards", href: "/products/business-cards/silk" },
      { label: "Standard Business Cards", href: "/products/business-cards/standard" },
      { label: "Business Flyers", href: "/products/business-flyers" },
      { label: "Custom Stickers", href: "/products/custom-stickers" },
      { label: "Vinyl Banners", href: "/products/banners/vinyl-banners" },
      { label: "View all products", href: "/products" },
    ],
  },
];

/** Flyout extras under Popular Products categories. */
export const CATEGORY_SUBMENUS: Record<string, NavLink[]> = {
  apparel: [
    { label: "T-Shirts", href: "/products/apparel/t-shirts" },
    { label: "Polo Shirts", href: "/products/apparel/polo-shirts" },
    { label: "Jackets", href: "/products/apparel/jackets" },
    { label: "Sweatshirts", href: "/products/apparel/sweatshirts" },
    { label: "Hats", href: "/products/apparel/hats" },
    { label: "Workwear", href: "/products/apparel/workwear" },
  ],
  banners: [
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
    { label: "Awesome X-Banner Stand", href: "/products/banners/awesome-x-banner-stand" },
  ],
  boxes: [
    { label: "Mailer Boxes", href: "/products/boxes/mailer-boxes" },
    { label: "Product Boxes", href: "/products/boxes/product-boxes" },
    { label: "Shipping Boxes", href: "/products/boxes/shipping-boxes" },
    { label: "Folding Cartons", href: "/products/boxes/folding-cartons" },
    { label: "Wine Mailer Boxes", href: "/products/boxes/wine-mailer-boxes" },
  ],
  "business-cards": [
    { label: "Standard", href: "/products/business-cards/standard" },
    { label: "Square", href: "/products/business-cards/square" },
    { label: "Rounded Corner", href: "/products/business-cards/rounded-corner" },
    { label: "Foil", href: "/products/business-cards/foil" },
    { label: "Metal", href: "/products/business-cards/metal" },
    { label: "Metallic Print", href: "/products/business-cards/metallic-print" },
    { label: "Plastic", href: "/products/business-cards/plastic" },
    { label: "Painted Edge", href: "/products/business-cards/painted-edge" },
    { label: "Raised Foil", href: "/products/business-cards/raised-foil" },
    { label: "Raised Spot UV", href: "/products/business-cards/raised-spot-uv" },
    { label: "Silk", href: "/products/business-cards/silk" },
    { label: "Spot UV", href: "/products/business-cards/spot-uv" },
    { label: "Velvet", href: "/products/business-cards/velvet" },
    { label: "Slim", href: "/products/business-cards/slim" },
    { label: "Square Rounded Corner", href: "/products/business-cards/square-rounded-corner" },
    { label: "Folded", href: "/products/business-cards/folded" },
    { label: "Leaf", href: "/products/business-cards/leaf" },
    { label: "Slim Rounded Corner", href: "/products/business-cards/slim-rounded-corner" },
    { label: "Circle", href: "/products/business-cards/circle" },
    { label: "Half-Circle", href: "/products/business-cards/half-circle" },
    { label: "Oval", href: "/products/business-cards/oval" },
    { label: "Single Rounded Corner", href: "/products/business-cards/single-rounded-corner" },
    { label: "Die-Cut", href: "/products/business-cards/die-cut" },
  ],
  flyers: [],
  brochures: [],
  labels: [],
  packaging: [],
  postcards: [],
  "promotional-products": [],
  signs: [],
  stickers: [],
};

for (const [key, sections] of Object.entries(SHOP_FLYOUTS)) {
  CATEGORY_SUBMENUS[key] = sections.flatMap((s) =>
    s.items.map((i) => ({ label: i.label, href: i.href })),
  );
}
