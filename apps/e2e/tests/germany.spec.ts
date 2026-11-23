import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Germany calculator works out Blue Card settlement dates', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '德国：开始计算' }).click();
  await expect(page).toHaveURL(/\/germany/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: /生效日期/ }).click();
  await expect(page.locator('#de-permit-0-from')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2026-11-22');
  await page.getByLabel('首次入境德国的日期').fill('2024-03-01');
  const permit = page.getByRole('group', { name: '许可 1' });
  await permit.getByLabel('许可类型').selectOption('blue-card');
  await permit.getByLabel('生效日期').fill('2024-03-10');
  await page.getByLabel('适用的定居路径').selectOption('blue-card');
  await page.getByLabel(/我的德语达到 B1/).check();
  await page.getByLabel(/符合 § 18g 条件就业并缴费的月数/).fill('21');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // 21 months on the Blue Card with German at B1.
  await expect(page.locator('[data-pathway="DE-SETTLEMENT"]')).toHaveAttribute(
    'data-status',
    'MET',
  );
  // Naturalisation needs 5 years: the 3-year route is gone.
  const naturalisation = page.locator('[data-pathway="DE-NATURALISATION"]');
  await expect(naturalisation).toContainText('最早 2029-03-10 满足时间条件');
  await expect(naturalisation).toContainText('2025-10-30');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(naturalisation).toContainText(
    'Time requirements met from 2029-03-10',
  );
});
