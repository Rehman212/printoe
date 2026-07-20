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
  const hideFooter = isEditor || isDashboard;

  return (
    <ToastProvider>
      <div className="flex min-h-full flex-col">
        {!isEditor ? <Header /> : null}
        <main className="flex-1">{children}</main>
        {!hideFooter ? <Footer /> : null}
        <FloatingQuoteCTA />
      </div>
    </ToastProvider>
  );
}
