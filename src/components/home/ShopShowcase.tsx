"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { categories, products } from "@/lib/data";
import { DynamicIcon } from "@/lib/icons";
import { Container } from "@/components/ui/Section";
import { ProductVisual } from "@/components/shared/ProductVisual";
import { cn } from "@/lib/utils";

/** Submenus that open on hover — like UPrinting Popular Products */
const categorySubmenus: Record<string, { label: string; href: string }[]> = {
  builder: [
    { label: "Start from blank", href: "/editor" },
    { label: "Upload artwork", href: "/editor" },
    { label: "Use a template", href: "/editor" },
  ],
  "business-cards": [
    { label: "Silk Business Cards", href: "/products/silk-business-cards" },
    { label: "Standard Cards", href: "/products?category=business-cards" },
    { label: "Spot UV Cards", href: "/products?category=business-cards" },
    { label: "Foil Business Cards", href: "/products?category=business-cards" },
    { label: "Squared Cards", href: "/products?category=business-cards" },
  ],
  flyers: [
    { label: "Standard Flyers", href: "/products?category=flyers" },
    { label: "Rack Cards", href: "/products?category=flyers" },
    { label: "Door Hangers", href: "/products?category=flyers" },
    { label: "Sell Sheets", href: "/products?category=flyers" },
  ],
  brochures: [
    { label: "Tri-Fold Brochures", href: "/products/tri-fold-brochures" },
    { label: "Bi-Fold Brochures", href: "/products?category=brochures" },
    { label: "Z-Fold Brochures", href: "/products?category=brochures" },
    { label: "Booklets", href: "/products?category=brochures" },
  ],
  posters: [
    { label: "Event Posters", href: "/products/event-posters" },
    { label: "Photo Posters", href: "/products?category=posters" },
    { label: "Mounted Posters", href: "/products?category=posters" },
    { label: "Large Format", href: "/products?category=posters" },
  ],
  stickers: [
    { label: "Die-Cut Stickers", href: "/products/die-cut-stickers" },
    { label: "Kiss-Cut Sheets", href: "/products?category=stickers" },
    { label: "Clear Stickers", href: "/products?category=stickers" },
    { label: "Holographic", href: "/products?category=stickers" },
  ],
  labels: [
    { label: "Roll Labels", href: "/products/roll-labels" },
    { label: "Sheet Labels", href: "/products?category=labels" },
    { label: "Bottle Labels", href: "/products?category=labels" },
    { label: "Shipping Labels", href: "/products?category=labels" },
  ],
  packaging: [
    { label: "Custom Mailers", href: "/products?category=packaging" },
    { label: "Poly Mailers", href: "/products?category=packaging" },
    { label: "Tissue & Inserts", href: "/products?category=packaging" },
    { label: "Branded Tape", href: "/products?category=packaging" },
  ],
  boxes: [
    { label: "Rigid Product Boxes", href: "/products/rigid-product-boxes" },
    { label: "Mailer Boxes", href: "/products?category=boxes" },
    { label: "Folding Cartons", href: "/products?category=boxes" },
    { label: "Shipping Boxes", href: "/products?category=boxes" },
  ],
  banners: [
    { label: "Vinyl Banners", href: "/products/vinyl-banners" },
    { label: "Retractable Banners", href: "/products?category=banners" },
    { label: "Mesh Banners", href: "/products?category=banners" },
    { label: "Fabric Banners", href: "/products?category=banners" },
  ],
  apparel: [
    { label: "T-Shirts", href: "/products?category=apparel" },
    { label: "Polo Shirts", href: "/products?category=apparel" },
    { label: "Jackets", href: "/products?category=apparel" },
    { label: "Sweatshirts", href: "/products?category=apparel" },
    { label: "Hats", href: "/products?category=apparel" },
    { label: "Workwear", href: "/products?category=apparel" },
  ],
  "promotional-products": [
    { label: "Tote Bags", href: "/products/branded-tote-bags" },
    { label: "Mugs", href: "/products?category=promotional-products" },
    { label: "Pens", href: "/products?category=promotional-products" },
    { label: "USB Drives", href: "/products?category=promotional-products" },
  ],
  "marketing-materials": [
    { label: "Presentation Folders", href: "/products?category=marketing-materials" },
    { label: "Notepads", href: "/products?category=marketing-materials" },
    { label: "Calendars", href: "/products?category=marketing-materials" },
    { label: "Catalogs", href: "/products?category=marketing-materials" },
  ],
};

