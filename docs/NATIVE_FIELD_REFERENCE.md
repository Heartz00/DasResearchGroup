# Native WordPress field reference

Generated from `wordpress/content-model.mjs`. Blank block templates contain no example claims and are never loaded as public content. Follow [ADMIN_GUIDE.md](ADMIN_GUIDE.md) before publishing.

## Homepage settings

Page; slug: `frontend-home`.

| Heading 2               | Help                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Hero Eyebrow            | Optional small introductory label.                                                   |
| Hero Title              | Main homepage heading.                                                               |
| Hero Subtitle           | Short lab identity line.                                                             |
| Hero Description        | One concise paragraph.                                                               |
| Primary CTA             | Button label.                                                                        |
| Primary Link            | A frontend path such as /research, or full HTTPS URL.                                |
| Secondary CTA           | Button label.                                                                        |
| Secondary Link          | A frontend path such as /people, or full HTTPS URL.                                  |
| Atomic Scale            | Approved explanation of why the research matters.                                    |
| Join Us CTA Title       | Short invitation heading.                                                            |
| Join Us CTA Description | Concise approved recruitment introduction.                                           |
| Join Us CTA Button      | Button label.                                                                        |
| Join Us CTA Link        | Usually /join.                                                                       |
| Statistics              | Optional verified figures, written as ordinary text; omit without evidence.          |
| Footer                  | Optional additional footer prose; separate Footer Settings is preferred.             |
| People Source           | Leave legacy until the complete roster and alumni migration is reviewed; then pages. |
| Publication Source      | Leave legacy until all bibliography records are reviewed; then posts.                |

## Member profile

Page; Parent: Meet the Team (ID 18).

| Heading 2            | Help                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Role                 | Consistent role, e.g. Graduate Researchers, Postdoctoral Researchers, Undergraduate Researchers or Visiting Researchers. |
| Status               | Current or Alumni. Change this field to move the same record.                                                            |
| Biography            | Short professional biography.                                                                                            |
| Research Interests   | Concise research focus.                                                                                                  |
| Education            | Verified degrees only.                                                                                                   |
| Email                | Public email, or leave blank.                                                                                            |
| Office / Lab         | Public location if appropriate.                                                                                          |
| Google Scholar       | Optional full HTTPS URL.                                                                                                 |
| ORCID                | Optional full HTTPS URL.                                                                                                 |
| LinkedIn             | Optional full HTTPS URL.                                                                                                 |
| Personal Website     | Optional full HTTPS URL.                                                                                                 |
| Start Year           | Verified four-digit year.                                                                                                |
| End Year             | Optional verified four-digit year.                                                                                       |
| Next Position        | For alumni, only if known and approved.                                                                                  |
| Display Order        | Whole number, 0 or greater; lower numbers first.                                                                         |
| Featured on Homepage | Yes or No; only current members are featured.                                                                            |

## Publication

Post; category slug: `publications`.

| Heading 2         | Help                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Authors           | Complete authors; keep contribution markings.                                                  |
| Journal           | Journal name.                                                                                  |
| Year              | Four-digit year, 1900–2099.                                                                    |
| Volume            | Optional volume.                                                                               |
| Issue             | Optional issue.                                                                                |
| Pages             | Page range or article identifier.                                                              |
| DOI               | Identifier such as 10.1234/example, or full doi.org URL.                                       |
| Link              | Full publisher/preprint URL; overrides the generated DOI link.                                 |
| Abstract          | Optional approved abstract or short summary.                                                   |
| Research Category | Approved research label; retained as citation information.                                     |
| Publication Type  | Research Article, Review, Book Chapter, Preprint or Conference Proceeding, only as applicable. |
| Status            | Published, Accepted, Under review, Submitted or Editorial.                                     |
| Affiliation       | SMU or Prior to SMU.                                                                           |
| Display Order     | Whole number 0 or greater, within the same publication year.                                   |

## Research area

Page; Parent: Research (ID 6).

| Heading 2            | Help                                                          |
| -------------------- | ------------------------------------------------------------- |
| Summary              | Concise homepage card text.                                   |
| Scientific question  | What question does this work address?                         |
| Approach             | Approved approach or full description.                        |
| Methods / Techniques | Verified methods; do not infer equipment from photographs.    |
| Why it matters       | Scientific significance without exaggerated outcomes.         |
| Related Publications | Explicit links to papers connected with this area.            |
| Display Order        | Whole number, lower first.                                    |
| Featured on Homepage | Yes or No. If none are featured, the first five areas appear. |

## Instrument

Page; Parent: Instrumentation (ID 308).

