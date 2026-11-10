# Storefront fixes

- Catalog category pills are populated **only** by `/api/v1/products/categories` (plus an `All` filter). No sample jewelry categories are injected into real storefronts.
- The public category response now includes `productCount`, counting **listed** products via a grouped repository query. Empty categories legitimately show zero. Counts update when a product is created, changed, hidden, or deleted (the backend cache is invalidated on product writes).
- Clicking a catalog pagination arrow or page summary scrolls to the top of the result grid, below the sticky header. Reduced-motion preferences are respected.
- Product detail descriptions, quantity selector, image gallery controls, and review cards use store color variables, so they work in light and dark themes. Generic copy replaces several jewelry-only claims.
- Minimal template product cards have 12px text and button insets.
- The optional ring-size guide no longer assumes a specific database category called `Rings`.
- The first-install wizard still uses **isolated illustrative demo images and labels** as requested earlier; those examples never become real catalog categories or products.

No migration or reset is needed. Existing categories in PostgreSQL are deliberately **not deleted**; manage or remove them through the category administration screen if unwanted.
