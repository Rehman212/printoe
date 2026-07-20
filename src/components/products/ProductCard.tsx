"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Palette } from "lucide-react";
import type { Product } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { ProductVisual } from "@/components/shared/ProductVisual";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/Misc";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const [favorited, setFavorited] = useState(false);

  return (
    <Card hover className={cn("group overflow-hidden", className)}>
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <ProductVisual
            variant={product.image}
            className="aspect-[4/3] rounded-none rounded-t-2xl"
            label={product.name}
          />
        </Link>
        {product.badge ? (
          <Badge variant="primary" className="absolute left-4 top-4">
            {product.badge}
          </Badge>
        ) : null}
        <button
          type="button"
          onClick={() => setFavorited((v) => !v)}
          className={cn(
            "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card/90 shadow-soft backdrop-blur-sm transition-all hover:scale-105 focus-ring",
            favorited && "border-danger/30 bg-danger/10 text-danger",
          )}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorited}
        >
          <Heart
            className={cn("h-4 w-4", favorited && "fill-current")}
          />
        </button>
      </div>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Link
            href={`/products/${product.slug}`}
            className="block focus-ring rounded-lg"
          >
            <h3 className="text-base font-bold text-text-primary transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <StarRating rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-text-primary">
              {formatCurrency(product.price)}
            </p>
            {product.compareAt ? (
              <p className="text-xs font-medium text-text-secondary line-through">
                {formatCurrency(product.compareAt)}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs font-medium text-text-secondary">
              {product.deliveryDays}-day delivery
            </p>
          </div>
          <Link href={`/products/${product.slug}?customize=true`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              Customize
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
