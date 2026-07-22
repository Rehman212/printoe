"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchProducts } from "@/lib/products-api";
import { products as localProducts } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import type { CatalogProduct } from "@/types";
import { Container, Section } from "@/components/ui/Section";
import { ProductMedia } from "@/components/shared/ProductMedia";
import { StarRating } from "@/components/ui/Misc";

export function FeaturedProducts() {
  const [items, setItems] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      rating: number;
      reviews: number;
      deliveryDays: number;
      imageUrl?: string | null;
      image: string;
    }>
  >(() =>
    localProducts
      .filter((p) => p.featured)
      .slice(0, 8)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        rating: p.rating,
        reviews: p.reviews,
        deliveryDays: p.deliveryDays,
        imageUrl: p.imageUrl,
        image: p.image,
      })),
  );

  useEffect(() => {
    let cancelled = false;
    void fetchProducts(undefined, true)
      .then((res) => {
        if (cancelled || !res.data.length) return;
        setItems(
          res.data.slice(0, 8).map((p: CatalogProduct) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.basePrice,
            rating: p.rating,
            reviews: p.reviews,
            deliveryDays: p.deliveryDays,
            imageUrl: p.imageUrl,
            image: p.category.slug,
          })),
        );
      })
      .catch(() => {
        /* keep local fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Section className="bg-white py-12 md:py-16">
      <Container size="wide">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Featured Products</h2>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              Admin “Feature on homepage” products · live from database
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary hover:underline"
          >
            View all products
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group border border-border bg-white transition hover:border-primary/40 hover:shadow-soft focus-ring"
            >
              <ProductMedia
                imageUrl={product.imageUrl ?? undefined}
                fallbackVariant={product.image}
                label={product.name}
                className="aspect-square"
              />
              <div className="space-y-2 border-t border-border p-4">
                <h3 className="text-sm font-bold text-secondary group-hover:text-primary">
                  {product.name}
                </h3>
                <StarRating rating={product.rating} reviews={product.reviews} />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-bold text-secondary">
                    From {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    {product.deliveryDays}-day delivery
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
