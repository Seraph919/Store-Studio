# Independent template settings and responsive storefronts

## Template edits

The Design Studio now keeps an independent snapshot for **Minimal**, **Modern**, and **Editorial**. A snapshot includes the homepage sections, uploaded photo URLs, section ordering and visibility, theme mode, palette, accent color, and font. **Store name and uploaded logos stay shared** between the templates.

- Switching templates stores the current template’s edits in the editor session and restores the destination template’s last settings.
- The first time a template is selected, its starting layout is cloned from the current template so sellers do not have to re-enter every title or photograph.
- The templates then diverge independently: changing a photograph in Modern no longer changes Minimal.
- Click **Publish changes** to persist *all* template snapshots to PostgreSQL, including inactive templates. Returning to an unpublished session without publishing still triggers the existing unsaved-changes warning.
- **Discard** resets all templates to their last published snapshots.
- Older existing designs have only `sections` and remain readable; no database migration is necessary. When published again, the snapshots are saved inside the existing `design_config` JSONB column as `templateDrafts`.

The server validates section content, image URLs and settings separately in every stored template. The JSON payload limit is 250 KB.

## Responsive layout updates

- **Phone (< 600px):** single-column story with a contained image, compact header actions, and vertically stacked footer. Category tiles are single-column until there is enough room for two.
- **Tablet (600px–1023px):** story content and imagery stack, with a two-column footer below the brand. This avoids squeezing copy into the seven/five-column desktop split.
- **Desktop (≥ 1024px):** existing multicolumn section layouts remain intact; the footer becomes a three-column layout.
- Hero images have bounded heights on narrow viewports, and promotional banners wrap long text/links rather than overflowing.
- Design Studio preview uses a 390px phone viewport and 768px tablet viewport to approximate common display sizes.

Suggested checks: review Modern, Minimal, and Editorial at 390px, 768px, and 1280px; scroll to the footer; test long store names; select and publish several templates; reload and switch back.

## References

- [MDN: Responsive web design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design)
- [web.dev: Responsive web design basics](https://web.dev/articles/responsive-web-design-basics)
- [web.dev: Responsive images](https://web.dev/learn/design/responsive-images)
