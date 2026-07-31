/**
 * UPrinting-aligned top navigation + Popular Products sidebar IA.
 * Links use catalog category filters or known product slugs.
 */

import { SHOP_FLYOUTS } from "./shop-catalog";

export type NavLink = { label: string; href: string };

export type NavGroup = {
  label: string;
  href: string;
  children: NavLink[];
};

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
