"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function FloatingQuoteCTA() {
  const pathname = usePathname();
  if (
    !pathname ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/quote")
  ) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="fixed bottom-6 left-6 z-40 hidden sm:block"
    >
      <Link
        href="/quote"
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-primary-hover focus-ring"
      >
        <Zap className="h-4 w-4" fill="currentColor" />
        Instant Quote
      </Link>
    </motion.div>
  );
}
