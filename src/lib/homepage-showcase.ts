/** Homepage product carousels — UPrinting-matched copy + local showcase images. */
export type ShowcaseItem = {
  name: string;
  slug: string;
  image: string;
};

export type ShowcaseRow = {
  title: string;
  items: ShowcaseItem[];
};

export const HOMEPAGE_SHOWCASE_ROWS: ShowcaseRow[] = [
  {
    title: "Top Sellers",
    items: [
      { name: "Menus", slug: "menus", image: "/uploads/catalog/menus.jpg" },
      {
        name: "Coasters",
        slug: "coasters",
        image: "/uploads/catalog/coasters.jpg",
      },
      {
        name: "Bottle Labels",
        slug: "bottle-labels",
        image: "/uploads/catalog/bottle-labels.jpg",
      },
      {
        name: "Vinyl Banners",
        slug: "vinyl-banners",
        image: "/uploads/catalog/vinyl-banners.jpg",
      },
    ],
  },
  {
    title: "Featured Products",
    items: [
      {
        name: "Table Tents",
        slug: "table-tents",
        image: "/uploads/catalog/table-tents.jpg",
      },
      {
        name: "Drinkware",
        slug: "drinkware",
        image: "/uploads/catalog/drinkware.jpg",
      },
      {
        name: "Pouches",
        slug: "pouches",
        image: "/uploads/catalog/pouches.jpg",
      },
      {
        name: "Wall Decals",
        slug: "wall-decals",
        image: "/uploads/catalog/wall-decals.jpg",
      },
    ],
  },
  {
    title: "New & Updated Products",
    items: [
      {
        name: "Trading Cards",
        slug: "trading-cards",
        image: "/uploads/catalog/trading-cards.jpg",
      },
      {
        name: "Every Door Direct Mail",
        slug: "eddm-postcards",
        image: "/uploads/catalog/every-door-direct-mail.jpg",
      },
      {
        name: "Magazines",
        slug: "magazines",
        image: "/uploads/catalog/magazines.jpg",
      },
      {
        name: "Waterproof Menus",
        slug: "waterproof-menus",
        image: "/uploads/catalog/waterproof-menus.jpg",
      },
    ],
  },
];
export const SHOWCASE_IMAGE_BY_SLUG: Record<string, string> =
  Object.fromEntries(
    HOMEPAGE_SHOWCASE_ROWS.flatMap((row) =>
      row.items.map((item) => [item.slug, item.image]),
    ),
  );

export function showcaseImageForSlug(slug: string): string | undefined {
  return SHOWCASE_IMAGE_BY_SLUG[slug];
}