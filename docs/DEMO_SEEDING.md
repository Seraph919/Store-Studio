# Demo storefront seeding

`seed_full_demo.py` populates an initialized **Store Studio** instance with a
fictional example storefront, *The Everyday Edit*. It uses only the Python 3
standard library and the existing REST API; no database migrations are needed.

## Before you start

1. Start the application and finish the first-time setup wizard.
2. Make sure you have the owner email and password.
3. **Use a test store**: the script replaces the store name, slogan, and home
   page design. It does not delete existing orders, unrelated products, or uploaded logos.

## Usage

From the project root:

```bash
python3 seed_full_demo.py
```

The default URL is `http://localhost:5173`. For another URL:

```bash
python3 seed_full_demo.py --url https://your-store.example
```

To update demo products already present by name:

```bash
python3 seed_full_demo.py --refresh-existing
```

Available flags:

- `--template MODERN|EDITORIAL|MINIMAL` (default: `MODERN`)
- `--refresh-existing` updates previously added demo products instead of skipping them
- `--yes` skips the `DEMO` confirmation (use with care)
- `--url` sets the storefront base URL

The script prompts for owner credentials, or reads `STORE_EMAIL` and
`STORE_PASSWORD` if supplied as environment variables. Avoid storing passwords
in shell history or committing them to source control.

## Demo content

- Four dynamically created product categories: **Headphones, Watches, Glasses, Perfumes**
- Twelve sample products with fictional MAD prices and stock quantities
- Homepage hero image, slogan and call-to-action
- Category cards, featured products, brand story, product collection and promo banner
- Reviews hidden until real customer reviews are available

The demo's photographs are served from external Unsplash image URLs. They are
**not included as image files in this ZIP** and require internet access. Review
third-party image terms before using any photo in a real shop.

This is demonstration data, not an actual inventory or product endorsement.
