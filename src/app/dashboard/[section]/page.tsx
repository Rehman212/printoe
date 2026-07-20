import { DashboardSection } from "@/components/dashboard/DashboardSection";

const TITLES: Record<string, string> = {
  orders: "Orders",
  quotations: "Quotations",
  "saved-designs": "Saved Designs",
  downloads: "Downloads",
  invoices: "Invoices",
  wishlist: "Wishlist",
  addresses: "Addresses",
  "payment-methods": "Payment Methods",
  notifications: "Notifications",
  "support-tickets": "Support Tickets",
  "profile-settings": "Profile Settings",
  "team-management": "Team Management",
  "account-security": "Account Security",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const title = TITLES[section] ?? "Dashboard";
  return {
    title: `${title} | Printoe`,
    description: `Manage your ${title.toLowerCase()} on Printoe.`,
  };
}

export default async function DashboardSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <DashboardSection section={section} />;
}
