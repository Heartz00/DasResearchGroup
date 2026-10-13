# UI/UX review and refinement

Review date: October 12, 2026. Scope: presentation and interactions only. WordPress adapters, normalized content contracts, authoring conventions, source selection, routes and deployment architecture remain unchanged.

## Audit findings

Live browser review of Home, People, Publications and Gallery at desktop/mobile sizes, plus the shared components/styles, identified:

- Page titles around 91px at 1440px were larger than the homepage hero and consumed unnecessary space. Mobile titles were about 53px. Section sizes and margins had overlapping breakpoint overrides rather than a consistent scale.
- Publication metadata was about 10px; footer labels, scientific captions and some controls were similarly small. Long citations repeated titles and raw URLs in the homepage previews.
- The header used a wider alignment grid than page content. Active navigation depended primarily on color. At intermediate widths navigation labels became small to fit.
- Mobile navigation supported Escape but did not close when focus/click moved outside the header. Some actions were smaller than comfortable touch targets.
- Publication previews aligned inconsistently when only one entry had an image. The bibliography offered a year filter but lacked visible year grouping.
- Research cards had inconsistent empty space and repeated generic links. People portraits and image-only legacy profiles required different treatments to preserve embedded information.
- Hero artwork had an oversized decorative frame with unused space. Repeated scientific imagery is authentic but needs better editorial selection in WordPress, rather than fabricated alternatives.
- Gallery image failures could change the thumbnail shape. Caption and empty/loading treatment needed consistency.

## Refinement plan

1. Establish shared typography, spacing, content-width, control-height, border and focus tokens.
2. Reduce page-title scale, improve metadata/citation readability, and align header/content grids.
3. Refine navigation active/hover states and mobile dismissal while preserving its disclosure semantics.
4. Refine hero proportions and scientific figure treatment; remove ornamental framing.
5. Standardize research, people, news and publication cards. Keep original scientific content intact.
6. Group existing publications by their existing year and make full citations available through native details in homepage previews; retain visible full citations in the bibliography.
7. Improve category jump links on People, consistent thumbnail/fallback geometry and responsive content panels.
8. Check all routes at 375, 430, 768, 1024 and 1440px; keyboard interaction, contrast, reduced motion and build checks.

Effects are limited to short color/border transitions that indicate interactivity. No decorative glow, parallax, animation library, scroll reveal or continuous motion is needed.

## Implemented refinements

| Area                        | Result                                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Type scale                  | Desktop page titles reduced from approximately 91px to 56px; mobile page titles from 53px to 36px. Hero is 72px desktop / 40px mobile. Metadata is at least 13px.        |
| Alignment and spacing       | Header now shares the 1240px content grid. Shared spacing/content/control tokens replace inconsistent breakpoint values.                                                 |
| Navigation                  | Visible active underline/marker, 44–48px controls, outside-click/focus dismissal, Escape focus return and sensible desktop resizing.                                     |
| Homepage                    | Scientific image framed to its actual contents; readable captions; aligned publication rows; native full-citation disclosure; quieter Join section with a clear red CTA. |
| People                      | Category jump links, prominent PI panel, consistent portraits and compact mobile cards. Image-only biographies/alumni retain their full image.                           |
| Publications                | Descending year groups, readable citations, clearer status/provenance labels and DOI actions. All existing records and author markings retained.                         |
| News / facilities / gallery | Consistent readable rows and image grids. News headings follow the page hierarchy. Gallery actions are explicit and thumbnail frames stay stable on image failure.       |
| Footer                      | Readable institutional affiliation and professional links sourced from the PI's existing WordPress content.                                                              |
| Accessibility               | Native disclosures, visible focus, adequate touch targets, reduced motion, correct news heading levels and removal of empty rendered image-only links.                   |

Presentation files changed: `src/app/globals.css`, `layout.tsx`, `page.tsx`, `[section]/page.tsx`, `loading.tsx`; `src/components/content.tsx`, `navigation.tsx`, `publication-list.tsx`, `scientific-image.tsx`. Browser tests/configuration were updated; CMS/data files and dependencies were not changed.

## Verification

All 11 routes were checked at 375, 430, 768, 1024 and 1440px without horizontal overflow. Browser coverage includes semantic/SEO route checks, mobile navigation/filtering, outside/focus dismissal, native citation disclosures, touch targets, reduced motion, image-failure geometry, automated WCAG checks on every route, and scientific-image loading/screenshots. The existing 12 adapter/API tests also pass. Automated accessibility testing does not replace a screen-reader/content review.

