import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSite } from '../src/lib/content/normalize';
import { photoKey, updateKey } from '../src/lib/wordpress/content-keys';
import {
  homepagePublications,
  publicationJournal,
} from '../src/lib/content/publication-presentation';
import { peopleRole } from '../src/lib/content/people-role';
import { contactDetails } from '../src/lib/content/contact-presentation';
import { researchHeaderUrl } from '../src/lib/content/page-headers';
import { people } from '../src/lib/wordpress/adapters';
import { contentDefaults } from '../src/lib/admin/content-defaults';
import {
  fieldYear,
  fieldOrder,
  fieldDoi,
  fieldEmail,
} from '../src/lib/wordpress/fields';
import type { CmsPage, SiteContent } from '../src/lib/content/types';
import snapshot from '../src/content/wordpress-snapshot.json';
import { publicHtml } from '../src/lib/wordpress/adapters';
import {
  contentValues,
  updateContentFields,
  profileKey,
  publicationKey,
} from '../src/lib/admin/content-values';
const record = (
  id: number,
  slug: string,
  html: string,
  parent = 0,
): CmsPage => ({
  id,
  slug,
  html,
  parent,
  title: slug,
  link: `https://people.smu.edu/daslab/${slug}/`,
  modified: '2026-10-12T00:00:00',
  featuredMedia: 0,
});

test('missing admin settings are seeded from WordPress and remain aligned after saving', () => {
  const data = source([
    record(
      16,
      'news',
      '<p>Verified biography.</p><p>Contact:</p><p>Email: pi@example.org</p><p>Mailing Address:</p><p>3215 Daniel Ave</p><p>Office: Fondren Science Rm 141</p>',
    ),
  ]);
  const site = normalizeSite(data);
  const initial = contentDefaults('contact', site);
  assert.equal(initial.Email, 'pi@example.org');
  assert.equal(initial['Mailing Address'], '3215 Daniel Ave');
  assert.equal(initial.Building, 'Fondren Science');
  assert.equal(initial.Room, '141');
  data.pages.push(
    record(
      800,
      'frontend-contact',
      updateContentFields('contact', '', {
        ...initial,
        Email: 'updated@example.org',
      }),
    ),
  );
  const updated = normalizeSite(data);
  assert.equal(updated.contactEmail, 'updated@example.org');
  assert.match(updated.contactHtml, /Fondren Science/);
  assert.equal(contentValues('contact', data.pages[1].html).Room, '141');
  assert.equal(contentDefaults('footer', site)['Contact Email'], site.email);
});
const source = (pages: CmsPage[]): SiteContent => ({
  pages,
  media: [],
  posts: [],
  categories: [],
  tags: [],
  mode: 'live',
});

test('group-news fields and photo captions round-trip from admin to public content', () => {
  const data = source([]);
  data.categories = [{ id: 3, slug: 'news', name: 'News' }];
  data.media = [
    {
      id: 99,
      url: 'https://people.smu.edu/daslab/files/event.jpg',
      alt: 'Approved event photo',
      caption: '',
    },
  ];
  data.posts = [
    {
      ...record(
        901,
        'group-event',
        updateContentFields('updates', '', {
          Summary: 'Short introduction',
          'Full Story': 'Complete approved story',
          'Update Type': 'Events',
          'Author / Credit': 'Group editor',
          'Photo Caption': 'Approved event caption',
          'Event Date': '2026-10-12',
        }),
      ),
      featuredMedia: 99,
      date: '2026-10-13T00:00:00Z',
      categories: [3],
      tags: [],
    },
  ];
  const update = normalizeSite(data).news[0];
  assert.equal(update.summary, 'Short introduction');
  assert.equal(update.photo?.url, data.media[0].url);
  assert.equal(update.photo?.caption, 'Approved event caption');
  assert.equal(update.credit, 'Group editor');
  assert.deepEqual(update.categories, ['Events']);
  assert.equal(update.date, '2026-10-12');
  assert.match(update.html, /Complete approved story/);
  assert.doesNotMatch(
    update.html,
    /Photo Caption|Author \/ Credit|Update Type/,
  );
});

