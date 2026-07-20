import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { blogPosts } from "@/lib/data";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProductVisual } from "@/components/shared/ProductVisual";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function BlogPreview() {
  const posts = blogPosts.slice(0, 3);

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Resources"
          title="Print craft & strategy insights"
          description="Guides from our production team to help you ship flawless campaigns."
          align="left"
          action={
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                View all articles
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group focus-ring rounded-2xl"
            >
              <Card hover className="h-full overflow-hidden">
                <div className="relative">
                  <ProductVisual
                    variant={post.image}
                    className="aspect-[16/10] rounded-none rounded-t-2xl"
                    label={post.title}
                  />
                  <div className="absolute left-4 top-4 flex gap-2">
                    <Badge variant="primary">{post.category}</Badge>
                    {post.trending ? (
                      <Badge variant="warning">Trending</Badge>
                    ) : null}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-bold leading-snug text-text-primary transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm font-medium leading-relaxed text-text-secondary line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-text-secondary">
                    {formatDate(post.date)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
