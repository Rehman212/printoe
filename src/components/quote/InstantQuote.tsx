"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calculator, Sparkles, Truck } from "lucide-react";
import { categories, products } from "@/lib/data";
import { createCustomerQuote } from "@/lib/customer-api";
import { useAuth } from "@/components/auth/AuthProvider";
import { formatCurrency } from "@/lib/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Container,
  Input,
  Section,
  SectionHeader,
  useToast,
} from "@/components/ui";
import { Breadcrumbs, Select } from "@/components/ui/Misc";

const quantityPresets = [100, 250, 500, 1000, 2500];

export function InstantQuote() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState(categories[0]?.slug ?? "");
  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [finishing, setFinishing] = useState("");
  const [quantity, setQuantity] = useState(500);

  const categoryProducts = useMemo(
    () => products.filter((p) => p.category === category),
    [category],
  );

  const product = useMemo(
    () => categoryProducts.find((p) => p.slug === productSlug) ?? categoryProducts[0],
    [categoryProducts, productSlug],
  );

  const effectiveSize = size || product?.sizes[0] || "";
  const effectiveMaterial = material || product?.materials[0] || "";
  const effectiveFinishing = finishing || product?.finishes[0] || "";

  const estimate = useMemo(() => {
    if (!product) return 0;
    const materialIndex = product.materials.indexOf(effectiveMaterial);
    const finishIndex = product.finishes.indexOf(effectiveFinishing);
    const materialMultiplier = 1 + Math.max(0, materialIndex) * 0.08;
    const finishMultiplier = 1 + Math.max(0, finishIndex) * 0.06;
    const volumeDiscount =
      quantity >= 1000 ? 0.82 : quantity >= 500 ? 0.88 : quantity >= 250 ? 0.93 : 1;
    return product.price * materialMultiplier * finishMultiplier * volumeDiscount;
  }, [product, effectiveMaterial, effectiveFinishing, quantity]);

  const unitPrice = product ? estimate / quantity : 0;
  const deliveryDays = product?.deliveryDays ?? 5;

  return (
    <Section className="pb-20 pt-8">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Instant quote" },
          ]}
        />

        <SectionHeader
          align="left"
          eyebrow="Pricing"
          title="Instant quote calculator"
          description="Configure your print job and get an estimated price in seconds — no account required."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div className="flex items-center gap-2 text-primary">
                <Calculator className="h-5 w-5" />
                <h2 className="text-lg font-bold text-text-primary">Configure your job</h2>
              </div>

              <Select
                label="Category"
                options={categories.map((c) => ({ label: c.name, value: c.slug }))}
                value={category}
                onChange={(value) => {
                  setCategory(value);
                  const first = products.find((p) => p.category === value);
                  if (first) setProductSlug(first.slug);
                  setSize("");
                  setMaterial("");
                  setFinishing("");
                }}
              />

              <Select
                label="Product"
                options={categoryProducts.map((p) => ({
                  label: p.name,
                  value: p.slug,
                }))}
                value={product?.slug ?? ""}
                onChange={(value) => {
                  setProductSlug(value);
                  setSize("");
                  setMaterial("");
                  setFinishing("");
                }}
              />

              {product ? (
                <>
                  <Select
                    label="Size"
                    options={product.sizes.map((s) => ({ label: s, value: s }))}
                    value={effectiveSize}
                    onChange={setSize}
                  />
                  <Select
                    label="Material"
                    options={product.materials.map((m) => ({ label: m, value: m }))}
                    value={effectiveMaterial}
                    onChange={setMaterial}
                  />
                  <Select
                    label="Finishing"
                    options={product.finishes.map((f) => ({ label: f, value: f }))}
                    value={effectiveFinishing}
                    onChange={setFinishing}
                  />
                </>
              ) : null}

              <div className="space-y-2">
                <span className="text-sm font-semibold text-text-primary">Quantity</span>
                <div className="flex flex-wrap gap-2">
                  {quantityPresets.map((q) => (
                    <Button
                      key={q}
                      variant={quantity === q ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setQuantity(q)}
                    >
                      {q.toLocaleString()}
                    </Button>
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
                />
              </div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <Card className="overflow-hidden border-primary/20">
              <div className="gradient-cta px-6 py-5 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Your estimate</h2>
                </div>
              </div>
              <CardContent className="space-y-5 pt-6">
                {product ? (
                  <>
                    <div>
                      <p className="text-3xl font-bold text-text-primary">
                        {formatCurrency(estimate)}
                      </p>
                      <p className="mt-1 text-sm font-medium text-text-secondary">
                        {formatCurrency(unitPrice)} per unit · {quantity.toLocaleString()} qty
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{effectiveSize}</Badge>
                      <Badge variant="outline">{effectiveMaterial}</Badge>
                      <Badge variant="outline">{effectiveFinishing}</Badge>
                    </div>

                    <p className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                      <Truck className="h-4 w-4 text-primary" />
                      Est. {deliveryDays} business day production
                    </p>

                    <Link href={`/products/${product.slug}`}>
                      <Button className="w-full">Configure & order</Button>
                    </Link>
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={submitting}
                        onClick={() => {
                          setSubmitting(true);
                          void createCustomerQuote({
                            productName: product.name,
                            quantity,
                            total: Number(estimate.toFixed(2)),
                            notes: `${effectiveSize} · ${effectiveMaterial} · ${effectiveFinishing}`,
                          })
                            .then(() => {
                              toast({
                                title: "Quote submitted",
                                description: "Saved to your dashboard · Quotations",
                                tone: "success",
                              });
                            })
                            .catch((err) =>
                              toast({
                                title: "Quote failed",
                                description:
                                  err instanceof Error
                                    ? err.message
                                    : "Could not save quote",
                                tone: "danger",
                              }),
                            )
                            .finally(() => setSubmitting(false));
                        }}
                      >
                        {submitting ? "Submitting…" : "Save quote to account"}
                      </Button>
                    ) : (
                      <Link href="/login">
                        <Button variant="outline" className="w-full">
                          Sign in to save quote
                        </Button>
                      </Link>
                    )}
                    <Link href="/cart">
                      <Button variant="ghost" className="w-full">
                        Add to cart
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm font-medium text-text-secondary">
                    Select a category to begin.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
