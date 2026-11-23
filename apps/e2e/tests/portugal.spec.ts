import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('the Portugal pilot works out golden visa and naturalisation dates', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '打开葡萄牙试点' }).click();
  await expect(page).toHaveURL(/\/portugal/);

  // Submitting without dates moves focus to the linked summary.
  await page.getByRole('button', { name: '计算' }).click();
  const summary = page
    .getByRole('alert')
    .filter({ hasText: '请先修正标红的项目' });
  await expect(summary).toBeFocused();
  await summary.getByRole('link', { name: /生效日期/ }).click();
  await expect(page.locator('#pt-permit-0-from')).toBeFocused();

  await page.getByLabel('模拟日期').fill('2025-06-01');
  const permit = page.getByRole('group', { name: '证件 1' });
  await permit.getByLabel('证件类型').selectOption('golden-visa');
  await permit.getByLabel('生效日期').fill('2024-01-10');
  await permit.getByLabel('到期日期').fill('2026-01-09');
  // Its renewal, still valid.
  await page.getByRole('button', { name: '添加证件' }).click();
  const renewal = page.getByRole('group', { name: '证件 2' });
  await renewal.getByLabel('证件类型').selectOption('golden-visa');
  await renewal.getByLabel('生效日期').fill('2026-01-10');
  // The nationality group has no default: the user must pick it.
  await expect(summary.getByRole('link', { name: /你的国籍/ })).toBeVisible();
  await page.getByLabel('你的国籍').selectOption('other');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  // Renewal opens 90 days before the 2026-01-09 expiry.
  const golden = page.locator('[data-pathway="PT-GOLDEN-VISA"]');
  await expect(golden).toContainText('最早 2025-10-11 满足时间条件');
  // 10 years from the day after 2024-01-10.
  await expect(
    page.locator('[data-pathway="PT-NATURALISATION"]'),
  ).toContainText('最早 2034-01-11 满足时间条件');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
  await expect(golden).toContainText('Time requirements met from 2025-10-11');
});
