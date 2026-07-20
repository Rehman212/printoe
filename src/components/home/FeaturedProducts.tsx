import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import { ProductCard } from "@/components/products/ProductCard";

export function FeaturedProducts() {
  const featured = products.filter((p) => p.featured);

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Featured"
          title="Best-selling print essentials"
          description="Hand-picked products with premium finishes, fast turnaround, and thousands of five-star reviews."
          align="left"
          action={
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                View all products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
