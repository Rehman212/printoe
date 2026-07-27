"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import { useProductsOptional } from "@/lib/product-store";
import { fetchProducts } from "@/lib/products-api";
import { addCustomerWishlist } from "@/lib/customer-api";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn, formatCurrency } from "@/lib/utils";
import type { CatalogProduct, Product } from "@/types";
import { ProductVisual } from "@/components/shared/ProductVisual";
import {
  ProductFilters,
  defaultProductFilters,
  type ProductFiltersState,
} from "./ProductFilters";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  EmptyState,
  Section,
  SectionHeader,
  StarRating,
  useToast,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Misc";

export type ProductListingProps = {
  initialCategory?: string;
  searchQuery?: string;
};

const PAGE_SIZE = 12;

function catalogToProduct(p: CatalogProduct): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.slug,
    description: p.description,
    price: p.basePrice,
    compareAt: p.compareAt ?? undefined,
    rating: p.rating,
    reviews: p.reviews,
    deliveryDays: p.deliveryDays,
    badge: p.badge ?? undefined,
    image: p.category.slug,
    images: [p.category.slug],
    imageUrl: p.imageUrl ?? undefined,
    galleryUrls: p.galleryUrls,
    materials: [],
    sizes: [],
    finishes: [],
    featured: p.featured,
  };
}

function matchesDelivery(product: Product, deliveryTime: string) {
  if (deliveryTime === "all") return true;
  if (deliveryTime === "fast") return product.deliveryDays <= 2;
  if (deliveryTime === "standard")
    return product.deliveryDays >= 3 && product.deliveryDays <= 5;
  return product.deliveryDays > 5;
}

function filterProducts(
  list: Product[],
  filters: ProductFiltersState,
  searchQuery?: string,
) {
  const q = searchQuery?.trim().toLowerCase();
  return list.filter((p) => {
    if (filters.category !== "all" && p.category !== filters.category) return false;
    if (
      filters.size !== "all" &&
      p.sizes.length > 0 &&
      !p.sizes.includes(filters.size)
    )
      return false;
    if (
      filters.material !== "all" &&
      p.materials.length > 0 &&
      !p.materials.includes(filters.material)
    )
      return false;
    if (
      filters.finishing !== "all" &&
      p.finishes.length > 0 &&
      !p.finishes.includes(filters.finishing)
    )
      return false;
    if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
    if (p.rating < filters.minRating) return false;
    if (!matchesDelivery(p, filters.deliveryTime)) return false;
    if (
      q &&
      !`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
}

function sortProducts(list: Product[], sort: string) {
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "delivery":
      return sorted.sort((a, b) => a.deliveryDays - b.deliveryDays);
    case "featured":
    default:
      return sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.reviews - a.reviews,
      );
  }
}

function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <Card hover className="group flex h-full flex-col overflow-hidden">
      <Link href={`/products/${product.slug}`} className="relative block">
        <ProductVisual
          variant={product.image}
          imageUrl={product.imageUrl}
          className="aspect-[4/3] rounded-none"
          label={product.name}
        />
        {product.badge ? (
          <Badge variant="primary" className="absolute left-4 top-4">
            {product.badge}
          </Badge>
        ) : null}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 bg-card/90 text-text-primary backdrop-blur-sm"
            aria-label="Add to wishlist"
            onClick={(e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                toast({
                  title: "Sign in required",
                  description: "Log in to save wishlist items.",
                  tone: "warning",
                });
                return;
              }
              void addCustomerWishlist({
                productSlug: product.slug,
                name: product.name,
                productId: product.id,
                imageUrl: product.imageUrl,
                basePrice: product.price,
              })
                .then(() =>
                  toast({ title: "Saved to wishlist", tone: "success" }),
                )
                .catch((err) =>
                  toast({
                    title: "Wishlist failed",
                    description:
                      err instanceof Error ? err.message : "Try again",
                    tone: "danger",
                  }),
                );
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col gap-3 pt-4">
        <div className="space-y-2">
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 text-base font-bold text-text-primary transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>

        <p className="line-clamp-2 text-sm font-medium text-text-secondary">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.compareAt ? (
                <span className="text-sm font-medium text-text-secondary line-through">
                  {formatCurrency(product.compareAt)}
                </span>
              ) : null}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-text-secondary">
              <Truck className="h-3.5 w-3.5" />
              {product.deliveryDays} day delivery
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Link href={`/products/${product.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4" />
              View
            </Button>
          </Link>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              void addItem({
                productId: product.id,
                productSlug: product.slug,
                name: product.name,
                image: product.image,
                imageUrl: product.imageUrl,
                quantity: 1,
                unitPrice: product.price,
                size: product.sizes?.[0],
                material: product.materials?.[0],
                finishing: product.finishes?.[0],
              })
                .then(() =>
                  toast({
                    title: "Added to cart",
                    description: product.name,
                    tone: "success",
                  }),
                )
                .catch((err) =>
                  toast({
                    title: "Could not add to cart",
                    description:
                      err instanceof Error ? err.message : "Try again",
                    tone: "danger",
                  }),
                );
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductListing({
  initialCategory,
  searchQuery,
}: ProductListingProps = {}) {
  const localStore = useProductsOptional();
  const [apiProducts, setApiProducts] = useState<Product[] | null>(null);
  const [filters, setFilters] = useState<ProductFiltersState>({
    ...defaultProductFilters,
    category: initialCategory || "all",
  });
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchProducts()
      .then((res) => {
        if (!cancelled) setApiProducts(res.data.map(catalogToProduct));
      })
      .catch(() => {
        if (!cancelled) setApiProducts(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const products = apiProducts ?? localStore.products;

  const filtered = useMemo(
    () =>
      sortProducts(
        filterProducts(products, filters, searchQuery),
        filters.sort,
      ),
    [filters, searchQuery, products],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleFilterChange = (next: ProductFiltersState) => {
    setFilters(next);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(defaultProductFilters);
    setPage(1);
  };

  return (
    <Section className="pb-20 pt-8">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products" },
          ]}
        />

        <SectionHeader
          align="left"
          eyebrow="Catalog"
          title="Premium print products"
          description="Configure size, stock, and finish — then upload artwork for production-ready output."
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 lg:hidden">
          <p className="text-sm font-semibold text-text-secondary">
            {filtered.length} products
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <ProductFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            className="hidden lg:block"
          />

          <div>
            <div className="mb-6 hidden items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-soft lg:flex">
              <p className="text-sm font-semibold text-text-secondary">
                Showing{" "}
                <span className="text-text-primary">{filtered.length}</span>{" "}
                products
              </p>
              <p className="text-sm font-semibold text-text-secondary">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {paginated.length === 0 ? (
              <EmptyState
                title="No products match your filters"
                description="Try adjusting categories, price range, or delivery options."
                action={
                  <Button variant="outline" onClick={handleReset}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <motion.div
                key={`${currentPage}-${filters.sort}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {paginated.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}

            {totalPages > 1 ? (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    variant={n === currentPage ? "primary" : "outline"}
                    size="sm"
                    className="min-w-10"
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-secondary/40 backdrop-blur-sm"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold text-text-primary">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileFiltersOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ProductFilters
                filters={filters}
                onChange={(next) => {
                  handleFilterChange(next);
                }}
                onReset={handleReset}
                className="static max-h-none border-0 p-0 shadow-none"
              />
            </div>
            <div className="border-t border-border p-4">
              <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
                Show {filtered.length} products
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Section>
  );
}
