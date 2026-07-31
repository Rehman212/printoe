export type ApparelNavItem = { label: string; slug: string };

export type ApparelProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  /** subtype filter key, e.g. short-sleeve */
  type: string;
};

export type ApparelCategory = {
  slug: string;
  name: string;
  title: string;
  tagline: string;
  bullets: string[];
  heroImages: string[];
  brands: string[];
  sidebarTitle: string;
  sidebar: ApparelNavItem[];
  products: ApparelProduct[];
};

/** Popular Products Apparel flyout (UPrinting order). */
export const APPAREL_FLYOUT: { label: string; href: string }[] = [
  { label: "T-Shirts", href: "/products/apparel/t-shirts" },
  { label: "Polo Shirts", href: "/products/apparel/polo-shirts" },
  { label: "Jackets", href: "/products/apparel/jackets" },
  { label: "Sweatshirts", href: "/products/apparel/sweatshirts" },
  { label: "Hats", href: "/products/apparel/hats" },
  { label: "Workwear", href: "/products/apparel/workwear" },
];

const BRANDS = [
  "Under Armour",
  "Carhartt",
  "Nike",
  "Hanes",
  "Sport-Tek",
  "Gildan",
  "Bella+Canvas",
  "Reebok",
];

const TSHIRT_IMG = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1622445275576-721929413ce4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
];

function tee(
  id: string,
  name: string,
  price: number,
  type: string,
  img: number,
): ApparelProduct {
  return {
    id,
    name,
    slug: id,
    price,
    type,
    imageUrl: TSHIRT_IMG[img % TSHIRT_IMG.length]!,
  };
}