const popularItems = [
  {
    id: "builder",
    name: "Custom Product Builder",
    href: "/editor",
    icon: "Sparkles",
  },
  ...categories.map((c) => ({
    id: c.slug,
    name: c.name,
    href: `/products?category=${c.slug}`,
    icon: c.icon,
  })),
];

const footerLinks = [
  { label: "Custom Quote", href: "/quote" },
  { label: "Design Service", href: "/services" },
  { label: "See More Products", href: "/products", chevron: true },
];

const topSellers = [
  { name: "Menus", slug: "tri-fold-brochures", image: "brochures" },
  { name: "Coasters", slug: "die-cut-stickers", image: "stickers" },
  { name: "Bottle Labels", slug: "roll-labels", image: "labels" },
  { name: "Vinyl Banners", slug: "vinyl-banners", image: "banners" },
  { name: "Business Cards", slug: "silk-business-cards", image: "business-cards" },
  { name: "Posters", slug: "event-posters", image: "posters" },
  { name: "Product Boxes", slug: "rigid-product-boxes", image: "boxes" },
  { name: "Tote Bags", slug: "branded-tote-bags", image: "promo" },
];

export function ShopShowcase() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="border-b border-border bg-white py-8 md:py-10">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] lg:items-start">
          {/* Popular Products sidebar + hover flyout */}
          <aside className="relative z-30">
            <h2 className="mb-3 text-lg font-bold text-secondary">
              Popular Products
            </h2>
            <nav
              className="relative border border-border bg-white"
              aria-label="Popular products"
              onMouseLeave={() => setOpenId(null)}
            >
              <ul className="divide-y divide-border">
                {popularItems.map((item) => {
                  const submenu = categorySubmenus[item.id] ?? [];
                  const hasSubmenu = submenu.length > 0;
                  const isOpen = openId === item.id;

                  return (
                    <li
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenId(item.id)}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-2.5 transition focus-ring",
                          isOpen
                            ? "bg-[#e8f4fc] text-primary"
                            : "hover:bg-[#e8f4fc] hover:text-primary",
                        )}
                        aria-expanded={hasSubmenu ? isOpen : undefined}
                        aria-haspopup={hasSubmenu ? "menu" : undefined}
                      >
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center",
                            isOpen ? "text-primary" : "text-text-secondary",
                          )}
                        >
                          <DynamicIcon name={item.icon} className="h-[18px] w-[18px]" />
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-sm font-medium",
                            isOpen ? "text-primary" : "text-secondary",
                          )}
                        >
                          {item.name}
                        </span>
                        {hasSubmenu && (
                          <ChevronRight
                            className={cn(
                              "h-4 w-4",
                              isOpen ? "text-primary" : "text-text-secondary/70",
                            )}
                          />
                        )}
                      </Link>

                      {/* Flyout submenu */}
                      {hasSubmenu && isOpen && (
                        <div
                          role="menu"
                          className="absolute left-full top-0 z-40 ml-0 min-w-[200px] border border-border bg-white py-2 shadow-soft"
                        >
                          {submenu.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              role="menuitem"
                              className="block px-4 py-2 text-sm text-secondary transition hover:bg-[#e8f4fc] hover:text-primary"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-border py-1">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-secondary transition hover:bg-[#e8f4fc] hover:text-primary"
                  >
                    {link.label}
                    {"chevron" in link && link.chevron ? (
                      <ChevronRight className="h-4 w-4 text-text-secondary/70" />
                    ) : null}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>

          {/* Top Sellers */}
          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-secondary">Top Sellers</h2>
              <Link
                href="/products"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              {topSellers.map((item) => {
                const product = products.find((p) => p.slug === item.slug);
                return (
                  <Link
                    key={item.slug}
                    href={`/products/${item.slug}`}
                    className="group focus-ring"
                  >
                    <div className="overflow-hidden border border-border bg-[#f3f4f6] transition group-hover:border-primary/40 group-hover:shadow-soft">
                      <ProductVisual
                        variant={item.image}
                        className="aspect-square rounded-none"
                        label={item.name}
                        style="catalog"
                      />
                    </div>
                    <p className="mt-2.5 text-center text-sm font-semibold text-secondary group-hover:text-primary">
                      {item.name}
                    </p>
                    {product ? (
                      <p className="text-center text-xs font-medium text-text-secondary">
                        From ${product.price.toFixed(2)}
                      </p>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
