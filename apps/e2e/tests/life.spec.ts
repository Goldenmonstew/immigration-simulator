import { expect, test } from '@playwright/test';
import {
  dismissCards,
  patchSave,
  quietMorning,
  startGame,
  walkTo,
} from './helpers';

function prepareVisaRenewal(save: Parameters<typeof quietMorning>[0]) {
  const timeline = save.timeline as { episodes: { validTo: string }[] };
  timeline.episodes[timeline.episodes.length - 1].validTo = '2025-08-31';
  (save.stats as Record<string, number>).money = 20000;
}

test('renewing near expiry extends the permission', async ({ page }) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', [quietMorning, prepareVisaRenewal]);
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

test('planting and watering yields a crop and a harvest record', async ({
  page,
}) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', [
    quietMorning,
    (save) => {
      (save.inventory as Record<string, number>)['seed-turnip'] = 1;
    },
  ]);
  await dismissCards(page);

  const dialog = page.locator('dialog[open]');
  const bag = page.getByRole('button', { name: /^背包/ }).first();
  const crop = dialog.getByText(/^芜菁 × [1-9]\d*$/);
  const collection = dialog.getByRole('tab', { name: '收藏' });
  const close = dialog.getByRole('button', { name: /关闭/ });
  await bag.click();
  await expect(dialog.getByText('芜菁种子 × 1')).toBeVisible();
  await expect(crop).toHaveCount(0);
  await collection.click();
  await expect(
    dialog.getByText('收成记录：收获 0 次，共 0 种作物。'),
  ).toBeVisible();
  await close.click();

  const openPlot = async () => {
    await expect(dialog).toHaveCount(0);
    const canvas = page.locator('canvas');
    await canvas.scrollIntoViewIfNeeded();
    const marker = page.getByRole('application').getByText(/^社区菜地/);
    await expect(marker).toBeVisible();
    const { x, y, width } = (await marker.boundingBox())!;
    const frame = (await canvas.boundingBox())!;
    const zoom = frame.width < 600 ? 2 : 2.5;
    // In town.json, plot 4 is 64 px right and 42 px above the label anchor.
    await canvas.click({
      position: {
        x: x + width / 2 - frame.x + 64 * zoom,
        y: y - frame.y - 42 * zoom,
      },
    });
    await expect(dialog.getByRole('heading', { name: '菜地 4' })).toBeVisible();
  };

  const allotment = await walkTo(page, '社区菜地');
  await allotment.getByRole('button', { name: /^租下菜地/ }).click();
  await openPlot();
  await dialog.getByRole('button', { name: '芜菁种子 × 1' }).click();
  const harvest = dialog.getByRole('button', { name: '收获', exact: true });
  await expect(harvest).toBeDisabled();
  await dialog.getByRole('button', { name: '浇水', exact: true }).click();
  await expect(
    dialog.getByRole('button', { name: '今天浇过水了' }),
  ).toBeDisabled();

  await patchSave(page, 'skilled-worker', (save) => {
    (save.plots as { growth: number }[])[3].growth = 3;
  });
  await dismissCards(page);
  await walkTo(page, '社区菜地');
  await close.click();
  await openPlot();
  await expect(harvest).toBeEnabled();
  await harvest.click();
  await expect(harvest).toHaveCount(0);
  await close.click();
  await bag.click();
  await expect(crop).toBeVisible();
  await collection.click();
  await expect(
    dialog.getByText('收成记录：收获 1 次，共 1 种作物。'),
  ).toBeVisible();
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

test('renewing and leaving the UK works in English', async ({ page }) => {
  await startGame(page, 'Yao Lin', 'en');
  await patchSave(
    page,
    'skilled-worker',
    [quietMorning, prepareVisaRenewal],
    'en',
  );
  await dismissCards(page);

  const visaMonths = page.getByText(/Visa: \d+ months left/).first();
  await expect(visaMonths).toHaveText(/Visa: [1-9] months left/);
  const visa = await walkTo(page, 'Visa centre');
  await visa.getByRole('button', { name: /^Extend permission/ }).click();
  await dismissCards(page);
  await expect(visaMonths).toHaveText(/Visa: (1[3-9]|[2-9]\d) months left/);

  const station = await walkTo(page, 'Station');
  await station.getByRole('button', { name: /^Leave the UK/ }).click();
  await expect(
    station.getByText(
      'This will end this game. Ready to bring this story to a close?',
    ),
  ).toBeVisible();
  await station.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your story in town' }),
  ).toBeVisible();
  const timeline = page.getByRole('link', {
    name: 'Open this timeline in the simulator',
  });
  await expect(timeline).toBeVisible();
  await expect(timeline).toHaveAttribute('href', /^\/result#s=.+/);
});
