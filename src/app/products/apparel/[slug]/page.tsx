import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApparelCategoryPage } from "@/components/products/ApparelCategoryPage";
import { APPAREL_CATEGORIES, getApparelCategory } from "@/lib/apparel-catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
};

export function generateStaticParams() {
  return Object.keys(APPAREL_CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getApparelCategory(slug);
  if (!category) return { title: "Apparel" };
  return {
    title: category.title,
    description: category.tagline,
  };
}

export default async function ApparelSubcategoryPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { type } = await searchParams;
  const category = getApparelCategory(slug);
  if (!category) notFound();

  return (
    <ApparelCategoryPage category={category} initialType={type} />
  );
}
