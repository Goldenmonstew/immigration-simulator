import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'engineer', zh: '朴俊浩', en: 'Junho Park' },
  { id: 'spouse', zh: '周晓雯', en: 'Xiaowen Zhou' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startUsGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/united-states/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('us-immigration-life')) localStorage.removeItem(key);
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
    `us-immigration-life-v3:${id}`,
  );

test('the US game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/united-states/game')).text();
  expect(html).toContain('/game/united-states/town-banner.png');
  expect(html).toContain('移民生活 · 湖湾');
  await page.goto('/united-states/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/united-states');
  await expect(page.getByRole('link', { name: /湖湾生活/ })).toHaveAttribute(
    'href',
    '/united-states/game',
  );
});

test('a new resident walks to the Lakefront Trail and watches the sailboats', async ({
  page,
}) => {
  await startUsGame(page);
  // Green card from 2023-06-15, valid ten years: 87 months on 2026-03-01.
  await expect(page.getByText('绿卡有效期剩余 87 个月').first()).toBeVisible();
  const bench = await walkTo(page, '湖滨步道长椅');
  await bench.getByRole('button', { name: /坐着看湖上的帆船/ }).click();
  await expect
    .poll(async () => (await save(page, 'engineer'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first spring reaches the summary with US pathways', async ({
  page,
}) => {
  await startUsGame(page, characters[1].zh);
  // Progress bars for the two pathways; the I-751 window opens 90 days
  // before the conditional card's end.
  await expect(
    page.getByRole('button', { name: /^绿卡 \d+%.*最早 2027-06-17/ }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /^入籍 \d+%/ })).toBeVisible();
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
  await expect(openDialog(page).getByText(/绿卡有效期剩余/)).toBeVisible();
  await openDialog(page).getByRole('button', { name: '迎接下一季' }).click();
  await dismissCards(page);
  await expect(page.getByText(/第 1 年 · 第 3 季/).first()).toBeVisible();
  expect((await save(page, 'spouse'))?.date).toBe('2026-06-01');
});

test('the English interface shows the green card and civics study', async ({
  page,
}) => {
  await startUsGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Junho Park' });
  await expect(hud.getByText('Green card: 87 months left')).toBeVisible();
  await expect(
    hud.getByText('English · civics', { exact: true }),
  ).toBeVisible();
  await expect(hud.getByText('$14,000')).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'Lakebend Park');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startUsGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const park = await walkTo(page, '湖湾公园', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^湖湾公园/ })
        .click();
    });
    await expect(park.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
