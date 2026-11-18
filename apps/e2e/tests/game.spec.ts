import { expect, test } from '@playwright/test';
import {
  characters,
  dismissCards,
  patchSave,
  quietMorning,
  startGame,
  walkTo,
} from './helpers';

test(
  'the character picker lists every protagonist',
  { tag: '@smoke' },
  async ({ page }) => {
    await page.goto('/game');
    for (const { name } of characters)
      await expect(
        page.getByRole('button', { name: new RegExp(`^和${name}`) }),
      ).toBeVisible();
    await expect(page).toHaveScreenshot('game-start.png');
  },
);

test('the static page already has the welcome banner', async ({ request }) => {
  // The largest paint; it must not wait for the game scripts.
  const response = await request.get('/game');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  const banner = '/game/assets/meadow-town/town-banner.png';
  const head = /<head>[\s\S]*?<\/head>/.exec(html)?.[0];
  const preload = head
    ?.match(/<link\b[^>]*>/g)
    ?.find((link) => link.includes(`href="${banner}"`));
  expect(preload).toContain('rel="preload"');
  expect(preload).toContain('as="image"');
  expect(preload).toContain('fetchPriority="high"');
  const main = /<main[\s\S]*?<\/main>/.exec(html)?.[0];
  expect(main).toContain('<h1>移民生活</h1>');
  expect(main).toContain(banner);
});

for (const { name } of characters) {
  test(`${name} can start a game`, async ({ page }) => {
    await startGame(page, name);
    await expect(page.getByText(name).first()).toBeVisible();
  });
}

test(
  'home menu, a chat, and a walk outside',
  { tag: '@smoke' },
  async ({ page }) => {
    await startGame(page);
    const home = await walkTo(page, '家');
    await home.getByRole('button', { name: /周沅 · 聊天/ }).click();
    const talk = page.locator('dialog[open]');
    await expect(talk.getByText('林遥的室友，装裱员')).toBeVisible();
    await talk.getByRole('button', { name: '待会儿见' }).click();
    await page
      .locator('dialog[open]')
      .getByRole('button', { name: /关闭/ })
      .click();
    await walkTo(page, '公园池塘');
  },
);

// page.route cannot see requests the service worker answers.
test.describe(() => {
  test.use({ serviceWorkers: 'block' });
  test('retry reloads the page when a story download fails', async ({
    page,
  }) => {
    await page.goto('/game');
    const start = page.getByRole('button', { name: /^和林遥/ });
    await expect(start).toBeVisible();
    // As after a deploy: this page's lazily loaded files are gone until a
    // fresh page load.
    let stale = true;
    page.on('request', (request) => {
      if (request.isNavigationRequest()) stale = false;
    });
    await page.route('**/_next/static/chunks/**', (route) =>
      stale ? route.fulfill({ status: 404 }) : route.continue(),
    );
    await start.click();
    await page.getByRole('button', { name: '重试' }).click();
    await start.click();
    await expect(page.locator('canvas')).toBeVisible();
  });
});

test('the game resumes after a reload', async ({ page }) => {
  await startGame(page);
  await page.reload();
  await page.getByRole('button', { name: '继续上次' }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByText('林遥').first()).toBeVisible();
});

test('fast-forwarding a quarter reaches the summary', async ({ page }) => {
  await startGame(page);
  await page.getByRole('button', { name: /快进/ }).first().click();
  await page
    .locator('dialog[open]')
    .getByRole('button', { name: '确认' })
    .click();
  const summary = page
    .locator('dialog[open]')
    .getByRole('heading', { name: '这一季的小结' });
  for (let i = 0; i < 20 && !(await summary.isVisible()); i++) {
    const dialog = page.locator('dialog[open]');
    if (await dialog.isVisible()) {
      await dialog
        .getByRole('button', { disabled: false })
        .filter({ hasNotText: /关闭|显示整句/ })
        .first()
        .click();
    }
    await page.waitForTimeout(500);
  }
  await expect(summary).toBeVisible();
  await page
    .locator('dialog[open]')
    .getByRole('button', { name: '迎接下一季' })
    .click();
  await dismissCards(page);
  await expect(page.getByText(/第 1 年 · 第 2 季/)).toBeVisible();
});

