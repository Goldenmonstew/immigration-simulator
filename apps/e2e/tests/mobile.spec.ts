import { expect, test, type Locator } from '@playwright/test';
import { noHorizontalScroll, startGame, walkTo } from './helpers';

async function tapPlaceInDrawer(button: Locator) {
  await button
    .page()
    .getByRole('button', { name: '镇上地点', exact: true })
    .tap();
  await button.tap();
}

test('the character picker fits a phone', async ({ page }) => {
  await page.goto('/game');
  await noHorizontalScroll(page);
  await expect(page).toHaveScreenshot('mobile-game-start.png');
});

test('first screen shows the town and the dock; the place drawer walks', async ({
  page,
}) => {
  await startGame(page);
  const canvas = page.locator('canvas');
  await expect(canvas).toBeInViewport();
  for (const name of ['镇上地点', '背包', '换角色'])
    await expect(
      page.getByRole('button', { name, exact: true }),
    ).toBeInViewport();
  await noHorizontalScroll(page);

  await walkTo(page, '公园池塘', tapPlaceInDrawer);
  await noHorizontalScroll(page);
});

test('a chat fits the phone screen', async ({ page }) => {
  await startGame(page);
  const home = await walkTo(page, '家', tapPlaceInDrawer);
  await home.getByRole('button', { name: /周沅 · 聊天/ }).tap();
  const talk = page.locator('dialog[open]');
  await expect(talk.getByRole('button', { name: '待会儿见' })).toBeInViewport();
  const box = await talk.boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 375).toBe(true);
  await noHorizontalScroll(page);
});
