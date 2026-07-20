import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  BookOpen,
  Box,
  Briefcase,
  CreditCard,
  FileSearch,
  FileText,
  Flag,
  Gift,
  Headphones,
  Image,
  Layers,
  LayoutTemplate,
  Leaf,
  Maximize2,
  Megaphone,
  Package,
  PackageOpen,
  Palette,
  Percent,
  Printer,
  Search,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Sticker,
  Tag,
  Truck,
  Upload,
  Zap,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Award,
  BadgeCheck,
  BookOpen,
  Box,
  Briefcase,
  CreditCard,
  FileSearch,
  FileText,
  Flag,
  Gift,
  Headphones,
  Image,
  Layers,
  LayoutTemplate,
  Leaf,
  Maximize2,
  Megaphone,
  Package,
  PackageOpen,
  Palette,
  Percent,
  Printer,
  Search,
  ShieldCheck,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Sticker,
  Tag,
  Truck,
  Upload,
  Zap,
};

export function DynamicIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = iconMap[name] ?? Package;
  return <Icon className={className} style={style} aria-hidden />;
}
