import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { countryPath, nonUkCountries } from '../../web/lib/site-countries';
import { completedDraft, startGame } from './helpers';

async function seriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
}

for (const path of [
  '/',
  ...['', 'simulate', 'policy', 'about', 'game'].map((sub) =>
    countryPath('uk', sub),
  ),
  ...nonUkCountries.map(({ id }) => countryPath(id)),
]) {
  test(`no serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });
}

test('no serious accessibility violations in the running game', async ({
  page,
}) => {
  await startGame(page);
  expect(await seriousViolations(page)).toEqual([]);
});

test('no serious accessibility violations on the result page', async ({
  page,
}) => {
  await page.goto('/uk');
  await page.evaluate(
    (value) =>
      localStorage.setItem('uk-immigration-draft-v1', JSON.stringify(value)),
    completedDraft,
  );
  await page.goto('/uk/result');
  await expect(
    page.getByRole('heading', { name: '你的路径模拟' }),
  ).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