| Heading 2                 | Help                                                  |
| ------------------------- | ----------------------------------------------------- |
| Manufacturer              | Verified manufacturer, optional.                      |
| Model                     | Verified model, optional.                             |
| Purpose                   | Short description of research use.                    |
| Capabilities              | Verified capabilities.                                |
| Related Research Areas    | Links or approved descriptions.                       |
| Location                  | Public location, optional.                            |
| Shared / Lab-Owned Status | Clearly distinguish shared access from lab ownership. |
| External Facility Link    | Optional full institutional facility URL.             |
| Display Order             | Whole number, lower first.                            |

## News story

Post; category slug: `news`.

| Heading 2           | Help                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Summary             | Short introduction.                                                                                  |
| Full Story          | Approved story; event date can be included here. WordPress Publish date controls the displayed date. |
| Related People      | Names and optional links.                                                                            |
| Related Publication | Citation or paper link.                                                                              |
| External Link       | Optional full source URL.                                                                            |

## PI profile

Page; slug: `pi-profile`.

| Heading 2                | Help                                           |
| ------------------------ | ---------------------------------------------- |
| Name                     | Full name.                                     |
| Title                    | Academic/lab role.                             |
| Biography                | Verified professional biography.               |
| Education                | Verified degrees and institutions.             |
| Academic Appointments    | Verified appointments and dates.               |
| Research Interests       | Approved research interests.                   |
| Awards and Honors        | Only verified awards.                          |
| Selected Publications    | Reviewed citations and links.                  |
| Professional Memberships | Only confirmed memberships.                    |
| Email                    | Public email.                                  |
| Office                   | Public office location.                        |
| Google Scholar           | Optional full HTTPS URL. Only public CV files. |
| ORCID                    | Optional full HTTPS URL. Only public CV files. |
| LinkedIn                 | Optional full HTTPS URL. Only public CV files. |
| Personal Website         | Optional full HTTPS URL. Only public CV files. |
| Institutional Profile    | Optional full HTTPS URL. Only public CV files. |
| CV                       | Optional full HTTPS URL. Only public CV files. |

## Join Us

Page; slug: `join-the-lab`.

| Heading 2                 | Help                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Intro                     | Concise invitation.                                                                     |
| Prospective PhD Students  | Approved opportunities, relevant background and inquiry instructions for this audience. |
| Undergraduate Researchers | Approved opportunities, relevant background and inquiry instructions for this audience. |
| Postdoctoral Researchers  | Approved opportunities, relevant background and inquiry instructions for this audience. |
| Visiting Researchers      | Approved opportunities, relevant background and inquiry instructions for this audience. |
| Collaborators             | Approved opportunities, relevant background and inquiry instructions for this audience. |
| Contact Instructions      | Who to contact and what to include.                                                     |
| Graduate Admissions URL   | Full official application/program URL.                                                  |
| Department URL            | Full department URL.                                                                    |
| Open Positions Notice     | Leave empty unless the PI explicitly confirms an opening.                               |

## Contact

Page; slug: `frontend-contact`.

| Heading 2       | Help                                                          |
| --------------- | ------------------------------------------------------------- |
| Lab Name        | Lab name.                                                     |
| PI Name         | Principal investigator.                                       |
| Department      | Department affiliation.                                       |
| University      | University affiliation.                                       |
| Building        | Public building name.                                         |
| Room            | Public room, optional.                                        |
| Mailing Address | Full postal address.                                          |
| Email           | Public contact email; controls the Contact page email action. |
| Department URL  | Full official URL.                                            |
| Map URL         | Optional public directions link.                              |
| Phone           | Optional public phone.                                        |

## Footer settings

Page; slug: `frontend-footer`.

| Heading 2                   | Help                                     |
| --------------------------- | ---------------------------------------- |
| Lab Name                    | Lab name in the footer.                  |
| Department                  | Department affiliation.                  |
| University                  | University affiliation.                  |
| Address                     | Public mailing address.                  |
| Contact Email               | Public contact email.                    |
| Social / Professional Links | Use ordinary links with readable labels. |
| Institutional Links         | Use ordinary links with readable labels. |
| Copyright Text              | Approved footer credit/copyright text.   |

## Gallery entry

Page; Parent: Group Photos (ID 129).

| Heading 2    | Help                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Caption      | Describe the selected Featured Image.                                                                                        |
| Date         | Optional known event date, not the upload date.                                                                              |
| Event        | Event name.                                                                                                                  |
| Category     | Group Photos, Conferences, Outreach, Lab Activities or Social Events, as appropriate; descriptive text, not a Page taxonomy. |
| Photographer | Credit if required.                                                                                                          |
