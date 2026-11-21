import { expect, test } from '@playwright/test';

test('the Australia pilot works out dates from a visa record', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '打开澳大利亚试点' }).click();
  await expect(page).toHaveURL(/\/australia/);
  await page.getByLabel('模拟日期').fill('2026-11-21');
  await page.getByLabel('出生日期').fill('1990-05-01');
  await page.getByLabel('首次入境澳洲的日期').fill('2021-02-01');
  const first = page.getByRole('group', { name: '签证 1' });
  await first.getByLabel('生效日').fill('2021-02-01');
  await first.getByLabel('到期日').fill('2023-08-31');
  await page.getByRole('button', { name: '添加签证' }).click();
  const second = page.getByRole('group', { name: '签证 2' });
  await second.getByLabel('签证类别').selectOption('186');
  await second.getByLabel('生效日').fill('2023-09-01');
  await page.getByRole('button', { name: '添加出境记录' }).click();
  await page.getByLabel('离开澳洲的日期').fill('2026-07-01');
  await page.getByLabel('回到澳洲的日期').fill('2026-10-15');
  await page.getByRole('button', { name: '计算' }).click();

  await expect(page.getByRole('heading', { name: '计算结果' })).toBeFocused();
  const citizenship = page.locator('[data-pathway="AU-CITIZENSHIP"]');
  // 106 days away in the last 12 months: 90 days at most from 2027-07-17.
  await expect(citizenship).toHaveAttribute('data-status', 'FUTURE');
  await expect(citizenship).toContainText('最早 2027-07-17 满足时间条件');
  await expect(page.locator('[data-pathway="AU-RRV"]')).toHaveAttribute(
    'data-status',
    'MET',
  );
});
