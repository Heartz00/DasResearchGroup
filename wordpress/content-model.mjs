// Installation-independent native WordPress contracts. These are blank editor
// templates, never a content database or a substitute for published CMS records.
const f = (label, help) => ({ label, help });
export const models = {
  home: {
    title: 'Homepage settings',
    slug: 'frontend-home',
    kind: 'Page',
    fields: [
      f('Hero Eyebrow', 'Optional small introductory label.'),
      f('Hero Title', 'Main homepage heading.'),
      f('Hero Subtitle', 'Short lab identity line.'),
      f('Hero Description', 'One concise paragraph.'),
      f('Primary CTA', 'Button label.'),
      f(
        'Primary Link',
        'A frontend path such as /research, or full HTTPS URL.',
      ),
      f('Secondary CTA', 'Button label.'),
      f(
        'Secondary Link',
        'A frontend path such as /people, or full HTTPS URL.',
      ),
      f('Atomic Scale', 'Approved explanation of why the research matters.'),
      f('Join Us CTA Title', 'Short invitation heading.'),
      f(
        'Join Us CTA Description',
        'Concise approved recruitment introduction.',
      ),
      f('Join Us CTA Button', 'Button label.'),
      f('Join Us CTA Link', 'Usually /join.'),
      f(
        'Statistics',
        'Optional verified figures, written as ordinary text; omit without evidence.',
      ),
      f(
        'Footer',
        'Optional additional footer prose; separate Footer Settings is preferred.',
      ),
      f(
        'People Source',
        'Leave legacy until the complete roster and alumni migration is reviewed; then pages.',
      ),
      f(
        'Publication Source',
        'Leave legacy until all bibliography records are reviewed; then posts.',
      ),
    ],
  },
  person: {
    title: 'Member profile',
    kind: 'Page',
    parent: 'Meet the Team (ID 18)',
    fields: [
      f(
        'Role',
        'Consistent role, e.g. Graduate Researchers, Postdoctoral Researchers, Undergraduate Researchers or Visiting Researchers.',
      ),
      f(
        'Status',
        'Current or Alumni. Change this field to move the same record.',
      ),
      f('Biography', 'Short professional biography.'),
      f('Research Interests', 'Concise research focus.'),
      f('Education', 'Verified degrees only.'),
      f('Email', 'Public email, or leave blank.'),
      f('Office / Lab', 'Public location if appropriate.'),
      ...['Google Scholar', 'ORCID', 'LinkedIn', 'Personal Website'].map(
        (label) => f(label, 'Optional full HTTPS URL.'),
      ),
      f('Start Year', 'Verified four-digit year.'),
      f('End Year', 'Optional verified four-digit year.'),
      f('Next Position', 'For alumni, only if known and approved.'),
      f('Display Order', 'Whole number, 0 or greater; lower numbers first.'),
      f(
        'Featured on Homepage',
        'Yes or No; only current members are featured.',
      ),
    ],
  },
  publication: {
    title: 'Publication',
    kind: 'Post',
    category: 'publications',
    fields: [
      f('Authors', 'Complete authors; keep contribution markings.'),
      f('Journal', 'Journal name.'),
      f('Year', 'Four-digit year, 1900–2099.'),
      f('Volume', 'Optional volume.'),
      f('Issue', 'Optional issue.'),
      f('Pages', 'Page range or article identifier.'),
      f('DOI', 'Identifier such as 10.1234/example, or full doi.org URL.'),
      f(
        'Link',
        'Full publisher/preprint URL; overrides the generated DOI link.',
      ),
      f('Abstract', 'Optional approved abstract or short summary.'),
      f(
        'Research Category',
        'Approved research label; retained as citation information.',
      ),
      f(
        'Publication Type',
        'Research Article, Review, Book Chapter, Preprint or Conference Proceeding, only as applicable.',
      ),
      f('Status', 'Published, Accepted, Under review, Submitted or Editorial.'),
      f('Affiliation', 'SMU or Prior to SMU.'),
      f(
        'Display Order',
        'Whole number 0 or greater, within the same publication year.',
      ),
    ],
  },
  research: {
    title: 'Research area',
    kind: 'Page',
    parent: 'Research (ID 6)',
    fields: [
      f('Summary', 'Concise homepage card text.'),
      f('Scientific question', 'What question does this work address?'),
      f('Approach', 'Approved approach or full description.'),
      f(
        'Methods / Techniques',
        'Verified methods; do not infer equipment from photographs.',
      ),
      f(
        'Why it matters',
        'Scientific significance without exaggerated outcomes.',
      ),
      f(
        'Related Publications',
        'Explicit links to papers connected with this area.',
      ),
      f('Display Order', 'Whole number, lower first.'),
      f(
        'Featured on Homepage',
        'Yes or No. If none are featured, the first five areas appear.',
      ),
    ],
  },
  instrument: {
    title: 'Instrument',
    kind: 'Page',
    parent: 'Instrumentation (ID 308)',
    fields: [
      f('Manufacturer', 'Verified manufacturer, optional.'),
      f('Model', 'Verified model, optional.'),
      f('Purpose', 'Short description of research use.'),
      f('Capabilities', 'Verified capabilities.'),
      f('Related Research Areas', 'Links or approved descriptions.'),
      f('Location', 'Public location, optional.'),
      f(
        'Shared / Lab-Owned Status',
        'Clearly distinguish shared access from lab ownership.',
      ),
      f('External Facility Link', 'Optional full institutional facility URL.'),
      f('Display Order', 'Whole number, lower first.'),
    ],
  },
  news: {
    title: 'News story',
    kind: 'Post',
    category: 'news',
    fields: [
      f('Summary', 'Short introduction.'),
      f(
        'Full Story',
        'Approved story; event date can be included here. WordPress Publish date controls the displayed date.',
      ),
      f('Related People', 'Names and optional links.'),
      f('Related Publication', 'Citation or paper link.'),
      f('External Link', 'Optional full source URL.'),
    ],
  },
  pi: {
    title: 'PI profile',
    kind: 'Page',
    slug: 'pi-profile',
    fields: [
      f('Name', 'Full name.'),
      f('Title', 'Academic/lab role.'),
      f('Biography', 'Verified professional biography.'),
      f('Education', 'Verified degrees and institutions.'),
      f('Academic Appointments', 'Verified appointments and dates.'),
      f('Research Interests', 'Approved research interests.'),
      f('Awards and Honors', 'Only verified awards.'),
      f('Selected Publications', 'Reviewed citations and links.'),
      f('Professional Memberships', 'Only confirmed memberships.'),
      f('Email', 'Public email.'),
      f('Office', 'Public office location.'),
      ...[
        'Google Scholar',
        'ORCID',
        'LinkedIn',
        'Personal Website',
        'Institutional Profile',
        'CV',
      ].map((label) =>
        f(label, 'Optional full HTTPS URL. Only public CV files.'),
      ),
    ],
  },
  join: {
    title: 'Join Us',
    kind: 'Page',
    slug: 'join-the-lab',
    fields: [
      f('Intro', 'Concise invitation.'),
      ...[
        'Prospective PhD Students',
        'Undergraduate Researchers',
        'Postdoctoral Researchers',
        'Visiting Researchers',
        'Collaborators',
      ].map((label) =>
        f(
          label,
          'Approved opportunities, relevant background and inquiry instructions for this audience.',
        ),
      ),
      f('Contact Instructions', 'Who to contact and what to include.'),
      f('Graduate Admissions URL', 'Full official application/program URL.'),
      f('Department URL', 'Full department URL.'),
      f(
        'Open Positions Notice',
        'Leave empty unless the PI explicitly confirms an opening.',
      ),
    ],
  },
  contact: {
    title: 'Contact',
    kind: 'Page',
    slug: 'frontend-contact',
    fields: [
      f('Lab Name', 'Lab name.'),
      f('PI Name', 'Principal investigator.'),
      f('Department', 'Department affiliation.'),
      f('University', 'University affiliation.'),
      f('Building', 'Public building name.'),
      f('Room', 'Public room, optional.'),
      f('Mailing Address', 'Full postal address.'),
      f(
        'Email',
        'Public contact email; controls the Contact page email action.',
      ),
      f('Department URL', 'Full official URL.'),
      f('Map URL', 'Optional public directions link.'),
      f('Phone', 'Optional public phone.'),
    ],
  },
  footer: {
    title: 'Footer settings',
    kind: 'Page',
    slug: 'frontend-footer',
    fields: [
      f('Lab Name', 'Lab name in the footer.'),
      f('Department', 'Department affiliation.'),
      f('University', 'University affiliation.'),
      f('Address', 'Public mailing address.'),
      f('Contact Email', 'Public contact email.'),
      f(
        'Social / Professional Links',
        'Use ordinary links with readable labels.',
      ),
      f('Institutional Links', 'Use ordinary links with readable labels.'),
      f('Copyright Text', 'Approved footer credit/copyright text.'),
    ],
  },
  gallery: {
    title: 'Gallery entry',
    kind: 'Page',
    parent: 'Group Photos (ID 129)',
    fields: [
      f('Caption', 'Describe the selected Featured Image.'),
      f('Date', 'Optional known event date, not the upload date.'),
      f('Event', 'Event name.'),
      f(
        'Category',
        'Group Photos, Conferences, Outreach, Lab Activities or Social Events, as appropriate; descriptive text, not a Page taxonomy.',
      ),
      f('Photographer', 'Credit if required.'),
    ],
  },
};
