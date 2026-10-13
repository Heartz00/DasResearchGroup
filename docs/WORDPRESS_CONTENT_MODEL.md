# WordPress capability audit and implementation plan

Audited October 12, 2026 through read-only public REST requests. Evidence is retained locally in `.preview/cms-capabilities.json`. The recommended model was presented before implementation. No production content, accounts, plugins, menus or settings have been modified.

## 1. Capabilities

| Capability                  | Evidence and limitation                                                                                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Posts, Pages                | Public collections work: 1 Post and 11 published Pages.                                                                                                                                                                                            |
| Categories, Tags            | Registered for Posts only; one Uncategorized category and no Tags currently. Pages expose **no taxonomies**.                                                                                                                                       |
| Featured Images             | `featured_media`, Media Library and embedded media are exposed; individual editor controls need account verification.                                                                                                                              |
| Media Library               | 115 public items; original URL, responsive sizes, alt text and captions are available.                                                                                                                                                             |
| Revisions                   | Page/Post revision routes are registered. Actual retention, author comparison and restoration require authenticated verification.                                                                                                                  |
| Custom Post Types           | No lab-specific types are exposed. Core patterns, templates and navigation types are not People/Publications content types. Non-REST private types cannot be ruled out.                                                                            |
| Custom fields / ACF         | Responses contain an empty `acf` property. This suggests ACF-related integration but does **not** establish installed/editable field groups, licensing, REST exposure or permission to add groups. No useful lab field schema is publicly exposed. |
| Gutenberg / reusable blocks | Block editor and pattern routes are registered. Actual editor selection, reusable-pattern creation permissions and theme support remain unverified.                                                                                                |
| WPBakery                    | No evidence in the public API audit; do not assume it is absent or available.                                                                                                                                                                      |
| Theme options / menus       | Settings, menu and template routes exist. Usable theme options and menu-management permissions require authentication. WordPress theme menus are not currently the Next.js navigation source.                                                      |
| REST API                    | Core public read endpoints work. Authenticated editing/user capabilities require an authorized account.                                                                                                                                            |
| Plugin installation         | Not assumed. SMU multisite/network restrictions require an institutional administrator's decision.                                                                                                                                                 |

## 2–4. Recommended native model and structured fields

Use existing Pages and child Pages, categorized Posts and Media Library. Each structured record uses ordinary **Heading 2 + paragraph/list/link blocks**. Text is stored in `post_content`, not repository JSON or theme settings. This is the implemented restricted-installation fallback, not a claim that native WordPress exposes typed field panels.

| Content                     | Native record                                              | Structure                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Homepage                    | Page `frontend-home`                                       | Hero, CTA, scientific significance, Join CTA, optional verified statistics; Featured Image for fallback visual                                   |
| People / Alumni             | Child Pages of People ID 18                                | Title = name, Featured Image = headshot, Role, Status, biography, interests, education, public contact/profile links, years, order, feature flag |
| PI                          | Optional Page `pi-profile`; legacy ID 16 remains fallback  | Biography, education, appointments, research, awards, publications, memberships, email/office, professional profiles, public CV                  |
| Research                    | Parent Research ID 6 and child Pages                       | Summary, question, approach, methods, significance, related papers, featured/supporting images, ordering/feature flag                            |
| Publications                | Posts in category `publications`, after complete migration | Authors, year, journal/volume/issue/pages, DOI/link, abstract, type, status, affiliation, order; Featured tag/image                              |
| News / awards / conferences | Posts in category `news`                                   | WordPress publication date, summary, story, people/paper links, source URL, Featured tag/image; optional topic categories                        |
| Facilities                  | Child Pages of Instrumentation ID 308                      | Title/image, manufacturer/model, purpose/capability, research relationship, location, ownership/access, facility link, order                     |
| Gallery                     | Existing Group Photos ID 129 and optional child Pages      | Native image/gallery blocks; child Featured Image with caption/event/date/credit; descriptive category text                                      |
| Teaching                    | Existing Teaching ID 17 (`contact`)                        | Ordinary dated course content; no current-course claims inferred                                                                                 |
| Join Us                     | Page `join-the-lab`                                        | Intro, five audience sections, inquiry instructions, official URLs, explicit optional openings notice                                            |
| Contact                     | Page `frontend-contact`                                    | Lab/PI, affiliation, building/room/address, public email, department/map links, optional phone                                                   |
| Footer                      | Page `frontend-footer`                                     | Name, affiliations, address/email, professional/institutional links and credit text                                                              |

