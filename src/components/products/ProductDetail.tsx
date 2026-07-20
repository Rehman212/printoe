"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileUp,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  Upload,
} from "lucide-react";
import { products } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductVisual } from "@/components/shared/ProductVisual";
import {
  Accordion,
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  EmptyState,
  Input,
  Section,
  StarRating,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from "@/components/ui";
import { Breadcrumbs } from "@/components/ui/Misc";

const QUANTITY_PRESETS = [100, 250, 500, 1000, 2500];
const RECENTLY_VIEWED_KEY = "pressora-recently-viewed";

const faqs = [
  {
    id: "faq-1",
    title: "What file formats do you accept?",
    content:
      "We accept PDF, AI, EPS, and high-resolution PNG/JPG. PDF with embedded fonts and 3mm bleed is preferred for the most accurate production.",
  },
  {
    id: "faq-2",
    title: "Will you review my artwork before printing?",
    content:
      "Yes. Every order includes a complimentary preflight review. Our team flags low resolution, missing bleed, and color profile issues before production.",
  },
  {
    id: "faq-3",
    title: "Can I order a sample before a bulk run?",
    content:
      "Absolutely. Select a lower quantity preset or contact us for a physical proof on premium stocks before your full production run.",
  },
  {
    id: "faq-4",
    title: "What is your reprint policy?",
    content:
      "If output does not meet our quality standard or approved proof, we reprint at no charge. Report issues within 7 days of delivery.",
  },
];

const reviews = [
  {
    id: "r1",
    name: "Alex Rivera",
    role: "Creative Director",
    rating: 5,
    date: "July 2026",
    text: "Color fidelity is exceptional. Our brand blues reproduce perfectly every time.",
  },
  {
    id: "r2",
    name: "Jordan Lee",
    role: "Marketing Manager",
    rating: 5,
    date: "June 2026",
    text: "Configurator made it easy to compare finishes. Delivery was two days early.",
  },
  {
    id: "r3",
    name: "Sam Ortiz",
    role: "Founder",
    rating: 4,
    date: "May 2026",
    text: "Premium feel on the soft-touch stock. Will reorder for our entire sales team.",
  },
];

function calculatePrice(
  product: Product,
  quantity: number,
  materialIndex: number,
  finishIndex: number,
) {
  const materialMultiplier = 1 + materialIndex * 0.08;
  const finishMultiplier = 1 + finishIndex * 0.06;
  const volumeDiscount = quantity >= 1000 ? 0.82 : quantity >= 500 ? 0.88 : quantity >= 250 ? 0.93 : 1;
  return product.price * materialMultiplier * finishMultiplier * volumeDiscount;
}

function saveRecentlyViewed(slug: string) {
  try {
    const existing = JSON.parse(
      localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]",
    ) as string[];
    const next = [slug, ...existing.filter((s) => s !== slug)].slice(0, 4);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
}

function getRecentlyViewed(currentSlug: string) {
  try {
    const slugs = JSON.parse(
      localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]",
    ) as string[];
    return slugs
      .filter((s) => s !== currentSlug)
      .map((s) => products.find((p) => p.slug === s))
      .filter(Boolean) as Product[];
  } catch {
    return [];
  }
}

