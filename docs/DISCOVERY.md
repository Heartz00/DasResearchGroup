# Phase 1: discovery and proposed architecture

Audit date: October 12, 2026. Status: preliminary; live API discovery remains incomplete.

Implementation update: Phase 1 was approved and the frontend has since been built. Live API discovery succeeded with Node's system CA store. The original audit below is retained as a record of that initial investigation; use [WORDPRESS_INTEGRATION.md](WORDPRESS_INTEGRATION.md) for current verified endpoints and content inventory, and [ARCHITECTURE.md](ARCHITECTURE.md) for the implemented system.

## Scope and evidence

The cloned target repository is `DasResearchGroup`, with origin `https://github.com/Heartz00/DasResearchGroup.git`. It was empty at inspection. The neighboring `CGC-SMU-website` is a separate project and is not the implementation target. Its custom admin architecture should not be copied: the supplied requirements explicitly prefer WordPress administration.

Discovery used read-only requests and indexed public SMU pages. No login, production write, plugin installation, scaffold, deployment, or Git commit was performed. Search-index copies were crawled approximately three to four months before this audit; they provide preliminary source material, not proof of current roster, positions, publication status, or site configuration. This was a content inspection, not a visual or accessibility audit of a live rendered site.

Direct browser-tool access to the homepage returned 502. REST requests failed without useful response bodies. Local PowerShell HTTPS failed at transport level and Windows curl failed acquiring Schannel credentials. These failures do not establish that the SMU API is disabled.

## Preliminary content inventory

