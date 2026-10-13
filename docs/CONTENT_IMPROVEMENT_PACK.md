# Research, people and recruitment content pack

This is a working editorial guide for the existing WordPress workflow. Nothing in this document has been published to WordPress. Obtain lab approval for scientific descriptions, member details and recruitment requirements before publishing. Bracketed prompts below are drafting instructions, not website copy.

## Research: concise explanations

The frontend now presents these paraphrases when the corresponding themes exist in the source Research page:

| Theme                  | Plain-language explanation                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Coinage metal clusters | Build atomically precise metal clusters and study how their structures relate to their properties.                                 |
| MOFs & COFs            | Study how metal clusters interact with MOFs and COFs to create multifunctional hybrid nanomaterials.                               |
| Catalysis & biology    | Explore applications of these materials in catalysis and biology, with sustainable energy and human health as broader motivations. |

These express the existing research program, not demonstrated outcomes. The complete source overview remains available below the at-a-glance section. The montage is shared authentic research imagery; it does not imply a verified image for every individual theme.

For deeper explanations, use the supported Research child Pages described in [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md). Review and publish one complete area at a time. Child pages automatically replace the generic overview themes on Home and supply detailed Research sections.

Suggested ordinary editor structure:

```text
Page title: [Approved research-area name]
Parent: Research
Featured Image: [Authorized image of this research, with descriptive alt text]

Summary
[Two sentences: what the group studies and the question it addresses.]

Scientific question
[One specific question approved by the PI.]

Approach
[Describe established methods used by the group. Distinguish current work from plans.]

Why it matters
[Explain the motivation without claiming unverified applications or results.]

Related publications
[Link to the relevant papers using exact titles and DOI/publisher links.]

Figure caption
[Explain the figure and credit its source.]
```

These headings are regular page body content, not new required fields or custom parser contracts. The existing Summary heading remains the supported homepage summary convention. Do not reuse a montage as proof of a specific result.

## People: collect a complete profile

For each current member and alumnus, collect:

- Verified display name and role; current/alumni status.
- A portrait the member authorizes, ideally at least 800px on its shorter side. Use similar lighting and a face-centered crop; do not upscale a small image or crop text from an image-only biography.
- A member-approved two- or three-sentence biography.
- One or two sentences describing their actual research interests.
- An email address only if approved for public display.

Use the existing child-page template: Role, Status, Biography, Research Interests and Email. The frontend now labels supplied research interests, offers a keyboard-accessible Biography disclosure and a clear email action. Missing details stay omitted rather than being invented.

Prepare the complete roster, including alumni, before switching People Source to pages in frontend-home. Until then the legacy People page remains canonical. Transcribe image-only biographies verbatim into a draft, then ask the member to correct and approve the text. Do not infer identity, degree, research focus or graduation dates from filenames.

## Publications: explain significance accurately

Choose three papers with the PI. For each, supply an authorized graphical abstract, verified citation/status/DOI and a short explanation approved by an author:

```text
What we found
[One sentence stating the paper's actual result.]

Why it matters
[One sentence stating the supported implication and any necessary limitation.]
```

Do not derive a finding from its title alone. In the existing structured publication format, these can be ordinary body sections and will appear in the full citation content; no new fields are required. Prepare the full bibliography before switching Publication Source to posts. A featured tag is a curated selection, not a claim that a paper is more important or already published.

## Recruitment: confirmed guidance first

The frontend surfaces the CV instruction only when the source recruitment prose contains it. The email action now supplies a descriptive subject, without sending a message automatically.

Use the existing optional join-the-lab Page to supply approved guidance for prospective graduate students, undergraduates and postdocs. For each group, confirm eligibility, relevant application route, what to send and whom to contact. Explain established training opportunities using actual group practices. List funded positions only after confirmation; clarify when an inquiry is welcome without implying an opening. Collaborators should have a clear contact route and source-approved research scope.

## Image and archive repair queue

Use [MEDIA_INVENTORY.md](MEDIA_INVENTORY.md) to locate existing assets; it is an inventory, not a current guarantee of availability or reuse permission.

1. Review missing/blocked portraits and research images on the frontend.
2. Obtain authorized originals from the lab or member; upload new files to the WordPress Media Library.
3. Add meaningful alt text, replace the relevant reference and retain the old asset until review.
4. Check Home, People, Research, Publications, Gallery and Facilities after cache refresh.
5. Confirm the current roster and move complete former-member records to Alumni.
6. Add verified event dates to news prose, or use the supported dated Posts format. Avoid duplicating archive entries during migration.

No real lab or member imagery should be replaced with invented stock or generated portraits.

## Visitor review: two short sessions

Ask a prospective student and a researcher to work independently. Send them the preview link and these tasks, without explaining how to navigate:

1. Describe one research area in your own words.
2. Find a paper relevant to that area and open its DOI/publisher link.
3. Find the PI and identify how to ask about research opportunities.
4. Locate a current member's role and research interests, if supplied.
5. Find the lab's mailing address.

Record whether each task succeeds, where the visitor hesitates, misunderstood terms, inaccessible controls and missing content. Ask what information they expected but could not find. Prioritize repeated obstacles over requests for extra effects. Check keyboard-only use and a narrow phone viewport as part of the review. No invitations have been sent by the coding agent.

## Publication checks

Before updating WordPress, review spelling, scientific claims, permissions, links, alt text and current/alumni status. After updating, wait for the existing cache refresh and compare the source and frontend. The developer has not changed the WordPress API, models, source-selection rules or publishing workflow.
