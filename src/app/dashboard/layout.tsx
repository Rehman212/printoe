import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-background">
      <DashboardSidebar />
      <div className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        {children}
      </div>
    </div>
  );
}
