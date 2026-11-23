import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Canada calculator works out citizenship from PR and earlier status', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '加拿大：开始计算' }).click();
  await expect(page).toHaveURL(/\/canada/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: /成为永久居民/ }).click();
  await expect(page.getByLabel('成为永久居民（PR）的日期')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2026-01-01');
  await page.getByLabel('出生日期').fill('1990-05-01');
  await page.getByLabel('成为永久居民（PR）的日期').fill('2024-06-01');
  await page.getByRole('button', { name: '添加临时身份' }).click();
  await page
    .getByRole('group', { name: '临时身份 1' })
    .getByLabel('开始日期')
    .fill('2021-06-01');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // 365 days of credit before PR, so 730 days as a PR: from 2026-06-01.
  const citizenship = page.locator('[data-pathway="CA-CITIZENSHIP"]');
  await expect(citizenship).toHaveAttribute('data-status', 'FUTURE');
  await expect(citizenship).toContainText('最早 2026-06-01 满足时间条件');
  await expect(page.locator('[data-pathway="CA-RESIDENCY"]')).toHaveAttribute(
    'data-status',
    'MET',
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(citizenship).toContainText(
    'Time requirements met from 2026-06-01',
  );
});
