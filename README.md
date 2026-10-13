# Das Research Group website

Next.js / TypeScript frontend for the SMU Das Research Group. WordPress remains the content source and administrative interface; Vercel is the intended host.

Live website: https://dasgroup.vercel.app. Admin: https://dasgroup.vercel.app/admin. The GitHub repository is connected to Vercel; pushes to `main` deploy automatically.

Implemented: responsive homepage, Research, Team/PI, searchable Publications bibliography, Group News, Instruments, Group Photos, Join, Contact and Teaching; live public content reads with five-minute revalidation; sanitized content, optimized images/failure states, metadata, sitemap/robots and administrator documentation.

## Run locally

Use Node.js 24. Run `npm ci`, then `npm run dev` and open the printed localhost URL. Windows PowerShell users can use `npm.cmd`. This environment needs `$env:NODE_USE_SYSTEM_CA='1'` for institutional HTTPS and `--cache .npm-cache` if npm's default cache is restricted. TLS verification stays enabled.

No WordPress credentials are needed. `.env.example` documents optional settings. Never copy the neighboring project's environment file. Set `WORDPRESS_ENABLED=false` only for a visibly labeled offline preview.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:browser`, `npm run format:check` and `npm run build`. Browser tests use installed Chrome. See [deployment instructions](docs/DEPLOYMENT.md) for environment setup.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [WordPress integration and verified inventory](docs/WORDPRESS_INTEGRATION.md)
- [Administrator editing guide](docs/CONTENT_MANAGEMENT.md)
- [Media inventory](docs/MEDIA_INVENTORY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Validation and launch review](docs/VALIDATION.md)
- [Handover](docs/HANDOVER.md)
- [Original Phase 1 audit](docs/DISCOVERY.md)

The frontend is deployed on Vercel, while the existing SMU content backend remains in place. Continue reviewing scientific/editorial content, missing image descriptions and blocked external images. Custom-domain and institutional DNS changes are separate from this deployment. The optional backend templates remain available as advanced setup references.

## Content administration

Use the website’s own `/admin` workspace for PI information, team bios/photos, individual papers, lab updates and other content. WordPress is the backend, not the normal editing interface. The [Admin Guide](docs/ADMIN_GUIDE.md) describes the current workflow. Individual managed records preserve original source content and work alongside the legacy roster/bibliography without an all-at-once migration.

The [native WordPress guide](docs/NATIVE_WORDPRESS_GUIDE.md), [capability audit](docs/WORDPRESS_CONTENT_MODEL.md), [field reference](docs/NATIVE_FIELD_REFERENCE.md) and blank templates remain advanced fallback/setup references. Normal editors use the custom workspace; it creates the appropriate backend records and associations when they save approved content. No production setup/migration has been performed by this development session.

Open /admin with individual authorized editing credentials. See [ADMIN_SETUP.md](docs/ADMIN_SETUP.md) for the server connection, permissions and extensibility. Run npm run test:admin for isolated mock-backed administration checks.
