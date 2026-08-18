export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
  startingPrice: number;
  icon: string;
  color: string;
};

export type OptionUiType = "SELECT" | "CARDS" | "NUMBER";

export type ProductOptionValue = {
  id: string;
  label: string;
  value: string;
  priceMod: number;
  sortOrder: number;
  meta?: {
    icon?: string;
    image?: string;
    /** Replaces the base price when this choice is selected. */
    absoluteBasePrice?: number;
    /** Flat amount added per unit when this choice is selected. */
    priceAdd?: number;
    /** Numeric width/height used by area pricing. Falls back to the value. */
    dimension?: number;
    /** Legacy custom-size metadata kept for already-synced products. */
    dimensionInches?: number;
    areaPricing?: { fixed: number; perSquareInch: number };
    quantitySetupCost?: number;
    /** Product-level pricing settings, stored on one option value. */
    pricingConfig?: {
      type: "area";
      widthKey: string;
      heightKey: string;
      setupCost: number;
      rate: number;
      minimumPrice: number;
    };
    hideGroups?: string[];
    labelWhen?: Array<{ key: string; value: string; label: string }>;
    [key: string]: unknown;
  } | null;
};

export type ProductOptionGroup = {
  id: string;
  key: string;
  label: string;
  uiType: OptionUiType;
  required: boolean;
  sortOrder: number;
  helpText?: string | null;
  meta?: {
    defaultsByProduct?: Record<string, string>;
    hideRulesByProduct?: Record<string, Array<Record<string, string>>>;
    [key: string]: unknown;
  } | null;
  values: ProductOptionValue[];
};

export type ProductFaq = {
  question: string;
  answer: string;
};

export type ProductTabField = {
  id: string;
  label: string;
  type: "select" | "text" | "number";
  options?: string[];
  helpText?: string;
};

export type ProductTab = {
  id: string;
  label: string;
  iconUrl?: string;
  /** Starting / base price when this tab is selected */
  price?: number;
  fields: ProductTabField[];
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  basePrice: number;
  compareAt?: number | null;
  rating: number;
  reviews: number;
  deliveryDays: number;
  badge?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  galleryUrls?: string[];
  faqs?: ProductFaq[];
  productTabs?: ProductTab[];
  featured?: boolean;
  active?: boolean;
  pricingMatrixEnabled?: boolean;
  category: { id: string; name: string; slug: string };
  optionGroups?: { id: string; key: string; label: string }[];
  optionGroupCount?: number;
};

export type ProductDetailPayload = {
  product: CatalogProduct;
  options: ProductOptionGroup[];
};

export type ProductOption = {
  label: string;
  value: string;
  priceMod?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  deliveryDays: number;
  badge?: string;
  image: string;
  images: string[];
  /** Real product photos (Unsplash / CDN) for testing */
  imageUrl?: string;
  galleryUrls?: string[];
  materials: string[];
  sizes: string[];
  finishes: string[];
  folding?: string[];
  printedSides?: string[];
  bundling?: string[];
  turnaround?: string[];
  productTypes?: { label: string; value: string }[];
  highlights?: string[];
  featured?: boolean;
  /** Dynamic configurator options from API */
  options?: ProductOptionGroup[];
  basePrice?: number;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  quote: string;
  logo: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  trending?: boolean;
  featured?: boolean;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type Order = {
  id: string;
  product: string;
  status: "processing" | "printing" | "shipped" | "delivered" | "cancelled";
  date: string;
  total: number;
  quantity: number;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  size: string;
  material: string;
  finishing: string;
};
