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
import {
  SiteSettingsProvider,
  useSiteSettings,
} from "@/components/settings/SiteSettingsProvider";
import { MaintenanceGate } from "@/components/settings/MaintenanceGate";
import { SiteDocumentEffects } from "@/components/settings/SiteDocumentEffects";

function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const site = useSiteSettings();
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
  const maintenancePublic = site.maintenanceMode && !isAdmin && !isAuth;
  const hideChrome =
    isEditor ||
    isAuth ||
    maintenancePublic ||
    (isAdmin && !pathname?.startsWith("/admin/login"));
  const hideFooter =
    isEditor || isDashboard || isAuth || isAdmin || maintenancePublic;
  const hideQuote = isAuth || isAdmin || isEditor || maintenancePublic;

  return (
    <div className="flex min-h-full flex-col">
      <SiteDocumentEffects />
      {hideChrome ? null : (
        <Header announcementOnly={Boolean(isDashboard)} />
      )}
      <main className="flex-1">
        <MaintenanceGate>{children}</MaintenanceGate>
      </main>
      {!hideFooter ? <Footer /> : null}
      {!hideQuote ? <FloatingQuoteCTA /> : null}
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <CartProvider>
            <ProductStoreProvider>
              <SiteChrome>{children}</SiteChrome>
            </ProductStoreProvider>
          </CartProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
