# Manage your lab website

The website’s own **Admin** workspace is the main editing interface. WordPress stores the content, photos, accounts and history behind the scenes. You do not need to use its dashboard, edit code or design page layouts for the tasks below.

Open **Admin** in the website footer, or visit `/admin` on your website. During local review the address is `http://localhost:3000/admin`. Sign in with your individual editing credentials. The owner configures personal access using the WordPress account connection described in [ADMIN_SETUP.md](ADMIN_SETUP.md); never share one account.

## Start with the task you want to do

The overview offers **Edit PI information**, **Add a team member**, **Write a lab update** and **Add a publication**. The sidebar also includes Research, Homepage content, Instruments, Gallery, Teaching, Join the lab, Contact information and Footer information. These are content forms, not page designers.

Existing content loads from WordPress. Before Homepage, Contact, Join the lab or Footer settings have their own saved record, the forms show the content currently used by the website. Saving creates the appropriate settings record; intentionally cleared saved fields stay empty. Footer contact and link settings replace the default links rather than adding duplicates. Old publications include a readable original citation reference; fields that cannot be reliably recovered remain blank.

## Change the PI information or portrait

1. Choose **PI profile** or **Edit PI information**.
2. Update the biography, education, appointments, research interests or public contact/profile details.
3. Under Profile photo, choose an existing photo by name or upload a new JPEG, PNG or WebP under 3 MB.
4. Describe a new photo for people using screen readers.
5. Use **Preview content** to review your text. This is a content preview; the public site supplies its own styling.
6. Select Draft, Send for review or Published, then **Save changes**. Check the success message.

The original PI source is retained when its dedicated profile is first saved. No existing record is deleted.

## Publish Group News with a photograph

Open **Group News → Add group update**. Enter the update title, a short Summary and the Full Story. Choose an optional Update Type, event date and approved Author / Credit. Choose an existing WordPress photo or upload a JPEG, PNG or WebP under 3 MB; describe the new photo and add an optional Photo Caption. Save as Published when ready. The public `/news` page displays the photo, caption, summary, credit and type alongside the expandable full update. Older records without photos or dates keep their original content; no image or event date is invented.

Research figures use the gallery viewer on `/research`. Continue adding images and scientific descriptions under Research. Team portraits, biographies, research interests and professional links remain editable under Team Members; the public Team directory searches these saved profiles and groups alumni separately.

## Add a biography, change a member’s photo or move them to Alumni

1. Choose **Team members**, then select a person. You can also choose **Add a team member**.
2. Enter the full name, position, biography and research interests. Add optional education and public email/profile links.
3. Choose or upload the portrait in the same form.
4. Change Current / alumni status to Alumni when appropriate. You do not need to recreate the person. Add an approved end year or next position if known.
5. Save a draft or publish when ready. Existing source entries stay available for recovery.

Some old member biographies are inside image pixels. Those cannot be recovered as editable text automatically. Enter an approved transcription in Biography; do not guess names or qualifications. The admin labels unnamed entries as needing a name.

## Edit instruments

**Instruments** includes existing WordPress instrument photographs. Open a photograph, enter its approved instrument name, manufacturer, model and capabilities, and save. The photograph is selected automatically where its media-library record is available. Unverified technical fields remain blank. Publishing replaces that photograph on the Instruments page with the completed instrument entry, without duplicating it or deleting its original source.

The public exhibition at `/facilities` displays instrument cards with photos, manufacturer/model, purpose and equipment-access labels when provided. Visitors can search by name or specifications, switch between grid and list views, filter by saved access status, and open the complete instrument details. Older laboratory photographs remain available in the collapsible photo archive. Update these fields in the existing Instruments editor; no separate showcase settings are required.

## Change page header images

Open **Site Settings → Page Headers**. Choose Research, Publications, Group News or Instruments, select an existing WordPress image or upload a JPEG/PNG/WebP under 3 MB, describe a new upload, and choose White text or Navy text. Optional header title/description fields change only that page's introduction. Save as Published to update the website. Selecting None removes the background. These images are kept separate from Group Photos, and use the same WordPress permissions and revision history as other content.

The Research header initially uses the approved WordPress gold-nanocluster banner. Teaching is available in the main navigation and footer at `/teaching`.

## Edit gallery photos

Existing gallery photographs are also available under **Gallery**. Edit their caption, event, category, date, credit or photo in one form. Published edits replace the original gallery entry; removing the photo hides that entry without deleting its original WordPress source.

