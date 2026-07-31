import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BannerProductPage } from "@/components/products/BannerProductPage";
import { BANNER_PRODUCTS, getBannerProduct } from "@/lib/banners-catalog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(BANNER_PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getBannerProduct(slug);
  if (!product) return { title: "Banners" };
  return {
    title: product.name,
    description: product.features.join(" · "),
  };
}

export default async function BannerProductRoute({ params }: Props) {
  const { slug } = await params;
  const product = getBannerProduct(slug);
  if (!product) notFound();
  return <BannerProductPage product={product} />;
}
