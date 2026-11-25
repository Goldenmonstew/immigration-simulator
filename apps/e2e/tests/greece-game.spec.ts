import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'bluecard', zh: '卡里姆·哈达德', en: 'Karim Haddad' },
  { id: 'spouse', zh: '林晓雯', en: 'Xiaowen Lin' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startGreeceGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/greece/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('gr-immigration-life')) localStorage.removeItem(key);
  });
  await page.reload();
  if (locale === 'en')
    await page.getByRole('button', { name: 'English' }).click();
  const start = locale === 'en' ? 'Start with ' : '和';
  await page
    .getByRole('button', { name: new RegExp(`^${start}${name}`) })
    .click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(openDialog(page)).toBeVisible();
  await dismissCards(page);
  await expect(openDialog(page)).toHaveCount(0);
}

const save = (page: Page, id: string) =>
  page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
    `gr-immigration-life-v3:${id}`,
  );

test('the Greece game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/greece/game')).text();
  expect(html).toContain('/game/greece/town-banner.png');
  expect(html).toContain('移民生活 · 利马纳基');
  await page.goto('/greece/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/greece');
  await expect(
    page.getByRole('link', { name: /利马纳基生活/ }),
  ).toHaveAttribute('href', '/greece/game');
});

test('a new resident walks to the seafront bench and sits by the sea', async ({
  page,
}) => {
  await startGreeceGame(page);
  // The pre-reform Blue Card runs to 2026-09-14: six months from March.
  await expect(page.getByText('居留卡剩余 6 个月').first()).toBeVisible();
  const bench = await walkTo(page, '海滨长椅');
  await bench.getByRole('button', { name: /坐着看海/ }).click();
  await expect
    .poll(async () => (await save(page, 'bluecard'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first spring reaches the summary with Greek routes', async ({
  page,
}) => {
  await startGreeceGame(page, characters[1].zh);
  await expect(page.getByText('长期居留').first()).toBeVisible();
  await expect(page.getByText('入籍').first()).toBeVisible();
  // Five years of joint residence from 2023-05-02, as the pack test computes.
  await expect(
    page.getByText('最早 2028-05-02 满足条件').first(),
  ).toBeVisible();
  await page.getByRole('button', { name: /快进/ }).first().click();
  await openDialog(page).getByRole('button', { name: '确认' }).click();
  const summary = openDialog(page).getByRole('heading', {
    name: '这一季的小结',
  });
  for (let i = 0; i < 30 && !(await summary.isVisible()); i++) {
    const dialog = openDialog(page);
    if (await dialog.isVisible())
      await dialog
        .getByRole('button', { disabled: false })
        .filter({ hasNotText: /关闭|显示整句/ })
        .first()
        .click();
    await page.waitForTimeout(500);
  }
  await expect(summary).toBeVisible();
  await expect(openDialog(page).getByText(/居留卡剩余/)).toBeVisible();
  await openDialog(page).getByRole('button', { name: '迎接下一季' }).click();
  await dismissCards(page);
  await expect(page.getByText(/第 1 年 · 第 3 季/).first()).toBeVisible();
  expect((await save(page, 'spouse'))?.date).toBe('2026-06-01');
});

test('the English interface shows the residence card and Greek study', async ({
  page,
}) => {
  await startGreeceGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Karim Haddad' });
  await expect(hud.getByText('Residence card: 6 months left')).toBeVisible();
  await expect(hud.getByText('Greek', { exact: true })).toBeVisible();
  await expect(hud.getByText('€14,000')).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'Agios Nikolaos square');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startGreeceGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const square = await walkTo(page, '圣尼古拉广场', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^圣尼古拉广场/ })
        .click();
    });
    await expect(square.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
