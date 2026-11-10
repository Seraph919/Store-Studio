#!/usr/bin/env python3
"""Seed a complete Store Studio demo using the existing REST API (Python stdlib only).

Creates 12 fictional demo products across 4 categories, configures a photo hero,
storefront copy, a brand-story image, featured product IDs, and homepage sections.
Safe to rerun: existing product names are reused, not duplicated.

Usage:
  python3 seed_full_demo.py
  python3 seed_full_demo.py --yes --template EDITORIAL
  STORE_URL=https://your-domain.example python3 seed_full_demo.py
"""

import argparse
import getpass
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


def image(photo_id, width=1100):
    return f"https://images.unsplash.com/{photo_id}?auto=format&fit=crop&w={width}&q=85"


# Image links are Unsplash-hosted photos, not local files. Keep real products' imagery separate.
HERO_IMAGE = "https://pub-79969d9d33b6499db4cbf8217627f9c7.r2.dev/uploads/9c448373-2ac2-46e2-8e5c-5751d5833b2e.png"
STORY_IMAGE = image("photo-1546435770-a3e426bf472b", 1400)


def product(name, category, description, price, photo_id, quantity=25, original=None):
    record = {
        "name": name,
        "categoryName": category,
        "description": description,
        "price": price,
        "quantity": quantity,
        "images": [image(photo_id)],
        "isPack": False,
    }
    if original is not None:
        record["originalPrice"] = original
    return record


# Fictional products, prices in MAD. Photos are for showcasing the theme, not product claims.
PRODUCTS = [
    product("Studio Wireless Headphones", "Headphones",
            "Over-ear wireless headphones with comfortable cushions and a clean modern design.",
            599, "photo-1505740420928-5e560c06d30e", 30, 749),
    product("Essential Black Headphones", "Headphones",
            "Classic black headphones for music, work and everyday listening.",
            449, "photo-1546435770-a3e426bf472b", 24),
    product("Compact Wireless Earbuds", "Headphones",
            "Travel-friendly wireless earbuds with a compact charging case.",
            299, "photo-1606220588913-b3aacb4d2f46", 45, 399),
    product("Classic Chronograph Watch", "Watches",
            "A versatile analog watch with a timeless face and elegant finish.",
            899, "photo-1524592094714-0f0654e20314", 18),
    product("Minimal Leather Watch", "Watches",
            "Understated wristwatch with clean lines and a classic strap.",
            649, "photo-1523275335684-37898b6baf30", 22),
    product("Modern Digital Watch", "Watches",
            "Contemporary wristwatch that pairs easily with everyday outfits.",
            749, "photo-1523170335258-f5ed11844a49", 15, 949),
    product("Classic Black Sunglasses", "Glasses",
            "Versatile dark sunglasses with a simple, timeless frame.",
            249, "photo-1511499767150-a48a237f0083", 40),
    product("Retro Summer Sunglasses", "Glasses",
            "Retro-inspired sunglasses for a relaxed everyday look.",
            299, "photo-1572635196237-14b3f281503f", 28),
    product("Everyday Optical Frames", "Glasses",
            "Minimal optical-style frames with a lightweight, modern profile.",
            349, "photo-1574258495973-f010dfbb5371", 20),
    product("Amber Signature Fragrance", "Perfumes",
            "Demo fragrance inspired by warm notes and a minimalist presentation.",
            399, "photo-1541643600914-78b084683601", 35),
    product("Noir Eau de Parfum", "Perfumes",
            "A fictional evening fragrance presented in a contemporary glass bottle.",
            549, "photo-1615634260167-c8cdede054de", 16, 699),
    product("Fresh Bloom Fragrance", "Perfumes",
            "A light fragrance concept with a fresh, everyday character.",
            329, "photo-1594035910387-fea47794261f", 32),
]