test('content forms preserve unchanged rich text and paired native blocks when a field changes', () => {
  const original =
    '<!-- wp:heading --><h2 class="wp-block-heading">Biography</h2><!-- /wp:heading --><!-- wp:paragraph --><p>First <strong>paragraph</strong>.</p><!-- /wp:paragraph --><!-- wp:paragraph --><p>Second paragraph.</p><!-- /wp:paragraph --><!-- wp:heading --><h2 class="wp-block-heading">Education</h2><!-- /wp:heading --><!-- wp:paragraph --><p>Verified degree.</p><!-- /wp:paragraph -->';
  const values = contentValues('people', original);
  assert.equal(values.Biography, 'First paragraph.\n\nSecond paragraph.');
  assert.equal(updateContentFields('people', original, values), original);
  const changed = updateContentFields('people', original, {
    ...values,
    Biography: 'Updated <science>.\n\nAnother paragraph.',
  });
  assert.ok(changed.includes('Updated &lt;science&gt;.'));
  assert.ok(changed.includes('Verified degree.'));
  assert.equal((changed.match(/<!-- wp:heading -->/g) || []).length, 2);
  assert.equal((changed.match(/<!-- \/wp:heading -->/g) || []).length, 2);
  assert.equal((changed.match(/<!-- wp:paragraph -->/g) || []).length, 3);
  assert.equal((changed.match(/<!-- \/wp:paragraph -->/g) || []).length, 3);
});
test('content forms reject invalid emails, DOI values, dates and unknown fields before saving', () => {
  assert.throws(
    () => updateContentFields('people', '', { Email: 'not-an-email' }),
    /address/,
  );
  assert.throws(
    () => updateContentFields('publications', '', { DOI: 'bad' }),
    /DOI/,
  );
  assert.throws(
    () => updateContentFields('updates', '', { 'Event Date': '2026-02-30' }),
    /date/,
  );
  assert.throws(
    () => updateContentFields('people', '', { 'Hidden Code': 'x' }),
    /Unknown/,
  );
});

test('internal managed-record fields never appear in public content', () => {
  const html = publicHtml(
    '<p>Approved story.</p><h2>Managed Update</h2><p>Yes</p><h2>Legacy Source</h2><p>["private-control-key"]</p><h2>Photo Hidden</h2><p>No</p><h2>Contact</h2><p>Approved contact.</p>',
  );
  assert.ok(html.includes('Approved story.'));
  assert.ok(html.includes('Approved contact.'));
  assert.ok(
    !/Managed Update|Legacy Source|Photo Hidden|private-control-key/.test(html),
  );
});

test('clearing a structured contact email does not revive an old address', () => {
  const data = source([
    record(
      20,
      'pi-profile',
      '<p>Email: old@example.org</p><h2>Email</h2><p></p>',
    ),
    record(21, 'frontend-contact', '<h2>Email</h2><p></p>'),
  ]);
  const site = normalizeSite(data);
  assert.equal(site.email, undefined);
  assert.equal(site.contactEmail, undefined);
});

