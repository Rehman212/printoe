import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex min-h-[calc(100vh-2.5rem)] bg-background">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopBar />
          <div className="min-w-0 flex-1 overflow-y-auto p-5 md:p-7 lg:p-8">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}
