# Store Studio — Developer & Deployment Guide

This guide covers the technologies, architecture, local development, configuration, and self-hosting requirements. For a nontechnical overview see [README.md](README.md).

## Architecture

A deployment operates **one store**. The frontend exposes the public storefront, first-time setup wizard, and authenticated seller/admin tools. Backend services own products, cart, orders, store settings, payment policy, and API-key authorization. An optional R2 bucket stores public media; optional integrations can use scoped read-only API keys.

| Component | Implementation |
|---|---|
| Web app | React 19, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS |
| API | Java 21, Spring Boot 4, Spring Security, Spring Data JPA |
| Data | PostgreSQL with Flyway SQL migrations |
| Caching | Redis |
| Media | Optional Cloudflare R2 (S3-compatible) |
| Packaging | Docker Compose; static marketing site in `website/` |

## Requirements

- Docker Engine and Docker Compose plugin
- OpenSSL or another cryptographically secure secret generator
- Port 5173 free for the default local Compose deployment
- Optional: Node.js and npm for frontend development; Java 21 and Maven for API development

## Launch locally

```sh
cp .env.example .env
openssl rand -hex 32   # copy output into SETUP_TOKEN
openssl rand -hex 48   # copy output into JWT_SECRET
```

Edit `.env`. In particular:

- `DB_USERNAME`, `POSTGRES_USER`, `FLYWAY_USER` must refer to the same intended DB account; keep corresponding passwords consistent.
- `POSTGRES_DB` and the database in `FLYWAY_URL` must match the application database. The supplied defaults use `store_db`.
- **Replace** all example passwords, `JWT_SECRET`, and `SETUP_TOKEN` with unique random values.
- `CF_ACC_ID`, `CF_ACC_KEY`, `CF_SEC_ID`, `CF_BUCKET` and `PUBLIC_DOMAIN` are used for R2 uploads. The public domain must serve uploaded media to visitors.
- `ADMIN_MAIL` and `APP_PASSWORD` configure outgoing email via the mail settings in `server/src/main/resources/application.yaml`. Use valid service-specific credentials if email is needed.
- `CORS_ALLOWED_ORIGIN_PATTERNS` controls permitted browser origins. Set only your actual storefront domain(s) for production; development tunnel patterns do not belong in production.

Run:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Open `http://localhost:5173`. With an empty database, the browser should take you to `/setup`: supply `SETUP_TOKEN`, create the first owner, select a template, configure branding, and publish. Existing installations with a user account continue to the storefront. **Never expose the installation token in a public URL or frontend variable.**

```sh
docker compose down  # stop services; keeps your persistent data
```

**Do not** use `docker compose down -v` on a database you want to keep. This removes persistent volumes.

## Source layout

```text
client/                              React storefront, dashboards and setup wizard
server/src/main/java/org/storestudio/store/    Spring Boot application and API
server/src/main/resources/db/migration/        Flyway migrations
server/src/test/                    Backend tests
website/                            Separate static project/promotional website
demoScript/seed_full_demo.py         Optional test-catalog/homepage seeder
docs/                               Feature and operations documentation
compose.yml                         Docker Compose services
.env.example                        Safe configuration template
```

## Frontend development

```sh
cd client
npm ci
npm run dev
npm run build
npm run lint
```

Development uses Vite; in Compose the frontend is served using `vite preview` on port 5173. That setup is convenient for evaluation but **is not a fully hardened production web server**. Put a production deployment behind HTTPS and review the web-serving architecture.

## Backend development

```sh
cd server
./mvnw test
./mvnw package
```

The Docker build uses a Maven builder stage and Java 21 runtime. The Maven group/package root has been normalized to `org.storestudio` so example installations do not inherit an individual developer's namespace.

## Key routes

| Route | Use |
|---|---|
| `/` | Published storefront |
| `/shop` | Product catalog |
| `/products/:productId` | Product details |
| `/checkout` | Submit an order request |
| `/setup` | One-time owner setup |
| `/login` | Owner/staff sign in |
| `/seller` | Seller dashboard |
| `/seller/products` | Products and inventory |
| `/seller/orders` | Order management |
| `/seller/shipping` | Shipping policy |
| `/seller/api-keys` | Read-only integration keys |
| `/dashboard/design` | Visual storefront editor |

## Payments and order state

Payment policy is per product: COD, percentage deposit, or full prepayment. The backend calculates amounts due before dispatch and on delivery, including mixed carts; it does **not** integrate an online payment processor. Advance amounts must be collected by a seller-approved external method and marked as received before dispatch. For details see [docs/PAYMENT_TERMS.md](docs/PAYMENT_TERMS.md).

## Media and integrations

- R2 media uploads are handled by the authenticated backend. Product photography supports different frames, fitting, zoom, and position. See [docs/R2_MEDIA_AND_FRAMING.md](docs/R2_MEDIA_AND_FRAMING.md).
- Scopable, revocable read-only API keys support **optional external MCP servers**. The MCP server itself is not bundled. See [docs/MCP_API_KEYS.md](docs/MCP_API_KEYS.md).
- A sample demo catalog and homepage can be seeded **only after owner setup**:

  ```sh
  python3 demoScript/seed_full_demo.py
  ```

  It can overwrite design copy and uses externally hosted demo images. Run it only in a disposable or intentionally demo environment. See [docs/DEMO_SEEDING.md](docs/DEMO_SEEDING.md).

## Production checklist

- Serve all customer traffic via HTTPS, preferably with one origin forwarding `/api` to the internal API. See `deploy/Caddyfile.example`.
- Never publish PostgreSQL, Redis, or backend ports directly to the internet.
- Generate unique secrets, configure a legitimate mail account and domain, and configure the correct R2 public domain.
- Back up PostgreSQL and media; test restoration before hosting real orders.
- Verify checkout, shipping, advances and email notifications end-to-end.
- Review applicable privacy, consumer, and commercial rules for the target jurisdiction.
- Keep dependencies patched and review [SECURITY.md](SECURITY.md).
- Never commit `.env`, build output, live database copies, screenshots of customer data, or generated service credentials.

## Publishing the code publicly

Run the [release audit](scripts/audit_public_release.py) before pushing. Replace `YOUR_ORG/YOUR_REPO` in the marketing site and add original screenshots with permission. Check the entire **Git history**, not just today's files, for secrets and merchant branding. See [docs/OPEN_SOURCE_RELEASE_CHECKLIST.md](docs/OPEN_SOURCE_RELEASE_CHECKLIST.md).
