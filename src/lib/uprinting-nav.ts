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
    { label: "See More Products", href: "/products", chevron: true, bold: true },
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
    href: "/products",
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
