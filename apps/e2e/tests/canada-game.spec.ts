import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'citizen', zh: '周婉宁', en: 'Wanning Zhou' },
  { id: 'graduate', zh: '阿迪蒂·拉奥', en: 'Aditi Rao' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startCanadaGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/canada/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('ca-immigration-life')) localStorage.removeItem(key);
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
    `ca-immigration-life-v3:${id}`,
  );

test('the Canada game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/canada/game')).text();
  expect(html).toContain('/game/canada/town-banner.png');
  expect(html).toContain('移民生活 · 枫港');
  await page.goto('/canada/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/canada');
  await expect(page.getByRole('link', { name: /枫港生活/ })).toHaveAttribute(
    'href',
    '/canada/game',
  );
});

test('a new resident walks to the boardwalk and watches the boats', async ({
  page,
}) => {
  await startCanadaGame(page);
  // The PR card printed for this story runs to July 2030.
  await expect(page.getByText('身份证件剩余 52 个月').first()).toBeVisible();
  const bench = await walkTo(page, '海滨长椅');
  await bench.getByRole('button', { name: /坐在木椅上看船进港/ }).click();
  await expect
    .poll(async () => (await save(page, 'citizen'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first spring reaches the summary with Canadian routes', async ({
  page,
}) => {
  await startCanadaGame(page, characters[1].zh);
  await expect(page.getByText('永久居民').first()).toBeVisible();
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
  await expect(openDialog(page).getByText(/身份证件剩余/)).toBeVisible();
  await openDialog(page).getByRole('button', { name: '迎接下一季' }).click();
  await dismissCards(page);
  await expect(page.getByText(/第 1 年 · 第 3 季/).first()).toBeVisible();
  expect((await save(page, 'graduate'))?.date).toBe('2026-06-01');
});

test('the English interface shows the status document and English skill', async ({
  page,
}) => {
  await startCanadaGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Wanning Zhou' });
  await expect(hud.getByText('Status document: 52 months left')).toBeVisible();
  await expect(hud.getByText('English', { exact: true })).toBeVisible();
  await expect(hud.getByText('CA$18,000')).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'Waterfront green');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startCanadaGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const wharf = await walkTo(page, '钓鱼码头', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^钓鱼码头/ })
        .click();
    });
    await expect(wharf.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
