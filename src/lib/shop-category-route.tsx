import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopProductPage } from "@/components/products/ShopProductPage";
import { getShopProduct, getShopSlugs } from "@/lib/shop-catalog";

export function makeShopCategoryRoute(category: string) {
  return {
    generateStaticParams() {
      return getShopSlugs(category).map((slug) => ({ slug }));
    },
    async generateMetadata({
      params,
    }: {
      params: Promise<{ slug: string }>;
    }): Promise<Metadata> {
      const { slug } = await params;
      const product = getShopProduct(category, slug);
      if (!product) return { title: category };
      return {
        title: product.name,
        description: product.features.join(" · "),
      };
    },
    async Page({ params }: { params: Promise<{ slug: string }> }) {
      const { slug } = await params;
      const product = getShopProduct(category, slug);
      if (!product) notFound();
      return <ShopProductPage product={product} />;
    },
  };
}
