import { expect, test } from '@playwright/test';
import {
  dismissCards,
  patchSave,
  quietMorning,
  startGame,
  walkTo,
} from './helpers';

test('renewing near expiry extends the permission', async ({ page }) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', (save) => {
    for (const field of ['pendingEvent', 'ending', 'trip', 'outcome'])
      delete save[field];
    save.eventQueue = [];
    Object.assign(save.day, {
      minute: 600,
      place: 'home',
      deliveries: [],
      done: [],
    });
    const timeline = save.timeline as { episodes: { validTo: string }[] };
    timeline.episodes[timeline.episodes.length - 1].validTo = '2025-08-31';
    (save.stats as Record<string, number>).money = 20000;
  });
  await dismissCards(page);
  const before = page.getByText(/签证剩余 \d+ 个月/).first();
  await expect(before).toHaveText(/签证剩余 [1-9] 个月/);
  const visa = await walkTo(page, '签证中心');
  await visa.getByRole('button', { name: /^续签/ }).click();
  await dismissCards(page);
  await expect(page.getByText(/签证剩余 \d+ 个月/).first()).toHaveText(
    /签证剩余 (1[3-9]|[2-9]\d) 个月/,
  );
});

test('buying at the corner shop puts the item in the bag', async ({ page }) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', quietMorning);
  await dismissCards(page);
  const shop = await walkTo(page, '街角小店');
  await shop.getByRole('button', { name: /^买 · £4/ }).click();
  await page
    .locator('dialog[open]')
    .getByRole('button', { name: /关闭/ })
    .click();
  await page.getByRole('button', { name: /背包/ }).first().click();
  await expect(
    page.locator('dialog[open]').getByText(/^茶 × \d+$/),
  ).toBeVisible();
});

test('renting an allotment unlocks the plots', async ({ page }) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', quietMorning);
  await dismissCards(page);
  const allotment = await walkTo(page, '社区菜地');
  await allotment.getByRole('button', { name: /^租下菜地/ }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await walkTo(page, '社区菜地');
  await expect(
    page.locator('dialog[open]').getByRole('button', { name: /^租下菜地/ }),
  ).toHaveCount(0);
});

test('a catch shows up in the collection', async ({ page }) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', quietMorning);
  await dismissCards(page);
  const pond = await walkTo(page, '公园池塘');
  await pond.getByRole('button', { name: '钓鱼' }).click();
  const dialog = page.locator('dialog[open]');
  await dialog.getByRole('button', { name: /简易模式/ }).click();
  for (let attempt = 0; attempt < 8; attempt++) {
    await dialog.getByRole('button', { name: '抛竿' }).click();
    await expect(dialog.getByText('咬钩了！现在收竿！')).toBeVisible({
      timeout: 20_000,
    });
    await dialog.getByRole('button', { name: '收竿' }).click();
    const status = dialog
      .getByRole('status')
      .filter({ hasText: /钓到了！|鱼游走了/ });
    await expect(status).toBeVisible({ timeout: 10_000 });
    if (await dialog.getByText('首次收录！已记入收藏册。').isVisible()) break;
  }
  await dialog.getByRole('button', { name: /关闭/ }).click();
  await page.getByRole('button', { name: '收藏', exact: true }).click();
  await expect(
    page.locator('dialog[open]').getByText(/钓到的鱼 · 1 \/ \d/),
  ).toBeVisible();
});

test('the game runs in English', async ({ page }) => {
  await page.goto('/game');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(
    page.getByRole('heading', { name: /Immigration Life/ }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Start with Yao Lin' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await dismissCards(page);
  await expect(
    page.getByRole('button', { name: /^Home/ }).first(),
  ).toBeVisible();
  await expect(page.getByText(/Visa: \d+ months left/).first()).toBeVisible();
});