test('managed update summaries do not use auto-generated excerpts containing control fields', () => {
  const data = source([]);
  data.categories = [{ id: 3, slug: 'news', name: 'News' }];
  data.posts = [
    {
      ...record(
        700,
        'update',
        '<h2>Full Story</h2><p>Approved story.</p><h2>Managed Update</h2><p>Yes</p>',
      ),
      excerpt: 'Full Story Approved story Managed Update Yes',
      categories: [3],
      tags: [],
      date: '2026-10-12T00:00:00Z',
    },
  ];
  const site = normalizeSite(data);
  assert.equal(site.news[0].summary, '');
  assert.ok(!site.news[0].html.includes('Managed Update'));
  assert.equal(site.news[0].link, '/news#story-700');
});
test('managed member edits replace exactly one legacy entry and new members append without source switches', () => {
  const data = source(snapshot.pages);
  const before = normalizeSite(data);
  const member = before.roster[0];
  const html = updateContentFields(
    'people',
    '',
    {
      Role: 'Graduate Researchers',
      Status: 'Current',
      Biography: 'Accessible bio',
    },
    { 'Managed Profile': 'Yes', 'Legacy Source': profileKey(member) },
  );
  data.pages.push({
    ...record(701, 'managed-member', html, 18),
    title: 'Reviewed name',
  });
  let after = normalizeSite(data);
  assert.equal(after.roster.length, before.roster.length);
  assert.equal(after.roster[0].id, '701');
  assert.ok(after.roster[0].html.includes('Accessible bio'));
  assert.deepEqual(after.roster.slice(1), before.roster.slice(1));
  data.pages.push({
    ...record(
      702,
      'new-member',
      updateContentFields(
        'people',
        '',
        { Role: 'Graduate Researchers', Status: 'Alumni' },
        { 'Managed Profile': 'Yes' },
      ),
      18,
    ),
    title: 'New member',
  });
  after = normalizeSite(data);
  assert.equal(after.roster.length, before.roster.length + 1);
  assert.equal(after.roster.at(-1)?.alumni, true);
});

test('public WordPress smart quotes still match saved member email and professional links', () => {
  const data = source([
    record(18, 'people', '<p>Graduate Students</p><p>Existing Member</p>'),
  ]);
  const member = normalizeSite(data).roster[0];
  const html = updateContentFields(
    'people',
    '',
    {
      Role: 'Graduate Researchers',
      Status: 'Current',
      Email: 'member@example.edu',
      LinkedIn: 'https://www.linkedin.com/in/example-member',
      Biography: 'Approved member biography.',
    },
    { 'Managed Profile': 'Yes', 'Legacy Source': profileKey(member) },
  );
  data.pages.push({
    ...record(507, 'member', html.replaceAll('&quot;', '&#8220;'), 18),
    title: member.name,
  });
  const roster = normalizeSite(data).roster;
  assert.equal(roster.length, 1);
  assert.equal(roster[0].id, '507');
  assert.equal(roster[0].email, 'member@example.edu');
  assert.equal(
    roster[0].links?.[0].href,
    'https://www.linkedin.com/in/example-member',
  );
  assert.match(roster[0].html, /Approved member biography/);
});

test('image-only legacy members remain editable whether WordPress wraps their images or not', () => {
  const image =
    '<img src="https://people.smu.edu/daslab/files/2022/05/member.jpg" alt="">';
  const raw = record(
    18,
    'people',
    `<p>Graduate Students</p>${image}<p>Former Members</p>${image}`,
  );
  const rendered = {
    ...raw,
    html: `<p>Graduate Students</p><p>${image}</p><p>Former Members</p><p>${image}</p>`,
  };
  const rawRoster = people(raw, []);
  const renderedRoster = people(rendered, []);
  assert.equal(rawRoster.length, 2);
  assert.deepEqual(rawRoster.map(profileKey), renderedRoster.map(profileKey));
  assert.deepEqual(
    rawRoster.map((p) => p.alumni),
    [false, true],
  );
});
test('managed publication edit preserves the complete bibliography and original scientific formatting', () => {
  const data = source(snapshot.pages);
  const paper = normalizeSite(data).publications[0];
  data.categories = [{ id: 2, slug: 'publications', name: 'Publications' }];
  const html = updateContentFields(
    'publications',
    `<h2>Original Citation</h2>${paper.html}`,
    { Year: String(paper.year || 2026), Status: 'Accepted' },
    { 'Managed Publication': 'Yes', 'Legacy Source': publicationKey(paper) },
  );
  data.posts = [
    {
      ...record(703, 'managed-paper', html),
      title: 'Reviewed title',
      categories: [2],
      tags: [],
      date: '2026-10-12T00:00:00Z',
    },
  ];
  const after = normalizeSite(data);
  assert.equal(after.publications.length, 33);
  const replacement = after.publications.find((p) => p.id === '703');
  assert.equal(replacement?.status, 'Accepted');
  assert.equal(replacement?.title, 'Reviewed title');
  assert.equal(replacement?.html, paper.html);
});

