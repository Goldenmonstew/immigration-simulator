import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the Japan pilot works out permanent residence for a spouse', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '打开日本试点' }).click();
  await expect(page).toHaveURL(/\/japan/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  // Neither route has a default: the user must pick them.
  await expect(
    summary.getByRole('link', { name: /适用的永住许可路线/ }),
  ).toBeVisible();
  await expect(
    summary.getByRole('link', { name: /适用的帰化路线/ }),
  ).toBeVisible();
  await summary.getByRole('link', { name: /在日本连续在留的开始日/ }).click();
  await expect(page.locator('#jp-stay-start')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2026-11-22');
  await page.getByLabel('在日本连续在留的开始日').fill('2025-10-01');
  await page.getByLabel('适用的永住许可路线').selectOption('spouse');
  await page.getByLabel('结婚日期').fill('2023-12-01');
  await page.getByLabel('适用的帰化路线').selectOption('general');
  await page.getByLabel('出生日期').fill('1990-05-05');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // Married 3 years and in Japan 1 year, before the 2027-04-01 guideline.
  const pr = page.locator('[data-pathway="JP-PR"]');
  await expect(pr).toContainText('最早 2026-12-01 满足时间条件');
  await expect(pr).toContainText('2028-12-01');
  // Naturalisation follows the 10-year practice: 2025-10-01 + 10 years.
  await expect(
    page.locator('[data-pathway="JP-NATURALISATION"]'),
  ).toContainText('最早 2035-10-01 满足时间条件');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(pr).toContainText('Time requirements met from 2026-12-01');
});
