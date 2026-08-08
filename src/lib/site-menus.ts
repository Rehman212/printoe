/**
 * Canonical storefront navigation snapshots for CRM Menus admin.
 * Mirrors Header (HEADER_NAV_GROUPS) + Footer columns.
 */

import { categories } from "@/lib/data";
import { HEADER_NAV_GROUPS, type MegaColumn } from "@/lib/uprinting-nav";
import type { CrmMenuItem } from "@/lib/crm-api";

export type MenuTreeNode = {
  label: string;
  href: string;
  children?: MenuTreeNode[];
};

export type SiteMenuBlueprint = {
  name: string;
  location: "header" | "footer";
  tree: MenuTreeNode[];
};

function megaToChildren(columns: MegaColumn[]): MenuTreeNode[] {
  return columns.map((col) => ({
    label: col.title,
    href: col.href,
    children: col.links.map((link) => ({
      label: link.label,
      href: link.href,
    })),
  }));
}

/** Homepage top nav: groups + dropdown / mega children. */
export function getHeaderMenuBlueprint(): SiteMenuBlueprint {
  const tree: MenuTreeNode[] = HEADER_NAV_GROUPS.map((group) => {
    if (group.mega?.length) {
      return {
        label: group.label,
        href: group.href,
        children: megaToChildren(group.mega),
      };
    }
    return {
      label: group.label,
      href: group.href,
      children: group.children.map((c) => ({
        label: c.label,
        href: c.href,
      })),
    };
  });

  return {
    name: "Homepage header",
    location: "header",
    tree,
  };
}

/** Footer link columns currently on the storefront. */
export function getFooterMenuBlueprint(): SiteMenuBlueprint {
  const tree: MenuTreeNode[] = [
    {
      label: "Products",
      href: "/products",
      children: categories.slice(0, 6).map((c) => ({
        label: c.name,
        href: `/products?category=${c.slug}`,
      })),
    },
    {
      label: "Services",
      href: "/services",
      children: [
        { label: "Graphic Design", href: "/services" },
        { label: "Brand Identity", href: "/services" },
        { label: "Packaging Design", href: "/services" },
        { label: "Large Format", href: "/services" },
        { label: "Custom Printing", href: "/custom-printing" },
      ],
    },
    {
      label: "Company",
      href: "/#why-us",
      children: [
        { label: "About Printoe", href: "/#why-us" },
        { label: "Careers", href: "/blog" },
        { label: "Press", href: "/blog" },
        { label: "Partners", href: "/services" },
        { label: "Contact", href: "/#newsletter" },
      ],
    },
    {
      label: "Resources",
      href: "/blog",
      children: [
        { label: "Blog", href: "/blog" },
        { label: "Custom Product Builder", href: "/custom-printing" },
        { label: "Design Studio", href: "/editor" },
        { label: "Templates", href: "/editor" },
        { label: "Artwork Guidelines", href: "/blog" },
        { label: "Help Center", href: "/dashboard/support-tickets" },
      ],
    },
    {
      label: "Legal",
      href: "#",
      children: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
        { label: "Accessibility", href: "#" },
      ],
    },
  ];

  return {
    name: "Site footer",
    location: "footer",
    tree,
  };
}

/** Flatten tree → CRM menu items (parent then children, depth via indent in label). */
export function flattenMenuTree(tree: MenuTreeNode[]): CrmMenuItem[] {
  const items: CrmMenuItem[] = [];
  let order = 0;

  const walk = (nodes: MenuTreeNode[], depth: number) => {
    for (const node of nodes) {
      const prefix = depth > 0 ? `${"—".repeat(depth)} ` : "";
      items.push({
        label: `${prefix}${node.label}`,
        href: node.href,
        sortOrder: order++,
      });
      if (node.children?.length) walk(node.children, depth + 1);
    }
  };

  walk(tree, 0);
  return items;
}

export function itemsToEditableText(items: CrmMenuItem[]): string {
  return items.map((i) => `${i.label}|${i.href}`).join("\n");
}

export function parseEditableMenuText(text: string): CrmMenuItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [label, href] = line.split("|").map((s) => s.trim());
      return {
        label: label || `Item ${i + 1}`,
        href: href || "/",
        sortOrder: i,
      };
    });
}

export function countTreeLinks(tree: MenuTreeNode[]): number {
  let n = 0;
  const walk = (nodes: MenuTreeNode[]) => {
    for (const node of nodes) {
      n += 1;
      if (node.children?.length) walk(node.children);
    }
  };
  walk(tree);
  return n;
}
