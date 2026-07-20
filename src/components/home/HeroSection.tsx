"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { SITE, products } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ProductVisual } from "@/components/shared/ProductVisual";

const trustBadges = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Award, label: "Color guaranteed" },
  { icon: Sparkles, label: "Free artwork review" },
];

const floatingProducts = products.filter((p) => p.featured).slice(0, 3);

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <section className="gradient-hero relative overflow-hidden pt-8 pb-20 md:pt-12 md:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <motion.div
          className="absolute left-[15%] top-[18%] h-16 w-16 rotate-12 rounded-2xl border border-primary/20 bg-primary/5"
          animate={{ rotate: [12, 18, 12], y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[20%] top-[35%] h-12 w-12 rounded-full border border-accent/30 bg-accent/10"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute bottom-24 left-[8%] h-24 w-24 rounded-3xl border border-border/60 bg-card/40 backdrop-blur-sm" />
        <div className="absolute right-[10%] bottom-16 h-20 w-20 rotate-45 rounded-xl border border-primary/15 bg-primary/5" />
      </div>

      <Container size="wide" className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl space-y-8"
          >
            <div className="space-y-4">
              <Badge variant="primary" className="gap-1.5 px-3 py-1.5 text-xs">
                <Zap className="h-3.5 w-3.5" fill="currentColor" />
                {SITE.tagline}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {SITE.name}
                </span>{" "}
                prints that elevate your brand
              </h1>
              <p className="text-lg font-medium leading-relaxed text-text-secondary md:text-xl">
                {SITE.description} Configure, quote, and ship premium print in
                minutes—not weeks.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search business cards, banners, packaging…"
                leftIcon={<Search className="h-4 w-4" />}
                className="flex-1"
                aria-label="Search products"
              />
              <Button type="submit" size="lg" className="shrink-0">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link href="/quote">
                <Button size="lg" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Get Instant Quote
                </Button>
              </Link>
              <Link href="/editor">
                <Button variant="outline" size="lg" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Artwork
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-sm font-semibold text-text-secondary"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative mx-auto hidden h-[480px] w-full max-w-lg lg:block">
            {floatingProducts.map((product, i) => {
              const positions = [
                "left-0 top-8 z-10 w-[58%] animate-float",
                "right-0 top-0 z-20 w-[52%] animate-float-delayed",
                "left-[18%] bottom-0 z-30 w-[55%] animate-float",
              ];
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                  className={`absolute ${positions[i]}`}
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-transform hover:scale-[1.02] focus-ring"
                  >
                    <ProductVisual
                      variant={product.image}
                      className="aspect-[4/3]"
                      label={product.name}
                    />
                    <div className="border-t border-border px-4 py-3">
                      <p className="text-sm font-bold text-text-primary">
                        {product.name}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        From ${product.price.toFixed(2)}{" "}
                        <ArrowRight className="ml-1 inline h-3 w-3" />
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
