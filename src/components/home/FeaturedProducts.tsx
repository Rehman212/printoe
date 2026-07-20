import Link from "next/link";
import { products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Container, Section } from "@/components/ui/Section";
import { ProductVisual } from "@/components/shared/ProductVisual";
import { StarRating } from "@/components/ui/Misc";

export function FeaturedProducts() {
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <Section className="bg-white py-12 md:py-16">
      <Container size="wide">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Featured Products</h2>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              Customer favorites with fast turnaround
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
          {featured.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group border border-border bg-white transition hover:border-primary/40 hover:shadow-soft focus-ring"
            >
              <ProductVisual
                variant={product.image}
                className="aspect-square rounded-none"
                label={product.name}
                style="catalog"
              />
              <div className="space-y-2 border-t border-border p-4">
                <h3 className="text-sm font-bold text-secondary group-hover:text-primary">
                  {product.name}
                </h3>
                <StarRating rating={product.rating} reviews={product.reviews} />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-base font-bold text-secondary">
                    {formatCurrency(product.price)}
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
