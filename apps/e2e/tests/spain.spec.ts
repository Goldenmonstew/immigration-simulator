import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Spain calculator works out long-term residence and citizenship', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '西班牙：开始计算' }).click();
  await expect(page).toHaveURL(/\/spain/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: /生效日期/ }).click();
  await expect(page.locator('#es-permit-0-from')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2024-01-01');
  await page
    .getByRole('group', { name: '许可 1' })
    .getByLabel('生效日期')
    .fill('2020-03-15');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // 5 years to the same date for long-term residence; 10 for citizenship.
  const longTerm = page.locator('[data-pathway="ES-LONG-TERM"]');
  await expect(longTerm).toContainText('最早 2025-03-15 满足时间条件');
  await expect(page.locator('[data-pathway="ES-NATIONALITY"]')).toContainText(
    '最早 2030-03-15',
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(longTerm).toContainText('Time requirements met from 2025-03-15');
});
