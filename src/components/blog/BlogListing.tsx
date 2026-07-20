"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Search, TrendingUp } from "lucide-react";
import { blogPosts } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Container, Section, SectionHeader } from "@/components/ui/Section";
import { ProductVisual } from "@/components/shared/ProductVisual";

const CATEGORIES = [...new Set(blogPosts.map((p) => p.category))];

export function BlogListing() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0];
  const trending = blogPosts.filter((p) => p.trending);

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || post.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <>
      <Section className="gradient-hero pb-12 pt-12 md:pb-16 md:pt-16">
        <Container>
          <SectionHeader
            align="left"
            eyebrow="Resources"
            title="Print insights & guides"
            description="Expert advice on production, brand craft, and scaling print at enterprise quality."
          />
          <div className="max-w-xl">
            <Input
              placeholder="Search articles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          {featured && !query && !category && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-14"
            >
              <Card hover className="overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <ProductVisual variant={featured.image} className="min-h-[240px] md:min-h-full" />
                  <CardContent className="flex flex-col justify-center p-8 md:p-10">
                    <Badge variant="primary" className="mb-4 w-fit">
                      Featured
                    </Badge>
                    <h2 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base">
                      {featured.excerpt}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-text-secondary">
                      <span>{featured.author}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {featured.readTime}
                      </span>
                    </div>
                    <Link href={`/blog/${featured.slug}`} className="mt-6">
                      <Button className="gap-2">
                        Read article
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="mb-10 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all focus-ring",
                !category
                  ? "bg-primary text-white shadow-soft"
                  : "bg-card text-text-secondary hover:bg-secondary/5",
              )}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-all focus-ring",
                  category === cat
                    ? "bg-primary text-white shadow-soft"
                    : "bg-card text-text-secondary hover:bg-secondary/5",
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-text-primary">
                {query || category ? "Results" : "Latest articles"}
              </h3>
              {filtered.length === 0 ? (
                <p className="text-sm text-text-secondary">No articles match your search.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filtered.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card hover className="h-full overflow-hidden">
                        <ProductVisual variant={post.image} className="aspect-[16/10]" />
                        <CardContent className="p-5">
                          <Badge variant="outline" className="mb-2">
                            {post.category}
                          </Badge>
                          <h4 className="font-bold text-text-primary">{post.title}</h4>
                          <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
                            {post.excerpt}
                          </p>
                          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-text-secondary">
                            <span>{post.date}</span>
                            <span>{post.readTime}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <aside>
              <Card>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-text-primary">Trending</h3>
                  </div>
                  <ul className="space-y-4">
                    {trending.map((post) => (
                      <li key={post.id}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="group block focus-ring rounded-lg"
                        >
                          <p className="text-sm font-semibold text-text-primary group-hover:text-primary">
                            {post.title}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary">{post.readTime}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
