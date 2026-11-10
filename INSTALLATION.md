# Store Studio — one-store self-hosted installation

Each deployment serves **one store**. Customers land on the storefront, not on a SaaS marketing page; only the owner/staff sign in. Public signup is disabled. MCP integration is optional.

## Before starting

1. Install Docker Engine and the Compose plugin.
2. Copy the environment file:
   ```sh
   cp .env.example .env
   ```
3. Generate **two independent secrets**:
   ```sh
   openssl rand -hex 32  # paste into SETUP_TOKEN
   openssl rand -hex 48  # paste into JWT_SECRET
   ```
4. Fill `DB_PASSWORD`, `POSTGRES_PASSWORD`, `FLYWAY_PASSWORD`, and any mandatory service secrets. PostgreSQL, Flyway, and the backend must use consistent DB credentials. Never commit `.env`.
5. Start locally:
   ```sh
   docker compose up -d --build
   ```
6. Open `http://localhost:5173`. A fresh database automatically redirects to `/setup`.

## The setup flow

- **1. Secure installation:** provide the secret in `SETUP_TOKEN`, owner name, email, and a strong password (minimum 12 characters). The server saves a BCrypt hash, creates one `OWNER` account, and immediately prevents a second bootstrap. It then signs you in.
- **2. Brand your store:** choose Minimal/Modern/Editorial, light/dark mode, colors, logo URLs, tagline, and optionally the ring-size guide. Logo overrides are optional; otherwise the bundled Store Studio logo displays. Save proceeds to step 3.
- **3. Review & publish:** review the summary and publish. Completion is recorded in PostgreSQL, not localStorage. New visits now show the public storefront at `/`; owners use `/login` and `/seller`.

If the owner account was created but setup wasn't completed (browser closed or server reboot), open `/setup` and **sign in with that owner account** to resume. You cannot repeat initial account creation.

**Existing database:** The V8 migration marks any database that already has users as installed, preserving the existing store and owner access. It does not overwrite existing designs or accounts.

## Security & deployment

- `SETUP_TOKEN` must be **at least 32 characters** and randomly generated. Keep it secret; it is required only on the one-time owner creation request.
- The owner creation endpoint is public but requires the installation token and a fresh database. Once an owner exists, registration is disabled regardless of token.
- **Publish the frontend via HTTPS** behind a reverse proxy (Caddy, Nginx, etc.) and forward the same-origin `/api` routes through the frontend service. Do not expose PostgreSQL, Redis, or Spring Boot directly to the public internet. The supplied Compose file does not publish their ports.
- The dev frontend currently listens on `:5173`. Place it behind an HTTPS reverse proxy for internet deployment; do not rely on Vite Preview alone as a hardened production web server.
- Set a unique `JWT_SECRET` generated from `openssl rand -hex 48` (do not reuse the setup token). Restart the backend when updating settings.
- Rotate/revoke API keys and use HTTPS for store image URLs. Do not expose secrets in client-side build variables.
- Back up your PostgreSQL volume and cloud media storage before upgrading. Never delete the database volume when recreating containers if you want to preserve setup completion.
- Keep owner access private; the optional MCP bridge uses separate scoped API keys.

## Common issues

| Symptom | Cause / fix |
|---|---|
| Setup returns `403` | `SETUP_TOKEN` missing, too short, or mistyped. Check your server `.env` and restart backend. |
| Setup returns `409` | An account already exists. Sign in and finish setup instead. |
| `Could not reach backend` | Check `docker compose ps`, logs, and Flyway migrations. |
| Existing installation goes to storefront | Expected: V8 automatically marks existing accounts as installed. |
| No logo | Leave URL blank to use bundled logo, or provide a reachable HTTPS image URL. |

## Routes

`/` public store · `/shop` product catalog · `/login` owner/staff login · `/seller` owner dashboard · `/dashboard/design` full editor · `/setup` first-install wizard only.

## API

`GET /api/v1/setup/status` returns `OWNER`, `CUSTOMIZE`, or `READY` in the `phase` field. `POST /api/v1/setup/owner` uses `setupToken`, `name`, `email`, `password`. `POST /api/v1/setup/complete` requires an authenticated owner/admin JWT.

A sample reverse proxy configuration is available at `deploy/Caddyfile.example`. It assumes Caddy is a container attached to the same Compose network; adapt the hostname and service topology for your server. Configure OCI firewall/security lists for 80/443, but keep ports 5432, 6379, and 8080 closed publicly.
