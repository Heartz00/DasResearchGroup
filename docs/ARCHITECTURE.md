# Architecture

WordPress is the content/media/account/history backend. The Next.js `/admin` workspace is the primary content editing interface; it provides lab-specific forms without layout controls or raw source editing. Next.js App Router also provides public presentation; Vercel is the intended host. Authenticated writes use the signed-in person's backend permissions and encrypted short-lived credentials, not a separate content database.

## Organization

`src/app/(public)` owns the public website navigation/footer and content reads. The root layout provides shared metadata, styles and the document only. Admin has its own layout/loading experience and does not fetch the public homepage or show its navigation while loading. Public URLs remain unchanged by the route group.

`src/app/admin/manage/[area]` and `src/lib/admin/content-model.ts` provide the content-task registry, lists and forms. Server actions scope writes to each model, recheck identity/permissions, validate input, preserve existing content and associate media/categories behind the interface. Explicit managed markers and stable legacy source keys allow individual member/publication/update replacements without deleting the original collection. Unmarked records retain the previously reviewed full-migration source behavior. Text history uses native revision records through the custom workspace; no separate database or audit log is created.

- `src/app`: homepage, section routes, PI profile, metadata, sitemap, robots and error/loading boundaries.
- `src/components`: navigation, semantic content cards, publication year filter and images with failure states.
- `src/lib/content`: normalized contracts and source selection.
- `src/lib/wordpress`: paginated public API requests, legacy/structured adapters and HTML sanitization.
- `src/content/wordpress-snapshot.json`: public content captured for explicit offline previews and adapter fixtures. Live mode never silently substitutes this snapshot.
- `tests`: source-based adapter tests and Playwright browser checks.

Server-only imports protect the CMS service. React cache shares content work within a render; public fetches and routes revalidate after 300 seconds. See [integration details](WORDPRESS_INTEGRATION.md) for synchronization and failure behavior.

## Rendering and design

Most presentation runs on the server. Client JavaScript handles the mobile menu, publication year selection, image failure states and a lazy-loaded React Three Fiber / Three.js hero. CSS provides responsive layouts, focus states and reduced motion. System fonts avoid external font requests. The hero's 3D gold cluster is explicitly labeled illustrative; it is not a verified lab crystal structure. WordPress featured media supplies its static fallback and the authentic research montage elsewhere on the homepage.

The scene uses 55 deterministic atom positions, instanced gold spheres/bonds, a fixed camera, soft lights, a faint lattice and six cyan tracers (three on mobile). A demand-driven Canvas is invalidated at a target 40fps on desktop or 24fps on mobile while visible and playing. It stops scheduled rendering offscreen, in hidden tabs, when paused. Mobile uses lower-detail geometry, one lattice layer, no reflection environment, a pixel ratio of 1 and no drag/parallax. Desktop pixel ratio is capped at 1.5. Ref-based frame updates avoid per-frame React state. No remote model, HDR texture, postprocessing or animation library is loaded.

`hero-cluster.tsx` supplies the server-compatible poster, lazy loading, capability/preference detection, keyboard/drag controls and error boundary; `cluster-scene.tsx` contains the GPU scene; `cluster.css` reserves the same borderless, transparent hero area throughout loading/failure. Unsupported WebGL, data-saving mode, load errors and context loss retain the static visual. Missing CMS media uses a code-native static SVG illustration. Slow automatic rotation resumes after desktop dragging. Arrow keys rotate, Space pauses/resumes and Home resets the orientation. Transparent canvas clearing, matte lighting and radially faded lattice lines blend the scene into the hero. Actual frame rates depend on the device; the schedule is a rendering budget, not a measured hardware guarantee.

Design tokens live in `src/app/globals.css`. The navy/off-white palette and controlled red accents follow the approved direction. SMU institutional branding approval remains a launch task. Source copy remains separate from layout and components; changing the layout requires a developer, routine supported content edits use WordPress.

## Content selection

Legacy pages remain canonical by default. Optional standard WordPress templates support future structured content, documented in [the administrator guide](CONTENT_MANAGEMENT.md). People and publication migrations require explicit CMS source selection after the full collection is ready. Adding one structured record does not silently hide the legacy collection. News Posts append above the legacy archive; avoid copying the same event into both.

HTML is sanitized with a tag/attribute/scheme allowlist. Scripts, styles, forms, iframe/object embeds and source images are removed from rich text. Images are extracted separately, restricted to known HTTPS host/path combinations and rendered with Next Image. Underlined undergraduate author markings and superscript/subscript notation are preserved. External links receive `noopener noreferrer`.

No category research filters are invented. Year filtering uses actual citation years. News does not turn page modification dates into event dates. Instrument photos are displayed without guessed model names/capabilities. Some legacy member images contain biographical text within the pixels and are kept intact; accessible structured records are the recommended migration path.

## Limitations

Legacy publication title parsing is heuristic; the complete original citation is always retained. The adapter handles the live page's joined citations 25/24. Future unusual citation formats should be reviewed or converted to structured Posts.

Third-party images can fail or be blocked. The UI provides an accessible failure state; administrators should upload authorized copies to the SMU Media Library. Unknown image hosts require developer review. Public REST discovery cannot prove WordPress dashboard revisions/permissions or editor configuration; a maintainer must verify these before migration.

The hero poster stays hidden during normal scene loading and is shown only for unavailable WebGL, data saving or scene failure. Rotation starts automatically without visible controls. Reduced motion uses 0.008 radians per second (about 13 minutes per revolution), stationary tracers and no parallax. Lost pointer capture also releases dragging so automatic rotation can resume.

## Optional WordPress administration

The /admin workspace uses separate server-only authenticated REST requests and a short-lived encrypted session cookie. The public content layer and normalized contracts remain unchanged. All read/write actions validate the signed-in WordPress identity; mutation handlers also enforce origin checks, route/field allowlists and optimistic modification checks. Generic collection editors and a template registry support future sections. See ADMIN_SETUP.md for configuration, scope and production limits.

## Native editorial model

Native WordPress records are the storage model behind the custom admin; its dashboard is an advanced fallback. `content/index.ts` is a server-only entry point; `content/normalize.ts` normalizes the public source into frontend objects and can be tested without a server. `wordpress/values.ts` and `fields.ts` provide plain-text/link handling and defensive field validation without circular module dependencies. Native Heading 2 field templates are developer setup scaffolding; they do not become a local content source and normal editors do not use them.

Homepage and footer settings, optional dedicated PI/contact/recruitment Pages, child member/research/instrument/gallery Pages and categorized publication/news Posts are supported. Display order, current/alumni status and featured selections remain in WordPress. Member/bibliography migrations still require explicit reviewed source selection. Public author IDs and modification timestamps survive normalization; native WordPress revisions remain the history interface. See [WORDPRESS_CONTENT_MODEL.md](WORDPRESS_CONTENT_MODEL.md) for audit evidence and authenticated setup limitations.
