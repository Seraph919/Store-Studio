# Cloudflare Tunnel: Add to Cart returns HTTP 403

## Cause

In the original project, both Spring Security and a separate Spring MVC CORS
configuration allowed only `http://localhost:5173`. In a Cloudflare Tunnel,
`POST /api/carts` and `POST /api/carts/{id}/items` include an `Origin` header
such as `https://my-temporary-name.trycloudflare.com`. The Vite proxy forwards
the request to the backend's internal `spring-backend:8080` host, and the CORS
filter rejects the external origin **before the cart controller runs**.

## Fix

The project now uses one Spring Security CORS configuration with the
deployer-configurable `CORS_ALLOWED_ORIGIN_PATTERNS` environment variable.
The default includes temporary `https://*.trycloudflare.com` URLs for local
preview testing and local hostnames. The old duplicate Spring MVC `CorsConfig`
was removed to prevent conflicting CORS decisions.

To configure a production domain, edit `.env`:

```dotenv
CORS_ALLOWED_ORIGIN_PATTERNS=https://shop.example.com,http://localhost:5173
```

Do **not** allow every origin (`*`) on a real store. Remove the temporary
`trycloudflare.com` wildcard for production. Recreate the backend after
editing `.env`:

```bash
docker compose up -d --build --force-recreate backend front-end
```

## Verify the fix

From your laptop, with the tunnel running and using its actual URL:

```bash
curl -i -X POST https://YOUR-TUNNEL.trycloudflare.com/api/carts \
  -H 'Origin: https://YOUR-TUNNEL.trycloudflare.com'
```

The expected response is **201 Created** and a JSON object containing
`cartId`. An **403 Forbidden** with an `Invalid CORS request` response indicates
the CORS configuration is still blocking that origin. On a real deployment,
you may also see a Cloudflare Access 403 if you enabled an access policy.

Once the cart is created, adding products from the storefront should work.
For other errors, inspect the browser's Network tab response for
`POST /api/carts` and `POST /api/carts/{id}/items` and backend logs:

```bash
docker compose logs --tail=100 backend
```
