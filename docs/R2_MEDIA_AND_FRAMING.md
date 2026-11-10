# Cloudflare R2 uploads and product photo framing

Store Studio uses **one bucket per installation**. Product images, store logos, hero photos, brand-story photos, and optional product videos are uploaded through the authenticated Spring Boot backend. **No URL entry or browser-to-R2 CORS policy is necessary.** Existing external image URLs in the database continue to render, but new media in seller interfaces is uploaded rather than entered as a link.

## Cloudflare setup

1. Create a Cloudflare **R2 bucket** (e.g. `store-studio-media`).
2. In R2 API Tokens, create credentials restricted to that bucket with **Object Read & Write** permissions. Keep the secret on the backend.
3. Make uploaded media publicly viewable: attach a **public custom domain** to the bucket (recommended for production), or enable the R2 public development URL for local testing. The public domain must serve files at `https://host/uploads/<file-id>.<ext>`. An API endpoint such as `*.r2.cloudflarestorage.com` is **not** a public-media domain.
4. Configure these values in `.env` (never commit it):

   ```dotenv
   CF_ACC_ID=<32-hex-character Cloudflare account ID>
   CF_ACC_KEY=<R2 access key ID>
   CF_SEC_ID=<R2 secret access key>
   CF_BUCKET=store-studio-media
   PUBLIC_DOMAIN=https://media.example.com
   ```

5. Restart the backend after changing its environment:

   ```bash
   docker compose up -d --build backend front-end
   ```

The upload endpoint is `POST /api/v1/seller/media/upload` (multipart field `file`). The frontend sends the owner JWT, and Spring Boot writes to R2 using the S3 API. R2 secrets never reach the browser. Invalid or missing R2 settings yield HTTP 503; check server logs and your bucket/domain settings. You do not need bucket CORS rules for this upload mechanism.

**Limits:** JPEG, PNG and WebP up to **8 MB**; MP4 and WebM up to **30 MB**. File signatures are checked by the backend. SVG and other formats are not accepted. Object names are randomized under `uploads/`. Assets are public by design; do not upload private customer information. Uploads are not deleted automatically when a product is edited—review unused objects periodically.

## Photo framing

In **Owner Dashboard → Products → Edit/Add Product**, upload images and select the primary and hover photos. The **Live storefront crop preview** lets you:

- Choose **square (1:1)**, **portrait (3:4)**, or **landscape (4:3)**.
- Choose **fill the frame** (cover) or **show the full photo** (contain). `Contain` is particularly useful for white-background product shots.
- **Drag** the photo in the preview or use horizontal / vertical sliders to reposition it.
- **Zoom** from 100–200% and reset if needed.

Press **Save Changes** or **Publish Piece**. Framing settings are saved per product and used in the public catalog, featured-product cards, and main product photo. The original upload is unchanged. Framing fields are added by `V9__product_image_framing.sql` (Flyway, applied on startup through Docker Compose). Existing products default to a square, cover-style image.

## Troubleshooting

- **HTTP 503:** R2 account ID, token, bucket or `PUBLIC_DOMAIN` is missing/invalid, or the S3 client cannot initialize.
- **Upload fails with access denied:** Check bucket-scoped token permissions and bucket name.
- **Upload succeeds but photo is blank:** The configured `PUBLIC_DOMAIN` must publicly serve the bucket; check the object URL in a private browser window.
- **413 error:** The file exceeds its size limit. Consider resizing photos before upload.
- **Old photos still point to external URLs:** The app preserves previously saved URLs, and the full-demo seeder deliberately uses public demo photographs. New dashboard uploads go to R2.

## Compatibility

The new media endpoint replaces the old presigned upload flow for the UI. No credentials or uploaded files are included in the repository ZIP. On an existing installation, the Flyway migration must complete before the updated backend starts (the supplied `compose.yml` already runs migrations first).
