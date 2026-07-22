# Printoe Work Report

**Project:** Printoe (Online Printing Platform)  
**Period:** Through July 21, 2026  
**Stack:** Next.js (frontend) · NestJS + Prisma + PostgreSQL (backend)

---

## Work Completed / Updated

### Branding & Storefront UI
- Brand updated to **Printoe** (logo, naming, design tokens — CMY palette).
- Homepage / catalog UI refined (Popular Products, Top Sellers, Featured Products).
- Responsive layout issues fixed across website and dashboard areas.
- Website content and wording improved for clearer storefront copy.

### Flexible Product Options (UPrinting-style)
- Product options system added: Category → Product → Option Groups → Option Values.
- Stickers, Banners, Business Cards (and related categories) get their own fields (Shape, Size, Quantity, Printing Time, etc.).
- Live price calculation with quantity + turnaround (`priceMod`) multipliers.
- Admin upload shows category-specific option templates and where the product will appear on the storefront.
- Demo product created and verified on storefront (`/products/demo-outdoor-stickers`).

### Product API & Database
- Prisma schema for products, categories, and option groups/values.
- Public APIs: `GET /api/products`, `GET /api/products/:slug`, category list + featured filter.
- Admin APIs: create / update / delete products with nested options (JWT + ADMIN).
- Admin Products page wired to PostgreSQL (no longer localStorage-only for catalog).
- Category-wise placement: product appears under Popular Products, nav, catalog filter, Featured (if enabled), Top Sellers.

### Categories Admin (CRUD + API)
- Full category management: **Add / Edit / Delete**.
- Admin Categories page integrated with API (`/api/admin/categories`).
- Delete blocked when products still linked to a category.
- All Popular Products sections seeded in DB (Business Cards, Flyers, Brochures, Posters, Stickers, Labels, Packaging, Boxes, Banners, Marketing Materials, Apparel, Promotional Products).
- Visual section picker on product upload matching homepage Popular Products sidebar.

### Auth & Signup Rules
- Customer signup / login via Nest auth API.
- Admin login via separate admin portal.
- **Same email cannot signup twice** — returns 409 Conflict; email field shows clear “already registered” message (case-insensitive).

### User Dashboard Layout
- On `/dashboard`: main website header (logo / search / nav) **hidden**.
- Only **top announcement bar** + **customer sidebar** remain visible.

### Admin CRM Module
- Admin sidebar **CRM** dropdown added with:
  - **Menus** — header/footer navigation links
  - **Posts** — blog / news (draft / published / archived)
  - **Pages** — static pages + SEO fields
- CRM APIs + PostgreSQL models (`menus`, `menu_items`, `posts`, `pages`).
- Admin UI: list / create / edit / delete for each CRM section.

### Header Account & Cart
- Logged-in users see a **profile circle** (initials) + “Hi, {name}” instead of “Hi, Log In!”.
- Guest users still see Log In / Your Account.
- **Real shopping cart API** built and integrated:
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PATCH /api/cart/items/:id`
  - `DELETE /api/cart/items/:id`
- Cart stored in DB for logged-in users; guest cart in localStorage (merges to API on login).
- Header cart badge shows live item count (hidden when empty).
- Product listing **Add** button writes to real cart; `/cart` page updates qty / remove via API.

### Other Fixes
- `next/image` host error fixed for external CDNs (e.g. magnific); `ProductMedia` falls back safely for unknown image hosts.
- Admin sidebar / navigation structure updated for Products, Categories, CRM, etc.

---

## Technical Summary

| Area | Status |
|------|--------|
| Frontend (Next.js storefront + admin) | Updated & API-wired |
| Backend (NestJS) | Products, Categories, CRM, Cart, Auth |
| Database (PostgreSQL + Prisma) | Schema synced |
| Admin CRUD | Products, Categories, CRM Menus/Posts/Pages |
| Customer UX | Dashboard chrome, profile circle, live cart |

---

## Suggested Next Steps (Optional)
- Wire CRM Menus/Posts/Pages to public storefront rendering.
- Image file upload (not only URL) for products.
- Checkout flow fully persisted as orders in DB.
- Live Chat Bot polish / production keys (if not already live).

---

*End of report — Printoe development progress.*
