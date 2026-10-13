# Deployment to Vercel

The site is deployed to Vercel and connected to GitHub. Production uses Node.js 24, the Next.js preset and reproducible `npm ci` installs.

- Website: https://dasgroup.vercel.app
- Admin sign-in: https://dasgroup.vercel.app/admin
- Repository: https://github.com/Heartz00/DasResearchGroup
- Hosting project: https://vercel.com/ayomides-projects-3c7c3776/das-research-group

Pushes to `main` trigger production deployments. Production environment settings are `WORDPRESS_URL=https://people.smu.edu/daslab`, `WORDPRESS_ENABLED=true`, `SITE_URL=https://dasgroup.vercel.app` and `ADMIN_ENABLED=true`. A fresh `ADMIN_SESSION_SECRET` is stored as a sensitive production variable in Vercel; it is not in GitHub. Editors sign in with their existing individual authorized content accounts.

Local `.env` files, Vercel authentication/link files, dependency caches and preview artifacts are excluded from Git and deployment uploads. The Linux clean-install check includes the required native/WASM dependency entries in the lockfile. The initial production deployment was completed on October 13, 2026.

## Local development

Use Node.js 24 (Next.js minimum is 20.9). In this repository run `npm ci`, then `npm run dev`. On Windows with PowerShell script restrictions, use `npm.cmd`. Open the printed localhost address.

Copy `.env.example` to `.env.local` if overrides are needed. Public content works without WordPress credentials. Never copy the neighboring CGC application's environment file or admin secrets.

On this Windows environment HTTPS works with Node's system certificate store: set `$env:NODE_USE_SYSTEM_CA='1'` before commands that access SMU. If npm cannot write its default cache, use `npm.cmd ci --cache .npm-cache`. Neither step disables TLS verification. Institutional certificates may differ on another machine; use its trusted CA setup rather than disabling verification.

## Verification commands

```text
npm run typecheck
npm run lint
npm test
npm run test:browser
npm run format:check
npm run build
```

Browser tests use an installed Chrome by default and start the app at port 3002. For another machine, install Chrome or adjust Playwright's channel/browser setup. The test server runs through Node directly. Tests capture ignored previews under `.preview`. The normal development port is 3000.

## Additional environments and custom domains

1. Confirm institutional/shared GitHub and Vercel ownership and give maintainers individual access.
2. Import the approved repository into Vercel using the Next.js framework preset. This repo root is the application root.
3. Set `WORDPRESS_URL=https://people.smu.edu/daslab`, `WORDPRESS_ENABLED=true`, and `SITE_URL=https://<approved-frontend-domain>` in the appropriate environment.
4. Review a private/preview deployment with the PI. Vercel preview environments are excluded from indexing by robots configuration.
5. Check all routes, real source updates, images, mobile/keyboard behavior, canonical/OG URLs, sitemap and robots before public launch.
6. Configure an additional approved domain when needed, update the production `SITE_URL` and redeploy. Changing the SMU site's DNS or redirects is a separate institutional task.

Public read-only requests need no authentication secrets. No webhook secret is required by this implementation. Leave the original SMU WordPress site untouched unless separately authorized. DNS and old-site redirects require institutional coordination.

## Redeploy and recover

Source changes can deploy through the connected GitHub branch once hosting is configured. Ordinary WordPress publishing does not need redeployment. For a frontend regression, use Vercel's previous deployment rollback and notify the owner. For a bad content edit, restore WordPress content rather than rolling back code. Preserve the lockfile, environment settings and original media references.

Never launch with `WORDPRESS_ENABLED=false` or a localhost SITE_URL. Confirm that required content, source-image repairs and dashboard revision access have been reviewed; a successful build alone does not establish editorial readiness.
