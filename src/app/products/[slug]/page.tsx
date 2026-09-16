import type { Metadata } from "next";
import { products } from "@/lib/data";
import { getApiBaseUrl } from "@/lib/auth";
import { ProductDetail } from "@/components/products/ProductDetail";
import { rebrandUprintingCopy, stripHtml } from "@/lib/utils";

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

async function fetchSeo(slug: string) {
  try {
    const res = await fetch(
      `${getApiBaseUrl()}/products/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        product?: {
          name?: string;
          description?: string;
          shortDescription?: string | null;
          seoTitle?: string | null;
          seoDescription?: string | null;
        };
      };
    };
    return json.data?.product ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchSeo(slug);
  const title =
    product?.seoTitle?.trim() ||
    product?.name?.trim() ||
    slug.replace(/-/g, " ");
  const rawDescription =
    product?.seoDescription?.trim() ||
    product?.shortDescription?.trim() ||
    (product?.description
      ? stripHtml(product.description).slice(0, 160)
      : "") ||
    "Custom printing on Printoe.";
  const description = rebrandUprintingCopy(rawDescription);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