class StoreAPI:
    def __init__(self, base_url):
        parsed = urllib.parse.urlparse(base_url)
        if parsed.scheme not in ("http", "https") or not parsed.hostname:
            raise ValueError("--url must be a valid HTTP(S) URL")
        if parsed.scheme == "http" and parsed.hostname not in ("localhost", "127.0.0.1", "::1"):
            raise ValueError("Use HTTPS for remote URLs so the login password is not sent in plaintext")
        self.base_url = base_url.rstrip("/")
        self.token = None

    def call(self, path, method="GET", payload=None):
        headers = {"Accept": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        data = None
        if payload is not None:
            headers["Content-Type"] = "application/json"
            data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            self.base_url + path, data=data, headers=headers, method=method
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                raw = response.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")[:400]
            raise RuntimeError(f"{method} {path}: HTTP {error.code}: {detail}") from error
        except urllib.error.URLError as error:
            raise RuntimeError(f"Cannot reach {self.base_url}: {error.reason}") from error

    def login(self):
        email = os.getenv("STORE_EMAIL") or input("Owner email: ").strip()
        password = os.getenv("STORE_PASSWORD") or getpass.getpass("Password: ")
        data = self.call("/api/v1/auth/login", "POST", {"email": email, "password": password})
        self.token = data.get("token")
        if not self.token:
            raise RuntimeError("Login returned no token; check owner credentials.")

    def all_products(self):
        result = []
        page = 0
        while True:
            params = urllib.parse.urlencode({"page": page, "size": 100, "sort": "id"})
            response = self.call(f"/api/v1/products?{params}")
            batch = response.get("content", [])
            result.extend(batch)
            if response.get("last", True) or not batch:
                return result
            page += 1
            if page > 500:
                raise RuntimeError("Product pagination exceeded 500 pages; stopped for safety.")


def demo_sections(featured_ids):
    # These fields and variants match the project's StoreDesignValidator.
    return [
        {
            "id": "hero", "type": "Hero", "variant": "fullscreen", "enabled": True,
            "settings": {
                "eyebrow": "THE EVERYDAY EDIT",
                "title": "Good things, for everyday living.",
                "intro": "Discover carefully chosen essentials across sound, style and scent. Simple finds with a little more character.",
                "cta": "Explore the collection", "ctaLink": "/shop",
                "imageUrl": HERO_IMAGE, "alignment": "center", "overlayOpacity": 35,
            },
        },
        {
            "id": "categories", "type": "Categories", "variant": "cards", "enabled": True,
            "settings": {
                "title": "Find your kind of essential",
                "subtitle": "Headphones, watches, glasses and fragrances — all in one place.",
                "maxCategories": 4,
            },
        },
        {
            "id": "featured-products", "type": "FeaturedProducts", "variant": "editorial-grid", "enabled": bool(featured_ids),
            "settings": {
                "title": "The featured edit",
                "subtitle": "A few of our favorite picks, made for everyday moments.",
                "strategy": "featured", "productIds": featured_ids,
                "columns": 4, "maxProducts": 8,
            },
        },
        {
            "id": "brand-story", "type": "BrandStory", "variant": "split-right", "enabled": True,
            "settings": {
                "eyebrow": "A LITTLE ABOUT US",
                "title": "Everyday items. Better choices.",
                "description": "The Everyday Edit is a fictional demo store showing how Store Studio can bring different products together in one clean, customizable shopping experience.",
                "cta": "Shop the collection", "ctaLink": "/shop", "imageUrl": STORY_IMAGE,
            },
        },
        {
            "id": "headphone-collection", "type": "ProductCollection", "variant": "grid", "enabled": True,
            "settings": {
                "title": "Sound essentials",
                "subtitle": "Discover the audio picks in our collection.",
                "strategy": "category", "categoryName": "Headphones", "columns": 3, "maxProducts": 3,
            },
        },
        {
            "id": "announcement", "type": "PromotionalBanner", "variant": "full", "enabled": True,
            "settings": {
                "text": "Your next favorite find is waiting.",
                "ctaText": "Browse all products", "ctaLink": "/shop",
                "bgColor": "#111827", "textColor": "#FFFFFF",
            },
        },
        {
            "id": "reviews", "type": "Reviews", "variant": "grid", "enabled": False,
            "settings": {
                "eyebrow": "CUSTOMER VOICES", "title": "Customer reviews", "subtitle": "Real customer feedback will appear here when available.",
            },
        },
    ]


def seed(api, args):
    settings = api.call("/api/v1/settings")
    design = api.call("/api/v1/store/design")
    current = api.all_products()
    by_name = {item["name"].strip().casefold(): item for item in current}

    print(f"\nCurrent store: {settings.get('storeName', 'Store Studio')}")
    print(f"Existing products: {len(current)}")
    print("\nThis will add demo products and REPLACE the homepage layout, store name,")
    print("tagline and headline text. Existing products, orders and logos are not deleted.")
    if not args.yes and input("This will override your store settings, type 'y' to continue: ").strip() != "y":
        print("Cancelled; no changes made.")
        return

    created = skipped = refreshed = failed = 0
    product_ids = {}
    for record in PRODUCTS:
        key = record["name"].strip().casefold()
        try:
            if key in by_name:
                existing_id = int(by_name[key]["id"])
                product_ids[key] = existing_id
                if args.refresh_existing:
                    api.call(f"/api/v1/products/{existing_id}", "PUT", record)
                    print(f"[UPDATED] {record['name']}")
                    refreshed += 1
                else:
                    print(f"[EXISTS]  {record['name']}")
                    skipped += 1
            else:
                saved = api.call("/api/v1/products", "POST", record)
                product_ids[key] = int(saved["id"])
                print(f"[CREATED] {record['name']}")
                created += 1
        except (RuntimeError, KeyError, ValueError, TypeError) as error:
            print(f"[FAILED]  {record['name']}: {error}", file=sys.stderr)
            failed += 1

    # Explicit IDs matter: the homepage's 'featured' strategy doesn't pick products automatically.
    feature_names = [
        PRODUCTS[i]["name"] for i in (0, 3, 6, 9, 1, 4, 7, 10)
    ]
    featured_ids = [product_ids[name.casefold()] for name in feature_names if name.casefold() in product_ids]

    # Preserve existing site logos; branding is the store's identity, not Store Studio's logo.
    branding = {
        "storeName": "The Everyday Edit",
        "storeTagline": "Curated essentials for every day.",
        "logoUrl": settings.get("logoUrl"),
        "logoDarkUrl": settings.get("logoDarkUrl"),
        "showRingSizeGuide": settings.get("showRingSizeGuide", False),
    }

    # Legacy homepage fields are kept in sync; the section editor uses designConfig below.
    api.call("/api/v1/settings", "PUT", {
        "storeName": branding["storeName"],
        "storeTagline": branding["storeTagline"],
        "heroEyebrow": "THE EVERYDAY EDIT",
        "heroTitle": "Good things, for everyday living.",
        "heroIntro": "Discover carefully chosen essentials across sound, style and scent.",
        "heroCta": "Explore the collection",
        "story1Eyebrow": "A LITTLE ABOUT US",
        "story1Title": "Everyday items. Better choices.",
        "story1Intro": "Explore a demo collection of well-designed everyday essentials.",
        "story1Cta": "Shop the collection",
        "story1Image": STORY_IMAGE,
        "story2Eyebrow": "DISCOVER MORE",
        "story2Title": "Make it yours",
        "story2Intro": "A flexible storefront you can adapt to your own business.",
        "story2Cta": "Browse products",
    })

    # Modern is the default so a supplied hero photo is actually visible.
    # The MINIMAL template intentionally uses a solid/text-first hero in this codebase.
    design_payload = {
        "template": args.template,
        "colorMode": "LIGHT",
        "paletteId": design.get("paletteId") or "CHAMPAGNE",
        "accentColor": "#FFC300",
        "fontPreset": "ELEGANT",
        "branding": branding,
        "designConfig": json.dumps({"sections": demo_sections(featured_ids)}, ensure_ascii=False),
    }
    api.call("/api/v1/store/design", "PUT", design_payload)

    print("\nDemo storefront configured!")
    print(f"  Products created : {created}")
    print(f"  Already present  : {skipped}")
    print(f"  Refreshed        : {refreshed}")
    print(f"  Product failures : {failed}")
    print(f"  Featured products: {len(featured_ids)}")
    print(f"  Store            : {branding['storeName']}")
    print(f"  Template         : {args.template} (LIGHT)")
    print("  Hero & story     : Unsplash-hosted photos")
    print("\nOpen the storefront and refresh the page to see the changes.")
    if failed:
        print("Some products failed. Rerun this script to retry only those products.")


def main():
    parser = argparse.ArgumentParser(description="Add a complete Store Studio demo storefront")
    parser.add_argument("--url", default=os.getenv("STORE_URL", "http://localhost:5173"),
                        help="Storefront URL (default: http://localhost:5173)")
    parser.add_argument("--template", choices=("MODERN", "EDITORIAL", "MINIMAL"), default="EDITORIAL",
                        help="Store design template (default: EDITORIAL)")
    parser.add_argument("--yes", action="store_true", help="Skip overwrite confirmation")
    parser.add_argument("--refresh-existing", action="store_true",
                        help="Replace details/photos of products with matching demo names")
    args = parser.parse_args()

    print("Store Studio — Full Demo Seeder\n")
    api = StoreAPI(args.url)
    api.login()
    seed(api, args)


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, ValueError, KeyError, TypeError) as error:
        print(f"\nError: {error}", file=sys.stderr)
        sys.exit(1)
