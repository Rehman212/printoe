import Link from "next/link";
import { categories } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { DynamicIcon } from "@/lib/icons";
import { Container, Section } from "@/components/ui/Section";

export function CategoryGrid() {
  return (
    <Section className="bg-background py-12 md:py-16">
      <Container size="wide">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-secondary">Shop by Category</h2>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              Find the right print product for your next project
            </p>
          </div>
          <Link
            href="/products"
            className="hidden text-sm font-semibold text-primary hover:underline sm:inline"
          >
            Browse all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center border border-border bg-white p-4 text-center transition hover:border-primary/40 hover:shadow-soft focus-ring"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center text-text-secondary transition group-hover:text-primary">
                <DynamicIcon name={category.icon} className="h-6 w-6" />
              </span>
              <h3 className="text-sm font-semibold text-secondary group-hover:text-primary">
                {category.name}
              </h3>
              <p className="mt-1 text-xs font-medium text-text-secondary">
                From {formatCurrency(category.startingPrice)}
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
