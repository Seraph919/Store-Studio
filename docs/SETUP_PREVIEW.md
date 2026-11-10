# First-install preview and template hero behavior

The installation wizard renders a fixed, **illustrative-only** catalog:
Headphones, Watches, Glasses, and Perfumes. The mock names, prices and image URLs are declared in `client/src/pages/SetupPage.tsx`.

- These items do **not** write to PostgreSQL or create products/categories.
- Product and category preview photos are third-party Unsplash images, loaded over HTTPS; the previews require an Internet connection. Replace these with project-owned, locally bundled photos for fully offline deployments.
- The preview changes layout when the seller chooses Minimal, Modern, or Editorial. It is a visual illustration, not a full live deployment of the design editor.

## The published hero

Selecting a template saves `StoreDesign.template` along with a matching hero variant.
When no real hero photograph has been uploaded, `HeroSectionRenderer` now renders a different image-free hero per template:

- Minimal: centered type and neutral background
- Modern: left-aligned bold type with a geometric graphic panel
- Editorial: high-contrast dark editorial panel

The sample products and sample hero photo are never copied into the published storefront. Add actual products and images via the dashboard.

Existing stores whose design was previously saved are not automatically overwritten. Change and publish their template in Design Studio to see the updated appearance.
