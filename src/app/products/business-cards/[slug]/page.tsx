import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessCardsProductPage } from "@/components/products/BusinessCardsProductPage";
import {
  BUSINESS_CARD_PRODUCTS,
  getBusinessCardProduct,
} from "@/lib/business-cards-catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(BUSINESS_CARD_PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getBusinessCardProduct(slug);
  if (!product) return { title: "Business Cards" };
  return {
    title: product.name,
    description: product.features.join(" · "),
  };
}

export default async function BusinessCardRoute({ params }: Props) {
  const { slug } = await params;
  const product = getBusinessCardProduct(slug);
  if (!product) notFound();
  return <BusinessCardsProductPage product={product} />;
}
