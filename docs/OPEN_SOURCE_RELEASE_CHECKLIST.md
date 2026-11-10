# Public repository release checklist

This source release is intended to be a **generic, one-store-per-installation** template, not a copy of any particular seller's deployment.

## Included cleanup

- Removed the uploaded `.env` (it contained populated private configuration values).
- Excluded generated frontend builds, compiled Java artifacts, and test reports.
- Replaced the original Java developer-specific package namespace with `org.storestudio`.
- Removed previous merchant branding and its email fixtures, obsolete multi-tenant documentation, and a stale CSS audit export.
- Replaced country-specific demo contact defaults with empty, configurable fields.
- Replaced a developer-profile GitHub link in the project website with `YOUR_ORG/YOUR_REPO` placeholders.
- Split project overview (`README.md`) from technical setup (`DEV_README.md`).
- Added MIT `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, and this checklist.

## Before making the GitHub repo public

1. **Rotate the credentials from your old `.env`:** database password, installation/JWT secrets, R2 API credentials, and any SMTP app password. Deleting a file from a ZIP does not invalidate credentials or remove secrets from Git history.
2. **Audit *all* Git commits and branches**, not only the current working tree, for `.env`, private configuration, screenshots, exported databases, and customer data. Remove secrets from history before publication and rotate them anyway.
3. Set the correct repository URL in `website/main.js` and `website/index.html` (replace `YOUR_ORG/YOUR_REPO`), and review docs/URLs.
4. Add application screenshots only after stripping names, order numbers, contact information, and other customer data.
5. Confirm that every image and third-party asset has suitable redistribution rights. The demo seeder references remotely hosted stock photographs.
6. Review the included **MIT license** and confirm you own or have permission to license the full code and included assets.
7. Run `python3 scripts/audit_public_release.py`, a frontend build, and backend tests. Review the implementation and service configuration before production deployment.
8. Recheck all live environment variables, public domains, and browser CORS patterns for the target server.

**Scope limitation:** A source-code search cannot prove the absence of hidden identifiers in every image, commit, deployment, or external account. Manual review and a Git history scan are still necessary.
