import { expect, test } from '@playwright/test';
import { countryPath, sitePagePaths } from '../../web/lib/site-countries';
import { completedDraft as draft } from './helpers';

test(
  'home page leads into the questionnaire',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/uk');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot('home.png');
    await page.getByRole('link', { name: '开始模拟' }).click();
    await expect(page).toHaveURL('/uk/simulate');
    await expect(page.getByRole('heading', { name: '基本信息' })).toBeVisible();
    await expect(page).toHaveScreenshot('simulate-step-1.png');
  },
);

test(
  'a completed timeline shows both assessment columns',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/uk');
    await page.evaluate(
      (value) =>
        localStorage.setItem('uk-immigration-draft-v1', JSON.stringify(value)),
      draft,
    );
    await page.goto('/uk/result');
    await expect(
      page.getByRole('heading', { name: '你的路径模拟' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '现行法律' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /已公布改革/ }).first(),
    ).toBeVisible();
  },
);

for (const path of ['/uk/policy', '/uk/about']) {
  test(`${path} renders`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

test('the service worker keeps the site pages available offline', async ({
  page,
  context,
}) => {
  await page.goto('/uk');
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  const last = countryPath('ie', 'simulate');
  for (const path of [...sitePagePaths.filter((path) => path !== last), last]) {
    expect((await page.goto(path))?.ok()).toBe(true);
  }
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // The last page's script is cached too: the Ireland questionnaire works offline.
  await page.locator('#ie-simulationDate').fill('2026-11-23');
  await page.locator('#ie-pathway-IE-NATURALISATION').check();
  await page.getByRole('button', { name: '继续', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: '许可、出入境与登记' }),
  ).toBeFocused();
});
