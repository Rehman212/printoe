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
]);

function canOptimize(url: string) {
  // Local public assets (e.g. /uploads/catalog/menus.jpg)
  if (url.startsWith("/")) return true;
  try {
    const host = new URL(url).hostname;
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
}: {
  imageUrl?: string;
  fallbackVariant: string;
  label?: string;
  className?: string;
  priority?: boolean;
}) {
  if (imageUrl) {
    // Admin / API may paste any CDN URL — use plain <img> when host isn't configured
    if (!canOptimize(imageUrl)) {
      return (
        <div className={cn("relative overflow-hidden bg-[#f3f4f6]", className)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={label ?? "Product"}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className={cn("relative overflow-hidden bg-[#f3f4f6]", className)}>
        <Image
          src={imageUrl}
          alt={label ?? "Product"}
          fill
          priority={priority}
          className="object-cover"
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
