import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes = [
  '/',
  '/research',
  '/people',
  '/people/anindita-das',
  '/publications',
  '/news',
  '/facilities',
  '/gallery',
  '/join',
  '/contact',
  '/teaching',
];

test('academic bibliography supports full citations, filters, figures and copying', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copiedCitation: string }).copiedCitation =
            value;
        },
      },
    });
  });
  await page.goto('/publications');
  const cards = page.locator('.publication-card');
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);
  await expect(cards.first().locator('.prose')).toBeVisible();
  await cards.first().getByRole('button', { name: 'Copy citation:' }).click();
  await expect(cards.first().getByRole('status')).toHaveText('Citation copied');
  expect(
    await page.evaluate(
      () => (window as unknown as { copiedCitation: string }).copiedCitation,
    ),
  ).toBeTruthy();
  await page.getByRole('button', { name: 'Compact', exact: true }).click();
  await expect(cards.first().locator('.citation-details')).toBeVisible();
  await expect(cards.first().locator('.prose')).toBeHidden();
  await page.getByLabel('Research affiliation').selectOption('prior');
  expect(await cards.count()).toBeLessThan(total);
  await expect(cards.first().locator('.affiliation-label')).toHaveText(
    'Prior to SMU',
  );
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(cards).toHaveCount(total);
  await page.getByLabel('Show research figures').check();
  await expect(
    page.locator('.publication-image:visible').first(),
  ).toBeVisible();
  expect(await page.locator('body').innerText()).not.toMatch(/word\s*press/i);
});

test('public pages do not display backend branding', async ({ page }) => {
  test.setTimeout(90000);
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(await page.locator('body').innerText()).not.toMatch(/word\s*press/i);
  }
});

test('team directory filters members and opens the alumni directory', async ({
  page,
}) => {
  await page.goto('/people');
  const name = (
    await page.locator('.person-card:visible h3').first().innerText()
  ).trim();
  await page.getByLabel('Find a team member').fill(name);
  await expect(
    page.locator('.person-card:visible').first().getByRole('heading'),
  ).toHaveText(name);
  await page.getByLabel('Find a team member').fill('no-matching-member-xyz');
  await expect(page.locator('.person-card:visible')).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await page.getByLabel('Member group').selectOption('Alumni');
  await expect(page.locator('.team-alumni')).toHaveAttribute('open', '');
  await expect(page.locator('#alumni .person-card').first()).toBeVisible();
  await page.goto('/people#alumni');
  await expect(page.locator('.team-alumni')).toHaveAttribute('open', '');
});

test('research explanations and group news expose full source details', async ({
  page,
}) => {
  await page.goto('/research');
  const theme = page.locator('.research-theme-detail').first();
  await theme.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(theme.locator('dl')).toBeVisible();
  const figure = page.locator('.research-overview-figure .gallery-grid a');
  await figure.click();
  await expect(page.getByRole('dialog').getByRole('heading')).toContainText(
    'Research figure',
  );
  await page.keyboard.press('Escape');
  await expect(figure).toBeFocused();
  await page.goto('/news');
  await expect(page.locator('main h1')).toHaveText('Group News.');
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Group News', exact: true }),
  ).toHaveAttribute('href', '/news');
  const story = page.locator('.news-story').first();
  await story.locator('summary').click();
  await expect(story.locator('.prose')).toBeVisible();
  const anchor = await page.locator('.news-card h2').first().getAttribute('id');
  await page.goto(`/news#${anchor}`);
  await expect(page.locator('.news-story').first()).toHaveAttribute('open', '');
});

