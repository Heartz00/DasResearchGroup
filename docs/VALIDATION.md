# Validation and launch review

Verified locally on October 12, 2026 using Node.js 24, Next.js 16.4.0 and installed Chrome.

## Current custom content admin

The latest workflow supersedes the native-dashboard recommendation below. `/admin` now provides lab-specific tasks, lists and forms for PI information, team bios/photos/alumni, individual publications, lab updates and other content. It uses WordPress storage, per-user credentials/permissions, Media and revision records behind the interface. The footer Admin link opens this workspace. The public route group owns the website navigation/footer; admin has a separate shell and no public homepage fetch or navigation flash while loading. Existing public URLs are preserved.

Thirty-four unit tests pass, including individual legacy replacements without collection loss, safe field updates with paired native block comments, field validation, internal-control removal from public content/excerpts and honoring cleared emails. All 13 public browser checks pass after the route-group split, including 55 route/viewport combinations. All 13 mock-backed admin checks passed their assertions, adding PI bio/portrait editing and revision restoration, a member bio/photo/alumni change, featured lab-update drafts, and the mobile content-task flow. Additional targeted checks cover the updated permission and primary editing flows. The Windows managed-server teardown still requires interruption after assertions; a clean `test:admin` process exit is not claimed. TypeScript, lint, formatting and production build pass. Desktop/mobile captures were reviewed.

No live SMU content, accounts, plugins or source flags were changed or deployed. Real authenticated access, media upload, revision retention and any institutional restrictions must be verified with an authorized account. Drafts stay outside public REST reads; uploaded files are separate Media operations. Native scheduled records are protected against accidental rescheduling. The content preview is a text preview, not an authenticated rendering of the exact public layout. See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for the current handover.

## Earlier implementation notes

Visual-only editing follow-up: the optional frontend workspace no longer exposes raw content, excerpt, caption or description editors, or buttons that switch to source editing. Complex records retain their original content internally and link to WordPress’s visual editor. Safe structured fields use email/URL/numeric inputs and featured selections; technical parent/category/tag/media IDs are hidden and preserved. Normal administrator documentation no longer instructs users to paste block markup or use Code mode. The targeted mobile editor check verifies visible textareas contain no markup and passes accessibility/save assertions. Authenticated editing and guided member-save checks use isolated mock WordPress records; no production data is modified.

Native WordPress content-model update: the read-only capability audit confirms core public collections, 11 Pages, 1 Post and 115 media records. No lab-specific REST types or usable structured-field schema were found; editor selection, account permissions and revision retention remain authenticated checks. Eleven blank block templates, the field reference and the nontechnical ADMIN_GUIDE are supplied without installing plugins or changing live records. The footer Admin link opens native SMU WordPress; the earlier frontend workspace remains optional.

The expanded normalization layer passes 27 unit tests, including unchanged legacy collections, explicit migration selection, member/alumni identity and ordering, featured selections, safe field handling, PI/settings/recruitment/news/gallery normalization and scientific author markings. All 13 public browser tests pass in one run, including 55 responsive route/viewport combinations and automated accessibility on all public routes. TypeScript, lint, formatting and production build pass. No authenticated live writes, production migrations, account changes, plugin installation or deployment were performed. Structured records must be prepared and approved in WordPress before activation.

UI refinement update: the later pass expands responsive checks to all 11 routes at 375, 430, 768, 1024 and 1440px, and automated accessibility checks to every route. It also covers citation disclosures, mobile dismissal/focus, touch targets, reduced motion and gallery failure sizing. See [UI/UX review](UI_UX_REVIEW.md) for findings, presentation changes and current scope.

3D hero update: four browser checks verify actual WebGL rendering, desktop drag/keyboard rotation and pause, a slow automatic reduced-motion view, unavailable-WebGL fallback, mobile DPR capped at 1 even on a DPR-3 screen, and recovery from context loss. The interactive hero passes the scoped automated accessibility check. Desktop/mobile screenshots were visually reviewed. No device-level FPS benchmark is claimed.

## Completed checks

- TypeScript, ESLint, Prettier checks and the production build pass.
- 12 adapter/API tests pass: HTML sanitization, scientific author markings, unsafe URL/image rejection, all 33 source publications, legacy/structured people and alumni, undated news, gallery captions, pagination/cache settings, unavailable CMS behavior, partial failures and embedded featured media during a Media Library outage.
- 5 Playwright browser tests pass: all 11 content routes and canonical metadata/internal links; no horizontal overflow at widths 1440, 768 and 390; keyboard mobile menu and publication filtering; automated WCAG A/AA checks on Home, People, Publications and Contact; successful authentic hero image loading and desktop/mobile screenshots.
- Browser previews were visually inspected. Screenshots are ignored local artifacts at `.preview/home-desktop.png` and `.preview/home-mobile.png`.
- Live public REST reads confirm 11 Pages and 115 Media Library items; pagination is supported. No production WordPress content was modified.

