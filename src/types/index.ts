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
  materials: string[];
  sizes: string[];
  finishes: string[];
  featured?: boolean;
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
  quantity: number;
  unitPrice: number;
  size: string;
  material: string;
  finishing: string;
};
