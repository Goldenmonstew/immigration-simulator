import { expect, test, type Page } from '@playwright/test';
import { dismissCards, noHorizontalScroll, walkTo } from './helpers';

const characters = [
  { id: 'nurse', zh: '玛丽塞尔·迪松', en: 'Maricel Dizon' },
  { id: 'graduate', zh: '刘嘉欣', en: 'Kayan Lau' },
] as const;
const openDialog = (page: Page) => page.locator('dialog[open]');

async function startAustraliaGame(
  page: Page,
  name: string = characters[0].zh,
  locale: 'zh-CN' | 'en' = 'zh-CN',
) {
  await page.goto('/australia/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('au-immigration-life')) localStorage.removeItem(key);
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
    `au-immigration-life-v3:${id}`,
  );

test('the Australia game page lists both residents with its own banner', async ({
  page,
  request,
}) => {
  const html = await (await request.get('/australia/game')).text();
  expect(html).toContain('/game/australia/town-banner.png');
  expect(html).toContain('移民生活 · 金合欢湾');
  await page.goto('/australia/game');
  for (const { zh } of characters)
    await expect(
      page.getByRole('button', { name: new RegExp(`^和${zh}`) }),
    ).toBeVisible();
  await page.goto('/australia');
  await expect(
    page.getByRole('link', { name: /金合欢湾生活/ }),
  ).toHaveAttribute('href', '/australia/game');
});

test('a new resident walks to the lookout bench and watches the bay', async ({
  page,
}) => {
  await startAustraliaGame(page);
  // The nurse's 491 runs to 2029-11-03 (see the content pack tests).
  await expect(page.getByText('签证剩余 44 个月').first()).toBeVisible();
  const bench = await walkTo(page, '瞭望长椅');
  await bench.getByRole('button', { name: /坐着看海湾/ }).click();
  await expect
    .poll(async () => (await save(page, 'nurse'))?.day.done)
    .toContain('bench');
});

test('fast-forwarding the first autumn reaches the summary with the 191 route', async ({
  page,
}) => {
  await startAustraliaGame(page, characters[1].zh);
  await expect(page.getByText('永久居留（191）').first()).toBeVisible();
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
  await expect(openDialog(page).getByText(/签证剩余/)).toBeVisible();
  await openDialog(page).getByRole('button', { name: '迎接下一季' }).click();
  await dismissCards(page);
  // The next quarter, winter, starts on 1 June.
  await expect(page.getByText(/第 1 年 · 第 3 季/).first()).toBeVisible();
  expect((await save(page, 'graduate'))?.date).toBe('2026-06-01');
});

test('the English interface shows the visa, Aussie English and dollars', async ({
  page,
}) => {
  await startAustraliaGame(page, characters[0].en, 'en');
  const hud = page.locator('header').filter({ hasText: 'Maricel Dizon' });
  await expect(hud.getByText('Visa: 44 months left')).toBeVisible();
  await expect(hud.getByText('Aussie English', { exact: true })).toBeVisible();
  await expect(hud.getByText('$15,000')).toBeVisible();
  expect(await hud.innerText()).not.toMatch(/[㐀-鿿]/);
  await walkTo(page, 'The jetty');
});

test.describe('at phone width', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true });
  test('the town is playable from the places drawer', async ({ page }) => {
    await startAustraliaGame(page);
    await noHorizontalScroll(page);
    const drawer = page.getByRole('button', { name: '镇上地点' });
    const foreshore = await walkTo(page, '海滨草坪', async () => {
      await drawer.click();
      await openDialog(page)
        .getByRole('button', { name: /^海滨草坪/ })
        .click();
    });
    await expect(foreshore.getByText(/营业时间/)).toBeVisible();
    await noHorizontalScroll(page);
  });
});
