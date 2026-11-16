import { expect, type Page } from '@playwright/test';

export const characters = [
  { id: 'skilled-worker', name: '林遥' },
  { id: 'hong-kong-bno', name: '陈嘉宁' },
  { id: 'family-partner', name: '索菲娅' },
  { id: 'graduate', name: '诺拉' },
] as const;

const saveKey = (id: string) => `uk-immigration-life-v3:${id}`;
const openDialog = (page: Page) => page.locator('dialog[open]');

/** Close the morning card and any opening event by taking its first choice. */
export async function dismissCards(page: Page) {
  const dialog = openDialog(page);
  for (let i = 0; i < 6; i++) {
    if (!(await dialog.isVisible().catch(() => false))) return;
    // Place menus (they all show opening hours) and talks are not cards.
    const text = await dialog.innerText();
    if (/营业时间|Opening hours|待会儿见/.test(text)) return;
    await dialog
      .getByRole('button', { disabled: false })
      .filter({ hasNotText: /关闭|显示整句/ })
      .first()
      .click();
    await page.waitForTimeout(300);
  }
}

export async function startGame(page: Page, name: string = '林遥') {
  await page.goto('/game');
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage))
      if (key.startsWith('uk-immigration-life')) localStorage.removeItem(key);
  });
  await page.reload();
  await page.getByRole('button', { name: new RegExp(`^和${name}`) }).click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(openDialog(page)).toBeVisible();
  await dismissCards(page);
  await expect(openDialog(page)).toHaveCount(0);
}

/** Rewrite the current save in place, then reopen it through "继续上次". */
export async function patchSave(
  page: Page,
  id: string,
  patch: (
    save: Record<string, unknown> & { day: Record<string, unknown> },
  ) => void,
) {
  await page.evaluate(
    ({ key, source }) => {
      const save = JSON.parse(localStorage.getItem(key)!);
      new Function('save', source)(save);
      localStorage.setItem(key, JSON.stringify(save));
    },
    { key: saveKey(id), source: `(${patch.toString()})(save);` },
  );
  await page.goto('/game');
  await page.getByRole('button', { name: '继续上次' }).click();
  await expect(page.locator('canvas')).toBeVisible();
}

/** A weekday morning at home with nothing pending. */
export function quietMorning(
  save: Record<string, unknown> & { day: Record<string, unknown> },
) {
  for (const field of ['pendingEvent', 'ending', 'trip', 'outcome'])
    delete save[field];
  save.eventQueue = [];
  Object.assign(save.day, {
    minute: 600,
    weather: 'sunny',
    place: 'home',
    deliveries: [],
    done: [],
    talked: [],
    gifted: [],
  });
  delete save.day.festival;
  delete save.day.resumeMinute;
}

/**
 * Walk to a place with the location button and wait for its menu. A random
 * event card may open on arrival instead; take its first choice, then ask for
 * the menu again (standing at the door opens it directly).
 */
export async function walkTo(page: Page, place: string) {
  const button = page
    .getByRole('button', { name: new RegExp(`^${place}`) })
    .first();
  const dialog = openDialog(page);
  const menu = dialog.getByRole('heading', { name: place, exact: true });
  for (let attempt = 0; attempt < 3; attempt++) {
    await button.click();
    await expect(dialog).toBeVisible({ timeout: 30_000 });
    if (await menu.isVisible()) return dialog;
    // Anything other than an event card (another place menu, a talk) is a bug.
    expect(await dialog.innerText()).not.toMatch(
      /营业时间|Opening hours|待会儿见/,
    );
    // An event card: take its first choice, then let it close.
    await dialog
      .getByRole('button', { disabled: false })
      .filter({ hasNotText: /关闭|显示整句/ })
      .first()
      .click();
    await page.waitForTimeout(400);
    if (await menu.isVisible()) return dialog;
    if (await dialog.isVisible()) await dismissCards(page);
  }
  await expect(menu).toBeVisible();
  return dialog;
}

export async function noHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

// A completed Skilled Worker timeline, written the way the questionnaire stores it.
export const completedDraft = {
  version: 1,
  step: 8,
  completed: true,
  simulationDate: '2026-11-16',
  screening: { criminality: 'no', breach: 'no', debt: 'no' },
  timeline: {
    dateOfBirth: '1994-05-20',
    nationality: 'CHN',
    episodes: [
      {
        route: 'SKILLED_WORKER',
        role: 'MAIN',
        validFrom: '2024-01-15',
        validTo: '2029-01-15',
      },
    ],
    absences: [],
    incomeYears: [],
    benefits: [],
    relationships: [],
    criminalRecord: [],
    immigrationBreaches: [],
  },
};
