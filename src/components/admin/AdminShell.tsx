"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <RequireAuth role="ADMIN" loginPath="/admin/login">
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </RequireAuth>
  );
}
