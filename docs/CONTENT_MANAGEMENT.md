# Content management for lab administrators

The primary workflow is now the custom website workspace described in [ADMIN_GUIDE.md](ADMIN_GUIDE.md). Normal editors manage content through lab-specific forms with WordPress behind the scenes. The older native source conventions below remain useful for advanced support. Explicitly managed member/publication records can now replace individual legacy entries or append new items without switching an entire collection; unmarked child Pages/Posts retain the existing reviewed-migration behavior.

Start with [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for the native WordPress workflow and [WORDPRESS_CONTENT_MODEL.md](WORDPRESS_CONTENT_MODEL.md) for the current capability audit and extended model. The guide below remains useful for legacy record formats; the new guide includes the expanded fields and safe setup sequence.

An optional frontend workspace at `/admin` can edit the same WordPress records. See [ADMIN_SETUP.md](ADMIN_SETUP.md) for authentication and supported editors. The WordPress dashboard remains available, and the source conventions and migrations below still apply.

For ready-to-use research/member drafting prompts, publication significance guidance, image repairs and a visitor review script, see [CONTENT_IMPROVEMENT_PACK.md](CONTENT_IMPROVEMENT_PACK.md).

Routine editing now happens in the custom `/admin` workspace. The native records described below are advanced source-maintenance references. You do not need React, TypeScript, Git or Vercel access for supported content changes. Use your own authorized account; do not share the PI's login.

The frontend currently reads the existing pages. Optional structured templates described later are supported by the code but have **not** been created in WordPress. Dashboard editor features, role permissions and revision retention still need an administrator's verification. Instructions use standard WordPress Pages/Posts/Media; names can differ slightly in the SMU editor.

## Publishing and checking changes

1. Open the relevant page or post in WordPress.
2. Make the change and use Preview to check the source.
3. Select Update for an existing published record, or Publish for a new record.
4. Wait approximately five minutes, then visit the corresponding new frontend page and reload. The first visit after cache expiry may trigger a background refresh; check again shortly after.
5. If the change still does not appear, confirm the source is published, not only saved as a draft, and contact the website maintainer.

Ordinary changes require no code commit or redeployment. The new frontend has not been deployed yet; during local review, use the running local site.

## Edit the existing content today

### Homepage and research

1. In Pages, open **Research** (`research`, page ID 6).
2. Edit the opening research paragraphs. The first sentence supplies the default homepage description.
3. Change the page's Featured Image to update the homepage's static scientific fallback and the research montage. The interactive gold cluster is a developer-maintained illustration.
4. Update and check Home and Research. Keep research claims approved by the PI.

The default homepage tagline and layout are presentation defaults. To change hero wording, CTA labels/links, footer prose or the atomic-scale text entirely through WordPress, use the optional Home settings page below.

### Add or edit a member

1. In Pages, open **Meet the Team** (`people`, ID 18).
2. Find the correct category: Graduate Students, Postdoctoral Fellows, Undergraduate Students or REU Students.
3. Keep category labels in their own paragraph or heading with the same wording. Add a member below the category and before the next category.
4. Prefer one paragraph containing a photo and the person's name, or one image/figure with a caption containing their name. A name-only paragraph is also supported.
5. Upload/select the portrait through Add Media or an Image block. Add descriptive alternative text and a caption/name. Do not add unrelated prose as a separate member paragraph in the legacy layout.
6. Update the page and check People. For an existing member, edit their name/caption/photo in the same location.

Some existing biographies are written into image pixels. Those are preserved but cannot be edited as text. To support accessible biographies, interests, email and roles, plan a complete migration to the child-page format below. Do not guess a name from a filename.

### Move someone to alumni

1. Open Meet the Team.
2. Cut the complete member entry, including its photo/caption, from the current category.
3. Paste it below **Former Members** and before another heading, keeping it as a separate entry.
4. Update and confirm it appears only in Alumni, not also in the current roster.

### Add a publication to the existing bibliography

1. Open **Publications** (`publications`, ID 15).
2. Insert a new paragraph in the appropriate SMU or Prior to SMU section. Start with a unique number followed by `)`, matching the current bibliography convention.
3. Include full authors, title, four-digit year, journal details and an explicit status such as Under review, Accepted or Published.
4. Use bold for the year, italics for the journal and the existing undergraduate/equal-contribution author markings. Do not combine two citations in one paragraph.
5. Add the DOI/publisher link using the editor's link tool. Add an authorized graphic within that citation paragraph or immediately below it, before the next citation.
6. Update and check the card, link, year filter and status. Unpublished work must not be presented as a published paper.

Recent published/accepted/editorial entries from the SMU section appear automatically on Home. A curated `featured` selection is supported in the optional structured Posts format. Parsing legacy title formats is heuristic; report any incorrect display to the developer or use the structured format after migration.

### Add news

For the existing archive: open **Group News** (`group-news`, ID 392), insert a separate paragraph at the top and add an optional source link. Update and check News/Home. No date is fabricated for archive paragraphs. Include an event date in the prose when known.

For new dated news, if your account permits Posts and Categories:

1. Create a category named News with the exact slug `news`, if it does not exist.
2. Add a Post with a descriptive title and body, assign only the appropriate News category, and publish.
3. Verify News. Categorized Posts appear before the legacy archive and display their publication dates.
4. Put any distinct event date in the body; the displayed badge is the post's publication month, not an inferred event date.

Do not copy an existing archive event into a new Post without removing the duplicate archive paragraph as part of an approved migration. Uncategorized sample posts do not appear as lab news.

### Upload or replace images

1. Open Media → Add New and upload a file you have permission to use.
2. Set meaningful Alternative Text; a filename or “image” is not enough. Add a caption where useful.
3. In the page/post, replace the image with the new Media Library item. For a Featured Image, choose the new item there.
4. Update the page/post and verify the frontend after revalidation.
5. Keep the old image until the change is reviewed. Revisions can restore an old reference only if the old file still exists.

Use a new upload rather than overwriting a file at the same URL; optimized images and browser caches may retain old bytes. A Media Library alt-text change takes effect on extracted images after frontend refresh. Images embedded only as external links can become unavailable; prefer authorized SMU-hosted copies. New image hosts require developer review.

### Instrumentation and research descriptions

Existing **Instrumentation** (`instruments-2`, ID 308) contains photos. Replace/add those images through the page editor. Do not use the empty Instruments/Lab Instrument Pictures pages as the active source.

To add a named instrument with a real description: create a Page whose Parent is Instrumentation, set its title to the instrument name, write its verified purpose/capabilities in the body and set a Featured Image. Publish and check Facilities. Add optional location/research links in the body. The new frontend reads child pages automatically.

For a separate research area: create a Page whose Parent is Research, give it an approved title/body and Featured Image, and optionally add a Heading 2 named **Summary** followed by a short paragraph. Publish. Research child pages supply homepage research cards and detailed sections. Update the main Research page for the overall scientific narrative.

### PI, Join, contact, social links and teaching

- PI biography, contact and professional links: edit **About Dr. Das** (`news`, ID 16). Preserve the Contact label and the recruitment paragraph beginning “Interested undergraduate…” while using the legacy adapter.
- Recruitment: edit that existing recruitment paragraph, or create the optional Page **Join the Lab** with exact slug `join-the-lab` to replace the recruitment prose throughout the frontend. Use headings for prospective graduate students, SMU undergraduates, postdocs and collaborators if approved content exists. Do not imply funded openings without confirmation.
- Contact: the PI page supplies default information. An optional Page with slug `frontend-contact` can replace the Contact page prose. The email CTA still comes from the PI page.
- Teaching: edit the page titled Teaching with slug `contact`, ID 17; it is the more complete existing listing. Check the title and ID carefully because two Teaching pages exist. List dates/terms; do not present historical courses as current availability.
- Gallery: open **Group Photos** (`lab-photos`, ID 129), add/remove Image or Gallery blocks and captions, then Update. Captions and Media Library alt text supply accessible descriptions. The frontend lays out extracted images responsively; selecting a photo opens its image file.

## Optional Home settings page

An administrator can create a regular Page with slug **`frontend-home`**. Production page creation and menu effects should be reviewed before use; this code has not created it. Use top-level Heading 2 blocks with the labels below, each followed by a paragraph. These are normal editor content, not JSON or custom fields.

| Heading 2          | Value / behavior                                                    |
| ------------------ | ------------------------------------------------------------------- |
| Hero Title         | Main homepage heading                                               |
| Hero Subtitle      | Small line above the main heading                                   |
| Hero Description   | Introductory paragraph                                              |
| Primary CTA        | Primary button label                                                |
| Primary Link       | `/research` or an approved full HTTPS URL                           |
| Secondary CTA      | Secondary button label                                              |
| Secondary Link     | `/people` or an approved full HTTPS URL                             |
| Atomic Scale       | Paragraphs for the scientific feature                               |
| Footer             | Additional footer prose/links                                       |
| People Source      | Leave `legacy` until a complete child-page migration; then `pages`  |
| Publication Source | Leave `legacy` until a complete publication migration; then `posts` |

Its Featured Image overrides the homepage's static fallback image. The interactive 3D structure, lighting and behavior are presentation code and require developer review to change; they are not a published crystal structure. Without the Page or a value, existing source/presentation defaults remain. Internal button links must start with one `/`; external links must be full HTTP(S) URLs. Do not set collection source flags until all records have been reviewed; they choose one canonical source and intentionally exclude the old collection.

## Optional structured people migration

Prepare one child Page per person under Meet the Team. Page title is the person's name; Featured Image is their portrait. Add these top-level Heading 2 sections followed by text:

- **Role**: a consistent category label, such as Graduate Researchers or Postdoctoral Researchers.
- **Status**: Current or Alumni.
- **Biography**: ordinary paragraphs.
- **Research Interests**: text.
- **Email**: optional email address.

After the complete roster, including alumni, is reviewed, set People Source to `pages` in frontend-home and Update. Future additions then need only a new child Page. Moving someone to alumni requires changing their Status to Alumni. Until that source switch, child profiles are not the public roster. Keep the legacy page as a recoverable archive; do not delete it during migration.

## Optional structured publication migration

Create category **Publications** with slug `publications` and optionally tag **Featured** with slug `featured`. Each publication is a Post whose title is the exact scientific title. Assign Publications. Use top-level Heading 2 sections:

- **Authors**: full authors and contribution markings.
- **Year**: four-digit year.
- **Journal**: journal/volume/pages.
- **Status**: Published, Accepted, Under review, Submitted or Editorial, as appropriate.
- **DOI**: DOI identifier or full doi.org URL.
- **Link**: optional full publisher/preprint URL.
- **Affiliation**: SMU or Prior to SMU.

Set a Featured Image for a graphical abstract if authorized and apply Featured only to a curated selection. Prepare/review the complete bibliography before setting Publication Source to `posts` in frontend-home. Until that switch the existing bibliography remains canonical. After migration, add a new categorized Post for each new publication. Incomplete metadata remains optional in rendering, but administrators should supply accurate records.

## Revisions and restoring content

1. Open the page/post and look for Revisions in the editor sidebar or publication panel.
2. If present, open it and compare versions; inspect the editor/time and highlighted changes.
3. Select the desired earlier revision and choose Restore This Revision.
4. Check the restored text/image references and publish/update if the editor requires it.
5. Verify the frontend after the refresh interval.

The public API confirms revision routes exist but does not reveal revision history without authentication. If your dashboard has no revision control, ask the SMU WordPress administrator about retention/configuration. Media files, taxonomy assignments, featured-image metadata and account settings may not be recoverable through ordinary content revisions; verify these separately. Keep old media and record migration settings before changes. Do not assume restoring a Post restores every metadata field.

## Developer-only tasks

Layout/style changes, new page types, navigation structure, custom parsers, image-host approvals, SEO/domain configuration, dependency updates and deployment need developer involvement. Unsupported custom fields should not be promised. Existing image-only biographies need content transcription and review for an accessible migration. Supported content edits and source selection happen in WordPress without editing repository data.

# Page structure and review cadence

See [Information architecture](INFORMATION_ARCHITECTURE.md) for the recommended sitemap, source audit, audience pathways, and retained legacy records. Ordinary content changes continue through the admin and WordPress records; no React changes are required to update existing supported records.

Review People and recruitment information each semester, publications and news when new items are available, and contact details and equipment descriptions whenever they change. Confirm publication status, explicit news dates, equipment ownership and capabilities, and course currency before publishing. Do not use a WordPress modification date as the date of a news event. Keep older or empty source pages until an owner approves archival.
