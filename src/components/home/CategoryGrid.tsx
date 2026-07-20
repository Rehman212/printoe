import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { DynamicIcon } from "@/lib/icons";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export function CategoryGrid() {
  return (
    <Section className="bg-background">
      <Container>
        <SectionHeader
          eyebrow="Shop by category"
          title="Everything your brand prints"
          description="Twelve curated categories with transparent pricing and instant configuration."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group focus-ring rounded-2xl"
            >
              <Card
                hover
                className="relative h-full overflow-hidden p-5 transition-all duration-300 group-hover:border-primary/25"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${category.color}14`,
                      color: category.color,
                    }}
                  >
                    <DynamicIcon name={category.icon} className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-text-secondary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-primary" />
                </div>
                <h3 className="text-base font-bold text-text-primary transition-colors group-hover:text-primary">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-text-secondary line-clamp-2">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs font-semibold">
                  <span className="text-text-secondary">
                    {category.count} products
                  </span>
                  <span className="text-primary">
                    From {formatCurrency(category.startingPrice)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
