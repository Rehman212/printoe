"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingQuoteCTA() {
  const pathname = usePathname();
  if (
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/quote") ||
    pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  return (
    <Link
      href="/quote"
      className="fixed bottom-5 right-5 z-40 hidden rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-card hover:bg-primary-hover sm:inline-flex focus-ring"
    >
      Get a Quote
    </Link>
  );
}
