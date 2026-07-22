import { products } from "@/lib/data";
import { ProductDetail } from "@/components/products/ProductDetail";

export const dynamicParams = true;

export function generateStaticParams() {
  return [
    { slug: "custom-stickers" },
    { slug: "vinyl-banners" },
    { slug: "silk-business-cards" },
    ...products.map((product) => ({ slug: product.slug })),
  ].filter(
    (item, index, arr) =>
      arr.findIndex((x) => x.slug === item.slug) === index,
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
