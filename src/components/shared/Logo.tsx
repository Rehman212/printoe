"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";

const DEFAULT_LOGO = "/images/printoe-logo.png";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  priority?: boolean;
  href?: string;
}) {
  const site = useSiteSettings();
  const src = site.logoUrl?.trim() || DEFAULT_LOGO;

  return (
    <Link
      href={href}
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center focus-ring rounded-md",
        className,
      )}
      aria-label={`${site.name} home`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={site.name}
        width={160}
        height={78}
        className="block h-10 w-[130px] object-contain object-left md:h-12 md:w-[155px]"
      />
    </Link>
  );
}
