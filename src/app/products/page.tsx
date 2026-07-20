import { ProductListing } from "@/components/products/ProductListing";

export const metadata = {
  title: "Products",
  description:
    "Browse premium print products — business cards, packaging, banners, and more.",
};

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <ProductListing
      initialCategory={params.category}
      searchQuery={params.q}
    />
  );
}
