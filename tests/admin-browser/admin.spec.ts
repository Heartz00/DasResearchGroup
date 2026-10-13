import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.beforeEach(async ({ request }) => {
  await request.get('http://127.0.0.1:3019/__test/reset');
});
async function signIn(
  page: import('@playwright/test').Page,
  username = 'editor',
) {
  await page.goto('/admin/login');
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page
    .getByLabel('Access key', { exact: true })
    .fill('abcdefghijklmnopqrstuvwx');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test('anonymous visitors are redirected and login is accessible', async ({
  page,
}) => {
  await page.goto('/admin/pages/6');
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test('authenticated editing preserves markup, saves to WordPress and signs out', async ({
  page,
  request,
}) => {
  await signIn(page);
  await page.goto('/admin/pages/6');
  await expect(page.locator('input[name="content"]')).toHaveValue(
    /<!-- wp:paragraph -->/,
  );
  await page.getByLabel('Title', { exact: true }).fill('Reviewed research');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('status')).toContainText('Changes saved');
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes).toHaveLength(1);
  expect(state.writes[0].data.title).toBe('Reviewed research');
  expect(state.writes[0].data.content).toContain('<!-- wp:paragraph -->');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin/pages/6');
  await expect(page).toHaveURL(/\/admin\/login$/);
});
test('concurrent WordPress edits are rejected without losing typed content', async ({
  page,
  request,
}) => {
  await signIn(page);
  await page.goto('/admin/pages/6');
  await page.getByLabel('Title', { exact: true }).fill('Unsaved edits');
  await request.get('http://127.0.0.1:3019/__test/conflict');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText(
    'changed in WordPress',
  );
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(
    'Unsaved edits',
  );
  expect(
    (await (await request.get('http://127.0.0.1:3019/__test/state')).json())
      .writes,
  ).toHaveLength(0);
});
test('WordPress permission rejection is shown and mobile avoids overflow', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await signIn(page);
  await page.goto('/admin/pages/6');
  await request.get('http://127.0.0.1:3019/__test/deny');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText(
    'does not have permission',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (await (await request.get('http://127.0.0.1:3019/__test/state')).json())
      .writes,
  ).toHaveLength(0);
});
test('image upload rejects disguised SVG and accepts a valid PNG', async ({
  page,
  request,
}) => {
  await signIn(page);
  await page.goto('/admin/media/new');
  await page.getByLabel('Image', { exact: true }).setInputFiles({
    name: 'fake.png',
    mimeType: 'image/png',
    buffer: Buffer.from('<svg/>'),
  });
  await page.getByRole('button', { name: 'Upload photo' }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText(
    'Upload a JPEG',
  );
  expect(
    (await (await request.get('http://127.0.0.1:3019/__test/state')).json())
      .writes,
  ).toHaveLength(0);
  await page.getByLabel('Image', { exact: true }).setInputFiles({
    name: 'figure.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2wAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await page.getByLabel('Alternative text').fill('Scientific figure');
  await page.getByRole('button', { name: 'Upload photo' }).click();
  await expect(page).toHaveURL(/\/admin\/media\/601\?saved=1/);
  expect(
    (await (await request.get('http://127.0.0.1:3019/__test/state')).json())
      .writes[0].data.image,
  ).toBe(true);
});
test('owner assigns access while an ordinary editor cannot manage users', async ({
  page,
  request,
}) => {
  await signIn(page);
  await page.goto('/admin/access');
  await expect(
    page.getByText(
      'Your account can edit content but cannot manage other accounts.',
    ),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Update access' })).toHaveCount(
    0,
  );
  await page.goto('/admin');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await signIn(page, 'owner');
  await page.goto('/admin/access');
  await page.getByLabel('Access level').first().selectOption('editor');
  await page.getByRole('button', { name: 'Update access' }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Access updated',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0]).toEqual({
    path: 'users/10',
    data: { roles: ['editor'] },
  });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test('revoked owner capability blocks stale access-management forms', async ({
  page,
  request,
}) => {
  await signIn(page, 'owner');
  await page.goto('/admin/access');
  await request.get('http://127.0.0.1:3019/__test/revoke-owner');
  await page.getByRole('button', { name: 'Update access' }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText(
    'cannot assign roles',
  );
  expect(
    (await (await request.get('http://127.0.0.1:3019/__test/state')).json())
      .writes,
  ).toHaveLength(0);
});
test('member templates use plain fields and save safely escaped WordPress content', async ({
  page,
  request,
}) => {
  await signIn(page);
  await page.goto('/admin/pages/new?template=member');
  await page.getByLabel('Title', { exact: true }).fill('Member draft');
  await page.getByLabel('Role', { exact: true }).fill('Graduate Researchers');
  await page
    .getByLabel('Biography', { exact: true })
    .fill('Research & teaching <draft>');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Changes saved',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0].data.content).toContain(
    'Research &amp; teaching &lt;draft&gt;',
  );
  expect(state.writes[0].data.status).toBe('draft');
});
test('authorized owner creates a content account without exposing its password', async ({
  page,
  request,
}) => {
  await signIn(page, 'owner');
  await page.goto('/admin/access');
  await page.getByLabel('Full name').fill('New Editor');
  await page.getByLabel('Username', { exact: true }).fill('new-editor');
  await page.getByLabel('Email address').fill('new-editor@example.edu');
  await page.getByLabel('Access level').last().selectOption('editor');
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Account created in WordPress',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0]).toEqual({
    path: 'users',
    data: {
      username: 'new-editor',
      email: 'new-editor@example.edu',
      name: 'New Editor',
      roles: ['editor'],
    },
  });
});
test('task dashboard and named navigation support a simple mobile editing flow', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page);
  await expect(
    page.getByRole('heading', { name: 'Welcome, Lab.' }),
  ).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.site-footer')).toBeHidden();
  const sidebar = page.getByRole('navigation', { name: 'Website management' });
  const expectedGroups = [
    ['Your website', ['Overview']],
    [
      'Content',
      [
        'PI Profile',
        'Team Members',
        'Research',
        'Publications',
        'Group News',
        'Instruments',
        'Gallery',
        'Join the Lab',
        'Teaching',
      ],
    ],
    ['Site Settings', ['Homepage', 'Page Headers', 'Contact', 'Footer']],
    ['Administration', ['Users & Access', 'Help']],
  ] as const;
  for (const [name, labels] of expectedGroups) {
    const group = sidebar.getByRole('region', { name, exact: true });
    await expect(group).toBeVisible();
    await expect(group.getByRole('link')).toHaveText([...labels]);
  }
  await expect(sidebar.getByRole('link')).toHaveCount(16);
  await expect(
    sidebar.getByRole('link', { name: 'Homepage', exact: true }),
  ).toHaveAttribute('href', '/admin/manage/homepage');
  await expect(
    sidebar.getByRole('link', { name: 'Users & Access', exact: true }),
  ).toHaveAttribute('href', '/admin/access');
  await expect(
    sidebar.getByRole('link', { name: 'Help', exact: true }),
  ).toHaveAttribute('href', '/admin/extend');
  await page.screenshot({
    path: '.preview/admin-dashboard-desktop.png',
    fullPage: true,
  });
  await page
    .locator('.admin-task-card')
    .filter({ hasText: /^Research/ })
    .click();
  await expect(page).toHaveURL(/\/admin\/manage\/research$/, {
    timeout: 15000,
  });
  await expect(
    page
      .getByRole('navigation', { name: 'Website management' })
      .getByRole('link', { name: 'Research', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page
    .getByRole('link', { name: 'Edit research overview', exact: true })
    .click();
  await page
    .getByLabel('Overview', { exact: true })
    .fill('Updated research introduction.');
  await expect(
    page.getByRole('button', { name: /HTML|formatting and images/i }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', {
      name: 'Open advanced visual editor ↗',
      exact: true,
    }),
  ).toHaveCount(0);
  expect(
    await page
      .locator('textarea')
      .evaluateAll((fields) =>
        fields.some((field) =>
          /<\/?[a-z][^>]*>|<!--/i.test((field as HTMLTextAreaElement).value),
        ),
      ),
  ).toBe(false);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Changes saved',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0].data.content).toContain(
    '<h2>Overview</h2><p>Updated research introduction.</p>',
  );
  expect(state.writes[0].data.content).toContain('<!-- wp:paragraph -->');
  await page.setViewportSize({ width: 375, height: 1000 });
  const chooser = page.getByRole('button', { name: 'Choose a section' });
  await expect(
    page.getByRole('navigation', { name: 'Website management' }),
  ).toBeHidden();
  await chooser.click();
  await expect(
    page.getByRole('navigation', { name: 'Website management' }),
  ).toBeVisible();
  await expect(chooser).toContainText('Current: Research');
  await sidebar.getByRole('link', { name: 'Research', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(chooser).toBeFocused();
  await expect(sidebar).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: '.preview/admin-editor-mobile.png',
    fullPage: true,
  });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('PI profile can be changed and a portrait selected without leaving the content workspace', async ({
  page,
  request,
}) => {
  await request.get('http://127.0.0.1:3019/__test/native');
  await signIn(page);
  await page
    .getByRole('link', { name: 'Edit PI information', exact: true })
    .click();
  await expect(page.getByLabel('Biography', { exact: true })).toHaveValue(
    'Verified PI biography.',
  );
  await page
    .getByLabel('Biography', { exact: true })
    .fill('Updated PI biography with a new research direction.');
  await page.getByLabel('Choose a photo', { exact: true }).selectOption('360');
  await page
    .getByLabel('Education', { exact: true })
    .fill('Verified education information.');
  await page
    .getByRole('button', { name: 'Preview content', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Content preview' }),
  ).toContainText('Updated PI biography');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Changes saved',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0].data.slug).toBe('pi-profile');
  expect(state.writes[0].data.featured_media).toBe(360);
  expect(state.writes[0].data.content).toContain('Updated PI biography');
  expect(state.writes[0].data.content).toContain('3215 Daniel Avenue');
  await page
    .locator('.editor-card')
    .filter({
      has: page.getByRole('heading', { name: 'Version history', exact: true }),
    })
    .locator('summary')
    .first()
    .click();
  await page
    .getByRole('button', { name: 'Restore this version', exact: true })
    .click();
  await expect(page.getByLabel('Biography', { exact: true })).toHaveValue(
    'Earlier approved biography.',
  );
  await expect(
    page.getByRole('link', { name: /advanced visual editor/ }),
  ).toHaveCount(0);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test('member biography, photo and alumni status can be edited in one form', async ({
  page,
  request,
}) => {
  await request.get('http://127.0.0.1:3019/__test/native');
  await signIn(page);
  await page.goto('/admin/manage/people');
  await expect(
    page.getByRole('link', { name: /Member profile — name needed/ }),
  ).toBeVisible();
  await page.getByRole('link', { name: /Existing Member/ }).click();
  await page
    .getByLabel('Biography', { exact: true })
    .fill('Accessible member biography.');
  await page.getByLabel('Choose a photo', { exact: true }).selectOption('360');
  await page
    .getByLabel('Current / alumni status', { exact: true })
    .selectOption('Alumni');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Changes saved',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0].data.parent).toBe(18);
  expect(state.writes[0].data.content).toContain('Accessible member biography');
  expect(state.writes[0].data.content).toContain(
    '<h2>Status</h2><p>Alumni</p>',
  );
  expect(state.writes[0].data.featured_media).toBe(360);
});
test('lab updates have a title, story, draft visibility and featured selection', async ({
  page,
  request,
}) => {
  await request.get('http://127.0.0.1:3019/__test/native');
  await signIn(page);
  await page
    .getByRole('link', { name: 'Write a lab update', exact: true })
    .click();
  await page
    .getByLabel('Update title', { exact: true })
    .fill('A new lab milestone');
  await page
    .getByLabel('Full Story', { exact: true })
    .fill('Approved lab update.');
  await page
    .getByLabel('Summary', { exact: true })
    .fill('Approved short summary.');
  await page.getByLabel('Update Type', { exact: true }).selectOption('Events');
  await page
    .getByLabel('Author / Credit', { exact: true })
    .fill('Das Research Group');
  await page
    .getByLabel('Photo Caption', { exact: true })
    .fill('Approved event photo.');
  await page.getByLabel('Upload a photo', { exact: true }).setInputFiles({
    name: 'group-news.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2wAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await page
    .getByLabel('Describe the new photo', { exact: true })
    .fill('Researchers at a lab event');
  await page.getByLabel('Feature on the homepage', { exact: true }).check();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Changes saved',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  const saved = state.writes.find(
    (w: { data: { title?: string } }) => w.data.title === 'A new lab milestone',
  );
  expect(saved.data.status).toBe('draft');
  expect(saved.data.categories).toContain(3);
  expect(saved.data.tags).toContain(4);
  expect(saved.data.featured_media).toBeGreaterThan(0);
  expect(saved.data.content).toContain('Approved lab update.');
  expect(saved.data.content).toContain('Approved event photo.');
  expect(saved.data.content).toContain('Events');
  expect(saved.data.content).toContain('Das Research Group');
});

test('existing gallery photographs can be edited without duplicating the source entry', async ({
  page,
  request,
}) => {
  await request.get('http://127.0.0.1:3019/__test/native');
  await signIn(page, 'gallery-editor');
  await page.goto('/admin/manage/photos');
  await page.getByRole('link', { name: /Original gallery caption/ }).click();
  await expect(page.getByLabel('Caption', { exact: true })).toHaveValue(
    'Original gallery caption',
  );
  await page
    .getByLabel('Caption', { exact: true })
    .fill('Approved gallery caption');
  await page.getByLabel('Team Header', { exact: true }).selectOption('Yes');
  await page
    .getByLabel('Photographer', { exact: true })
    .fill('Approved photographer');
  await page.getByLabel('Choose a photo', { exact: true }).selectOption('360');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Changes saved',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0].data.parent).toBe(129);
  expect(state.writes[0].data.featured_media).toBe(360);
  expect(state.writes[0].data.content).toContain('Approved gallery caption');
  expect(state.writes[0].data.content).toContain(
    '<h2>People Header</h2><p>Yes</p>',
  );
  expect(state.writes[0].data.content).toContain('Legacy Source');
  await page.goto('/admin/manage/photos');
  await expect(page.locator('.managed-item')).toHaveCount(1);
});

test('facilities prepopulates existing instrument photos and saves approved details', async ({
  page,
  request,
}) => {
  await request.get('http://127.0.0.1:3019/__test/native');
  await signIn(page, 'facilities-editor');
  await page.goto('/admin/manage/facilities');
  await page.getByRole('link', { name: /Instrument photograph 1/ }).click();
  await expect(page.getByLabel('Manufacturer', { exact: true })).toHaveValue(
    '',
  );
  await page
    .getByLabel('Name / title', { exact: true })
    .fill('Approved instrument');
  await page
    .getByLabel('Manufacturer', { exact: true })
    .fill('Approved manufacturer');
  await page.getByLabel('Model', { exact: true }).fill('Verified model');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('main').getByRole('status')).toContainText(
    'Changes saved',
  );
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  expect(state.writes[0].data.parent).toBe(308);
  expect(state.writes[0].data.content).toContain('Verified model');
  expect(state.writes[0].data.content).toContain('Legacy Source');
  await page.goto('/admin/manage/facilities');
  await expect(page.locator('.managed-item')).toHaveCount(1);
  await expect(
    page.getByRole('link', { name: /Approved instrument/ }),
  ).toBeVisible();
});

test('page headers support media selection and upload through the normal WordPress workflow', async ({
  page,
  request,
}) => {
  await request.get('http://127.0.0.1:3019/__test/native');
  await signIn(page, 'header-editor');
  await page.goto('/admin/headers');
  await expect(page.locator('.admin-task-card')).toHaveCount(4);
  for (const section of ['research', 'publications', 'news', 'facilities']) {
    await page.goto(`/admin/manage/${section}-header`);
    await page
      .getByLabel('Header Title', { exact: true })
      .fill(`Approved ${section}`);
    await page
      .getByLabel('Text Style', { exact: true })
      .selectOption('White text');
    await page
      .getByLabel('Visibility', { exact: true })
      .selectOption('publish');
    if (section === 'research') {
      await page.getByLabel('Upload a photo', { exact: true }).setInputFiles({
        name: 'header.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2wAAAABJRU5ErkJggg==',
          'base64',
        ),
      });
      await page
        .getByLabel('Describe the new photo', { exact: true })
        .fill('Scientific header background');
    } else
      await page
        .getByLabel('Choose a photo', { exact: true })
        .selectOption('360');
    await page
      .getByRole('button', { name: 'Save changes', exact: true })
      .click();
    await expect(page.locator('main').getByRole('status')).toContainText(
      'Changes saved',
    );
  }
  const state = await (
    await request.get('http://127.0.0.1:3019/__test/state')
  ).json();
  for (const section of ['research', 'publications', 'news', 'facilities']) {
    const record = state.writes.find(
      (write: { data: { slug?: string } }) =>
        write.data.slug === `frontend-header-${section}`,
    );
    expect(record.data.featured_media).toBeGreaterThan(0);
    expect(record.data.status).toBe('publish');
    expect(record.data.content).toContain(`Approved ${section}`);
  }
});