TypeScript, ESLint, formatting and production build checks pass. Nine browser checks passed across the full run and targeted follow-up for the final presentation changes. During the build, some SMU Media Library requests returned HTTP 429; the existing optional-media/embedded-featured-image fallback handled them. Fetching and caching policy were not changed in this UI pass.

Local visual review artifacts are in the ignored `.preview/` folder, including before/after desktop/mobile captures. The frontend remains available at the development server's localhost URL.

## Remaining content recommendations

Use WordPress to replace blocked external images and supply meaningful alternative text. Transcribe image-only profiles into the existing supported structured member format when approved. Curate distinct authentic visuals for research areas/hero and add verified equipment descriptions. Dates, categories, biographies, research claims and funding opportunities must not be invented to fill UI space.

## Follow-up polish review

Preserved the established layout and automatic transparent 3D hero. Long-form text now uses a 740px reading width inside the 1240px layout. Shared transitions use 180ms; the sticky header adds a restrained shadow after scrolling. Light-background secondary buttons use the same outline treatment. Interactive research and people cards receive restrained border feedback, without adding hover effects to static content. Page intros have a faint radial scientific atmosphere.

Research records support section jump links, paired text/figure layouts and direct publication actions when structured areas exist. The existing live research overview remains intact where no structured areas are supplied. PI emphasis, research-interest metadata, publication year separators and source-flagged featured publication treatment are clearer. News dates use semantic time elements and long news collections expose archive jump links without inventing dates or categories. Portrait image sizes account for compact mobile cards and preserve image-only biographies. Existing gallery frames, source imagery, footer institutional links and loading/empty states remain appropriate.

Content limits: the current news records do not supply standalone images/categories; some portraits are blocked or low quality at their source, and alumni or biographies may be embedded in images. Presentation changes cannot recover missing source content. These remain WordPress editorial tasks; no replacement identities, dates, equipment capabilities or scientific claims were created. No dependencies or CMS contracts were added.

Follow-up validation: all nine site checks pass across the full run and targeted responsive rerun; all four hero checks pass. All 11 routes pass automated accessibility checks and horizontal-overflow checks at 375, 430, 768, 1024 and 1440px. Full-page captures were reviewed at 375, 430, 768 and 1440px. The layout test now waits for DOM readiness rather than blocked external image loading; authentic research-image loading is checked separately. TypeScript, lint and formatting checks pass.

## Complete beautification pass

A lightweight code-native molecular network SVG now appears at low opacity behind page intros, the full-width dark research feature and the recruitment section. It is decorative CSS with no accessibility-tree noise or JavaScript. The homepage keeps its existing story order while alternating open editorial research summaries, a navy scientific image/text feature, a larger lead publication, the people section and a responsive three-item lab highlights strip. The lead paper retains full citation, source status/year, abstract when supplied, and publication/DOI actions; other previews retain native citation disclosures.

The PI panel now uses navy, a restrained red rule and accessible light secondary actions. Facilities photography uses a larger two-column desktop layout, collapsing to one column on phones. The first source-ordered news update has editorial emphasis without being assigned an invented date. Gallery links gain a small shadow on pointer hover. Shared tokens govern spacing, corners, reading widths, colors and transition duration. Mobile treatment collapses lead papers and highlights, tones down the motif and preserves readable touch controls.

Updated components: homepage, shared PublicationCard/NewsCard, shared section-page wrapper, global CSS and public/scientific-network.svg. The transparent automatic hero, header, footer groupings, routes, server content delivery and WordPress workflow remain intact. No animation or UI dependency was added. Route animations and scroll reveals were omitted because they would add motion without improving clarity. No dated milestone timeline was created because legacy updates lack sufficiently reliable dates. Remaining opportunities are authentic high-resolution lab photographs, standalone member biographies, verified news dates/images and distinct graphical abstracts supplied through WordPress.

Beautification validation: all 13 browser checks pass in a single run, including every-route accessibility, 55 route/width overflow combinations, native keyboard interactions, authentic scientific-image loading and hero rotation/fallback checks. TypeScript, lint, formatting and production build pass. Desktop/mobile homepage, PI and facilities previews were visually inspected; all-route captures cover 375, 430, 768 and 1440px. The recurring SVG is 752 bytes. No device-level FPS or field performance benchmark is claimed.

## CGC-style admin refinement

Compared the adjacent CGC admin dashboard, shell, homepage editor and image picker, then adapted its task-based approach without copying credentials or changing CMS contracts. Added a standalone website-manager shell, named section navigation, clickable task cards, simpler copy, legacy text editing that preserves surrounding markup, featured-photo choices/previews and a thumbnail photo library. Advanced fields and collection tools are secondary. The existing WordPress account setup, permission checks and safe source-migration requirements remain.
