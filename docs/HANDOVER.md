# Maintainer handover

## Routine administration

Follow [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md) for step-by-step WordPress editing:

- Current members and alumni: Meet the Team; after an approved migration, individual child Pages and their Status.
- Publications: existing bibliography; after complete migration, Publications-category Posts.
- News: Group News archive or News-category Posts, without duplicate copied events.
- Research: Research page and optional child Pages.
- Instruments: Instrumentation page photos and optional named child Pages.
- Photos: Media Library and Group Photos page; add accessible descriptions.
- Recruitment/contact: PI page or documented dedicated Pages.
- Homepage/footer: optional frontend-home Page and its normal heading/paragraph fields.

Updates normally appear after the five-minute cache interval and a subsequent refresh. See [integration](WORDPRESS_INTEGRATION.md) for timing and outages. Do not edit the offline repository snapshot to update the public site.

## Ownership and access

The PI should retain institutional ownership and scientific/editorial approval. A trusted website administrator can maintain content and coordinate access. Graduate/student maintainers should have individual WordPress accounts with suitable permissions, not shared developer credentials. Verify that their assigned role can edit the shared Pages they need; Author roles often cannot edit others' Pages. SMU determines available roles and account provisioning.

Prefer an institutional GitHub organization and shared Vercel team with at least two responsible owners. The current origin is a personal repository; moving ownership remains a human decision. Record the approved domain, owners and support contacts in the team's institutional records, not in public source files containing private details. Review and remove departing maintainers' access.

## Developer handover

Read [architecture](ARCHITECTURE.md), [integration](WORDPRESS_INTEGRATION.md) and [deployment](DEPLOYMENT.md). Use the lockfile to install dependencies, run the verification commands, and review actual WordPress source records when changing adapters. Frontend source changes require testing and a hosting deployment; content publishing does not.

Never change without review: source mappings, bibliography parsing, canonical collection switches, HTML sanitizer, image allowlist, WordPress URL, domain/robots configuration, roles, account ownership or legacy archive deletion. Do not introduce a second admin system without demonstrating a critical unsupported requirement and discussing its tradeoffs.

Keep WordPress revision/history and old media available. Source rollback restores code, WordPress revisions restore supported content, and Vercel rollback restores frontend deployments; these are different operations. Confirm revision retention and recovery behavior with SMU before relying on it.

## Remaining launch work

PI review of current roster, publications/statuses, research language and recruitment; replacement/authorization of blocked third-party graphics; missing alt text and image-only biography accessibility; confirmation of SMU branding, revisions, ownership and domain; a permitted live content-change/revalidation test; final launch approval. No production content was altered during this implementation.
