import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminSection } from "@/components/admin/AdminSection";
import { AdminSettings } from "@/components/admin/AdminSettings";

const TITLES: Record<string, string> = {
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  quotes: "Quotes",
  proofs: "Artwork Proofs",
  categories: "Categories",
  settings: "Settings",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = TITLES[section] ?? "Admin";
  return {
    title: `${title} | Admin`,
    description: `Manage ${title.toLowerCase()} in Printoe admin.`,
  };
}

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (section === "products") {
    return <AdminProducts />;
  }
  if (section === "settings") {
    return <AdminSettings />;
  }
  return <AdminSection section={section} />;
}
