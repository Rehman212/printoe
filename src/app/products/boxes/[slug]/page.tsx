import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoxesProductPage } from "@/components/products/BoxesProductPage";
import { BOX_PRODUCTS, getBoxProduct } from "@/lib/boxes-catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(BOX_PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getBoxProduct(slug);
  if (!product) return { title: "Boxes" };
  return {
    title: product.name,
    description: product.caption,
  };
}

export default async function BoxProductRoute({ params }: Props) {
  const { slug } = await params;
  const product = getBoxProduct(slug);
  if (!product) notFound();
  return <BoxesProductPage product={product} />;
}