test('core routes have a title, main heading, canonical and working internal links', async ({
  page,
}) => {
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Das Research Group/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `http://localhost:3000${route === '/' ? '' : route}`,
    );
    const links = await page
      .locator('a[href^="/"]')
      .evaluateAll((elements) => elements.map((e) => e.getAttribute('href')));
    expect(
      links.every(
        (href) =>
          href &&
          (routes.includes(href) || href === '/admin' || href.includes('#')),
      ),
    ).toBeTruthy();
  }
});
test('desktop, tablet and mobile avoid horizontal overflow', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [375, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    for (const route of routes) {
      // Layout checks do not need to wait for third-party image requests.
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main h1')).toBeVisible();
      if (route === '/' && width >= 1024) {
        await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
        const navigation = page.getByRole('navigation', {
          name: 'Main navigation',
        });
        for (const name of ['Research', 'Team', 'Publications', 'Join Us'])
          await expect(
            navigation.getByRole('link', { name, exact: false }),
          ).toBeVisible();
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBeTruthy();
    }
  }
});
test('mobile navigation and publication filtering work by keyboard', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menu' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await page.goto('/publications');
  await page
    .getByLabel('Publication year', { exact: true })
    .selectOption('2026');
  await expect(page.locator('.publication-card')).toHaveCount(3);
  await expect(page.locator('.filter-bar [aria-live]')).toHaveText('3 entries');
  await expect(page.locator('.year-heading h2')).toHaveText('2026');
});

test('mobile menu dismisses outside the header and after keyboard focus leaves it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Menu' });
  await toggle.click();
  const cluster = page.locator('.hero-science');
  const bounds = await cluster.boundingBox();
  await cluster.click({ position: { x: 20, y: bounds!.height - 8 } });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  const count = await page
    .getByRole('navigation', { name: 'Main navigation' })
    .locator('a')
    .count();
  for (let i = 0; i < count + 1; i++) await page.keyboard.press('Tab');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('main a').first()).toBeFocused();
});

test('publication previews disclose complete citations by keyboard', async ({
  page,
}) => {
  await page.goto('/');
  const citation = page.locator('.citation-details').first();
  await citation.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(citation).toHaveAttribute('open', '');
  await expect(citation.locator('.prose')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(citation).not.toHaveAttribute('open', '');
});

test('gallery thumbnails keep their dimensions when source images fail', async ({
  page,
}) => {
  await page.route('**/_next/image?**', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await page.goto('/gallery');
  const frame = page.locator('.gallery-media').nth(1);
  await frame.scrollIntoViewIfNeeded();
  await expect(frame.locator('.image-fallback')).toBeVisible();
  const size = await frame.boundingBox();
  expect(size).not.toBeNull();
  expect(size!.width / size!.height).toBeCloseTo(4 / 3, 1);
});

test('mobile controls have comfortable touch targets and motion can be reduced', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/people', '/publications', '/join']) {
    await page.goto(route);
    await expect(page.locator('main h1')).toBeVisible();
    const controls = await page
      .locator(
        '.button, .menu-toggle, .filter-bar select, .section-navigation a, .citation-details summary',
      )
      .evaluateAll((elements) =>
        elements
          .filter((e) => e.getBoundingClientRect().width > 0)
          .map((e) => ({
            height: e.getBoundingClientRect().height,
            text: e.textContent,
          })),
      );
    expect(
      controls.filter((e) => e.height < 44),
      JSON.stringify(controls),
    ).toEqual([]);
  }
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    ),
  ).toBe('auto');
});
test('representative pages meet automated WCAG accessibility checks', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const route of routes) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  }
});
test('authentic WordPress research image loads and desktop/mobile previews are captured', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const heroImage = page.locator('.atomic-section img');
  await expect(heroImage).toBeAttached();
  await heroImage.scrollIntoViewIfNeeded();
  await expect
    .poll(() => heroImage.evaluate((e: HTMLImageElement) => e.naturalWidth))
    .toBeGreaterThan(0);
  for (
    let y = 0;
    y < (await page.evaluate(() => document.body.scrollHeight));
    y += 700
  ) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await expect
    .poll(() =>
      page
        .locator('img')
        .evaluateAll(
          (images) =>
            images.filter((e) => !(e as HTMLImageElement).complete).length,
        ),
    )
    .toBe(0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '.preview/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.preview/home-mobile.png', fullPage: true });
});

