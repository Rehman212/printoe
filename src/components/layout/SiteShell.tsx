"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { FloatingQuoteCTA } from "@/components/shared/FloatingQuoteCTA";
import { ProductStoreProvider } from "@/lib/product-store";
import { CartProvider } from "@/lib/cart-store";
import { AuthProvider } from "@/components/auth/AuthProvider";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith("/editor");
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAdmin = pathname?.startsWith("/admin");
  const isAuth =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/admin/login" ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/signup/") ||
    pathname?.startsWith("/admin/login/");
  const hideChrome = isEditor || isAuth || (isAdmin && !pathname?.startsWith("/admin/login"));
  const hideFooter = isEditor || isDashboard || isAuth || isAdmin;
  const hideQuote = isAuth || isAdmin || isEditor;

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ProductStoreProvider>
            <div className="flex min-h-full flex-col">
              {hideChrome ? null : (
                <Header announcementOnly={Boolean(isDashboard)} />
              )}
              <main className="flex-1">{children}</main>
              {!hideFooter ? <Footer /> : null}
              {!hideQuote ? <FloatingQuoteCTA /> : null}
            </div>
          </ProductStoreProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
