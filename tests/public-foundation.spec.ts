import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const publicRoutes = [
  '/',
  '/daycare',
  '/daycare/about',
  '/daycare/programs',
  '/daycare/parent-info',
  '/daycare/calendar',
  '/daycare/contact',
  '/daycare/parents',
  '/eduhub',
  '/eduhub/about',
  '/eduhub/programs',
  '/eduhub/programs/diploma',
  '/eduhub/contact',
  '/blog',
  '/blog/when-should-my-child-start-nursery',
  '/contact',
  '/workspace',
];

const staticImageRoutes = ['/daycare/about', '/eduhub/about', '/eduhub/programs'];

for (const route of publicRoutes) {
  test(`${route} renders without confirmed accessibility or overflow failures`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1_500);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
    const overflow = await page.evaluate(() => ({
      amount: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      elements: [...document.querySelectorAll<HTMLElement>('body *')].filter(element => {
        const box = element.getBoundingClientRect();
        return box.right > document.documentElement.clientWidth + 1 || box.left < -1;
      }).slice(0, 8).map(element => { const box = element.getBoundingClientRect(); return `${element.tagName.toLowerCase()}.${element.className}[${box.left.toFixed(1)},${box.right.toFixed(1)};${getComputedStyle(element).transform}]`; }),
    }));
    expect(overflow.amount, `horizontal overflow on ${route}: ${overflow.elements.join(', ')}`).toBeLessThanOrEqual(1);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'best-practice']).analyze();
    expect(results.violations, `axe violations on ${route}`).toEqual([]);
  });
}

for (const route of staticImageRoutes) {
  test(`${route} renders stable imagery from local semantic slots`, async ({ page }) => {
    await page.route(/(?:supabase\.co|images\.unsplash\.com)/, request => request.abort());
    await page.goto(route, { waitUntil: 'networkidle' });
    const images = page.locator('main img');
    await expect(images.first()).toBeVisible();
    const sources = await images.evaluateAll(elements => elements.map(element => (element as HTMLImageElement).getAttribute('src') ?? ''));
    expect(sources.every(source => source.includes('/images/slots/')), `non-local image on ${route}: ${sources.join(', ')}`).toBe(true);
  });
}

test('shared Parent Portal remains separate from child-linked accounts', async ({ page }) => {
  await page.goto('/daycare/parents');
  await expect(page.getByRole('heading', { name: 'Family Portal' })).toBeVisible();
  await expect(page.getByLabel('Parent Portal PIN')).toBeVisible();
  await expect(page.getByText('No individual child profile is required')).toBeVisible();
});

test('local workspace exposes all four functional role previews', async ({ page }) => {
  await page.goto('/workspace');
  for (const role of ['Owner', 'Admin', 'Teacher', 'Parent']) await expect(page.getByRole('button', { name: new RegExp(role) })).toBeVisible();
});
