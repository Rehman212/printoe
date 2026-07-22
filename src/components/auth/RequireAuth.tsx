"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function RequireAuth({
  children,
  role,
  loginPath = "/login",
}: {
  children: React.ReactNode;
  role?: "ADMIN" | "CUSTOMER";
  loginPath?: string;
}) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`${loginPath}?next=${next}`);
      return;
    }

    if (role === "ADMIN" && user?.role !== "ADMIN") {
      logout();
      router.replace("/admin/login");
      return;
    }

    if (role === "CUSTOMER" && user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [
    isAuthenticated,
    loading,
    pathname,
    router,
    role,
    user?.role,
    loginPath,
    logout,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-medium text-text-secondary">
        Redirecting to login…
      </div>
    );
  }

  if (role === "ADMIN" && user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm font-medium text-text-secondary">
        Admin access required…
      </div>
    );
  }

  return <>{children}</>;
}