The public photo collection is called **Group Photos** at `/gallery`, reachable from the main navigation, footer and Team page. To change the Team page background, open a Gallery photo, set **Team Header** to Yes and publish. The most recently saved published photo marked Yes is used. Hidden photos are not used as header backgrounds.

## Add or edit a publication

1. Choose **Publications** to edit a paper, or **Add a publication**.
2. Enter the exact title, authors, year, journal and other known citation details. DOI accepts an identifier or full doi.org URL; Publication URL accepts a full web address.
3. Set the paper’s publication status accurately, independently of whether the website entry is a draft or published. A preprint/under-review paper must not be labeled Published.
4. Choose or upload an authorized graphical abstract and optionally highlight the paper in the full bibliography. Homepage selection follows the four requested Science/JACS papers.
5. Save Draft or publish after review.

Each paper has its own editable record. A reviewed edit replaces that paper on the new frontend while retaining the original bibliography. New papers appear alongside existing records; you do not need to migrate every paper first. An unchanged original citation retains scientific author formatting. For older records, verify the structured authors/journal/details when converting the citation into the new fields.

The public bibliography shows full citations by default, grouped by year. Readers can search by title, author, journal or DOI, filter by year/status/affiliation, switch to compact citations, show research figures, and copy the displayed citation text. Author markings and prior-to-SMU attribution are retained. Figures, links and status labels continue to use the saved publication records.

## Publish a lab update

1. Choose **Write a lab update**.
2. Enter a concise title, optional summary and full story. Add related people/paper information or a source link if useful.
3. Choose or upload a photo. Select Feature on the homepage if appropriate.
4. Enter Event Date only when known. New updates otherwise use their publication date; edited undated archive entries remain undated unless an event date is supplied.
5. Save Draft, Send for review or Published, then check the save confirmation.

The workspace handles the backend category/tag associations. You never need to enter numeric category or image IDs. A restricted account may need the owner to finish the initial publishing setup or grant appropriate editing access.

## Update other content

- **Research:** edit the overall research overview or add/edit an individual research area with question, approach, methods, significance and related papers.
- **Instruments:** enter verified names, capabilities, manufacturer/model and whether equipment is shared or lab-owned. Do not infer details from pictures.
- **Gallery:** add a photo with an approved caption, event/date and credit. Existing gallery source images are retained.
- **Homepage content:** update headlines, introductions, button labels/destinations and the recruitment banner. Layout and the 3D illustration stay part of the website design.
- **Join the lab:** update guidance for each audience and official application/contact links. Leave Open Positions Notice empty unless an opening is confirmed.
- **Contact information / Footer information:** update public identity, address/email and institutional/professional links.
- **Teaching:** update course names and terms; distinguish historical teaching from current availability.

## Drafts, preview, save and history

Drafts and review submissions are private. Publishing changes makes them eligible for the public site. Normal updates appear after the next successful refresh, usually around five minutes; the first visit after cache expiry can trigger a background refresh. A success message means the content service confirmed the save, not that every browser cache has already refreshed.

**Preview content** shows your entered text without publishing. It is not an authenticated preview of the exact public page layout. Unsaved changes must be saved before leaving the form.

Existing records show **Version history** where the backend exposes saved revisions. Expand a version to review it, then choose **Restore this version**. Restoration restores text; the current photo, parent/category associations and visibility remain unchanged. Revision availability follows the institution’s retention and account permissions. Uploaded file bytes are not restored by text revisions.

If another editor changed a record while you were editing, saving is blocked so you can compare before overwriting it. Keep your typed text and reload in another tab. Uploads and content saves are separate backend operations; an uploaded file may remain in the photo library if the later record save fails.

## Access and handover

Use personal accounts. The owner handles **Editing access** according to the backend’s account permissions. Editors maintain the site; accounts without publishing permission can save/submit drafts. The admin does not bypass institutional access rules.

Show a new maintainer one PI edit, a member biography/photo change, a publication draft and a lab update. Show the content preview, visibility selector, save confirmation and history. Review the roster/recruitment each semester and update publications, news and equipment details as they change.

The native WordPress guide is retained as an advanced fallback in [NATIVE_WORDPRESS_GUIDE.md](NATIVE_WORDPRESS_GUIDE.md). Generic collection/source tools remain for compatibility but are not the normal workspace navigation.

**Verification boundary:** local unit/browser checks use isolated test records. Real SMU authenticated editing, media upload and revision retention must be checked with an authorized account. This development work has not changed production content or accounts.
