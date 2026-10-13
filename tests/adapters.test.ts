import test from 'node:test';
import assert from 'node:assert/strict';
import snapshot from '../src/content/wordpress-snapshot.json';
import {
  allowedImage,
  cleanHtml,
  legacyNews,
  people,
  photos,
  publications,
  safeUrl,
  sections,
  text,
} from '../src/lib/wordpress/adapters';
import type { Media } from '../src/lib/content/types';
import { collection, loadLiveContent } from '../src/lib/wordpress/transport';

test('CMS pagination reads every page with five-minute cache settings', async () => {
  const urls: string[] = [];
  const request: typeof fetch = async (url, init) => {
    urls.push(String(url));
    assert.equal(
      (init as RequestInit & { next: { revalidate: number } }).next.revalidate,
      300,
    );
    assert.ok(init?.signal);
    return new Response(JSON.stringify([{ id: urls.length }]), {
      headers: { 'x-wp-totalpages': '2' },
    });
  };
  assert.deepEqual(await collection('https://cms.example', 'pages', request), [
    { id: 1 },
    { id: 2 },
  ]);
  assert.ok(urls[1].includes('page=2'));
});
test('CMS failure reports unavailability rather than substituting snapshot data', async () => {
  const result = await loadLiveContent(
    'https://cms.example',
    async () => new Response('Unavailable', { status: 503 }),
    () => {},
  );
  assert.equal(result.mode, 'unavailable');
  assert.deepEqual(result.pages, []);
});
test('CMS optional media failure does not erase valid page content', async () => {
  const request: typeof fetch = async (url) => {
    if (String(url).includes('/media?'))
      return new Response('', { status: 403 });
    if (String(url).includes('/pages?'))
      return new Response(
        JSON.stringify([
          {
            id: 6,
            slug: 'research',
            title: { rendered: 'Research' },
            content: { rendered: '<p>Verified text</p>' },
          },
        ]),
      );
    return new Response('[]');
  };
  const result = await loadLiveContent(
    'https://cms.example',
    request,
    () => {},
  );
  assert.equal(result.mode, 'live');
  assert.equal(result.pages[0].html, '<p>Verified text</p>');
  assert.deepEqual(result.media, []);
});

