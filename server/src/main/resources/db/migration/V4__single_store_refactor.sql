-- Migration V4: Single-Store Platform Refactor & Store Design System

-- 1. Create singleton store_design table for the customizable storefront
CREATE TABLE IF NOT EXISTS "store_design" (
    "id" BIGINT NOT NULL PRIMARY KEY DEFAULT 1,
    "template" VARCHAR(30) NOT NULL DEFAULT 'MINIMAL',
    "color_mode" VARCHAR(20) NOT NULL DEFAULT 'LIGHT',
    "accent_color" VARCHAR(30) NOT NULL DEFAULT '#F4B400',
    "font_preset" VARCHAR(30) NOT NULL DEFAULT 'ELEGANT',
    "design_config" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add store identity branding columns to store_settings
ALTER TABLE "store_settings"
    ADD COLUMN IF NOT EXISTS "store_name" VARCHAR(120) DEFAULT 'Store Studio',
    ADD COLUMN IF NOT EXISTS "store_tagline" VARCHAR(255) DEFAULT 'A minimal storefront starter sellers can personalize',
    ADD COLUMN IF NOT EXISTS "logo_url" TEXT,
    ADD COLUMN IF NOT EXISTS "logo_dark_url" TEXT;

UPDATE "store_settings"
SET "store_name" = COALESCE("store_name", 'Store Studio'),
    "store_tagline" = COALESCE("store_tagline", 'A minimal storefront starter sellers can personalize')
WHERE "id" = 1;

-- 3. Populate default store_design record (id=1)
INSERT INTO "store_design" (
    "id",
    "template",
    "color_mode",
    "accent_color",
    "font_preset",
    "design_config",
    "updated_at"
)
VALUES (
    1,
    'MINIMAL',
    'LIGHT',
    '#F4B400',
    'ELEGANT',
    '{
      "sections": [
        {
          "id": "hero",
          "type": "Hero",
          "variant": "fullscreen",
          "enabled": true,
          "settings": {
            "eyebrow": "store studio",
            "title": "Launch a clean storefront, then make it yours",
            "intro": "Start with a bright, minimal storefront and a neutral identity. Sellers can later swap the logo, colors, content, and structure to match their own brand.",
            "cta": "Browse catalog",
            "ctaLink": "/shop",
            "imageUrl": "",
            "cutoutImage": "",
            "alignment": "center",
            "overlayOpacity": 0
          }
        },
        {
          "id": "categories",
          "type": "Categories",
          "variant": "cards",
          "enabled": true,
          "settings": {
            "title": "Browse by category",
            "subtitle": "Start shoppers with a simple path into the catalog."
          }
        },
        {
          "id": "featured-products",
          "type": "FeaturedProducts",
          "variant": "editorial-grid",
          "enabled": true,
          "settings": {
            "title": "Featured products",
            "subtitle": "Highlight the products you want visitors to discover first.",
            "strategy": "featured",
            "columns": 4,
            "maxProducts": 8
          }
        },
        {
          "id": "brand-story",
          "type": "BrandStory",
          "variant": "split-right",
          "enabled": true,
          "settings": {
            "eyebrow": "brand story",
            "title": "Tell your story with clarity",
            "description": "Use this section to introduce the business, explain what makes the catalog special, and build trust without overwhelming the page.",
            "cta": "Learn more",
            "ctaLink": "/shop",
            "imageUrl": "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80"
          }
        },
        {
          "id": "packs-showcase",
          "type": "ProductCollection",
          "variant": "curated-packs",
          "enabled": true,
          "settings": {
            "title": "Collections & packs",
            "subtitle": "Group related products into clear, browsable collections.",
            "strategy": "packs",
            "columns": 4,
            "maxProducts": 4
          }
        },
        {
          "id": "reviews",
          "type": "Reviews",
          "variant": "grid",
          "enabled": true,
          "settings": {
            "eyebrow": "customer feedback",
            "title": "What customers are saying",
            "subtitle": "Social proof and reviews can sit here once the store starts collecting feedback."
          }
        }
      ]
    }'::jsonb,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;

-- 4. Simplify Order Items: make seller_id and seller_order_id nullable
ALTER TABLE "order_items"
    ALTER COLUMN "seller_id" DROP NOT NULL;

-- 5. Migrate user roles: SELLER -> OWNER
UPDATE "users"
SET "role" = 'OWNER'
WHERE "role" = 'SELLER';