test('new structured drafts/records do not implicitly replace the legacy roster or bibliography', () => {
  const data = source([
    ...snapshot.pages,
    record(500, 'new-member', '<h2>Role</h2><p>Graduate Researchers</p>', 18),
  ]);
  const site = normalizeSite(data);
  assert.equal(site.publications.length, 33);
  assert.ok(site.roster.length);
  assert.ok(site.roster.every((p) => p.id !== '500'));
  assert.equal(site.pi?.id, 16);
});

test('structured member ordering, alumni transition, links and home selection use the same record', () => {
  const data = source([
    record(18, 'people', ''),
    record(6, 'research', ''),
    record(10, 'frontend-home', '<h2>People Source</h2><p>pages</p>'),
    record(
      50,
      'A',
      '<h2>Role</h2><p>Graduate Researchers</p><h2>Status</h2><p>Current</p><h2>Biography</h2><p>Approved bio</p><h2>Education</h2><p>Verified degree</p><h2>Display Order</h2><p>5</p><h2>Featured on Homepage</h2><p>Yes</p><h2>ORCID</h2><p>https://orcid.org/0000-0000-0000-0000</p>',
      18,
    ),
    record(
      51,
      'B',
      '<h2>Role</h2><p>Graduate Researchers</p><h2>Status</h2><p>Current</p><h2>Display Order</h2><p>1</p>',
      18,
    ),
  ]);
  let site = normalizeSite(data);
  assert.deepEqual(
    site.roster.map((p) => p.id),
    ['51', '50'],
  );
  assert.equal(site.featuredPeople[0].id, '50');
  assert.ok(site.roster[1].html.includes('Verified degree'));
  assert.equal(site.roster[1].links?.[0].label, 'ORCID');
  data.pages.find((p) => p.id === 50)!.html = data.pages
    .find((p) => p.id === 50)!
    .html.replace('<p>Current</p>', '<p>Alumni</p>');
  site = normalizeSite(data);
  assert.equal(site.roster.find((p) => p.id === '50')?.alumni, true);
  assert.equal(site.featuredPeople.length, 0);
  data.pages = data.pages.filter((p) => p.parent !== 18);
  assert.deepEqual(normalizeSite(data).roster, []);
});

test('publication posts preserve rich author markings, sort by year and avoid invalid field values', () => {
  const data = source([
    record(10, 'frontend-home', '<h2>Publication Source</h2><p>posts</p>'),
  ]);
  data.categories = [{ id: 1, slug: 'publications', name: 'Publications' }];
  data.tags = [{ id: 2, slug: 'featured', name: 'Featured' }];
  data.posts = [
    {
      ...record(
        40,
        'older',
        '<h2>Year</h2><p>2025</p><h2>Authors</h2><p>A<sup>†</sup></p><h2>DOI</h2><p>10.1234/test</p><h2>Publication Type</h2><p>Preprint</p>',
      ),
      date: '2026-10-12T00:00:00Z',
      categories: [1],
      tags: [2],
    },
    {
      ...record(
        41,
        'newer',
        '<h2>Year</h2><p>2026</p><h2>Journal</h2><p>Journal</p><h2>DOI</h2><p>not-a-doi</p><h2>Link</h2><p>javascript:alert(1)</p>',
      ),
      date: '2026-10-12T00:00:00Z',
      categories: [1],
      tags: [],
    },
  ];
  const site = normalizeSite(data);
  assert.deepEqual(
    site.publications.map((p) => p.year),
    [2026, 2025],
  );
  assert.equal(site.publications[0].doi, undefined);
  assert.equal(site.publications[0].link, undefined);
  assert.ok(site.publications[1].html.includes('<sup>†</sup>'));
  assert.equal(site.publications[1].type, 'Preprint');
  assert.equal(site.publications[1].featured, true);
  assert.equal(site.publications[1].link, 'https://doi.org/10.1234/test');
});

