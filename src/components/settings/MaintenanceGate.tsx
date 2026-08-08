"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const site = useSiteSettings();

  const bypass =
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/login/") ||
    pathname?.startsWith("/signup/");

  if (!site.maintenanceMode || bypass) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Wrench className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
        {site.name} is temporarily unavailable
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
        {site.maintenanceMessage}
      </p>
      <p className="mt-6 text-xs text-text-secondary">
        Need help?{" "}
        <a
          href={`mailto:${site.email}`}
          className="font-semibold text-primary hover:underline"
        >
          {site.email}
        </a>
      </p>
    </div>
  );
}
