import { AdminCrmMenus } from "@/components/admin/crm/AdminCrmMenus";
import { AdminCrmPosts } from "@/components/admin/crm/AdminCrmPosts";
import { AdminCrmPages } from "@/components/admin/crm/AdminCrmPages";
import { notFound } from "next/navigation";

const TITLES: Record<string, string> = {
  menus: "Menus",
  posts: "Posts",
  pages: "Pages",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = TITLES[section] ?? "CRM";
  return {
    title: `${title} | CRM | Admin`,
    description: `Manage ${title.toLowerCase()} in Printoe CRM.`,
  };
}

export default async function AdminCrmSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (section === "menus") return <AdminCrmMenus />;
  if (section === "posts") return <AdminCrmPosts />;
  if (section === "pages") return <AdminCrmPages />;

  notFound();
}