test('WordPress settings, PI sections, recruitment, gallery and featured news normalize without plugins', () => {
  const data = source([
    record(
      10,
      'frontend-home',
      '<h2>Hero Title</h2><p>Approved title</p><h2>Primary Link</h2><p>javascript:alert(1)</p><h2>Join Us CTA Title</h2><p>Join title</p>',
    ),
    record(16, 'news', '<p>Legacy PI</p>'),
    record(
      20,
      'pi-profile',
      '<h2>Name</h2><p>Approved name</p><h2>Biography</h2><p>Approved biography</p><h2>Education</h2><p>Verified education</p><h2>Email</h2><p>pi@example.org</p><h2>CV</h2><p>javascript:alert(1)</p>',
    ),
    record(
      21,
      'join-the-lab',
      '<h2>Intro</h2><p>Approved intro</p><h2>Prospective PhD Students</h2><p>Inquiry instructions</p><h2>Open Positions Notice</h2><p></p>',
    ),
    record(22, 'frontend-contact', '<h2>Email</h2><p>contact@example.org</p>'),
    record(
      23,
      'frontend-footer',
      '<h2>Lab Name</h2><p>Lab</p><h2>Copyright Text</h2><p>Approved credit</p>',
    ),
    record(129, 'lab-photos', ''),
    {
      ...record(
        24,
        'gallery-entry',
        '<h2>Caption</h2><p>Approved caption</p><h2>Photographer</h2><p>Credit</p>',
        129,
      ),
      featuredMedia: 99,
    },
  ]);
  data.media = [
    {
      id: 99,
      url: 'https://people.smu.edu/daslab/files/2026/10/figure.jpg',
      alt: 'Scientific image',
      caption: '',
      width: 100,
      height: 100,
    },
  ];
  data.categories = [{ id: 3, slug: 'news', name: 'News' }];
  data.tags = [{ id: 2, slug: 'featured', name: 'Featured' }];
  data.posts = [
    {
      ...record(
        30,
        'story',
        '<h2>Summary</h2><p>Short</p><h2>Full Story</h2><p>Full story</p>',
      ),
      featuredMedia: 99,
      date: '2026-10-12T00:00:00Z',
      categories: [3],
      tags: [2],
    },
  ];
  const site = normalizeSite(data);
  assert.equal(site.heroTitle, 'Approved title');
  assert.equal(site.primaryHref, '/research');
  assert.equal(site.pi?.id, 20);
  assert.equal(site.piName, 'Approved name');
  assert.equal(site.piDetails[0].title, 'Education');
  assert.deepEqual(site.piLinks, []);
  assert.equal(site.email, 'pi@example.org');
  assert.equal(site.contactEmail, 'contact@example.org');
  assert.equal(site.joinPaths.length, 1);
  assert.equal(site.joinPaths[0].title, 'Prospective PhD Students');
  assert.equal(site.joinCtaTitle, 'Join title');
  assert.equal(site.footerSettings?.copyright, 'Approved credit');
  assert.ok(site.gallery[0].caption.includes('Credit'));
  assert.equal(site.featuredNews[0].summary, 'Short');
  assert.equal(site.featuredNews[0].photo?.alt, 'Scientific image');
});

test('field validation rejects unsafe or malformed values without rejecting an otherwise useful record', () => {
  assert.equal(fieldYear('<p>2026abc</p>'), undefined);
  assert.equal(fieldYear('<p>2026</p>'), 2026);
  assert.equal(fieldOrder('<p>-1</p>'), 0);
  assert.equal(fieldOrder('<p>1.5</p>'), 0);
  assert.equal(fieldDoi('<p>https://doi.org/10.1234/a(b)</p>'), '10.1234/a(b)');
  assert.equal(fieldDoi('<p>10.bad/a</p>'), undefined);
  assert.equal(fieldEmail('bad@example'), undefined);
  assert.equal(fieldEmail('person+lab@example.org'), 'person+lab@example.org');
});