export const APPAREL_CATEGORIES: Record<string, ApparelCategory> = {
  "t-shirts": {
    slug: "t-shirts",
    name: "T-Shirts",
    title: "Custom T-Shirts",
    tagline:
      "Classic, comfortable, and custom shirts tailored to your brand — print or embroider your logo on trusted blanks.",
    bullets: [
      "Custom printing & embroidery for your designs",
      "Extensive shirt sizes from XS to 5XL",
      "Top brands: Gildan, Bella+Canvas, Nike & more",
      "Bulk discounts with fast turnaround options",
    ],
    heroImages: [TSHIRT_IMG[0]!, TSHIRT_IMG[1]!, TSHIRT_IMG[2]!],
    brands: BRANDS,
    sidebarTitle: "T-Shirts",
    sidebar: [
      { label: "Short Sleeve T-Shirts", slug: "short-sleeve" },
      { label: "Long Sleeve T-Shirts", slug: "long-sleeve" },
      { label: "Work T-Shirts", slug: "work" },
      { label: "Dry Performance T-Shirts", slug: "performance" },
      { label: "Mens T-Shirts", slug: "mens" },
      { label: "Ladies T-Shirts", slug: "ladies" },
      { label: "Under Armour T-Shirts", slug: "under-armour" },
      { label: "Carhartt T-Shirts", slug: "carhartt" },
      { label: "Nike T-Shirts", slug: "nike" },
      { label: "Tank Tops", slug: "tank" },
    ],
    products: [
      tee("gildan-ultra-cotton", "Gildan Adult Unisex Ultra Cotton® T-shirt", 7.59, "short-sleeve", 0),
      tee("gildan-softstyle", "Gildan Softstyle® Adult T-Shirt", 8.29, "short-sleeve", 1),
      tee("bella-canvas-3001", "Bella+Canvas Unisex Jersey T-Shirt", 9.45, "short-sleeve", 2),
      tee("hanes-beefy", "Hanes Beefy-T® Adult Short Sleeve", 7.99, "short-sleeve", 3),
      tee("nike-legend", "Nike Dri-FIT Legend Tee", 18.5, "performance", 4),
      tee("ua-tech", "Under Armour Tech™ Short Sleeve", 19.25, "under-armour", 5),
      tee("carhartt-pocket", "Carhartt® Short Sleeve Pocket T-Shirt", 23.54, "carhartt", 6),
      tee("gildan-long-sleeve", "Gildan Ultra Cotton® Long Sleeve", 11.2, "long-sleeve", 7),
      tee("ladies-favorite", "Ladies Favorite Tee", 9.15, "ladies", 8),
      tee("mens-heavy-cotton", "Mens Heavy Cotton T-Shirt", 8.05, "mens", 0),
      tee("work-pocket-tee", "Work Pocket T-Shirt", 14.8, "work", 1),
      tee("tank-unisex", "Unisex Tank Top", 8.75, "tank", 2),
    ],
  },
  "polo-shirts": {
    slug: "polo-shirts",
    name: "Polo Shirts",
    title: "Custom Polo Shirts",
    tagline:
      "Polished polos for teams, events, and everyday brand wear — embroidered or printed.",
    bullets: [
      "Classic and performance polo styles",
      "Men’s, ladies’, and unisex fits",
      "Embroidery-ready collars and plackets",
      "Low minimums with bulk pricing",
    ],
    heroImages: [TSHIRT_IMG[3]!, TSHIRT_IMG[4]!, TSHIRT_IMG[5]!],
    brands: BRANDS,
    sidebarTitle: "Polo Shirts",
    sidebar: [
      { label: "Short Sleeve Polos", slug: "short-sleeve" },
      { label: "Long Sleeve Polos", slug: "long-sleeve" },
      { label: "Performance Polos", slug: "performance" },
      { label: "Mens Polos", slug: "mens" },
      { label: "Ladies Polos", slug: "ladies" },
    ],
    products: [
      tee("sport-tek-polo", "Sport-Tek PosiCharge Polo", 14.59, "performance", 3),
      tee("gildan-dryblend-polo", "Gildan DryBlend Jersey Polo", 12.4, "short-sleeve", 4),
      tee("nike-polo", "Nike Golf Dri-FIT Polo", 28.9, "performance", 5),
      tee("ladies-polo", "Ladies Soft Touch Polo", 15.2, "ladies", 6),
      tee("mens-classic-polo", "Mens Classic Pique Polo", 13.75, "mens", 7),
      tee("long-sleeve-polo", "Long Sleeve Pique Polo", 16.5, "long-sleeve", 8),
    ],
  },
  jackets: {
    slug: "jackets",
    name: "Jackets",
    title: "Custom Jackets",
    tagline:
      "Branded jackets built for weather, work, and team spirit — print or embroider your logo.",
    bullets: [
      "Softshell, fleece, and work jackets",
      "Trusted brands including Carhartt",
      "Embroidery and print decoration",
      "Sizes for the whole team",
    ],
    heroImages: [TSHIRT_IMG[6]!, TSHIRT_IMG[7]!, TSHIRT_IMG[1]!],
    brands: BRANDS,
    sidebarTitle: "Jackets",
    sidebar: [
      { label: "Fleece Jackets", slug: "fleece" },
      { label: "Softshell Jackets", slug: "softshell" },
      { label: "Work Jackets", slug: "work" },
      { label: "Rain Jackets", slug: "rain" },
    ],
    products: [
      tee("fleece-full-zip", "Full-Zip Fleece Jacket", 32.5, "fleece", 6),
      tee("softshell-core", "Core Softshell Jacket", 41.2, "softshell", 7),
      tee("carhartt-active", "Carhartt® Duck Active Jacket", 120.07, "work", 0),
      tee("rain-defender", "Rain Defender Hooded Jacket", 69.91, "rain", 1),
    ],
  },
  sweatshirts: {
    slug: "sweatshirts",
    name: "Sweatshirts",
    title: "Custom Sweatshirts",
    tagline:
      "Soft, cozy sweatshirts and hoodies personalized with your brand.",
    bullets: [
      "Hoodies, crewnecks, and zip-ups",
      "Lightweight and midweight options",
      "Print or embroidery decoration",
      "Popular brands and colorways",
    ],
    heroImages: [TSHIRT_IMG[5]!, TSHIRT_IMG[8]!, TSHIRT_IMG[0]!],
    brands: BRANDS,
    sidebarTitle: "Sweatshirts",
    sidebar: [
      { label: "Hoodies", slug: "hoodie" },
      { label: "Crewnecks", slug: "crewneck" },
      { label: "Zip-Ups", slug: "zip" },
      { label: "Performance", slug: "performance" },
    ],
    products: [
      tee("gildan-hoodie", "Gildan Heavy Blend Hoodie", 22.4, "hoodie", 5),
      tee("crewneck-classic", "Classic Crewneck Sweatshirt", 18.9, "crewneck", 8),
      tee("zip-hoodie", "Full-Zip Hooded Sweatshirt", 26.75, "zip", 0),
      tee("nike-hoodie", "Nike Club Fleece Hoodie", 48.0, "performance", 4),
    ],
  },
  hats: {
    slug: "hats",
    name: "Hats",
    title: "Custom Hats",
    tagline:
      "Caps and hats that put your logo front and center — embroidered for a premium finish.",
    bullets: [
      "Structured and unstructured caps",
      "Beanies and performance hats",
      "Embroidery-ready panels",
      "Bulk-friendly pricing",
    ],
    heroImages: [TSHIRT_IMG[2]!, TSHIRT_IMG[3]!, TSHIRT_IMG[4]!],
    brands: BRANDS,
    sidebarTitle: "Hats",
    sidebar: [
      { label: "Baseball Caps", slug: "baseball" },
      { label: "Trucker Hats", slug: "trucker" },
      { label: "Beanies", slug: "beanie" },
      { label: "Performance Hats", slug: "performance" },
    ],
    products: [
      tee("structured-cap", "Structured Baseball Cap", 12.5, "baseball", 2),
      tee("trucker-mesh", "Mesh Trucker Hat", 11.8, "trucker", 3),
      tee("cuff-beanie", "Cuffed Beanie", 10.25, "beanie", 4),
      tee("nike-cap", "Nike Dri-FIT Cap", 22.0, "performance", 5),
    ],
  },
  workwear: {
    slug: "workwear",
    name: "Workwear",
    title: "Custom Workwear",
    tagline:
      "Durable uniforms and work apparel from brands built for the job site.",
    bullets: [
      "Carhartt, Dickies & more",
      "Shirts, jackets, and hats for crews",
      "High-visibility options available",
      "Embroidery for a professional look",
    ],
    heroImages: [TSHIRT_IMG[6]!, TSHIRT_IMG[0]!, TSHIRT_IMG[7]!],
    brands: BRANDS,
    sidebarTitle: "Workwear",
    sidebar: [
      { label: "Work Shirts", slug: "shirts" },
      { label: "Work Jackets", slug: "jackets" },
      { label: "Work Hats", slug: "hats" },
      { label: "High-Visibility", slug: "hiviz" },
    ],
    products: [
      tee("carhartt-work-tee", "Carhartt® Work Pocket Tee", 23.54, "shirts", 6),
      tee("dickies-work-shirt", "Dickies Industrial Work Shirt", 25.83, "shirts", 7),
      tee("carhartt-work-jacket", "Carhartt® Duck Detroit Jacket", 137.55, "jackets", 0),
      tee("carhartt-hat", "Carhartt® Cotton Canvas Hat", 22.03, "hats", 1),
    ],
  },
};

export function getApparelCategory(slug: string): ApparelCategory | null {
  return APPAREL_CATEGORIES[slug] ?? null;
}