const media = snapshot.media as Media[];
test('embedded featured media survives an optional Media Library outage', async () => {
  const request: typeof fetch = async (url) => {
    if (String(url).includes('/media?'))
      return new Response('', { status: 503 });
    if (String(url).includes('/pages?'))
      return new Response(
        JSON.stringify([
          {
            id: 6,
            slug: 'research',
            featured_media: 360,
            _embedded: {
              'wp:featuredmedia': [
                {
                  id: 360,
                  source_url: 'https://people.smu.edu/daslab/files/res.jpg',
                },
              ],
            },
          },
        ]),
      );
    return new Response('[]');
  };
  const result = await loadLiveContent(
    'https://cms.example',
    request,
    () => {},
  );
  assert.equal(result.mode, 'live');
  assert.equal(result.media[0].id, 360);
  assert.equal(result.pages[0].featuredMedia, 360);
});
const page = (slug: string) => snapshot.pages.find((p) => p.slug === slug);
test('WordPress HTML removes executable markup while preserving author markings', () => {
  const html = cleanHtml(
    '<script>alert(1)</script><form>private form</form><p onclick="evil()"><span style="text-decoration: underline">Student</span><sup>†</sup><sub>18</sub><a href="javascript:evil()">link</a><img src=x onerror=evil()></p>',
  );
  assert.ok(!/script|onclick|javascript|onerror|<form|<img/.test(html));
  assert.ok(html.includes('<u>Student</u>'));
  assert.ok(html.includes('<sup>†</sup>'));
  assert.ok(html.includes('<sub>18</sub>'));
});
test('links and image sources exclude unsafe schemes and unapproved image hosts', () => {
  assert.equal(safeUrl('javascript:alert(1)'), undefined);
  assert.equal(safeUrl('//attacker.example'), undefined);
  assert.equal(
    allowedImage('https://people.smu.edu/another-lab/image.jpg'),
    undefined,
  );
  assert.equal(allowedImage('https://evil.example/image.png'), undefined);
  assert.equal(
    allowedImage('https://people.smu.edu/daslab/files/test.jpg'),
    'https://people.smu.edu/daslab/files/test.jpg',
  );
});
test('real publication records retain preprints, provenance and citations', () => {
  const result = publications(page('publications'), media);
  assert.equal(result.length, 33);
  assert.equal(result[0].year, 2026);
  assert.equal(result[0].status, 'Under review');
  assert.equal(
    result[0].title,
    'Reversible Site-Selective Editing of Atomically Precise Au6 Nanoclusters through Controlled Oxidation/Reduction',
  );
  assert.ok(
    result
      .find((p) => p.id === 'legacy-30')
      ?.link?.includes('10.1021/acs.chemmater.5c02450'),
  );
  assert.ok(result.find((p) => p.id === 'legacy-21')?.prior);
  assert.equal(result.find((p) => p.id === 'legacy-22')?.prior, false);
  assert.ok(result.some((p) => p.html.includes('<u>')));
  assert.ok(result.every((p) => text(p.html).length > 30));
});
test('legacy roster respects category boundaries and preserves profiles embedded in images', () => {
  const result = people(page('people'), media);
  assert.ok(
    result.some(
      (p) =>
        p.name === 'Ayomide Benjamen Oladele' &&
        p.role === 'Graduate Students' &&
        !p.alumni,
    ),
  );
  assert.ok(
    result.some(
      (p) =>
        p.name === 'Joshua Plank, Ph.D' && p.role === 'Postdoctoral Fellows',
    ),
  );
  assert.ok(
    result.some(
      (p) => p.name === 'Spencer Brown' && p.role === 'Undergraduate Students',
    ),
  );
  assert.equal(result.filter((p) => p.alumni).length, 7);
  assert.ok(result.some((p) => !p.name && p.photo));
});
test('structured member pages support biographies, research interests, status and contact', () => {
  const result = people(
    undefined,
    [],
    [
      {
        id: 1,
        title: 'Example Researcher',
        slug: 'example',
        html: '<h2>Role</h2><p>Graduate researcher</p><h2>Status</h2><p>Alumni</p><h2>Biography</h2><p>A biography.</p><h2>Research interests</h2><p>Materials</p><h2>Email</h2><p>person@example.org</p>',
        link: '',
        modified: '',
        featuredMedia: 0,
      },
    ],
  );
  assert.equal(result[0].alumni, true);
  assert.equal(result[0].email, 'person@example.org');
  assert.equal(result[0].interests, 'Materials');
  assert.ok(result[0].html.includes('A biography.'));
});
test('legacy news never substitutes page modification dates for event dates', () => {
  const result = legacyNews(page('group-news'));
  assert.ok(result.length > 15);
  assert.ok(result.every((n) => n.date === undefined));
  assert.ok(result[0].title.includes('Benjamen Oladele'));
});
test('gallery resolves WordPress media and caption text', () => {
  const result = photos(page('lab-photos')?.html ?? '', media);
  assert.ok(result.length > 10);
  assert.ok(result.some((p) => p.caption.includes('REU students')));
  assert.ok(result.every((p) => p.width > 0 && p.height > 0));
});
test('missing content and optional fields return safe empty collections', () => {
  assert.deepEqual(people(undefined, []), []);
  assert.deepEqual(publications(undefined, []), []);
  assert.deepEqual(legacyNews(undefined), []);
  assert.deepEqual(photos('<img src="javascript:evil()">', []), []);
  assert.equal(
    text(sections('<h2>Hero Title</h2><p>Atomic precision</p>')['hero title']),
    'Atomic precision',
  );
});