test('publication and update edits survive WordPress typography without disappearing or duplicating', () => {
  const data = source([
    record(
      15,
      'publications',
      '<p>1) A, B. Existing science, <em>Journal</em> <strong>2025</strong>. Published</p>',
    ),
    record(
      392,
      'group-news',
      '<p>The group’s award. <a href="https://example.org/award">Details</a></p>',
    ),
  ]);
  data.categories = [
    { id: 2, slug: 'publications', name: 'Publications' },
    { id: 3, slug: 'news', name: 'News' },
  ];
  data.tags = [{ id: 4, slug: 'featured', name: 'Featured' }];
  const before = normalizeSite(data);
  const publicationHtml = updateContentFields(
    'publications',
    '',
    {
      Authors: 'Approved authors',
      Journal: 'Updated journal',
      Year: '2026',
      DOI: '10.1234/updated',
      Status: 'Published',
    },
    {
      'Managed Publication': 'Yes',
      'Legacy Source': publicationKey(before.publications[0]),
    },
  );
  const updateHtml = updateContentFields(
    'updates',
    '',
    {
      Summary: 'Approved summary',
      'Full Story': 'Updated award details.',
      'External Link': 'https://example.org/new-award',
    },
    { 'Managed Update': 'Yes', 'Legacy Source': updateKey(before.news[0]) },
  );
  data.posts = [
    {
      ...record(800, 'paper', publicationHtml.replaceAll('&quot;', '&#8220;')),
      title: 'Updated scientific title',
      categories: [2],
      tags: [],
      date: '2026-10-13T00:00:00Z',
    },
    {
      ...record(801, 'award', updateHtml.replaceAll('&quot;', '&#8221;')),
      title: 'Updated award',
      categories: [3],
      tags: [4],
      date: '2026-10-13T00:00:00Z',
    },
  ];
  const after = normalizeSite(data);
  assert.equal(after.publications.length, 1);
  assert.equal(after.publications[0].id, '800');
  assert.equal(after.publications[0].doi, '10.1234/updated');
  assert.match(after.publications[0].html, /Approved authors/);
  assert.equal(after.news.length, 1);
  assert.equal(after.news[0].id, '801');
  assert.equal(after.news[0].link, 'https://example.org/new-award');
  assert.equal(after.featuredNews[0].id, '801');
});

test('gallery edits replace original captions and photos instead of losing to duplicate removal', () => {
  const data = source([
    record(
      129,
      'lab-photos',
      '<figure><img class="wp-image-360" src="https://people.smu.edu/daslab/files/old.jpg"><figcaption>Old caption</figcaption></figure>',
    ),
  ]);
  data.media = [
    {
      id: 360,
      url: 'https://people.smu.edu/daslab/files/old.jpg',
      alt: 'Original photo',
      caption: 'Old caption',
    },
    {
      id: 361,
      url: 'https://people.smu.edu/daslab/files/new.jpg',
      alt: 'New photo',
      caption: '',
    },
  ];
  const photo = normalizeSite(data).legacyGallery[0];
  const edited = {
    ...record(
      900,
      'photo',
      updateContentFields(
        'photos',
        '',
        { Caption: 'Approved caption', Photographer: 'Approved credit' },
        { 'Legacy Source': photoKey(photo) },
      ).replaceAll('&quot;', '&#8220;'),
      129,
    ),
    featuredMedia: 360,
  };
  data.pages.push(edited);
  assert.equal(normalizeSite(data).gallery.length, 1);
  assert.equal(
    normalizeSite(data).gallery[0].caption,
    'Approved caption · Approved credit',
  );
  edited.featuredMedia = 361;
  assert.equal(normalizeSite(data).gallery.length, 1);
  assert.equal(normalizeSite(data).gallery[0].url, data.media[1].url);
  edited.html = updateContentFields(
    'photos',
    edited.html,
    { Caption: '' },
    { 'Photo Hidden': 'Yes' },
  );
  assert.equal(normalizeSite(data).gallery.length, 0);
  assert.equal(normalizeSite(data).legacyGallery.length, 1);
});

