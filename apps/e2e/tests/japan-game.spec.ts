import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'engineer', zh: '陈思远', en: 'Siyuan Chen' },
  { id: 'spouse', zh: '安娜·佩雷拉', en: 'Ana Pereira' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startJapanGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/japan/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('jp-immigration-life')) localStorage.removeItem(key);
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
    `jp-immigration-life-v3:${id}`,
  );

test('the Japan game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/japan/game')).text();
  expect(html).toContain('/game/japan/town-banner.png');
  expect(html).toContain('移民生活 · 港坂');
  await page.goto('/japan/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/japan');
  await expect(page.getByRole('link', { name: /港坂生活/ })).toHaveAttribute(
    'href',
    '/japan/game',
  );
});

test('a new resident walks to the riverside bench and sits by the river', async ({
  page,
}) => {
  await startJapanGame(page);
  await expect(page.getByText('在留期限剩余 12 个月').first()).toBeVisible();
  const bench = await walkTo(page, '河边长椅');
  await bench.getByRole('button', { name: /坐着看河/ }).click();
  await expect
    .poll(async () => (await save(page, 'engineer'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first spring reaches the summary with Japanese routes', async ({
  page,
}) => {
  await startJapanGame(page, characters[1].zh);
  await expect(page.getByText('永住許可').first()).toBeVisible();
  await expect(page.getByText('帰化').first()).toBeVisible();
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
  await expect(openDialog(page).getByText(/在留期限剩余/)).toBeVisible();
  await openDialog(page).getByRole('button', { name: '迎接下一季' }).click();
  await dismissCards(page);
  await expect(page.getByText(/第 1 年 · 第 3 季/).first()).toBeVisible();
  expect((await save(page, 'spouse'))?.date).toBe('2026-06-01');
});

test('the English interface shows the period of stay and Japanese study', async ({
  page,
}) => {
  await startJapanGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Siyuan Chen' });
  await expect(hud.getByText('Period of stay: 12 months left')).toBeVisible();
  await expect(hud.getByText('Japanese', { exact: true })).toBeVisible();
  await expect(hud.getByText('¥1,800,000')).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'Minatozaka Shrine');
});

test('the progress detail is titled with its pathway', async ({ page }) => {
  await startJapanGame(page, characters[0].en, 'en');
  await page.getByRole('button', { name: /Permanent residence/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Permanent residence' }),
  ).toBeVisible();
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startJapanGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const shrine = await walkTo(page, '港坂神社', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^港坂神社/ })
        .click();
    });
    await expect(shrine.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
