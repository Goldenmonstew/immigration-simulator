import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the Greece pilot works out golden visa renewal dates', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '打开希腊试点' }).click();
  await expect(page).toHaveURL(/\/greece/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: /生效日期/ }).click();
  await expect(page.locator('#gr-permit-0-from')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2026-11-21');
  const permit = page.getByRole('group', { name: '许可 1' });
  await permit.getByLabel('许可类型').selectOption('investor');
  await permit.getByLabel('生效日期').fill('2020-06-01');
  await permit.getByLabel('到期日期').fill('2027-05-31');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // Renewal opens 2 months before the 2027-05-31 expiry.
  const golden = page.locator('[data-pathway="GR-GOLDEN-VISA"]');
  await expect(golden).toContainText('最早 2027-03-31 满足时间条件');
  // Golden visa time alone leaves long-term residence uncertain.
  await expect(page.locator('[data-pathway="GR-LONG-TERM"]')).toHaveAttribute(
    'data-status',
    'UNKNOWN',
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(golden).toContainText('Time requirements met from 2027-03-31');
});