test('research, facilities and teaching use saved fields and honor removed photos', () => {
  const data = source([
    record(
      6,
      'research',
      updateContentFields('research', '', {
        Overview: 'Approved research overview',
      }),
    ),
    record(308, 'instruments-2', ''),
    record(
      17,
      'contact',
      updateContentFields('teaching', '', {
        Courses: 'Approved course and term',
      }),
    ),
    {
      ...record(
        801,
        'instrument',
        updateContentFields(
          'facilities',
          '',
          {
            Purpose: 'Approved purpose',
            'External Facility Link': 'https://example.org/facility',
          },
          { 'Photo Hidden': 'Yes' },
        ),
        308,
      ),
      featuredMedia: 360,
    },
    {
      ...record(
        802,
        'theme',
        updateContentFields(
          'research',
          '',
          {
            Summary: 'Approved research summary',
            Approach: 'Approved approach',
          },
          { 'Photo Hidden': 'Yes' },
        ),
        6,
      ),
      featuredMedia: 360,
    },
  ]);
  data.media = [
    {
      id: 360,
      url: 'https://people.smu.edu/daslab/files/image.jpg',
      alt: 'Scientific image',
      caption: '',
    },
  ];
  const site = normalizeSite(data);
  assert.match(site.researchHtml, /Approved research overview/);
  assert.equal(site.areas[0].summary, 'Approved research summary');
  assert.equal(site.areas[0].photo, undefined);
  assert.equal(site.instruments[0].photo, undefined);
  assert.match(site.instruments[0].html, /Approved purpose/);
  assert.equal(site.instruments[0].facilityUrl, 'https://example.org/facility');
  assert.match(site.teaching!.html, /Approved course and term/);
});

test('legacy instrument photographs become editable facilities without duplicate public photos', () => {
  const data = source([
    record(
      308,
      'instruments-2',
      '<p><img class="wp-image-316" src="https://people.smu.edu/daslab/files/instrument.jpg"></p>',
    ),
  ]);
  data.media = [
    {
      id: 316,
      url: 'https://people.smu.edu/daslab/files/instrument.jpg',
      alt: '',
      caption: '',
    },
  ];
  const before = normalizeSite(data);
  assert.equal(before.legacyInstrumentPhotos.length, 1);
  assert.equal(before.instrumentPhotos.length, 1);
  const html = updateContentFields(
    'facilities',
    '',
    {
      Manufacturer: 'Approved manufacturer',
      Model: 'Approved model',
      Purpose: 'Verified purpose',
    },
    { 'Legacy Source': photoKey(before.legacyInstrumentPhotos[0]) },
  ).replaceAll('&quot;', '&#8220;');
  const edited = {
    ...record(901, 'instrument', html, 308),
    title: 'Approved instrument',
    featuredMedia: 316,
  };
  data.pages.push(edited);
  const after = normalizeSite(data);
  assert.equal(after.instruments[0].title, 'Approved instrument');
  assert.match(after.instruments[0].html, /Approved model/);
  assert.equal(after.instruments[0].photo?.url, data.media[0].url);
  assert.equal(after.instrumentPhotos.length, 0);
  assert.equal(after.legacyInstrumentPhotos.length, 1);
  edited.html = updateContentFields(
    'facilities',
    edited.html,
    {},
    { 'Photo Hidden': 'Yes' },
  );
  assert.equal(normalizeSite(data).instruments[0].photo, undefined);
  assert.equal(normalizeSite(data).instrumentPhotos.length, 0);
});

test('People header uses the requested WordPress group photo and follows Gallery settings', () => {
  const url =
    'https://people.smu.edu/daslab/files/2026/05/IMG_5076-1024x768.jpeg';
  const data = source([record(129, 'lab-photos', `<p><img src="${url}"></p>`)]);
  assert.equal(normalizeSite(data).peopleHeaderPhoto?.url, url);
  data.media = [
    {
      id: 360,
      url: 'https://people.smu.edu/daslab/files/selected.jpg',
      caption: '',
      alt: 'Group photo',
    },
  ];
  data.pages.push({
    ...record(
      900,
      'header-photo',
      updateContentFields('photos', '', {
        'People Header': 'Yes',
        Caption: 'Approved group photo',
      }),
      129,
    ),
    featuredMedia: 360,
  });
  assert.equal(normalizeSite(data).peopleHeaderPhoto?.url, data.media[0].url);
  data.pages[1].html = updateContentFields(
    'photos',
    data.pages[1].html,
    {},
    { 'Photo Hidden': 'Yes' },
  );
  assert.equal(normalizeSite(data).peopleHeaderPhoto, undefined);
});

