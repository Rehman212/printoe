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
      { name: "Menus", slug: "menus", image: "/home-showcase/menus.jpg" },
      {
        name: "Coasters",
        slug: "coasters",
        image: "/home-showcase/coasters.jpg",
      },
      {
        name: "Bottle Labels",
        slug: "bottle-labels",
        image: "/home-showcase/bottle-labels.jpg",
      },
      {
        name: "Vinyl Banners",
        slug: "vinyl-banners",
        image: "/home-showcase/vinyl-banners.jpg",
      },
    ],
  },
  {
    title: "Featured Products",
    items: [
      {
        name: "Table Tents",
        slug: "table-tents",
        image: "/home-showcase/table-tents.jpg",
      },
      {
        name: "Drinkware",
        slug: "drinkware",
        image: "/home-showcase/drinkware.jpg",
      },
      { name: "Pouches", slug: "pouches", image: "/home-showcase/pouches.jpg" },
      {
        name: "Wall Decals",
        slug: "wall-decals",
        image: "/home-showcase/wall-decals.jpg",
      },
    ],
  },
  {
    title: "New & Updated Products",
    items: [
      {
        name: "Trading Cards",
        slug: "trading-cards",
        image: "/home-showcase/trading-cards.jpg",
      },
      {
        name: "Every Door Direct Mail",
        slug: "eddm-postcards",
        image: "/home-showcase/every-door-direct-mail.jpg",
      },
      {
        name: "Magazines",
        slug: "magazines",
        image: "/home-showcase/magazines.jpg",
      },
      {
        name: "Waterproof Menus",
        slug: "waterproof-menus",
        image: "/home-showcase/waterproof-menus.jpg",
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