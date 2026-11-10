# Branding, minimal default, and optional ring-size guide

## Default design

New stores use the `MINIMAL` template and `LIGHT` mode, with a solid palette background. The old layered hero and its cutout images are not part of the default or available in the current editor. Other templates can still use a single optional hero image.

Platform SVGs live under `client/public/`:

- `/store-studio-logo-light.svg` — charcoal + gold, for light storefronts
- `/store-studio-logo-dark.svg` — white + gold, for dark storefronts
- `/favicon.svg` — platform favicon

When no seller logo is configured, the storefront falls back to the corresponding platform icon. Sellers can replace both versions in **Seller → Visual Store Studio → Branding**, using logo URLs, and publish. Their own brand takes priority over the platform asset.

## Ring-size guide

The **Show ring-size guide** switch is in **Seller → Visual Store Studio → Branding**. It is **off by default**. After publishing, the link appears/disappears in the desktop/mobile header, footer, and product page; direct access to `/ring-size-guide` redirects to `/shop` while disabled. Administrators may also change the switch in Store Settings.

`V7__optional_ring_guide_and_minimal_defaults.sql` adds the persistent setting with `FALSE` as the default. It converts the original unmodified V4 jewelry demo hero to a minimal design, while preserving seller-customized designs and existing theme choices.

## Existing local theme preferences

Dashboard mode defaults to light. Explicitly chosen light/dark mode stays respected across reloads. Store visitors can independently toggle the published store theme.