| Source                                                      | Findings                                                                                                                                                                                        | Proposed destination                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| [Research / homepage](https://people.smu.edu/daslab/)       | Synthetic inorganic chemistry; atomically precise coinage-metal clusters; hybrid materials involving MOFs and COFs; catalysis and biology applications. Research narrative and funding imagery. | Home and Research                                           |
| [About Dr. Das](https://people.smu.edu/daslab/news/)        | PI biography, education, contact and recruitment guidance. The misleading `news` slug contains the PI profile.                                                                                  | People / PI, Contact, Join                                  |
| [Publications](https://people.smu.edu/daslab/publications/) | Numbered bibliography divided into SMU and earlier work, publisher links and scientific graphics. Entries include submitted/accepted status.                                                    | Publications and featured previews                          |
| [Group News](https://people.smu.edu/daslab/group-news/)     | Awards, research updates and member milestones in a single page; dates are not consistently explicit in the indexed content.                                                                    | News; retain undated archive entries without invented dates |
| [Group Photos](https://people.smu.edu/daslab/lab-photos/)   | Captioned group, outreach, presentation and social photographs. Some indexed images lack descriptive labels.                                                                                    | Gallery and People preview                                  |
| Meet the Team                                               | Named in supplied requirements; exact URL, membership and categorization not verified.                                                                                                          | People and Alumni                                           |
| Instrumentation / Instruments / Lab Instrument Pictures     | Named in supplied requirements; exact URLs and capabilities not verified. Potential overlapping pages.                                                                                          | Facilities                                                  |
| Teaching                                                    | Named in supplied requirements; contents and URL not verified.                                                                                                                                  | Teaching, linked in secondary navigation                    |

Do not assume historical members are current. Confirm the roster with the PI. Confirm publication status and year before launch. Preserve author symbols, scientific notation and the distinction between pre-SMU and SMU work. Review image reuse rights, captions, alternative text and source attribution before selecting visuals.

Missing or weak information: normalized publication fields, explicit news dates, current roles/alumni status, verified instrument capabilities, current recruitment language, image dimensions/URLs/rights, professional links, and homepage editorial selections. Detailed media inventory cannot yet be completed.

## API discovery status

Attempted without successful JSON retrieval:

- `https://people.smu.edu/daslab/wp-json/`
- `https://people.smu.edu/daslab/wp-json/wp/v2/types`
- `https://people.smu.edu/daslab/wp-json/wp/v2/posts`
- `https://people.smu.edu/daslab/wp-json/wp/v2/media`
- `https://people.smu.edu/daslab/?rest_route=/wp/v2/pages`

Still to inspect: `/wp/v2/pages`, `/wp/v2/categories`, `/wp/v2/tags`, `/wp/v2/taxonomies`, `/wp/v2/settings` availability, route index, supported menu interfaces, pagination headers, page IDs/slugs, embedded media, registered metadata and custom post types. Settings and some other interfaces may require authentication; do not assume public access. No available custom post type, plugin, menu endpoint, metadata field or revision policy has been verified.

Next discovery step: obtain read-only public API responses from a working browser/network, then inventory all pages/posts and associated media with pagination. Record IDs, slugs, modification times, images/alt text, content structures and available taxonomies. Separately inspect the dashboard's existing editing features and revision panels through user-provided information or authorized read access. Do not request passwords in chat or alter production during this check.

## Recommended architecture

WordPress Admin → WordPress content and Media Library → public REST API → server-only Next.js adapters → App Router server components → Vercel.

Use Next.js with TypeScript, semantic HTML and CSS design tokens. Tailwind is optional and should be decided during foundation work. Keep client components limited to navigation, usable filters and a gallery viewer. No separate Next.js admin dashboard or database is proposed.

Render sanitized WordPress content; remove scripts, unsafe URLs, event handlers and unsupported embedded markup. Use explicit remote image hosts after media discovery, preserve image alt text and dimensions, and optimize responsive images. Public reads should require no admin credentials. Never import environment files from the neighboring project.

Proposed caching: five-minute revalidation for content and routes, subject to validation against the selected Next.js version. After expiry, a request may receive cached content while refresh occurs; five minutes is a target refresh interval, not a guaranteed publishing deadline. Routine publishing must not require Git or a redeployment. Add an authenticated on-demand revalidation endpoint only if a supported WordPress webhook is available and needed. Document outages, stale-content behavior and how administrators verify published changes.

Use last successfully cached content where supported during upstream failures; otherwise show a clear unavailable state and a link to the official source. Do not silently replace live records with fictional data. Local snapshots, if temporarily necessary, must record source, verification date and migration status and remain behind the same adapter.

## Information architecture

Primary navigation: Research, People, Publications, News, Facilities, Join the Lab. Home through the group identity. Gallery, Teaching and Contact in secondary navigation/footer. PI profile at `/people/anindita-das`; Alumni within People, with a separate route if the archive warrants it.

Homepage sequence: scientific hero; research areas; atomic-scale research feature; featured publications; group preview; news; Join call to action; footer. Include these sections only when verified content exists; omit empty previews gracefully. Use the established research tagline as a starting point. Proposed hero wording and research headings require PI editorial review.

## Design system and components

Aim for a restrained academic editorial layout: dark navy hero, warm white reading surfaces, generous space, large readable headings, red calls to action and authentic scientific graphics. Avoid implied scientific accuracy in decorative molecular models. Prefer a verified lab figure or crystallographic rendering with an appropriate caption.

Proposed colors: navy `#07111f`, dark surface `#0d1b2a`, off-white `#f7f8fa`, text `#142235`, SMU red accent `#c8102e`, optional cyan `#4cc9f0`. These are proposals, not verified institutional brand specifications; confirm SMU usage requirements and check contrast in actual combinations. Use Inter or a system sans-serif for text, with restrained heading weight and size. Avoid large font payloads and excessive motion.

Components: site header/mobile navigation, footer, section heading, research card, publication card/citation, person card/profile, news card/article, instrument card, responsive gallery, recruitment panel, empty/error states and accessible link/button primitives. Publication filters should depend on reliable metadata, with year filtering preferred initially. Visible keyboard focus, skip link, heading order, reduced motion and descriptive links are foundation requirements.

Proposed folder structure:

```text
src/app/                 routes, layout, metadata, sitemap, robots, boundaries
src/components/          layout and reusable content components
src/lib/content/         normalized types, service functions, provenance
src/lib/wordpress/       server-only client, pagination, adapters, sanitization
src/content/             documented temporary snapshots only if required
public/                  approved static brand assets
docs/                    discovery, architecture, deployment, CMS, handover
tests/                   meaningful adapter and integration checks
```

## Content model and WordPress integration

All contracts should include source ID/URL and modification time where available. Media carries URL, alt text, caption and optional dimensions. Optional fields remain optional; scientific claims and dates must not be guessed.

| Model                    | Fields                                                                                                        | Preferred WordPress source                             | Plugin-free fallback proposal                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Site/Home                | hero, subtitle, CTA labels/links, section introductions, contact/footer/professional links                    | Existing supported fields/options, if publicly exposed | Dedicated Pages with documented headings and standard blocks                                      |
| Research area            | title, summary, body, image, related links                                                                    | Existing revision-enabled type if supported            | Child Pages under Research                                                                        |
| Person                   | name, role, current/alumni status, biography, interests, photo, optional email/links                          | Existing people type if supported                      | Child Pages under People; standard role/status headings and featured images                       |
| Publication              | title, authors, year, journal, status, DOI/link, optional image/category, featured flag, SMU/prior provenance | Existing publication type/fields if supported          | Posts in Publications category; citation in documented blocks; featured tag if tags are available |
| News                     | title, body, true event date if known, image, topic                                                           | Posts with News category                               | Same, retaining the legacy undated page as an archive                                             |
| Instrument               | name, verified description/capabilities, image, optional location                                             | Existing type if supported                             | Child Pages under Facilities                                                                      |
| Gallery                  | images, captions, alt text, optional event dates                                                              | Page gallery blocks and Media Library                  | Same                                                                                              |
| PI/Join/Teaching/Contact | editorial page content and supported linked records                                                           | Pages                                                  | Same                                                                                              |

The fallback is a proposal that uses ordinary editing, not repository JSON or code. Verify editor support and REST output before committing to block conventions. Parse documented headings/blocks robustly, validate missing data and provide clear editor examples. Do not require administrators to type JSON. Legacy page adapters can bridge existing content while approved structured records are introduced; select one canonical source for each collection to avoid duplicates.

Use custom types/fields only if already supported and suitable. Verify their public REST exposure and revision support. Native post/page revisions should be checked on this installation; metadata and media replacement may have different recovery behavior. Prefer uploading replacement media and changing references rather than overwriting files. Document which properties can be restored through revisions. Give maintainers individual WordPress accounts and the least role sufficient for their tasks; PI retains ownership and approves content policy. Account creation and production restructuring require separate authorization.

## Roadmap and acceptance criteria

1. Finish live endpoint/media inventory and dashboard capability checks; approve this architecture, visual direction and content conventions.
2. Foundation: scaffold Next.js/TypeScript, lint/format, design tokens, navigation/footer, UI primitives, WordPress client and boundaries.
3. Homepage: use verified content and authentic visuals; review desktop/tablet/mobile composition.
4. Core pages: Research, People/PI, Publications, News, Facilities, Gallery, Join, Contact and Teaching.
5. CMS integration: confirm source ownership for every field, test a permitted content update and revalidation, and write step-by-step administrator documentation.
6. Quality: TypeScript, lint, production build, keyboard/accessibility/contrast checks, responsive layouts, links, metadata, images, sanitization and API failure behavior. Test publication parsing against real citations rather than invented fixtures alone.
7. Deployment preparation: Vercel environment and domain configuration, canonical/OG metadata, sitemap/robots, content verification and documented handover. Deploy only after the supplied launch criteria and deployment authorization are satisfied.

Required final documents: `ARCHITECTURE.md`, `DEPLOYMENT.md`, `CONTENT_MANAGEMENT.md`, `HANDOVER.md`, `WORDPRESS_INTEGRATION.md` and README. Write final administrator instructions against verified editing screens and the implemented conventions. Cover adding/editing people, alumni transitions, publications/news, image replacements, research/instruments/Join edits, revisions/restoration, update timing and developer-only work. Do not present proposed dashboard steps as verified instructions now.

Ownership recommendation: organization/shared institutional ownership for GitHub and Vercel, individual access accounts, PI control of WordPress access and a documented successor. The current personal GitHub remote is suitable for development but institutional handover remains to be decided.

## Decisions needed before major implementation

- Approve the proposed WordPress-first architecture, page hierarchy and design direction.
- Verify whether the dashboard offers only standard Pages/Posts or existing custom fields/types, and whether revisions are visible; public API access is still unresolved.
- Approve any future content restructuring separately; this audit does not authorize changes to the live WordPress site.
- Confirm current roster, imagery permissions, publication statuses and recruiting wording before launch.
- Establish institutional repository/hosting ownership and intended frontend domain before deployment.

No major application changes should begin until Phase 1 approval. If public REST access remains unavailable, investigate SMU-supported read interfaces/export options and document tradeoffs before choosing an alternate integration. A custom admin application is not justified by the current evidence.
