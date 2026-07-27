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
  meta?: { icon?: string; image?: string } | null;
};

export type ProductOptionGroup = {
  id: string;
  key: string;
  label: string;
  uiType: OptionUiType;
  required: boolean;
  sortOrder: number;
  helpText?: string | null;
  values: ProductOptionValue[];
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAt?: number | null;
  rating: number;
  reviews: number;
  deliveryDays: number;
  badge?: string | null;
  imageUrl?: string | null;
  galleryUrls?: string[];
  featured?: boolean;
  active?: boolean;
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