Full labels/help: [NATIVE_FIELD_REFERENCE.md](NATIVE_FIELD_REFERENCE.md). Eleven blank native block templates are in `wordpress/native-templates/`. Setup instructions are in [ADMIN_GUIDE.md](ADMIN_GUIDE.md). They are editor scaffolding, **not local content storage**. No sample people, papers, openings, awards or instrument claims are inserted.

Pages cannot use categories on this installation; Page **Parent**, Role/Status headings and title search provide organization. No custom sidebar is promised. Native admin navigation remains Pages, Posts, Media and permitted Users. Clear record titles and parent hierarchies keep it understandable without a plugin. A dedicated People/Publications sidebar or typed field UI would require an SMU-approved extension and a separate authenticated assessment.

## 5. Revisions and auditability

Page/Post text, including the structured headings, stays in native revision history where retained. REST normalization preserves author ID and modified timestamp; it does not create a public editor directory or custom activity log. WordPress identifies revision authors and compares/restores content. Featured Image references, Page Parent/order, taxonomies, uploaded file bytes and account changes may not be restored with text revisions; verify independently. Keep old images and migration settings. No settings are moved into non-revisioned local files.

## 6. Roles

Use named individual SMU WordPress accounts. Administrator is the institution/site owner; Editor is the lab website manager and can maintain Pages/Posts/Media; Author normally publishes their own Posts and uploads media; Contributor normally submits drafts and cannot upload media. Actual capabilities must be checked on SMU. Native Author access is **not limited to the News category**: it also permits their own publication Posts. Category-specific restrictions and a custom Lab Website Manager role require approved configuration; no custom role is created here. Settings implemented as Pages are editable by Editors, not Authors under standard roles.

Reference: [WordPress role capabilities](https://wordpress.org/documentation/article/roles-and-capabilities/).

## 7. REST, validation, preview and refresh

`transport.ts` reads public published Pages/Posts/Media/Categories/Tags with pagination and a 300-second cache. `content/normalize.ts` produces frontend objects. UI components do not read raw REST shapes. The adapter accepts ordinary rich text, validates field emails/URLs/DOIs/years/order/feature flags, sanitizes HTML, and retains missing optional values safely. Invalid year/DOI/email values are omitted from their dedicated output; invalid ordering defaults to zero. Native blank-name/publish controls and the editorial checklist remain the fallback for required names. This is **read-time defensive validation**, not a WordPress pre-publish field enforcement UI.

Drafts, pending records and scheduled future Posts remain outside the public REST collections until WordPress publishes them. Native Preview previews the **WordPress source**, not the exact Next.js layout. Authenticated Next.js draft preview and webhook refresh are not added without a verified hosting/account integration. Normal updates appear on the next successful refresh after approximately five minutes; the first request can serve cached content while refreshing in the background. No routine rebuild, Git commit or Vercel action is needed.

Synced-pattern references are not resolved by this adapter. For frontend fields use ordinary blocks or **unsynced copies**, not a synced reference. Theme navigation/layout, the 3D scene and unsupported media hosts remain developer tasks.

## 8. Safe rollout and fallback

1. An authorized owner verifies the editor, Page/Post permissions, Featured Image, revision restore and media controls in SMU WordPress.
2. Prepare the settings and structured records as drafts using the templates. Leave legacy collection flags unchanged.
3. Compare every member, alumni entry and all 33 source citations; transcribe image-only biographies with approval. Do not recreate records just to move people to Alumni.
4. Publish reviewed records, then select the canonical source in Homepage settings (`pages` for People; `posts` for Publications). These are explicit collection replacements, not automatic partial merges. Keep source flags recorded separately for restoration.
5. Check all public destinations after revalidation. Retain the old Pages and files; do not delete or rename production source records during rollout.

News Posts can coexist with undated legacy news; remove duplicate archive paragraphs only as part of a reviewed migration. Research/instrument/gallery child Pages appear when published, without a source switch. Homepage, PI, Join, Contact and Footer settings become active when published at the documented slug, so they must be complete enough for the intended change.

If SMU exposes usable ACF/CPT fields later, map them in the normalization layer and retain the frontend object contract. Evaluate field revision support before changing storage. Do not replace this working native model merely to gain extra menu items.
