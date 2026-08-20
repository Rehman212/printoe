import { ProductListing } from "@/components/products/ProductListing";
import { fetchProducts } from "@/lib/products-api";

export const metadata = {
  title: "Products",
  description:
    "Browse premium print products — business cards, packaging, banners, and more.",
};

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const [params, productsResponse] = await Promise.all([
    searchParams,
    fetchProducts().catch(() => null),
  ]);
  return (
    <ProductListing
      initialCategory={params.category}
      searchQuery={params.q}
      initialProducts={productsResponse?.data ?? null}
    />
  );
}
