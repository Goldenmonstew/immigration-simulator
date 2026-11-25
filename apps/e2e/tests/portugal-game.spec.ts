import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'worker', zh: '沈知夏', en: 'Zhixia Shen' },
  { id: 'partner', zh: '塞莱斯特·蒙泰罗', en: 'Celeste Monteiro' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startPortugalGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/portugal/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('pt-immigration-life')) localStorage.removeItem(key);
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
    `pt-immigration-life-v3:${id}`,
  );

test('the Portugal game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/portugal/game')).text();
  expect(html).toContain('/game/portugal/town-banner.png');
  expect(html).toContain('移民生活 · 燕子街区');
  await page.goto('/portugal/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/portugal');
  await expect(
    page.getByRole('link', { name: /燕子街区生活/ }),
  ).toHaveAttribute('href', '/portugal/game');
});

test('a new resident walks up to the miradouro and watches the river', async ({
  page,
}) => {
  await startPortugalGame(page);
  // The card runs to 2028-09-19 (pt-pack.test.ts).
  await expect(page.getByText('居留卡剩余 30 个月').first()).toBeVisible();
  const miradouro = await walkTo(page, '观景台');
  await miradouro.getByRole('button', { name: /坐在观景台看河/ }).click();
  await expect
    .poll(async () => (await save(page, 'worker'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first spring reaches the summary with Portuguese routes', async ({
  page,
}) => {
  await startPortugalGame(page, characters[1].zh);
  await expect(page.getByText('永久居留').first()).toBeVisible();
  await expect(page.getByText('国籍').first()).toBeVisible();
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
  expect((await save(page, 'partner'))?.date).toBe('2026-06-01');
});

test('the English interface shows the residence card and Portuguese study', async ({
  page,
}) => {
  await startPortugalGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Zhixia Shen' });
  await expect(hud.getByText('Residence card: 30 months left')).toBeVisible();
  await expect(hud.getByText('Portuguese', { exact: true })).toBeVisible();
  // Starts at €9,000; a morning card may already have cost a euro or two.
  await expect(hud.getByText(/^€\d,\d{3}$/)).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'Largo das Andorinhas');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startPortugalGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const largo = await walkTo(page, '燕子广场', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^燕子广场/ })
        .click();
    });
    await expect(largo.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
