import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Strips HTML tags from rich-text (Tiptap) content for plain-text previews. */
export function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Storefront copy: uprinting.com → printoe.com. Leaves CDN hosts like staticecp.uprinting.com. */
export function rebrandUprintingCopy(text: string) {
  if (!text) return text;
  return text.replace(
    /(?<![\w.-])(https?:\/\/)?(?:www\.)?uprinting\.com(?![\w.-])/gi,
    (_full, proto?: string) => (proto ? "https://printoe.com" : "printoe.com"),
  );
}
