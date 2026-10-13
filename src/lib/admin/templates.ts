import type { Collection } from './records';
export const templates: Record<
  string,
  {
    label: string;
    kind: Collection;
    title: string;
    slug?: string;
    parentSlug?: string;
    content: string;
  }
> = {
  home: {
    label: 'Homepage settings',
    kind: 'pages',
    title: 'Frontend Home',
    slug: 'frontend-home',
    content:
      '<h2>Hero Title</h2><p>Synthetic nanoscience with atomic precision.</p>\n<h2>Hero Subtitle</h2><p>Das Research Group · SMU Chemistry</p>\n<h2>Hero Description</h2><p></p>\n<h2>Primary CTA</h2><p>Explore our research</p>\n<h2>Primary Link</h2><p>/research</p>\n<h2>Secondary CTA</h2><p>Meet the group</p>\n<h2>Secondary Link</h2><p>/people</p>',
  },
  member: {
    label: 'Member profile',
    kind: 'pages',
    title: '',
    parentSlug: 'people',
    content:
      '<h2>Role</h2><p></p>\n<h2>Status</h2><p>Current</p>\n<h2>Biography</h2><p></p>\n<h2>Research Interests</h2><p></p>\n<h2>Email</h2><p></p>',
  },
  research: {
    label: 'Research area',
    kind: 'pages',
    title: '',
    parentSlug: 'research',
    content:
      '<h2>Summary</h2><p></p>\n<h2>Scientific question</h2><p></p>\n<h2>Approach</h2><p></p>\n<h2>Why it matters</h2><p></p>',
  },
  instrument: {
    label: 'Instrument',
    kind: 'pages',
    title: '',
    parentSlug: 'instruments-2',
    content: '<h2>Purpose</h2><p></p>\n<h2>Capabilities</h2><p></p>',
  },
  publication: {
    label: 'Publication',
    kind: 'posts',
    title: '',
    content:
      '<h2>Authors</h2><p></p>\n<h2>Year</h2><p></p>\n<h2>Journal</h2><p></p>\n<h2>Status</h2><p></p>\n<h2>DOI</h2><p></p>\n<h2>Link</h2><p></p>\n<h2>Affiliation</h2><p>SMU</p>',
  },
  news: { label: 'News post', kind: 'posts', title: '', content: '<p></p>' },
  join: {
    label: 'Recruitment guidance',
    kind: 'pages',
    title: 'Join the Lab',
    slug: 'join-the-lab',
    content: '<p></p>',
  },
  contact: {
    label: 'Contact details',
    kind: 'pages',
    title: 'Frontend Contact',
    slug: 'frontend-contact',
    content: '<p></p>',
  },
};