test('homepage selection includes only the four requested Science/JACS citations', () => {
  const papers = normalizeSite(source(snapshot.pages)).publications;
  const selected = homepagePublications(papers);
  assert.equal(selected.length, 4);
  assert.deepEqual(
    selected.map((p) => p.year),
    [2019, 2018, 2013, 2012],
  );
  assert.deepEqual(selected.map(publicationJournal), [
    'Science',
    'J. Am. Chem. Soc.',
    'J. Am. Chem. Soc.',
    'J. Am. Chem. Soc.',
  ]);
  assert.ok(selected.every((p) => p.prior));
  assert.ok(!selected.some((p) => /Glomerular Barrier/i.test(p.title)));
  assert.equal(peopleRole('Graduate Students'), 'Graduate Researchers');
});

test('contact presentation uses approved affiliation and removes only duplicated lead fields', () => {
  const html = updateContentFields('contact', '', {
    'Lab Name': 'Approved lab',
    Department: 'Approved department',
    University: 'Approved institution',
    Email: 'contact@example.edu',
    Building: 'Verified building',
    Room: '141',
    'Mailing Address': 'Approved mailing address',
  });
  const site = normalizeSite(source([record(900, 'frontend-contact', html)]));
  assert.equal(site.contactDepartment, 'Approved department');
  assert.equal(site.contactUniversity, 'Approved institution');
  const details = contactDetails(site.contactHtml);
  assert.ok(!details.includes('contact@example.edu'));
  assert.ok(!details.includes('Approved department'));
  assert.match(details, /Verified building/);
  assert.match(details, /Approved mailing address/);
});

test('header settings replace only their own background and support clearing it', () => {
  const data = source([]);
  assert.equal(
    normalizeSite(data).pageHeaders.research.photo?.url,
    researchHeaderUrl,
  );
  data.media = [
    {
      id: 360,
      url: 'https://people.smu.edu/daslab/files/header.jpg',
      caption: '',
      alt: 'Header image',
    },
  ];
  data.pages.push({
    ...record(
      900,
      'frontend-header-publications',
      updateContentFields('publications-header', '', {
        'Header Title': 'Approved publications',
        'Text Style': 'Navy text',
      }),
    ),
    featuredMedia: 360,
  });
  const site = normalizeSite(data);
  assert.equal(site.pageHeaders.publications.photo?.url, data.media[0].url);
  assert.equal(site.pageHeaders.publications.title, 'Approved publications');
  assert.equal(site.pageHeaders.publications.lightText, false);
  assert.equal(site.pageHeaders.news.photo, undefined);
  data.pages.push(
    record(
      901,
      'frontend-header-research',
      updateContentFields('research-header', '', {}, { 'Photo Hidden': 'Yes' }),
    ),
  );
  assert.equal(normalizeSite(data).pageHeaders.research.photo, undefined);
});

test('approved Facilities banner replaces initial setup and respects subsequent admin saves', () => {
  const page = {
    ...record(
      518,
      'frontend-header-facilities',
      '<h2>Text Style</h2><p>White text</p>',
    ),
    featuredMedia: 512,
    modified: '2026-10-13T16:28:59',
  };
  const data = source([page]);
  data.media = [
    {
      id: 512,
      url: 'https://people.smu.edu/daslab/files/old-photo.jpg',
      caption: '',
      alt: '',
    },
  ];
  assert.equal(
    normalizeSite(data).pageHeaders.facilities.photo?.url,
    'https://people.smu.edu/daslab/files/2026/10/facilities.jpg',
  );
  page.modified = '2026-10-13T17:00:00';
  assert.equal(
    normalizeSite(data).pageHeaders.facilities.photo?.url,
    data.media[0].url,
  );
  page.html = '<h2>Photo Hidden</h2><p>Yes</p>';
  assert.equal(normalizeSite(data).pageHeaders.facilities.photo, undefined);
});
