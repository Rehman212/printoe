import { portfolioItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import { ProductVisual } from "@/components/shared/ProductVisual";

const categoryVariants: Record<string, string> = {
  Packaging: "boxes",
  Posters: "posters",
  Stationery: "business-cards",
  Labels: "labels",
  "Large Format": "banners",
  Brochures: "brochures",
};

export function PortfolioGallery() {
  return (
    <Section className="bg-background">
      <Container>
        <SectionHeader
          eyebrow="Portfolio"
          title="Work that speaks for itself"
          description="Recent production highlights from brands that trust Pressora for premium print."
        />

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {portfolioItems.map((item) => (
            <article
              key={item.id}
              className={cn(
                "group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-soft",
                item.tall ? "aspect-[3/4]" : "aspect-[4/3]",
              )}
            >
              <ProductVisual
                variant={categoryVariants[item.category] ?? "default"}
                className="h-full w-full transition-transform duration-500 group-hover:scale-110"
                label={item.title}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-card/90 backdrop-blur-sm">
                    {item.category}
                  </Badge>
                  {item.beforeAfter ? (
                    <Badge variant="accent" className="bg-accent/90 text-white">
                      Before / After
                    </Badge>
                  ) : null}
                </div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
