import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.setTimeout(60000);

test('gold cluster renders, pauses and responds to desktop drag and keyboard rotation', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const region = page.locator('.cluster-viewport');
  // The scene is intentionally lazy-loaded; first-load compilation can exceed
  // the default assertion timeout on the development server.
  await expect(region).toHaveClass(/cluster-ready/, { timeout: 15000 });
  const canvas = region.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(page.locator('.cluster-poster')).toBeHidden();
  await expect(page.locator('.cluster-figure button')).toHaveCount(0);
  const turning = await canvas.screenshot();
  await page.waitForTimeout(400);
  expect((await canvas.screenshot()).equals(turning)).toBe(false);
  await region.focus();
  await page.keyboard.press('Space');
  const before = await canvas.screenshot();
  const box = (await region.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 90,
    box.y + box.height / 2 + 30,
    { steps: 8 },
  );
  await page.mouse.up();
  const dragged = await canvas.screenshot();
  expect(dragged.equals(before)).toBe(false);
  await region.focus();
  await page.keyboard.press('ArrowRight');
  expect((await canvas.screenshot()).equals(dragged)).toBe(false);
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');
  const resumed = await canvas.screenshot();
  await page.waitForTimeout(400);
  expect((await canvas.screenshot()).equals(resumed)).toBe(false);
  const appearance = await region.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    border: getComputedStyle(element.parentElement!).borderWidth,
  }));
  expect(appearance).toEqual({ background: 'rgba(0, 0, 0, 0)', border: '0px' });
  const alpha = await canvas.evaluate(
    (element: HTMLCanvasElement) =>
      element.getContext('webgl2')!.getContextAttributes()!.alpha,
  );
  expect(alpha).toBe(true);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('reduced motion rotates automatically without visible controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.cluster-ready')).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole('button', { name: 'Pause', exact: true }),
  ).toHaveCount(0);
  const canvas = page.locator('.cluster-canvas canvas');
  // Allow initial environment rendering and browser compositing to settle.
  await page.waitForTimeout(1000);
  const first = await canvas.screenshot();
  await page.waitForTimeout(500);
  expect((await canvas.screenshot()).equals(first)).toBe(false);
  await expect(page.locator('.cluster-figure button')).toHaveCount(0);
});

test('WebGL unavailable preserves the static scientific fallback and CTAs', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === 'webgl' || type === 'webgl2') return null;
      return (
        original as (
          this: HTMLCanvasElement,
          type: string,
          ...args: unknown[]
        ) => RenderingContext | null
      ).call(this, type, ...args);
    } as typeof original;
  });
  await page.goto('/');
  await expect(page.locator('.cluster-poster')).toBeVisible();
  await expect(page.locator('.cluster-canvas canvas')).toHaveCount(0);
  await expect(page.locator('.hero-actions a')).toHaveCount(2);
  await expect(page.locator('.hero-actions a').first()).toBeVisible();
});

test('mobile limits pixel density and WebGL context loss restores the fallback', async ({
  browser,
}) => {
  const page = await browser.newPage({
    viewport: { width: 375, height: 1000 },
    deviceScaleFactor: 3,
  });
  await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002');
  await expect(page.locator('.cluster-ready')).toBeVisible();
  const canvas = page.locator('.cluster-canvas canvas');
  const density = await canvas.evaluate(
    (element: HTMLCanvasElement) =>
      element.width / element.getBoundingClientRect().width,
  );
  expect(density).toBeLessThanOrEqual(1.01);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await canvas.evaluate((element) =>
    element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })),
  );
  await expect(page.locator('.cluster-poster')).toBeVisible();
  await expect(page.locator('.cluster-canvas')).toHaveCount(0);
  await page.close();
});
