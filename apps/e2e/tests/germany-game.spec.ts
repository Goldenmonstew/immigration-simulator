import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'bluecard', zh: '许嘉禾', en: 'Jiahe Xu' },
  { id: 'spouse', zh: '马特奥·罗哈斯', en: 'Mateo Rojas' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startGermanyGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/germany/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('de-immigration-life')) localStorage.removeItem(key);
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
    `de-immigration-life-v3:${id}`,
  );

test('the Germany game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/germany/game')).text();
  expect(html).toContain('/game/germany/town-banner.png');
  expect(html).toContain('移民生活 · 林登岸');
  await page.goto('/germany/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/germany');
  await expect(page.getByRole('link', { name: /林登岸生活/ })).toHaveAttribute(
    'href',
    '/germany/game',
  );
});

test('a new resident walks to the canal bench and watches the boats', async ({
  page,
}) => {
  await startGermanyGame(page);
  // The Blue Card runs to 2029-01-14 (see packages/game/test/de-pack.test.ts).
  await expect(page.getByText('居留许可剩余 34 个月').first()).toBeVisible();
  const bench = await walkTo(page, '运河长椅');
  await bench.getByRole('button', { name: /坐着看运河上的船/ }).click();
  await expect
    .poll(async () => (await save(page, 'bluecard'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first spring reaches the summary with German routes', async ({
  page,
}) => {
  await startGermanyGame(page, characters[1].zh);
  await expect(page.getByText('定居许可').first()).toBeVisible();
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
  await expect(openDialog(page).getByText(/居留许可剩余/)).toBeVisible();
  await openDialog(page).getByRole('button', { name: '迎接下一季' }).click();
  await dismissCards(page);
  await expect(page.getByText(/第 1 年 · 第 3 季/).first()).toBeVisible();
  expect((await save(page, 'spouse'))?.date).toBe('2026-06-01');
});

test('the English interface shows the residence permit and German study', async ({
  page,
}) => {
  await startGermanyGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Jiahe Xu' });
  await expect(hud.getByText('Residence permit: 34 months left')).toBeVisible();
  await expect(hud.getByText('German', { exact: true })).toBeVisible();
  // Savings in euros with a thousands separator; the seed is the clock, so
  // a morning card may already have spent a few euros of the €15,000.
  await expect(hud.getByText(/^€1\d,\d{3}$/)).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'Market square');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startGermanyGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const square = await walkTo(page, '集市广场', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^集市广场/ })
        .click();
    });
    await expect(square.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
