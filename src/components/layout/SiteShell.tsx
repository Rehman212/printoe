"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { FloatingQuoteCTA } from "@/components/shared/FloatingQuoteCTA";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuth =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/signup/");
  const hideChrome = isEditor || isAuth;
  const hideFooter = isEditor || isDashboard || isAuth;

  return (
    <ToastProvider>
      <div className="flex min-h-full flex-col">
        {!hideChrome ? <Header /> : null}
        <main className="flex-1">{children}</main>
        {!hideFooter ? <Footer /> : null}
        {!isAuth ? <FloatingQuoteCTA /> : null}
      </div>
    </ToastProvider>
  );
}
