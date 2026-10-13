# WordPress integration

## Verified public discovery

On October 12, 2026, public HTTPS REST reads succeeded from Node using its system CA store. The earlier discovery failures were transport issues, not proof that REST was disabled. TLS verification remains enabled.

Base: `https://people.smu.edu/daslab/wp-json/wp/v2/`.

| Collection                    | Observed result                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| Pages                         | 11 published pages                                                                               |
| Posts                         | 1 legacy post; not a structured News/Publications dataset                                        |
| Media                         | 115 records across two pages at 100 records per request                                          |
| Categories                    | 1 category; no News/Publications category yet                                                    |
| Tags                          | Empty                                                                                            |
| Types                         | Standard WordPress types; no public people/publication/research/instrument custom type observed  |
| Menus / menu-items / settings | 401 for unauthenticated requests                                                                 |
| People page revisions         | Registered route, 401 for public reads; dashboard revision availability still needs verification |

Page responses include empty `acf` arrays and `_acf_changed` metadata. This is not proof that usable custom fields exist or that plugins can be installed. No custom field dependency was introduced.

| ID  | Slug                    | Meaning                                               |
| --- | ----------------------- | ----------------------------------------------------- |
| 6   | research                | Research/homepage source; featured media 360          |
| 15  | publications            | Full bibliography, 33 numbered records                |
| 16  | news                    | About Dr. Das, contact and recruitment guidance       |
| 17  | contact                 | Teaching, despite its slug; includes Fall 2022        |
| 18  | people                  | Current roster and former-member images               |
| 129 | lab-photos              | Group gallery                                         |
| 262 | teaching                | Older teaching listing                                |
| 295 | lab-instrument-pictures | Empty                                                 |
| 306 | instruments             | Empty                                                 |
| 308 | instruments-2           | Instrumentation photographs, no verified capabilities |
| 392 | group-news              | News archive with undated updates                     |

The server adapter deliberately maps these semantic mismatches rather than treating `/news` as news or `/contact` as contact. Source collection IDs/URLs and modification times remain in normalized records. See [media inventory](MEDIA_INVENTORY.md).

## Fetch and synchronization

The service fetches Pages first, then Media, Posts, Categories and Tags. Pages/Posts also embed their featured media, preserving hero/featured images if the separate Media Library request fails. Every collection follows `X-WP-TotalPages`; each request has a 15-second timeout and a five-minute Next.js cache lifetime. Routes also revalidate every five minutes.

WordPress publishing normally needs no Git commit, React change or redeployment. After five minutes, a visitor request may still receive cached content while Next.js refreshes it. Reload after a short additional wait to verify an update. An idle page will not refresh on its own. Development HMR caching and browser image caches differ from production revalidation. The exact update timing has not yet been tested by publishing production content, because production writes were not authorized.

No manual webhook or refresh endpoint is configured. If content remains stale beyond the expected refresh window, check the published source and public API, then ask the developer to inspect Vercel logs/cache. Do not promise an exact five-minute publishing deadline.

Pages failure produces an unavailable banner and official source links. Optional collection failures retain page content and omit unavailable extras. Framework caches may retain previously successful fetch data during an upstream outage; there is no separately stored durable last-good database. No old local snapshot is silently substituted for live content.

Set `WORDPRESS_ENABLED=false` only for offline development: it displays a dated snapshot banner and robots disallow indexing. The snapshot is public data, not another admin backend. It is not a production source of truth. `node --use-system-ca scripts/refresh-snapshot.mjs` refreshes it and the media inventory using GET requests only; developers should review the diff and tests.

## Supported future templates

Optional Pages: `frontend-home`, `frontend-contact`, `join-the-lab`; child Pages of Research, People and Instrumentation. Optional Posts: categories with slugs `news` and `publications`, plus a `featured` tag for publications. No plugin is required by the code.

These records have not been created in production. Their authoring conventions are specified in [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md). A WordPress administrator must check editor and account capabilities first. Existing source pages continue working without any setup.

## Media issues

Many source files have no alternative text. Some people/alumni biographies are image-only. A ResearchGate portrait returned 403 and an ACS graphical image returned 410 during browser checks. Several other publisher images may be blocked or missing. Image failures are handled visibly, but restoring authorized source files and accessible descriptions is a content task before launch. Do not claim an inferred instrument capability from its photograph.

## Authenticated admin workspace

The frontend now provides /admin for authenticated WordPress content management, using per-user Application Passwords and the existing REST API. Public discovery does not prove that SMU permits this authentication method; confirm it through the account Profile or SMU administrator. No live authenticated publishing has been performed. The existing dashboard and source-selection conventions remain authoritative. Setup and extension instructions are in ADMIN_SETUP.md.
