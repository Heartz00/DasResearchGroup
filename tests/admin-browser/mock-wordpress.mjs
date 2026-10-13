import { createServer } from 'node:http';
let modified = '2026-10-12T12:00:00',
  writes = [],
  denied = false;
let role = 'contributor',
  ownerRevoked = false;
let native = false,
  managed = [],
  nextId = 700;
const nativePages = () => [
  {
    ...record(),
    content: {
      raw:
        record().content.raw +
        '<p>Current Funding Support</p><img src="https://people.smu.edu/daslab/files/2025/08/website-grants.jpg" width="1280" height="720">',
    },
  },
  {
    id: 308,
    slug: 'instruments-2',
    title: { raw: 'Instruments' },
    status: 'publish',
    modified_gmt: modified,
    content: {
      raw: '<p><img src="https://people.smu.edu/daslab/files/2022/04/instrument.jpg"></p>',
    },
  },
  {
    id: 129,
    slug: 'lab-photos',
    title: { raw: 'Lab photos' },
    status: 'publish',
    modified_gmt: modified,
    content: {
      raw: '<figure><img src="https://people.smu.edu/daslab/files/2022/05/gallery.jpg"><figcaption>Original gallery caption</figcaption></figure>',
    },
  },
  {
    id: 16,
    slug: 'news',
    title: { raw: 'About Dr. Das' },
    status: 'publish',
    modified_gmt: modified,
    featured_media: 0,
    content: {
      raw: '<p>Verified PI biography.</p><p>Contact:</p><p>Email: pi@example.edu</p><p>Mailing Address:</p><p>3215 Daniel Avenue</p><p>Office: Science Room 141</p><p>Interested undergraduate students can contact the PI.</p>',
    },
  },
  {
    id: 18,
    slug: 'people',
    title: { raw: 'People' },
    status: 'publish',
    modified_gmt: modified,
    content: {
      raw: '<p>Graduate Students</p><p>Existing Member</p><img src="https://people.smu.edu/daslab/files/2022/05/member.jpg" alt="">',
      rendered:
        '<p>Graduate Students</p><p>Existing Member</p><p><img src="https://people.smu.edu/daslab/files/2022/05/member.jpg" alt=""></p>',
    },
  },
  {
    id: 15,
    slug: 'publications',
    title: { raw: 'Publications' },
    status: 'publish',
    modified_gmt: modified,
    content: {
      raw: '<p>1) A, B. Existing science, <em>Journal</em> <strong>2025</strong>. Published</p>',
    },
  },
];
const record = () => ({
  id: 6,
  title: { raw: 'Research' },
  content: {
    raw: '<!-- wp:paragraph --><p>Original research.</p><!-- /wp:paragraph -->',
  },
  excerpt: { raw: '' },
  slug: 'research',
  status: 'publish',
  modified_gmt: modified,
  featured_media: 360,
  parent: 0,
});
createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:3019');
  res.setHeader('Content-Type', 'application/json');
  const send = (value, status = 200) => {
    res.statusCode = status;
    res.end(JSON.stringify(value));
  };
  if (url.pathname === '/') return send({ test: true });
  if (url.pathname === '/__test/reset') {
    native = false;
    managed = [];
    nextId = 700;
    modified = '2026-10-12T12:00:00';
    writes = [];
    denied = false;
    role = 'contributor';
    ownerRevoked = false;
    return send({ ok: true });
  }
  if (url.pathname === '/__test/conflict') {
    modified = '2026-10-12T12:10:00';
    return send({ ok: true });
  }
  if (url.pathname === '/__test/deny') {
    denied = true;
    return send({ ok: true });
  }
  if (url.pathname === '/__test/state') return send({ writes });
  if (url.pathname === '/__test/revoke-owner') {
    ownerRevoked = true;
    return send({ ok: true });
  }
  const auth = Buffer.from(
    // Individual credentials are tested below; fixture toggles are loopback-only.
    (req.headers.authorization || '').replace('Basic ', ''),
    'base64',
  ).toString();
  if (url.pathname === '/__test/native') {
    native = true;
    return send({ ok: true });
  }
  if (url.pathname === '/image.png') {
    res.setHeader('Content-Type', 'image/png');
    return res.end(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2wAAAABJRU5ErkJggg==',
        'base64',
      ),
    );
  }
  if (
    ![
      'editor:abcdefghijklmnopqrstuvwx',
      'gallery-editor:abcdefghijklmnopqrstuvwx',
      'facilities-editor:abcdefghijklmnopqrstuvwx',
      'header-editor:abcdefghijklmnopqrstuvwx',
      'owner:abcdefghijklmnopqrstuvwx',
    ].includes(auth)
  )
    return send({ code: 'rest_not_logged_in' }, 401);
  const path = url.pathname.replace('/wp-json/wp/v2/', '');
  if (path === 'users/me')
    return send({
      id: 9,
      name: 'Lab Editor',
      capabilities: {
        edit_posts: true,
        edit_pages: true,
        upload_files: true,
        publish_pages: true,
        publish_posts: true,
        manage_categories: true,
        ...(auth.startsWith('owner:') && !ownerRevoked
          ? { list_users: true, create_users: true, promote_users: true }
          : {}),
      },
    });
  if (req.method === 'POST') {
    if (denied) return send({ code: 'rest_cannot_edit' }, 403);
    let body = '';
    for await (const chunk of req) body += chunk;
    if (
      path === 'media' &&
      req.headers['content-type']?.includes('multipart/form-data')
    ) {
      writes.push({ path, data: { image: body.includes('image/png') } });
      return send({ id: 601 });
    }
    const data = JSON.parse(body);
    if (native && !path.startsWith('users')) {
      const kind = path.split('/')[0];
      const id = Number(path.split('/')[1]) || nextId++;
      const previous =
        managed.find((r) => r.id === id) ||
        nativePages().find((r) => r.id === id) ||
        {};
      const value = {
        ...previous,
        ...data,
        id,
        kind,
        title: { raw: data.title || previous.title?.raw || '' },
        content: { raw: data.content || previous.content?.raw || '' },
        modified_gmt: modified,
        date_gmt: '2026-10-12T12:00:00',
      };
      managed = managed.filter((r) => r.id !== id);
      managed.push(value);
      writes.push({ path, data });
      return send(value);
    }
    if (path.startsWith('users')) {
      if (!auth.startsWith('owner:') || ownerRevoked)
        return send({ code: 'rest_cannot_edit' }, 403);
      if (path === 'users/10') role = data.roles[0];
      writes.push({ path, data: { ...data, password: undefined } });
      return send({
        id: path === 'users' ? 11 : 10,
        name: data.name || 'Team Member',
        roles: data.roles,
      });
    }
    writes.push({ path, data });
    return send({ ...record(), ...data, title: { raw: data.title }, id: 6 });
  }
  if (path === 'pages/6') return send(record());
  if (native) {
    if (path === 'pages')
      return send([
        ...nativePages().filter((p) => !managed.some((r) => r.id === p.id)),
        ...managed.filter((r) => r.kind === 'pages'),
      ]);
    if (path === 'posts')
      return send(managed.filter((r) => r.kind === 'posts'));
    if (path === 'categories')
      return send([
        { id: 2, name: 'Publications', slug: 'publications' },
        { id: 3, name: 'Lab updates', slug: 'news' },
      ]);
    if (path === 'tags')
      return send([{ id: 4, name: 'Featured', slug: 'featured' }]);
    if (path === 'media')
      return send([
        {
          id: 360,
          title: { raw: 'Lab portrait' },
          source_url: 'http://127.0.0.1:3019/image.png',
          alt_text: 'Lab portrait',
          caption: { raw: '' },
        },
      ]);
    if (path.endsWith('/revisions')) {
      const current = managed.find((r) => String(r.id) === path.split('/')[1]);
      return send(
        current
          ? [
              {
                id: 900,
                title: current.title,
                content: {
                  raw: current.content.raw.replace(
                    'Updated PI biography with a new research direction.',
                    'Earlier approved biography.',
                  ),
                },
                modified_gmt: '2026-10-11T12:00:00',
              },
            ]
          : [],
      );
    }
  }
  if (path === 'users')
    return send([
      { id: 9, name: 'Owner', roles: ['administrator'] },
      {
        id: 10,
        name: 'Team Member',
        email: 'member@example.edu',
        roles: [role],
      },
    ]);
  if (path === 'users/10')
    return send({ id: 10, name: 'Team Member', roles: [role] });
  if (path === 'media/601')
    return send({
      id: 601,
      title: { raw: 'Uploaded image' },
      slug: 'uploaded-image',
      status: 'inherit',
      alt_text: 'Scientific figure',
      content: { raw: '' },
      caption: { raw: '' },
      source_url: 'http://127.0.0.1:3019/image.png',
    });
  if (path === 'pages/6/revisions') return send([]);
  if (path === 'pages') {
    res.setHeader('X-WP-TotalPages', '1');
    return send([record()]);
  }
  if (['posts', 'media', 'categories', 'tags'].includes(path)) return send([]);
  return send({ code: 'rest_not_found' }, 404);
}).listen(3019, '127.0.0.1');
