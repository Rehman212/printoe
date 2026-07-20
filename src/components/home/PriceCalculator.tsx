"use client";

import { useMemo, useState } from "react";
import { Calculator, Zap } from "lucide-react";
import { categories, products } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Misc";
import {
  Container,
  Section,
  SectionHeader,
} from "@/components/ui/Section";

const quantityOptions = [
  { label: "100", value: "100" },
  { label: "250", value: "250" },
  { label: "500", value: "500" },
  { label: "1,000", value: "1000" },
  { label: "2,500", value: "2500" },
  { label: "5,000", value: "5000" },
];

const turnaroundOptions = [
  { label: "Standard (5–7 days)", value: "standard", multiplier: 1 },
  { label: "Express (3 days)", value: "express", multiplier: 1.25 },
  { label: "Rush (Next day)", value: "rush", multiplier: 1.55 },
];

const finishingOptions = [
  { label: "None", value: "none", addon: 0 },
  { label: "Matte laminate", value: "matte", addon: 12 },
  { label: "Soft touch", value: "soft-touch", addon: 18 },
  { label: "Spot UV", value: "spot-uv", addon: 28 },
  { label: "Foil stamp", value: "foil", addon: 45 },
];

function getProductsForCategory(categorySlug: string) {
  return products.filter((p) => p.category === categorySlug);
}

export function PriceCalculator() {
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [productSlug, setProductSlug] = useState(
    () => getProductsForCategory(categories[0].slug)[0]?.slug ?? products[0].slug,
  );
  const [quantity, setQuantity] = useState("500");
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("");
  const [finishing, setFinishing] = useState("none");
  const [turnaround, setTurnaround] = useState("standard");

  const categoryProducts = useMemo(
    () => getProductsForCategory(categorySlug),
    [categorySlug],
  );

  const selectedProduct = useMemo(() => {
    const match = categoryProducts.find((p) => p.slug === productSlug);
    return match ?? categoryProducts[0] ?? products[0];
  }, [categoryProducts, productSlug]);

  const sizeOptions = useMemo(
    () =>
      selectedProduct.sizes.map((s) => ({
        label: s,
        value: s,
      })),
    [selectedProduct],
  );

  const materialOptions = useMemo(
    () =>
      selectedProduct.materials.map((m) => ({
        label: m,
        value: m,
      })),
    [selectedProduct],
  );

  const activeSize = size || sizeOptions[0]?.value || "";
  const activeMaterial = material || materialOptions[0]?.value || "";

  const price = useMemo(() => {
    const qty = Number(quantity);
    const baseUnit = selectedProduct.price / 100;
    const volumeDiscount =
      qty >= 5000 ? 0.72 : qty >= 2500 ? 0.8 : qty >= 1000 ? 0.88 : qty >= 500 ? 0.94 : 1;
    const sizeIndex = selectedProduct.sizes.indexOf(activeSize);
    const sizeMultiplier = sizeIndex <= 0 ? 1 : 1 + sizeIndex * 0.08;
    const materialIndex = selectedProduct.materials.indexOf(activeMaterial);
    const materialMultiplier = materialIndex <= 0 ? 1 : 1 + materialIndex * 0.12;
    const finishingAddon =
      finishingOptions.find((f) => f.value === finishing)?.addon ?? 0;
    const turnaroundMultiplier =
      turnaroundOptions.find((t) => t.value === turnaround)?.multiplier ?? 1;

    const subtotal =
      baseUnit * qty * volumeDiscount * sizeMultiplier * materialMultiplier;
    const total = (subtotal + finishingAddon) * turnaroundMultiplier;

    return Math.max(total, selectedProduct.price);
  }, [
    quantity,
    selectedProduct,
    activeSize,
    activeMaterial,
    finishing,
    turnaround,
  ]);

  const unitPrice = price / Number(quantity);

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const nextProducts = getProductsForCategory(slug);
    const next = nextProducts[0]?.slug ?? products[0].slug;
    setProductSlug(next);
    setSize("");
    setMaterial("");
  };

  return (
    <Section>
      <Container>
        <SectionHeader
          eyebrow="Instant pricing"
          title="Calculate your print cost live"
          description="Configure quantity, stock, and finishing to see transparent pricing before you upload artwork."
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <Card className="lg:col-span-3 p-6 md:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Product type"
                value={categorySlug}
                onChange={handleCategoryChange}
                options={categories.map((c) => ({
                  label: c.name,
                  value: c.slug,
                }))}
              />

              {categoryProducts.length > 0 ? (
                <Select
                  label="Product"
                  value={selectedProduct.slug}
                  onChange={(v) => {
                    setProductSlug(v);
                    setSize("");
                    setMaterial("");
                  }}
                  options={categoryProducts.map((p) => ({
                    label: p.name,
                    value: p.slug,
                  }))}
                />
              ) : (
                <Select
                  label="Product"
                  value={selectedProduct.slug}
                  onChange={setProductSlug}
                  options={products.map((p) => ({
                    label: p.name,
                    value: p.slug,
                  }))}
                />
              )}

              <Select
                label="Quantity"
                value={quantity}
                onChange={setQuantity}
                options={quantityOptions}
              />

              <Select
                label="Size"
                value={activeSize}
                onChange={setSize}
                options={sizeOptions}
              />

              <Select
                label="Material"
                value={activeMaterial}
                onChange={setMaterial}
                options={materialOptions}
              />

              <Select
                label="Finishing"
                value={finishing}
                onChange={setFinishing}
                options={finishingOptions.map((f) => ({
                  label: f.label,
                  value: f.value,
                }))}
              />

              <Select
                label="Turnaround"
                value={turnaround}
                onChange={setTurnaround}
                className="sm:col-span-2"
                options={turnaroundOptions.map((t) => ({
                  label: t.label,
                  value: t.value,
                }))}
              />
            </div>
          </Card>

          <Card className="gradient-mesh flex flex-col justify-between p-6 md:p-8 lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Calculator className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-secondary">
                    Estimated total
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-text-primary">
                    {formatCurrency(price)}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Unit price</dt>
                  <dd className="font-semibold text-text-primary">
                    {formatCurrency(unitPrice)}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Quantity</dt>
                  <dd className="font-semibold text-text-primary">
                    {Number(quantity).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="font-medium text-text-secondary">Delivery</dt>
                  <dd className="font-semibold text-text-primary">
                    {selectedProduct.deliveryDays} business days
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-text-secondary">Product</dt>
                  <dd className="max-w-[160px] truncate text-right font-semibold text-text-primary">
                    {selectedProduct.name}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 space-y-3">
              <Button className="w-full gap-2" size="lg">
                <Zap className="h-4 w-4" />
                Get this quote
              </Button>
              <p className="text-center text-xs font-medium text-text-secondary">
                Prices update instantly. Volume discounts applied automatically.
              </p>
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
