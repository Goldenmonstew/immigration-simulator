import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the Ireland pilot works out naturalisation and Stamp 4 dates', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '打开爱尔兰试点' }).click();
  await expect(page).toHaveURL(/\/ireland/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  // The Stamp 4 choice has no default: the user must pick it.
  await expect(
    summary.getByRole('link', { name: /要计算的许可/ }),
  ).toBeVisible();
  await summary.getByRole('link', { name: /生效日期/ }).click();
  await expect(page.locator('#ie-permit-0-from')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2026-11-22');
  const permit = page.getByRole('group', { name: '许可 1' });
  await permit.getByLabel('许可类型').selectOption('stamp1-csep');
  await permit.getByLabel('生效日期').fill('2021-03-01');
  await page.getByLabel('要计算的许可').selectOption('csep');
  await page.getByLabel('在爱尔兰凭该许可开始工作的日期').fill('2025-03-15');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // 1 year plus 1462 days from 2021-03-01 were complete on 2026-03-02.
  await expect(
    page.locator('[data-pathway="IE-NATURALISATION"]'),
  ).toHaveAttribute('data-status', 'MET');
  // 21 months from starting work on 2025-03-15.
  const stamp4 = page.locator('[data-pathway="IE-STAMP4"]');
  await expect(stamp4).toContainText('最早 2026-12-15 满足时间条件');
  await expect(page.locator('[data-pathway="IE-SPOUSE"]')).toHaveAttribute(
    'data-status',
    'NOT_APPLICABLE',
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(stamp4).toContainText('Time requirements met from 2026-12-15');
});
