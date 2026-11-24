import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'nurse', zh: '玛丽塞尔·纳瓦罗', en: 'Maricel Navarro' },
  { id: 'partner', zh: '卢卡斯·勃兰特', en: 'Lukas Brandt' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startNewZealandGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/new-zealand/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('nz-immigration-life')) localStorage.removeItem(key);
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
    `nz-immigration-life-v3:${id}`,
  );

test('the New Zealand game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/new-zealand/game')).text();
  expect(html).toContain('/game/new-zealand/town-banner.png');
  expect(html).toContain('移民生活 · 凯雷鲁湾');
  await page.goto('/new-zealand/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/new-zealand');
  await expect(
    page.getByRole('link', { name: /凯雷鲁湾生活/ }),
  ).toHaveAttribute('href', '/new-zealand/game');
});

test('a new resident walks to the seaside bench and watches the tide', async ({
  page,
}) => {
  await startNewZealandGame(page);
  // Travel conditions run to 2027-08-17 (two years from the 2025-08-18 grant).
  await expect(page.getByText('旅行条件剩余 17 个月').first()).toBeVisible();
  const bench = await walkTo(page, '海边长椅');
  await bench.getByRole('button', { name: /坐着看潮水/ }).click();
  await expect
    .poll(async () => (await save(page, 'nurse'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first autumn reaches the summary with both routes', async ({
  page,
}) => {
  await startNewZealandGame(page, characters[1].zh);
  await expect(page.getByText('永久居民签证').first()).toBeVisible();
  await expect(page.getByText('入籍').first()).toBeVisible();
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
  await expect(openDialog(page).getByText(/旅行条件剩余/)).toBeVisible();
  await openDialog(page).getByRole('button', { name: '迎接下一季' }).click();
  await dismissCards(page);
  // Quarter 3 is June to August: winter in Kererū Bay.
  await expect(page.getByText(/第 1 年 · 第 3 季 · 冬/).first()).toBeVisible();
  expect((await save(page, 'partner'))?.date).toBe('2026-06-01');
});

test('the English interface shows travel conditions and te reo', async ({
  page,
}) => {
  await startNewZealandGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Maricel Navarro' });
  await expect(
    hud.getByText('Travel conditions: 17 months left'),
  ).toBeVisible();
  await expect(hud.getByText('Te reo', { exact: true })).toBeVisible();
  await expect(hud.getByText('NZ$14,000')).toBeVisible();
  await expect(hud.getByText('Year 1 · Quarter 2 · Autumn')).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'Bay domain');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startNewZealandGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const wharf = await walkTo(page, '海湾码头', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^海湾码头/ })
        .click();
    });
    await expect(wharf.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
