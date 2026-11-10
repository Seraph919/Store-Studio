# Store Studio Web Application

This directory contains the public storefront, first-time owner setup wizard, seller/admin dashboard, and Design Studio.

- [What Store Studio does](../README.md)
- [Developer setup, stack and deployment](../DEV_README.md)
- [Detailed frontend documentation](docs/FRONTEND_DOCUMENTATION.md)

For local frontend development:

```sh
npm ci
npm run dev
```

For a type-checked production bundle:

```sh
npm run build
```

The web app expects the Store Studio backend API. For a complete local environment, use Docker Compose from the repository root as described in the developer guide.
