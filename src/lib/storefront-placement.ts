/** Where a category shows on the storefront after admin upload */

export type StorefrontPlacement = {
  popularName: string;
  navLabel: string;
  catalogPath: string;
  catalogLabel: string;
};

export const CATEGORY_STOREFRONT_PLACEMENT: Record<string, StorefrontPlacement> =
  {
    "business-cards": {
      popularName: "Business Cards",
      navLabel: "All Products → Business Cards",
      catalogPath: "/products?category=business-cards",
      catalogLabel: "Products → Business Cards",
    },
    flyers: {
      popularName: "Flyers",
      navLabel: "Marketing Materials",
      catalogPath: "/products?category=flyers",
      catalogLabel: "Products → Flyers",
    },
    brochures: {
      popularName: "Brochures",
      navLabel: "Marketing Materials",
      catalogPath: "/products?category=brochures",
      catalogLabel: "Products → Brochures",
    },
    posters: {
      popularName: "Posters",
      navLabel: "Signs & Banners",
      catalogPath: "/products?category=posters",
      catalogLabel: "Products → Posters",
    },
    stickers: {
      popularName: "Stickers",
      navLabel: "Stickers & Labels",
      catalogPath: "/products?category=stickers",
      catalogLabel: "Products → Stickers",
    },
    labels: {
      popularName: "Labels",
      navLabel: "Stickers & Labels",
      catalogPath: "/products?category=labels",
      catalogLabel: "Products → Labels",
    },
    packaging: {
      popularName: "Packaging",
      navLabel: "Boxes & Packaging",
      catalogPath: "/products?category=packaging",
      catalogLabel: "Products → Packaging",
    },
    boxes: {
      popularName: "Boxes",
      navLabel: "Boxes & Packaging",
      catalogPath: "/products?category=boxes",
      catalogLabel: "Products → Boxes",
    },
    banners: {
      popularName: "Banners",
      navLabel: "Signs & Banners",
      catalogPath: "/products?category=banners",
      catalogLabel: "Products → Banners",
    },
    "marketing-materials": {
      popularName: "Marketing Materials",
      navLabel: "Marketing Materials",
      catalogPath: "/products?category=marketing-materials",
      catalogLabel: "Products → Marketing Materials",
    },
    apparel: {
      popularName: "Apparel",
      navLabel: "Apparel & Promo",
      catalogPath: "/products?category=apparel",
      catalogLabel: "Products → Apparel",
    },
    "promotional-products": {
      popularName: "Promotional Products",
      navLabel: "Apparel & Promo",
      catalogPath: "/products?category=promotional-products",
      catalogLabel: "Products → Promo",
    },
  };

export function getStorefrontPlacement(slug: string): StorefrontPlacement {
  return (
    CATEGORY_STOREFRONT_PLACEMENT[slug] ?? {
      popularName: slug.replace(/-/g, " "),
      navLabel: "All Products",
      catalogPath: `/products?category=${slug}`,
      catalogLabel: `Products → ${slug}`,
    }
  );
}
