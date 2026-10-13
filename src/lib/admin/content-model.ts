export type ContentField = {
  label: string;
  type?: 'long' | 'email' | 'url' | 'number' | 'date';
  options?: string[];
  help?: string;
};
const field = (
  label: string,
  type?: ContentField['type'],
  help?: string,
): ContentField => ({ label, type, help });
const select = (label: string, options: string[]): ContentField => ({
  label,
  options,
});
const feature = select('Featured on Homepage', ['No', 'Yes']);
const headerFields = [
  field(
    'Header Title',
    undefined,
    'Leave empty to keep the page’s existing heading.',
  ),
  field(
    'Header Description',
    'long',
    'Leave empty to keep the page’s existing introduction.',
  ),
  select('Text Style', ['White text', 'Navy text']),
];
export const contentModels = {
  'research-header': {
    label: 'Research header',
    singular: 'research header',
    kind: 'pages',
    slug: 'frontend-header-research',
    single: true,
    fields: headerFields,
  },
  'publications-header': {
    label: 'Publications header',
    singular: 'publications header',
    kind: 'pages',
    slug: 'frontend-header-publications',
    single: true,
    fields: headerFields,
  },
  'news-header': {
    label: 'Group News header',
    singular: 'group news header',
    kind: 'pages',
    slug: 'frontend-header-news',
    single: true,
    fields: headerFields,
  },
  'facilities-header': {
    label: 'Instruments header',
    singular: 'instruments header',
    kind: 'pages',
    slug: 'frontend-header-facilities',
    single: true,
    fields: headerFields,
  },
  profile: {
    label: 'PI profile',
    singular: 'PI profile',
    kind: 'pages',
    slug: 'pi-profile',
    fallback: 'news',
    single: true,
    fields: [
      field('Name'),
      field('Title'),
      field('Biography', 'long'),
      field('Education', 'long'),
      field('Academic Appointments', 'long'),
      field('Research Interests', 'long'),
      field('Awards and Honors', 'long'),
      field('Selected Publications', 'long'),
      field('Professional Memberships', 'long'),
      field('Email', 'email'),
      field('Office'),
      field('Mailing Address', 'long'),
      field('Google Scholar', 'url'),
      field('ORCID', 'url'),
      field('LinkedIn', 'url'),
      field('Institutional Profile', 'url'),
      field('CV', 'url'),
    ],
  },
  people: {
    label: 'Team members',
    singular: 'team member',
    kind: 'pages',
    parent: 'people',
    fields: [
      select('Role', [
        'Graduate Researchers',
        'Postdoctoral Researchers',
        'Undergraduate Researchers',
        'Visiting Researchers',
        'REU Students',
        'Researchers',
      ]),
      select('Status', ['Current', 'Alumni']),
      field('Biography', 'long'),
      field('Research Interests', 'long'),
      field('Education', 'long'),
      field('Email', 'email'),
      field('Office / Lab'),
      field('Google Scholar', 'url'),
      field('ORCID', 'url'),
      field('LinkedIn', 'url'),
      field('Personal Website', 'url'),
      field('Start Year', 'number'),
      field('End Year', 'number'),
      field('Next Position'),
      field('Display Order', 'number'),
      feature,
    ],
  },
  publications: {
    label: 'Publications',
    singular: 'publication',
    kind: 'posts',
    category: 'publications',
    fields: [
      field('Authors', 'long'),
      field('Year', 'number'),
      field('Journal'),
      field('Volume'),
      field('Issue'),
      field('Pages'),
      field('DOI'),
      field('Link', 'url'),
      select('Status', [
        'Published',
        'Accepted',
        'Under review',
        'Submitted',
        'Editorial',
      ]),
      select('Publication Type', [
        'Research Article',
        'Review',
        'Book Chapter',
        'Preprint',
        'Conference Proceeding',
      ]),
      field('Abstract', 'long'),
      field('Research Category'),
      select('Affiliation', ['SMU', 'Prior to SMU']),
      field('Display Order', 'number'),
    ],
  },
  updates: {
    label: 'Group News',
    singular: 'group update',
    kind: 'posts',
    category: 'news',
    fields: [
      field('Summary', 'long'),
      field('Full Story', 'long'),
      select('Update Type', [
        'Research',
        'Publications',
        'Awards',
        'Events',
        'Group Life',
      ]),
      field(
        'Author / Credit',
        undefined,
        'Optional approved author or reporting credit.',
      ),
      field(
        'Photo Caption',
        undefined,
        'Optional caption displayed beneath the update photo.',
      ),
      field(
        'Event Date',
        'date',
        'Optional date of the event. New updates otherwise display their publication date.',
      ),
      field('Related People'),
      field('Related Publication', 'long'),
      field('External Link', 'url'),
    ],
  },
  research: {
    label: 'Research',
    singular: 'research area',
    kind: 'pages',
    parent: 'research',
    fields: [
      field('Overview', 'long'),
      field('Summary', 'long'),
      field('Scientific question', 'long'),
      field('Approach', 'long'),
      field('Methods / Techniques', 'long'),
      field('Why it matters', 'long'),
      field('Related Publications', 'long'),
      field('Display Order', 'number'),
      feature,
    ],
  },
  facilities: {
    label: 'Instruments',
    singular: 'instrument',
    kind: 'pages',
    parent: 'instruments-2',
    fields: [
      field('Manufacturer'),
      field('Model'),
      field('Purpose', 'long'),
      field('Capabilities', 'long'),
      field('Related Research Areas', 'long'),
      field('Location'),
      select('Shared / Lab-Owned Status', ['Lab-owned', 'Shared access']),
      field('External Facility Link', 'url'),
      field('Display Order', 'number'),
    ],
  },
  funding: {
    label: 'Funding Support',
    singular: 'funder',
    kind: 'pages',
    parent: 'research',
    fields: [
      field('Award Number'),
      field('Program'),
      field('Description', 'long'),
      field('Funder Website', 'url'),
      select('Display on Website', ['Yes', 'No']),
      field('Display Order', 'number'),
    ],
  },
  photos: {
    label: 'Gallery',
    singular: 'gallery photo',
    kind: 'pages',
    parent: 'lab-photos',
    fields: [
      field('Caption', 'long'),
      field('Date', 'date'),
      field('Event'),
      field('Category'),
      field('Photographer'),
      {
        ...select('People Header', ['Yes', 'No']),
        help: 'The most recently saved photo marked Yes appears in the Team page header.',
      },
    ],
  },
  homepage: {
    label: 'Homepage content',
    singular: 'homepage',
    kind: 'pages',
    slug: 'frontend-home',
    single: true,
    fields: [
      field('Hero Eyebrow'),
      field('Hero Title'),
      field('Hero Subtitle'),
      field('Hero Description', 'long'),
      field('Primary CTA'),
      field('Primary Link'),
      field('Secondary CTA'),
      field('Secondary Link'),
      field('Atomic Scale', 'long'),
      field('Join Us CTA Title'),
      field('Join Us CTA Description', 'long'),
      field('Join Us CTA Button'),
      field('Join Us CTA Link'),
    ],
  },
  join: {
    label: 'Join the lab',
    singular: 'recruitment information',
    kind: 'pages',
    slug: 'join-the-lab',
    single: true,
    fields: [
      field('Intro', 'long'),
      ...[
        'Prospective PhD Students',
        'Undergraduate Researchers',
        'Postdoctoral Researchers',
        'Visiting Researchers',
        'Collaborators',
      ].map((label) => field(label, 'long')),
      field('Contact Instructions', 'long'),
      field('Graduate Admissions URL', 'url'),
      field('Department URL', 'url'),
      field(
        'Open Positions Notice',
        'long',
        'Leave empty unless an opening is confirmed.',
      ),
    ],
  },
  contact: {
    label: 'Contact information',
    singular: 'contact information',
    kind: 'pages',
    slug: 'frontend-contact',
    single: true,
    fields: [
      field('Lab Name'),
      field('PI Name'),
      field('Department'),
      field('University'),
      field('Building'),
      field('Room'),
      field('Mailing Address', 'long'),
      field('Email', 'email'),
      field('Department URL', 'url'),
      field('Map URL', 'url'),
      field('Phone'),
    ],
  },
  footer: {
    label: 'Footer information',
    singular: 'footer information',
    kind: 'pages',
    slug: 'frontend-footer',
    single: true,
    fields: [
      field('Lab Name'),
      field('Department'),
      field('University'),
      field('Address', 'long'),
      field('Contact Email', 'email'),
      field(
        'Social / Professional Links',
        'long',
        'One full web address per line.',
      ),
      field('Institutional Links', 'long', 'One full web address per line.'),
      field('Copyright Text'),
    ],
  },
  teaching: {
    label: 'Teaching',
    singular: 'teaching information',
    kind: 'pages',
    slug: 'contact',
    single: true,
    fields: [field('Courses', 'long', 'Include course names and terms.')],
  },
} satisfies Record<
  string,
  {
    label: string;
    singular: string;
    kind: 'pages' | 'posts';
    slug?: string;
    fallback?: string;
    parent?: string;
    category?: string;
    single?: boolean;
    fields: ContentField[];
  }
>;
export type ContentArea = keyof typeof contentModels;
export function hasPhoto(area: string) {
  return (
    area.endsWith('-header') ||
    [
      'profile',
      'people',
      'publications',
      'updates',
      'research',
      'facilities',
      'funding',
      'photos',
      'homepage',
    ].includes(area)
  );
}
export function contentModel(area: string) {
  if (!Object.hasOwn(contentModels, area))
    throw new Error('Unknown content section.');
  return contentModels[area as ContentArea] as {
    label: string;
    singular: string;
    kind: 'pages' | 'posts';
    slug?: string;
    fallback?: string;
    parent?: string;
    category?: string;
    single?: boolean;
    fields: ContentField[];
  };
}
