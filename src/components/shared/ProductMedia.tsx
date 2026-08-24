"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProductVisual } from "@/components/shared/ProductVisual";

/** Hosts allowed for next/image optimization (must match next.config.ts). */
const OPTIMIZED_HOSTS = new Set([
  "images.unsplash.com",
  "plus.unsplash.com",
  "img.magnific.com",
  "staticecp.uprinting.com",
  "s2.uprinting.com",
  "s3.uprinting.com",
  "printoe.com",
  "www.printoe.com",
]);

/** Protocol-relative and scraped CDN URLs → absolute https for <img>/next/image. */
export function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
}

function canOptimize(url: string) {
  // Local public assets only (e.g. /uploads/catalog/menus.jpg) — not //cdn/...
  if (url.startsWith("/") && !url.startsWith("//")) return true;
  try {
    const host = new URL(url).hostname;
    // UPrinting's CDN permits direct browser images but intermittently rejects
    // Next's server-side optimizer requests, producing broken imported media.
    if (host.endsWith(".uprinting.com")) return false;
    return OPTIMIZED_HOSTS.has(host) || host.endsWith(".magnific.com");
  } catch {
    return false;
  }
}

export function ProductMedia({
  imageUrl,
  fallbackVariant,
  label,
  className,
  priority = false,
  /** `contain` shows the full product without cropping; `cover` fills the frame. */
  fit = "contain",
}: {
  imageUrl?: string;
  fallbackVariant: string;
  label?: string;
  className?: string;
  priority?: boolean;
  fit?: "contain" | "cover";
}) {
  const objectFit = fit === "cover" ? "object-cover" : "object-contain";
  const resolvedUrl = normalizeMediaUrl(imageUrl);

  if (resolvedUrl) {
    // Admin / API may paste any CDN URL — use plain <img> when host isn't configured
    if (!canOptimize(resolvedUrl)) {
      return (
        <div className={cn("relative overflow-hidden bg-[#f3f4f6]", className)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedUrl}
            alt={label ?? "Product"}
            className={cn("absolute inset-0 h-full w-full", objectFit)}
          />
        </div>
      );
    }

    return (
      <div className={cn("relative overflow-hidden bg-[#f3f4f6]", className)}>
        <Image
          src={resolvedUrl}
          alt={label ?? "Product"}
          fill
          priority={priority}
          className={objectFit}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <ProductVisual
      variant={fallbackVariant}
      className={className}
      label={label}
      style="catalog"
    />
  );
}
