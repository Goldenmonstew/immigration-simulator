import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the United States pilot works out naturalization dates', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '打开美国试点' }).click();
  await expect(page).toHaveURL(/\/united-states/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: /出生日期/ }).click();
  await expect(page.getByLabel('出生日期')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2026-11-21');
  await page.getByLabel('出生日期').fill('1990-05-01');
  await page.getByLabel('取得永久居民身份的日期').fill('2022-03-01');
  await page.getByLabel('我与美国公民结婚并同住').check();
  await page.getByLabel('结婚日期').fill('2023-06-01');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // 5 years from 2022-03-01 less 90 days.
  const general = page.locator('[data-pathway="US-NATURALIZATION"]');
  await expect(general).toHaveAttribute('data-status', 'FUTURE');
  await expect(general).toContainText('最早 2026-12-01 满足时间条件');
  // 3 years of marriage from 2023-06-01 cannot be filed early.
  await expect(page.locator('[data-pathway="US-SPOUSE"]')).toContainText(
    '最早 2026-06-01',
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(general).toContainText('Time requirements met from 2026-12-01');
});
