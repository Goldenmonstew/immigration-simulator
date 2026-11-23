import { expect, test } from '@playwright/test';
import { completedDraft } from './helpers';

test('a shared legacy result opens the same UK assessments', async ({
  page,
}) => {
  const encoded = Buffer.from(JSON.stringify(completedDraft)).toString(
    'base64url',
  );
  const fragment = `#s=${encoded}`;
  await page.goto(`/uk/result${fragment}`);
  const columns = page.getByRole('region', { name: /^(现行法律|已公布改革)$/ });
  await expect(columns).toHaveCount(2);
  const expected = await columns.allInnerTexts();

  await page.goto(`/result${fragment}`, { waitUntil: 'commit' });
  await expect(page).toHaveURL(`/uk/result${fragment}`);
  await expect(page.getByText('已载入分享的情景，可修改输入')).toBeVisible();
  await expect(columns).toHaveText(expected, { useInnerText: true });
});

for (const [oldPath, newPath, heading] of [
  [
    '/simulate?from=old%20link#main',
    '/uk/simulate?from=old%20link#main',
    '基本信息',
  ],
  ['/game', '/uk/game', '移民生活'],
]) {
  test(`old ${oldPath} opens its UK page`, async ({ page }) => {
    await page.goto(oldPath, { waitUntil: 'commit' });
    await expect(page).toHaveURL(newPath);
    await expect(
      page.getByRole('heading', { name: heading, exact: true }),
    ).toBeVisible();
  });
}