export function ProductDetail({ slug }: { slug: string }) {
  const product = products.find((p) => p.slug === slug);
  const { toast } = useToast();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [material, setMaterial] = useState(product?.materials[0] ?? "");
  const [finishing, setFinishing] = useState(product?.finishes[0] ?? "");
  const [quantity, setQuantity] = useState(500);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  useEffect(() => {
    if (!product) return;
    saveRecentlyViewed(product.slug);
    setRecentlyViewed(getRecentlyViewed(product.slug));
  }, [product]);

  const materialIndex = product?.materials.indexOf(material) ?? 0;
  const finishIndex = product?.finishes.indexOf(finishing) ?? 0;
  const unitPrice = product
    ? calculatePrice(product, quantity, materialIndex, finishIndex) / quantity
    : 0;
  const totalPrice = unitPrice * quantity;
  const deliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (product?.deliveryDays ?? 3) + (quantity >= 1000 ? 1 : 0));
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [product?.deliveryDays, quantity]);

  const related = useMemo(
    () =>
      products
        .filter((p) => p.category === product?.category && p.slug !== slug)
        .slice(0, 3),
    [product?.category, slug],
  );

  if (!product) {
    return (
      <Section>
        <Container size="narrow">
          <EmptyState
            title="Product not found"
            description="This product may have been moved or discontinued."
            action={
              <Link href="/products">
                <Button>Browse products</Button>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  const gallery = product.images.length ? product.images : [product.image];

  return (
    <>
      <Section className="pb-12 pt-8">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Products", href: "/products" },
              { label: product.name },
            ]}
          />

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ProductVisual
                  variant={gallery[activeImage]}
                  className="aspect-square w-full"
                  label={product.name}
                />
              </motion.div>
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "overflow-hidden rounded-xl border-2 transition-all focus-ring",
                      activeImage === i
                        ? "border-primary shadow-soft"
                        : "border-transparent opacity-80 hover:opacity-100",
                    )}
                  >
                    <ProductVisual variant={img} className="aspect-square" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <Card className="overflow-hidden">
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {product.badge ? (
                        <Badge variant="primary">{product.badge}</Badge>
                      ) : null}
                      <Badge variant="outline">
                        <Truck className="mr-1 h-3 w-3" />
                        {product.deliveryDays} day turnaround
                      </Badge>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                      {product.name}
                    </h1>
                    <StarRating
                      rating={product.rating}
                      reviews={product.reviews}
                      size="md"
                    />
                    <p className="text-sm font-medium leading-relaxed text-text-secondary">
                      {product.description}
                    </p>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
                    <OptionGroup
                      label="Size"
                      options={product.sizes}
                      value={size}
                      onChange={setSize}
                    />
                    <OptionGroup
                      label="Material"
                      options={product.materials}
                      value={material}
                      onChange={setMaterial}
                    />
                    <OptionGroup
                      label="Finishing"
                      options={product.finishes}
                      value={finishing}
                      onChange={setFinishing}
                    />

                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-text-primary">
                        Quantity
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {QUANTITY_PRESETS.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setQuantity(q)}
                            className={cn(
                              "rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus-ring",
                              quantity === q
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-text-secondary hover:border-primary/30",
                            )}
                          >
                            {q.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <Input
                        type="number"
                        min={50}
                        step={50}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(Math.max(50, Number(e.target.value) || 50))
                        }
                        hint="Minimum order 50 units"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                          Estimated total
                        </p>
                        <p className="text-3xl font-bold text-text-primary">
                          {formatCurrency(totalPrice)}
                        </p>
                        <p className="mt-1 text-sm font-medium text-text-secondary">
                          {formatCurrency(unitPrice)} / unit · {quantity.toLocaleString()} qty
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center justify-end gap-1 text-sm font-semibold text-success">
                          <Calendar className="h-4 w-4" />
                          Est. delivery
                        </p>
                        <p className="text-sm font-bold text-text-primary">{deliveryDate}</p>
                      </div>
                    </div>
                  </div>

                  <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-border bg-background p-5 transition-colors hover:border-primary/40 hover:bg-primary/5">
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.ai,.eps,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setUploadName(file?.name ?? null);
                        if (file) {
                          toast({
                            title: "Artwork uploaded",
                            description: file.name,
                            tone: "success",
                          });
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      {uploadName ? (
                        <>
                          <CheckCircle2 className="h-8 w-8 text-success" />
                          <p className="text-sm font-bold text-text-primary">{uploadName}</p>
                          <p className="text-xs font-medium text-text-secondary">
                            Click to replace file
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-primary" />
                          <p className="text-sm font-bold text-text-primary">
                            Upload artwork
                          </p>
                          <p className="text-xs font-medium text-text-secondary">
                            PDF, AI, EPS, or high-res PNG/JPG
                          </p>
                        </>
                      )}
                    </div>
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1"
                      onClick={() =>
                        toast({
                          title: "Added to cart",
                          description: `${quantity} × ${product.name}`,
                          tone: "success",
                        })
                      }
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to cart
                    </Button>
                    <Link href="/quote" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Sparkles className="h-4 w-4" />
                        Get instant quote
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                    {[
                      { icon: ShieldCheck, label: "Quality guarantee" },
                      { icon: FileUp, label: "Free preflight" },
                      { icon: Clock, label: "Express options" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1.5 text-center"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-border bg-card py-16">
        <Container>
          <h2 className="mb-8 text-2xl font-bold text-text-primary">
            Frequently asked questions
          </h2>
          <Accordion items={faqs} className="max-w-3xl" />
        </Container>
      </Section>

      <Section className="py-16">
        <Container>
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="specs">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Category", product.category.replace(/-/g, " ")],
                  ["Available sizes", product.sizes.join(", ")],
                  ["Materials", product.materials.join(", ")],
                  ["Finishes", product.finishes.join(", ")],
                  ["Turnaround", `${product.deliveryDays} business days`],
                  ["Minimum quantity", "50 units"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-card p-4"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold capitalize text-text-primary">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <p className="text-sm font-medium leading-relaxed text-text-secondary">
                    Standard production ships via tracked courier. Express production
                    is available for eligible products with artwork approved before
                    2pm PT.
                  </p>
                  <ul className="space-y-2 text-sm font-semibold text-text-primary">
                    <li className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Free shipping on orders over $150
                    </li>
                    <li className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      International delivery available
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-text-primary">{review.name}</p>
                          <p className="text-xs font-medium text-text-secondary">
                            {review.role} · {review.date}
                          </p>
                        </div>
                        <StarRating rating={review.rating} size="sm" />
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-text-secondary">
                        {review.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section className="border-t border-border bg-background py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-bold text-text-primary">
              Related products
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/products/${item.slug}`}>
                  <Card hover className="overflow-hidden">
                    <ProductVisual
                      variant={item.image}
                      className="aspect-[4/3] rounded-none"
                    />
                    <CardContent className="space-y-2 pt-4">
                      <p className="font-bold text-text-primary">{item.name}</p>
                      <StarRating rating={item.rating} reviews={item.reviews} />
                      <p className="text-sm font-bold text-primary">
                        From {formatCurrency(item.price)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {recentlyViewed.length > 0 ? (
        <Section className="py-16">
          <Container>
            <h2 className="mb-8 text-2xl font-bold text-text-primary">
              Recently viewed
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentlyViewed.map((item) => (
                <Link key={item.id} href={`/products/${item.slug}`}>
                  <Card hover className="overflow-hidden">
                    <ProductVisual
                      variant={item.image}
                      className="aspect-square rounded-none"
                    />
                    <CardContent className="pt-3">
                      <p className="text-sm font-bold text-text-primary">{item.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold text-text-primary">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-semibold transition-all focus-ring",
              value === opt
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-text-secondary hover:border-primary/30",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
