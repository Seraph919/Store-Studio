# Security policy

Store Studio is self-hosted. Deployers are responsible for protecting their installation and customer information.

## Reporting issues

Please do **not** post exploit details, private tokens, customer records or production configuration in a public issue. Contact the maintainers using GitHub's private vulnerability reporting feature if it is enabled, or use a private channel listed in the repository once configured.

## Deployment safeguards

- Use HTTPS, restrict backend/database/cache exposure, and use a unique `JWT_SECRET` and `SETUP_TOKEN` per installation.
- Keep API keys and R2 credentials on the backend only. Never commit `.env` or exported database/media backups.
- Back up production data and regularly update dependencies and infrastructure.
- Do not treat checkout submissions or manual payment records as successful online charges.

No formal vulnerability response timeline is promised for this volunteer project.