Automated accessibility checks are scoped checks, not a certification. Source images with biographies embedded in pixels still need accessible transcription and review. Manual screen-reader testing and a broader editorial review remain useful before launch.

## Content and integration limitations

Some external source images return 403/410 or time out. The frontend provides image failure states. Replace authorized images through the WordPress Media Library, and supply missing alternative text. Third-party publication links may require publisher access; a complete external publisher-link audit was not performed.

The existing bibliography is retained in full, but legacy title extraction remains heuristic. Check scientific titles/statuses and the current roster with the PI. Facilities has photos without reliable model/capability descriptions, so none are invented. Historical teaching is labeled accordingly. Recruitment is based on the PI's source guidance, without claims of funded openings.

Dashboard editor permissions, revision retention/restoration and the optional WordPress template setup have not been verified through authenticated access. No production edit was made to measure end-to-end revalidation timing. The code uses a five-minute cache interval; this is not an exact publishing deadline.

## Before deployment

Confirm scientific/editorial content, source-image repairs, accessible member biographies, revisions, SMU brand usage, institutional GitHub/Vercel ownership and the approved domain. Set production SITE_URL and live WordPress mode, review a permitted content update through the frontend, then perform the deployment review described in [DEPLOYMENT.md](DEPLOYMENT.md). The original WordPress site remains available.

## WordPress-connected administration validation

The optional /admin workspace adds six security/validation unit checks; 18 combined adapter/admin unit tests pass. Five mock-backed administration browser checks passed their assertions, including anonymous redirect, authenticated HTML-preserving save/sign-out, concurrent edit conflict with typed-value retention, WordPress permission failure, mobile overflow and upload signature handling. Scoped automated accessibility checks pass on login and editor. In the restricted Windows environment the managed test-server teardown required interrupting the command after assertions; it did not produce a clean runner exit. Real SMU Application Password access and authenticated publishing remain unverified. The configured live login page was visually reviewed at desktop/mobile widths without entering credentials or making production writes.

Team-access and guided-editor follow-up: 21 unit tests pass, including role-escalation/owner protection, explicit user endpoint validation and safe guided text serialization. Nine mock-backed browser checks passed their assertions, adding ordinary-editor exclusion, owner role assignment, revoked-capability protection, plain-field member saving and account creation without credential disclosure. No real user accounts, access roles, email invitations or live WordPress content were changed. The existing Windows managed-server teardown limitation remains. SMU permissions and account provisioning still need verification with the real authorized owner account.

CGC-style admin follow-up: 22 unit tests pass, including byte-preserving edits around images, links and WordPress block comments. The nine existing mock-backed admin browser checks passed their assertions, and an additional task-dashboard/mobile editing check passes with named navigation, saved text, active section tracking, no horizontal overflow, a collapsible mobile section chooser and automated accessibility. Desktop dashboard and mobile editor captures were visually reviewed. Production build, TypeScript, lint and formatting checks pass. The previously documented Windows managed-server teardown limitation still requires interruption after mock test results; no real content or accounts were modified.

## Information architecture review — October 12, 2026

Audited all 11 public routes and the live published WordPress Page inventory before presenting the recommended sitemap. Navigation now includes eight primary destinations, with Teaching and Gallery remaining in the footer. Research has source-backed question/approach/significance sections, Publications has year links, Home includes the PI, the PI page separates biography and contact, and Join Us provides five audience pathways with official SMU links. Existing public URLs and all WordPress records are retained.

TypeScript, lint, formatting, 22 unit tests and production compilation pass. Responsive review covers 55 route/viewport combinations; desktop/mobile captures were inspected, and the PI portrait was explicitly verified to load. All 13 browser checks passed across the final run and a targeted rerun: canonical metadata, links, keyboard interactions, automated accessibility, image failure states and the existing WebGL interactions. Twelve passed in the full run; the scene startup check initially exceeded five seconds and passed after its assertion allowed 15 seconds for lazy loading and development compilation.

No live content, role, source-selection flag or deployment was changed. Named equipment capabilities, dates for legacy news, missing member details and detailed research-theme techniques/paper associations still require approved lab content; see [the source audit and sitemap](INFORMATION_ARCHITECTURE.md).