test('fishing in easy mode lands a catch', async ({ page }) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', quietMorning);
  await dismissCards(page);
  const pond = await walkTo(page, '公园池塘');
  await pond.getByRole('button', { name: '钓鱼' }).click();
  const dialog = page.locator('dialog[open]');
  await dialog.getByRole('button', { name: /简易模式/ }).click();
  for (let attempt = 0; attempt < 5; attempt++) {
    await dialog.getByRole('button', { name: '抛竿' }).click();
    await expect(dialog.getByText('咬钩了！现在收竿！')).toBeVisible({
      timeout: 20_000,
    });
    await dialog.getByRole('button', { name: '收竿' }).click();
    const status = dialog
      .getByRole('status')
      .filter({ hasText: /钓到了！|鱼游走了/ });
    await expect(status).toBeVisible({ timeout: 10_000 });
    if ((await status.textContent())?.includes('钓到了')) return;
  }
  throw new Error('no catch in five easy-mode casts');
});

test('cooking works step by step and with skip', async ({ page }) => {
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
    delete save.day.festival;
    Object.assign(save.inventory as Record<string, number>, {
      potato: 10,
      tomato: 10,
      cucumber: 10,
    });
  });
  await dismissCards(page);
  const home = await walkTo(page, '家');
  await home.getByRole('button', { name: '厨房' }).click();
  const dialog = page.locator('dialog[open]');
  await dialog
    .getByRole('button', { name: /烤土豆/ })
    .first()
    .click();
  for (let step = 0; step < 6; step++) {
    const serve = dialog.getByRole('button', { name: '装盘，开饭' });
    if (await serve.isVisible()) {
      await serve.click();
      break;
    }
    await dialog.getByText(/第 \d+ \/ \d+ 步/).waitFor();
    await dialog
      .getByRole('button')
      .filter({ hasNotText: /跳过|返回配方|关闭/ })
      .first()
      .click();
  }
  await expect(dialog.getByText('亲手做的一份，刚刚好。')).toBeVisible();
  await dialog.getByRole('button', { name: '返回配方' }).click();
  const kitchen = page.locator('dialog[open]');
  await kitchen.getByRole('button', { name: /沙拉/ }).first().click();
  await kitchen.getByRole('button', { name: '跳过操作，直接做好' }).click();
  await expect(kitchen.getByText('亲手做的一份，刚刚好。')).toBeVisible();
});

test('leaving the UK ends the game with life memories and a simulator link', async ({
  page,
}) => {
  await startGame(page);
  await patchSave(page, 'skilled-worker', (save) => {
    for (const field of ['pendingEvent', 'trip', 'outcome']) delete save[field];
    save.eventQueue = [];
    Object.assign(save.day, {
      minute: 600,
      place: 'home',
      deliveries: [],
      done: [],
    });
    (save.flags as string[]).push(
      'talked-margaret',
      'furnished-reading-chair',
      'community-lunch-photo-received',
    );
    (save.friendship as Record<string, number>).margaret = 450;
  });
  await dismissCards(page);
  const station = await walkTo(page, '火车站');
  await station.getByRole('button', { name: /离开英国/ }).click();
  await expect(
    page.getByText('这会结束这一局。准备好和这段生活告别了吗？'),
  ).toBeVisible();
  await page.getByRole('button', { name: '确认' }).click();
  await expect(
    page.getByRole('heading', { name: '这一局的故事' }),
  ).toBeVisible();
  const memories = page.getByRole('heading', { name: '留在日子里的小事' });
  await expect(memories).toBeVisible();
  await expect(memories.locator('xpath=..')).toHaveScreenshot(
    'ending-memories.png',
  );
  await page.getByRole('link', { name: '在模拟器里打开这条时间线' }).click();
  await expect(
    page.getByRole('heading', { name: '你的路径模拟' }),
  ).toBeVisible();
});
