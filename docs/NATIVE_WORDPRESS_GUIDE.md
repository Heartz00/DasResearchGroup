# Lab website editing guide

This is the advanced native WordPress fallback. For the current website-specific content admin, use [ADMIN_GUIDE.md](ADMIN_GUIDE.md).

WordPress is the lab's content source. You can make routine changes without code, GitHub or deployment access. The native WordPress dashboard is the recommended workspace; the older optional `/admin` frontend workspace remains available, but is not required for this model.

**Current status:** the frontend and blank templates support this structure. The new settings/structured records have **not** been installed or published in SMU WordPress. Existing content still works. A lab website manager should perform the one-time setup and review the migration before handing it over.

## Log in and choose the correct record

1. Visit [SMU Das lab WordPress](https://people.smu.edu/daslab/wp-admin/).
2. Use your own authorized SMU WordPress account. Follow SMU's sign-in flow; do not share the PI's credentials.
3. Use **Pages** for lab profiles, research, equipment and general information; **Posts** for dated news and structured publications; **Media** for images.
4. If you cannot see or edit a record, ask the lab website manager to check your permissions. Do not create a second copy to get around access restrictions.

Recommended access: the PI/owner handles account permissions; an Editor maintains the website; Authors create their own Posts; Contributors submit drafts for review. Contributors may need an Editor to upload images. SMU may customize these permissions.

## One-time setup: reusable editor templates

A manager should create a few clearly named **draft** template records, then let editors copy their blocks. Do not publish empty templates or put them in public menus.

1. Create a draft Page or Post, as indicated in the [field reference](NATIVE_FIELD_REFERENCE.md).
2. Add a **Heading 2** block for each label in the relevant table, followed by paragraph/list blocks for its value. Use the labels exactly; changing them can stop a field from being recognized.
3. Stay in the **Visual editor**. Use Heading, Paragraph, List, Link and Image controls; never paste source markup. The HTML template files are developer-only setup assets, not an administrator task. If a preconfigured draft template is available, copy its blocks visually.
4. Save the blank record as a draft titled “Template — Member profile”, for example. In the block editor, use **Copy all blocks** and paste into a new record; if available, save an **unsynced pattern**. Do not use a synced-pattern reference for frontend fields.
5. Editors fill in the paragraphs below each label. Keep optional values empty or remove their heading and value together. Never publish template instructions as actual lab facts.

WordPress may show Parent under Page Attributes or Page settings. Posts use Categories and Tags. Featured Image is in the Page/Post sidebar when supported. These controls vary with the SMU editor.

## Existing records you can edit today

| Content                                     | Open in Pages                                 | Public destination   |
| ------------------------------------------- | --------------------------------------------- | -------------------- |
| Research / default home description         | Research, ID 6                                | Home, Research       |
| Current members and alumni                  | Meet the Team, ID 18                          | People               |
| PI biography and legacy contact/recruitment | About Dr. Das, ID 16, slug `news`             | PI, Contact, Join Us |
| Existing bibliography                       | Publications, ID 15                           | Publications         |
| Undated news archive                        | Group News, ID 392                            | News, Home           |
| Equipment photographs                       | Instrumentation, ID 308, slug `instruments-2` | Facilities           |
| Gallery                                     | Group Photos, ID 129                          | Gallery              |
| Historical teaching                         | Teaching, ID 17, slug `contact`               | Teaching             |

The legacy source slugs are misleading, so check the title and ID. Do not rename/delete these records during normal editing. The older Teaching ID 262 and empty instrument placeholders are not the active sources.

## Edit the homepage

After setup, open **Homepage settings**, slug `frontend-home`.

1. Edit Hero Title, Subtitle, Eyebrow and Description. Keep the description concise.
2. Edit the primary/secondary button labels and links. A frontend destination starts with one slash, such as `/research`; an external destination uses a full HTTPS URL.
3. Edit Atomic Scale for the research-significance feature and the Join Us CTA fields for the recruitment banner.
4. Set its Featured Image to change the scientific fallback visual. The automatic 3D illustration is part of the design and is not edited in WordPress.
5. Add optional Statistics only if verified. Do not enter guesses or automatic counts.
6. Save/preview, then Update. **Do not change People Source or Publication Source during routine editing.** These select complete collections and are only for a reviewed migration.

Featured items are selected on their own records: Research/People use **Featured on Homepage = Yes**; publication/news Posts use the **Featured** tag, exact slug `featured`. The homepage shows up to five research areas, three publications, three news entries and a small people preview alongside the PI. Current featured people are preferred; alumni are excluded. Without an explicit selection, existing sensible previews remain.

## Add or edit a member

After the structured roster migration:

1. Pages → Add New, copy the Member profile template.
2. Put the full name in the Page title. Set Parent to **Meet the Team** (ID 18), even for alumni.
3. Fill Role, Status = Current, Biography and Research Interests. Add optional approved education, public email/profile URLs, location and years.
4. Choose a portrait as Featured Image and set its Media Library alt text.
5. Set Display Order to a whole number; smaller numbers appear first. Enter Yes under Featured on Homepage only if approved.
6. Save as Draft for review, then Publish. Check People after the refresh interval.

For an existing member, find their Page by name and edit the same record. To move them to Alumni, change **Status** from Current to Alumni, add an approved End Year/Next Position if known, and Update. Do not recreate or move the Page to another parent. Their record and text revisions remain available.

Until migration, edit the existing Meet the Team Page. Keep category labels and each complete entry together. Move the complete entry under Former Members to make it alumni. Image-only biographies need authorized transcription before structured migration; do not guess names from filenames.

## Add or feature a publication

After the complete publication migration:

1. Posts → Add New, copy Publication blocks. Title = exact scientific title.
2. Assign the category **Publications**, exact slug `publications`. Do not assign News to the same paper record.
3. Fill Authors, Year, Journal, volume/issue/pages where known, DOI and/or full publisher/preprint Link. Keep contribution markings using the normal formatting tools.
4. Enter the correct Status and, if applicable, Publication Type and Affiliation. A preprint is not a published article.
5. Set an authorized graphical abstract as Featured Image, with alt text. Add a reviewed abstract if useful.
6. To feature it, apply **Featured** tag (`featured`). Save Draft, review, Publish, then check Publications and Home.

Year is a four-digit number; DOI normally starts with `10.` followed by digits and a slash. Links need full HTTP(S) URLs. If a dedicated value disappears from the frontend, check the format first.

Until migration, add a numbered citation paragraph to the existing Publications Page, matching its bibliography convention. Keep the full scientific record and prior-to-SMU section. All existing papers must be reviewed before selecting the Posts source; a partial migration would hide unconverted entries.

## Create news, awards or conference updates

1. Posts → Add New; write a specific title and use the News blocks or ordinary story paragraphs.
2. Assign **News** category (`news`). An Editor can add topic categories such as Award, Conference, Group News, Outreach, New Member, Graduation or Collaboration **when they are needed**. Also keep the parent News category checked; child categories alone are not selected by the frontend.
3. Add Summary, Full Story, optional related people/paper links and an External Link. Set a Featured Image if available.
4. WordPress Publish date controls the displayed publication date; write any different event date in the story. Do not use a page modification date as an event date.
5. Apply Featured tag to select it for Home. Save Draft or Submit for Review. Use WordPress scheduling if publishing later; it becomes public after WordPress publishes it.
6. Publish and check News/Home. Existing undated archive paragraphs stay undated. Avoid duplicating an archive item as a Post unless the manager approves the migration.

## Edit research areas and instruments

For a research area, create/edit a child Page with Parent **Research** (ID 6). Title = area name. Fill Summary, Scientific question, Approach, Methods / Techniques, Why it matters and explicit Related Publications. Set a Featured Image; supporting Image blocks are also displayed. Use approved figures and captions. Set order/feature flag, save Draft and review before publishing. The main Research Page remains the overall overview.

For an instrument, create/edit a child Page with Parent **Instrumentation** (ID 308). Title = instrument name. Fill verified manufacturer/model, purpose/capabilities, research links, location, ownership/shared-access status and external facility link. Set its Featured Image and order. Do not infer specifications or ownership from a photograph. Publish and check Facilities. Existing parent-page equipment photos remain available.

## Gallery and image uploads

1. Media → Add New; upload an image you have permission to use.
2. Open the item and enter meaningful **Alternative Text** and an optional caption/credit. Prefer a description of the subject, not a filename.
3. For the existing Gallery, add an Image or Gallery block to Group Photos (ID 129).
4. For a structured entry, create a child Page under Group Photos, set a Featured Image and fill Caption, known Date, Event, descriptive Category and Photographer. Save Draft, review and Publish.
5. Verify the image/caption and full-image link on Gallery. Keep old media until replacements are reviewed: restoring a text revision does not restore a deleted file.

Upload a new file instead of overwriting image bytes at the same URL. Next.js image optimization/browser caching may otherwise keep the old image. Use authorized SMU-hosted files; a new external image host needs developer review.

## Update PI, Join Us, Contact, Teaching and Footer

**PI:** edit the complete reviewed `pi-profile` Page after setup. Name/Title control the heading, Featured Image the portrait, Biography the introduction. Education, Academic Appointments, Research Interests, Awards and Honors, Selected Publications and Professional Memberships appear only when populated. Add public Email/Office and approved profile/CV URLs. Before setup, edit About Dr. Das ID 16; preserve its legacy Contact marker and recruitment paragraph.

**Join Us:** edit `join-the-lab`. Fill Intro and the audience sections, Contact Instructions and official admissions/department URLs. Enter Open Positions Notice only after the PI confirms a vacancy. Empty opening notices do not create an opening claim. Without this settings Page, existing source recruitment guidance remains.

**Contact:** edit `frontend-contact`. Fill verified Lab Name, PI Name, affiliation, public building/room, mailing address, Email, department/map URLs and optional phone. The Email field controls the Contact email action; keep the PI's Email current separately for PI/recruitment links. Before setup, Contact uses the legacy PI record.

**Teaching:** edit the existing Teaching record ID 17. Include terms/years and link to official SMU information for current availability.

**Footer:** edit `frontend-footer`. Fill lab identity/affiliations, public address/email, professional and institutional links using ordinary readable link text, and credit/copyright text. Homepage settings also supports additional Footer prose. The navigational layout remains part of the site design.

## Preview, publish and check

1. Save Draft or Submit for Review until the content is approved. Existing published records use Update; saving a published change can make it live immediately, so use the site's review practice.
2. WordPress Preview checks the source document. It does **not** preview the exact Next.js design. The public Next.js site does not expose drafts.
3. Publish or Schedule using native controls. Confirm the correct parent/category, Featured Image, status and slug first.
4. Visit the corresponding frontend page after about five minutes and refresh. The first visitor after expiry may see cached content while a background refresh completes; check again shortly after.
5. If it still looks wrong, check published status, field labels, parent/category and source selection with the manager. Do not change code or deploy to fix routine content.

The new frontend is currently reviewed locally at `http://localhost:3000`; use the deployed frontend URL once the owner supplies it.

## Revisions and restoring an earlier version

1. Open the existing Page/Post and find **Revisions** in its editor settings/publication panel.
2. Compare the earlier version with the current text, noting the editor and time.
3. Choose **Restore This Revision** when supported, then review/publish/update as prompted.
4. Check images, Featured Image, parent, categories, tags and source settings separately. A content revision may not restore these or deleted media.
5. Verify the frontend after its refresh interval.

If Revisions is missing, ask the SMU administrator to verify revision support/retention. See [WordPress revisions documentation](https://wordpress.org/documentation/article/revisions/). Never promise recovery of deleted uploads.

## Short handover checklist

- Give the next maintainer their own account and Editor access only if they manage the whole site.
- Demonstrate one member edit, an Alumni status change, one publication draft, a news draft and an image alt-text update.
- Show the correct parent/category and how Preview, Publish and Revisions work.
- Record the active People/Publication source settings and the public frontend address.
- Review roster/opportunities each semester; update publications/news promptly and facilities/contact details when they change.
- Keep private protocols, personal contacts and internal forms off public Pages and Media.