test('gallery lightbox supports keyboard navigation, Escape and focus restoration', async ({
  page,
}) => {
  await page.goto('/gallery');
  const opener = page.locator('.gallery-grid a').first();
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('heading')).toContainText('photograph 2');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('gallery search, layouts, thumbnails and mobile swipe work together', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/gallery');
  const images = page.locator('.gallery-grid a');
  const total = await images.count();
  expect(total).toBeGreaterThan(1);
  await page.getByRole('button', { name: 'Compact', exact: true }).click();
  await expect(page.locator('.gallery-grid')).toHaveClass(
    /gallery-grid--compact/,
  );
  await page.getByLabel('Find a photograph').fill('no-matching-photograph-xyz');
  await expect(images).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(images).toHaveCount(total);
  await images.first().click();
  const dialog = page.getByRole('dialog');
  await dialog
    .getByRole('button', { name: 'View photograph 2', exact: true })
    .click();
  await expect(dialog.getByRole('heading')).toContainText('photograph 2');
  const stage = dialog.locator('.gallery-stage');
  await stage.evaluate((element) => {
    const start = new Touch({
      identifier: 1,
      target: element,
      clientX: 250,
      clientY: 200,
    });
    const end = new Touch({
      identifier: 1,
      target: element,
      clientX: 80,
      clientY: 205,
    });
    element.dispatchEvent(
      new TouchEvent('touchstart', { bubbles: true, touches: [start] }),
    );
    element.dispatchEvent(
      new TouchEvent('touchend', { bubbles: true, changedTouches: [end] }),
    );
  });
  await expect(dialog.getByRole('heading')).toContainText(
    `photograph ${total === 2 ? 1 : 3}`,
  );
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(
    'hidden',
  );
  await dialog.getByRole('button', { name: 'Close' }).click();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    'hidden',
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});

test('instrument exhibition supports search, layouts and accessible equipment details', async ({
  page,
}) => {
  await page.goto('/facilities');
  const cards = page.locator('.equipment-card');
  const total = await cards.count();
  expect(total).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.locator('.instrument-showcase')).toHaveClass(
    /instrument-showcase--list/,
  );
  const title = (await cards.first().getByRole('heading').innerText()).trim();
  await page.getByLabel('Find an instrument').fill(title);
  await expect(cards.first().getByRole('heading')).toHaveText(title);
  await page.getByLabel('Find an instrument').fill('no-matching-equipment-xyz');
  await expect(cards).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(cards).toHaveCount(total);
  const opener = cards.first().getByRole('button', { name: 'View details:' });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading')).toHaveText(title);
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
  await expect(
    dialog.getByRole('link', { name: 'Contact the group' }),
  ).toHaveAttribute('href', '/contact');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ['Grid', 'List']) {
      await page.getByRole('button', { name, exact: true }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBeTruthy();
    }
    await cards.first().getByRole('button').click();
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBeTruthy();
    await dialog.getByRole('button', { name: 'Close' }).click();
  }
});

test('publication search and news archive preserve discoverability and deep links', async ({
  page,
}) => {
  await page.goto('/publications');
  const firstTitle = await page
    .locator('.publication-card h3')
    .first()
    .textContent();
  await page.getByLabel('Find a publication').fill(firstTitle!.trim());
  await expect(page.locator('.publication-card')).toHaveCount(1);
  await page.getByLabel('Find a publication').fill('no-matching-paper-xyz');
  await expect(page.getByRole('status')).toContainText('No publications');
  await page.goto('/news');
  const initial = await page.locator('.news-card').count();
  const more = page.getByRole('button', { name: 'Show more updates' });
  if (await more.count()) {
    await more.click();
    expect(await page.locator('.news-card').count()).toBeGreaterThan(initial);
  }
  await page.goto('/news#news-update-13');
  await expect(page.locator('#news-update-13')).toBeVisible();
  await page.getByLabel('Find a lab update').fill('no-matching-news-xyz');
  await expect(page.locator('.news-card')).toHaveCount(0);
});
