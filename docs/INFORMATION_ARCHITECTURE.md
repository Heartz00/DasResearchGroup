# Structural audit and recommended sitemap

Reviewed October 12, 2026, before restructuring. Evidence: live read-only WordPress Pages response, all 11 rendered public routes, source mappings, metadata, headings and internal links. Local read-only audit artifacts are in `.preview/structure-source-pages.json` and `.preview/structural-route-audit.json`. No WordPress records are deleted or archived by this plan.

## Recommended sitemap

```text
Home                         /
Research                     /research
  Source-backed themes       #theme anchors; child URLs only with reviewed content
People                       /people
  Anindita (Dia) Das         /people/anindita-das
  Current role groups        #category anchors
  Alumni                     #alumni
Publications                 /publications
  Year groups                #year anchors
News                         /news
Facilities                   /facilities
Join Us                      /join
Contact                      /contact

Secondary / footer
Gallery                      /gallery
Teaching                     /teaching

Private workspace            /admin (noindex, excluded from public sitemap)
```

Primary navigation: Home, Research, People, Publications, News, Facilities, Join Us, Contact. The logo also returns Home. Teaching and Gallery remain secondary. Preserve existing URLs and canonical routes. Do not create empty Resources, research subpages, member profiles, news categories or publication-type filters.

## Current page audit and disposition

| Destination  | Current findings                                                                                           | Decision                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Home         | Complete broad story, but PI is not represented in the people preview; some previews repeat full citations | Retain; emphasize PI and concise links to deeper content                                                              |
| Research     | Three supported themes, then long narrative; no published child research Pages                             | Retain; organize themes around the source question, approach and motivation; keep the full source narrative available |
| People       | PI panel and role groups; some member/alumni information is embedded in images or missing                  | Retain; preserve current/alumni grouping; no invented profiles, education or next positions                           |
| PI profile   | Dedicated URL and verified biography, but no section headings and includes recruitment/contact prose       | Retain; separate biography, group research, publications and contact/opportunities                                    |
| Publications | 33 source citations; descending year groups, statuses, DOI links and year selector                         | Retain; add year navigation and preserve authors, contribution markings and preprint distinctions                     |
| News         | Source-ordered archive; many entries lack dates/images/categories                                          | Retain; keep ordering and verified dates; do not label undated records as dated articles                              |
| Facilities   | Five photographs, no verified instrument models/capabilities or ownership descriptions                     | Retain; present photography accurately; named child records only when approved descriptions exist                     |
| Join         | Dedicated URL, one source recruitment paragraph, no audience-specific guidance or admissions links         | Retain; introduce audience entry points and official links without implying vacancies, eligibility or funding         |
| Contact      | Verified PI, email, address/office information; repeated contact prose                                     | Retain; make contact actions obvious and use the existing contact source                                              |
| Gallery      | Authentic imagery and captions                                                                             | Retain in footer/secondary navigation                                                                                 |
| Teaching     | Historical Fall 2021/2022 and Spring 2022 course records                                                   | Retain as a historical teaching record, not current course availability                                               |

All 11 public routes return 200, have one H1, title, description and canonical URL. Some page titles are vague (From the group, Inside the lab, Let's connect) and should use News, Facilities and Contact for clearer orientation and academic search results.

## Duplicate and outdated WordPress sources

The live inventory contains 11 published Pages. The frontend already maps misleading source slugs correctly; renaming public routes to match them would be a regression.

- Page 16, `news`: About Dr. Das, also the legacy fallback for contact/recruitment. Keep as the PI source; optional dedicated Contact/Join Pages can supersede those extracts after review.
- Page 17, `contact`: the more complete Teaching record (Fall 2021/2022 and Spring 2022). Keep canonical for teaching. Page 262, `teaching`, is an older overlapping listing. Propose archiving it in WordPress only after an administrator compares and approves retention; do not delete it.
- Page 308, `instruments-2`: active Instrumentation photographs. Pages 306 (`instruments`) and 295 (`lab-instrument-pictures`) have no text or images. Propose archiving these unused placeholders only after explicit approval; retain all three for now.
- Page 6 (`research`) supplies the scientific narrative. Keep it; research child Pages can add reviewed theme detail without duplicating the entire overview.

No public frontend pages need merging or removal. Consolidation recommendations concern overlapping source records, not existing frontend URLs.

## Research content boundaries

The source supports coinage metal clusters, interactions with MOFs/COFs, and applications in catalysis/biology. Structure–property relationships are a cross-cutting question. Sustainable energy and human health are stated motivations, not proof of demonstrated devices or treatments. Do not create standalone energy/biomedical programs merely to fill the proposed theme list.

Each reviewed research child Page should provide Summary, Scientific question, Approach, Why it matters, an authorized figure/caption, relevant techniques and explicit related-paper links. Techniques and paper associations must be provided by the lab; do not infer instrument ownership or results from images/titles.

## Audience paths

| Audience                        | Primary path                      | What must be findable                                                  |
| ------------------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| Prospective Ph.D. students      | Join Us → Research → PI           | Research scope, contact/CV guidance, official graduate admissions      |
| Undergraduates                  | Join Us → People                  | How to express interest and who to contact                             |
| Postdocs                        | Join Us → Publications            | Research direction and inquiry route, without unconfirmed openings     |
| Collaborators/faculty/funders   | Research → Publications → Contact | Questions, supported approaches, outputs and affiliation               |
| Conference visitors/journalists | Home → PI → Contact               | Lab identity, leader, plain-language significance and reliable contact |
| Current members/alumni          | People, News, footer links        | Accurate role/status, achievements and secondary pages                 |

Visiting researcher guidance and facilities capability details need approved source content. Public Resources is deferred until there are useful nonsensitive documents; internal lab material belongs in an approved access-controlled system.

## Maintenance and WordPress mapping

- Frequently reviewed: roster/status, publications, news, facilities and recruitment. Assign a lab editor; check each term and after changes.
- Relatively stable: mission, research overview and PI biography. Review annually and after career/research changes.
- News: categorized Posts, preserving undated legacy archive entries until a reviewed migration.
- General content: existing Pages and supported Contact/Join/Home settings Pages.
- Members, research areas and instruments: supported child Pages; no new plugin/custom type requirement.
- Publications: legacy bibliography until a complete reviewed categorized-Post migration.
- Media: authorized WordPress Media Library images with alt text and captions; major edits retain available WordPress revisions.

Routine record changes remain WordPress-managed through the frontend workspace or existing dashboard. New layouts/contracts need developer work. No source-selection flags are switched automatically.

## Official institutional links

Use the [Chemistry Department](https://www.smu.edu/dedman/academics/departments/chemistry), [Chemistry graduate programs](https://www.smu.edu/dedman/academics/departments/chemistry/graduate) and [Graduate Studies in Chemistry admissions overview](https://grad.smu.edu/graduate-studies-in-chemistry). Links were checked against official SMU pages. Leave application requirements, deadlines and admissions decisions with SMU rather than duplicating potentially changing policy.
