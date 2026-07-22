"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types";
import { products as seedProducts } from "@/lib/data";

const STORAGE_KEY = "printoe-admin-products-v1";
const DELETED_KEY = "printoe-admin-deleted-v1";

type ProductInput = {
  id?: string;
  name: string;
  slug?: string;
  category: string;
  description: string;
  price: number;
  compareAt?: number;
  rating?: number;
  reviews?: number;
  deliveryDays?: number;
  badge?: string;
  image?: string;
  images?: string[];
  imageUrl?: string;
  galleryUrls?: string[];
  materials?: string[];
  sizes?: string[];
  finishes?: string[];
  folding?: string[];
  printedSides?: string[];
  bundling?: string[];
  turnaround?: string[];
  productTypes?: { label: string; value: string }[];
  highlights?: string[];
  featured?: boolean;
};

type ProductStoreValue = {
  products: Product[];
  ready: boolean;
  addProduct: (input: ProductInput) => Product;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getBySlug: (slug: string) => Product | undefined;
};

const ProductStoreContext = createContext<ProductStoreValue | null>(null);

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function loadCustom(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadDeleted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ProductStoreProvider({ children }: { children: ReactNode }) {
  const [custom, setCustom] = useState<Product[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCustom(loadCustom());
    setDeleted(loadDeleted());
    setReady(true);
  }, []);

  const persist = useCallback((nextCustom: Product[], nextDeleted: string[]) => {
    setCustom(nextCustom);
    setDeleted(nextDeleted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCustom));
    localStorage.setItem(DELETED_KEY, JSON.stringify(nextDeleted));
  }, []);

  const products = useMemo(() => {
    const seed = seedProducts.filter((p) => !deleted.includes(p.id));
    const byId = new Map(seed.map((p) => [p.id, p]));
    for (const c of custom) {
      if (!deleted.includes(c.id)) byId.set(c.id, c);
    }
    const extras = custom.filter(
      (c) => !seedProducts.some((s) => s.id === c.id) && !deleted.includes(c.id),
    );
    const rest = [...byId.values()].filter(
      (p) => !extras.some((e) => e.id === p.id),
    );
    return [...extras, ...rest];
  }, [custom, deleted]);

  const addProduct = useCallback(
    (input: ProductInput) => {
      const id = input.id ?? `admin-${Date.now()}`;
      const slugBase = input.slug || slugify(input.name);
      const slug = products.some((p) => p.slug === slugBase)
        ? `${slugBase}-${Date.now().toString(36)}`
        : slugBase;

      const product: Product = {
        id,
        name: input.name,
        slug,
        category: input.category,
        description: input.description,
        price: Number(input.price) || 0,
        compareAt: input.compareAt,
        rating: input.rating ?? 4.8,
        reviews: input.reviews ?? 0,
        deliveryDays: input.deliveryDays ?? 3,
        badge: input.badge,
        image: input.image || input.category,
        images: input.images?.length ? input.images : [input.image || input.category],
        imageUrl: input.imageUrl,
        galleryUrls: input.galleryUrls,
        materials: input.materials?.length ? input.materials : ["Standard"],
        sizes: input.sizes?.length ? input.sizes : ["Standard"],
        finishes: input.finishes?.length ? input.finishes : ["None"],
        folding: input.folding,
        printedSides: input.printedSides,
        bundling: input.bundling,
        turnaround: input.turnaround,
        productTypes: input.productTypes,
        highlights: input.highlights,
        featured: input.featured ?? false,
      };

      const nextCustom = [product, ...custom.filter((c) => c.id !== id)];
      persist(nextCustom, deleted.filter((d) => d !== id));
      return product;
    },
    [custom, deleted, persist, products],
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      const existing =
        custom.find((p) => p.id === id) ??
        seedProducts.find((p) => p.id === id);
      if (!existing) return;
      const updated = { ...existing, ...patch, id };
      const nextCustom = [updated, ...custom.filter((c) => c.id !== id)];
      persist(nextCustom, deleted);
    },
    [custom, deleted, persist],
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const nextCustom = custom.filter((c) => c.id !== id);
      const nextDeleted = deleted.includes(id) ? deleted : [...deleted, id];
      persist(nextCustom, nextDeleted);
    },
    [custom, deleted, persist],
  );

  const getBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products],
  );

  const value = useMemo(
    () => ({
      products,
      ready,
      addProduct,
      updateProduct,
      deleteProduct,
      getBySlug,
    }),
    [products, ready, addProduct, updateProduct, deleteProduct, getBySlug],
  );

  return (
    <ProductStoreContext.Provider value={value}>
      {children}
    </ProductStoreContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductStoreContext);
  if (!ctx) {
    throw new Error("useProducts must be used within ProductStoreProvider");
  }
  return ctx;
}

/** Safe hook when provider may be missing (falls back to seed). */
export function useProductsOptional(): ProductStoreValue {
  const ctx = useContext(ProductStoreContext);
  if (ctx) return ctx;
  return {
    products: seedProducts,
    ready: true,
    addProduct: () => seedProducts[0],
    updateProduct: () => undefined,
    deleteProduct: () => undefined,
    getBySlug: (slug) => seedProducts.find((p) => p.slug === slug),
  };
}
