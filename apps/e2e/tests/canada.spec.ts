import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { sourceUrls } from '../../web/lib/sources';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('ca', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['ca.policy.title'], exact: true });
const section = (page: Page, title: string) =>
  page.locator('summary').filter({ hasText: new RegExp(`^${title}$`) });

async function copyResult(page: Page) {
  const share = page.getByRole('region', {
    name: zhCN['share.copy'],
    exact: true,
  });
  await share
    .getByRole('button', { name: zhCN['share.copy'], exact: true })
    .click();
  await expect(
    share.getByText(zhCN['share.copied'], { exact: true }),
  ).toBeVisible();
  return page.evaluate(() => navigator.clipboard.readText());
}

// Became PR in 2020 and lived abroad from 2021 until mid-2025. The unit test
// "the result lists only chosen routes…" runs this draft: 2027-06-01, and
// 2027-08-29 with one more trip from 2026-12-01 to 2027-03-01.
async function fillResidency(page: Page, dict: Dict) {
  const main = page.getByRole('main');
  await page.goto('/');
  await main.locator(`a[href="${path()}"]`).click();
  await expect(page).toHaveURL(path());
  if (dict === en)
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'English', exact: true })
      .click();
  await main
    .getByRole('link', { name: dict['home.start'], exact: true })
    .click();
  await expect(main.getByRole('progressbar')).toBeVisible();

  // Submitting without a route moves focus to the route choices.
  const form = questionnaire(page);
  await form.locator('button[type="submit"]').click();
  await expect(form.getByRole('alert')).toHaveText(dict['form.fixErrors']);
  await expect(page.locator('#ca-goals')).toBeFocused();
  await expect(page.locator('#ca-goals')).toHaveAccessibleDescription(
    dict['ca.error.goals'],
  );

  await page.locator('#ca-simulationDate').fill('2026-11-24');
  await page.locator('#ca-goal-CA-RESIDENCY').check();
  await page.locator('#ca-permanentResident').fill('2020-01-10');
  await page.locator('#ca-residence-prStatus').selectOption('valid');
  await page.locator('#ca-residence-prConditionsFulfilled').selectOption('yes');
  await noHorizontalScroll(page);
  const next = form.getByRole('button', {
    name: dict['form.continue'],
    exact: true,
  });
  await next.click();
  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');

  await section(page, dict['ca.section.trips']).click();
  await form
    .getByRole('button', {
      name: `${dict['ca.form.add']} · ${dict['ca.field.trips']}`,
      exact: true,
    })
    .click();
  await page.locator('#ca-trips-0-departed').fill('2021-01-04');
  await page.locator('#ca-trips-0-returned').fill('2025-06-01');
  await section(page, dict['ca.section.prDays']).click();
  for (const list of ['ca.field.credits', 'ca.field.exclusions'] as const)
    await form
      .getByRole('group', { name: dict[list], exact: true })
      .getByRole('button', { name: dict['ca.form.noRecords'], exact: true })
      .click();
  await page.locator('#ca-residence-humanitarianRelief').selectOption('none');
  await noHorizontalScroll(page);
  await next.click();
  await expect(progress).toHaveAttribute('aria-valuenow', '3');
  // The draft is kept on this device and reopens at the same step.
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '3');
  await form
    .getByRole('button', { name: dict['form.results'], exact: true })
    .click();
  await expect(page).toHaveURL(path('result'));
}

test('Canadian residency questionnaire shows conditions, saves, shares and compares a later date', async ({
  page,
  context,
  browser,
}) => {
  await fillResidency(page, zhCN);
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', { name: '永久居民居住义务', exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.FUTURE'].replace('{date}', '2027-06-01'),
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result
      .locator('[data-status="FAIL"]')
      .getByText('认可的境外日、执法截点及人道裁量', { exact: true }),
  ).toBeVisible();
  await expect(
    result.locator(`a[href="${sourceUrls['SRC-075']}"]`).first(),
  ).toBeAttached();
  const original = await result.innerText();

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('加拿大居住');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '加拿大居住', exact: true }),
  ).toBeVisible();

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const url = await copyResult(page);
  expect(new URL(url).pathname).toBe(path('result'));
  expect(new URL(url).hash).toMatch(/^#s=.+/);
  const receiver = await browser.newContext();
  try {
    const shared = await receiver.newPage();
    await shared.goto(url);
    await expect(
      shared.getByRole('main').getByText(zhCN['share.loaded'], { exact: true }),
    ).toBeVisible();
    await expect(assessment(shared, zhCN)).toHaveText(original, {
      useInnerText: true,
    });
  } finally {
    await receiver.close();
  }

  // The unmet condition links to the matching comparison control.
  const gaps = result.getByRole('region', {
    name: zhCN['gap.title'],
    exact: true,
  });
  await gaps.locator('a[href*="?focus=date"]').click();
  await expect(page.locator('#ca-whatif-date')).toBeFocused();
  const comparison = assessment(page, zhCN)
    .getByText(zhCN['result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText('2027-06-01→2027-06-01');
  await page.locator('#ca-whatif-trip-from').fill('2026-12-01');
  await page.locator('#ca-whatif-trip-to').fill('2027-03-01');
  await expect(comparison).toHaveText('2027-06-01→2027-08-29');
});

test('English mobile Canada pages fit the screen and show Canadian policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await fillResidency(page, en);
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', {
      name: 'PR residency obligation',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: en['country.status.FUTURE'].replace('{date}', '2027-06-01'),
      exact: true,
    }),
  ).toBeVisible();
  await expect(result).toContainText(
    'Credited days abroad, enforcement and humanitarian relief',
  );
  await noHorizontalScroll(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page
    .getByRole('main')
    .getByRole('link', { name: en['whatif.title'], exact: true })
    .first()
    .click();
  const comparison = assessment(page, en)
    .getByText(en['result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText('2027-06-01→2027-06-01');
  await page.locator('#ca-whatif-date').fill('2027-12-31');
  await expect(
    assessment(page, en)
      .getByText(en['whatif.outcome'], { exact: true })
      .locator('xpath=following-sibling::dd[1]'),
  ).toHaveText(
    `${en['country.status.FUTURE'].replace('{date}', '2027-06-01')}→${en['country.status.MET']}`,
  );
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: en['ca.policy.pageTitle'],
      exact: true,
    }),
  ).toBeVisible();
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-075"] a')).toHaveAttribute(
    'href',
    sourceUrls['SRC-075'],
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  await expect(sources.locator('[data-source="SRC-110"]')).toHaveCount(0);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  await rules.locator('summary').click();
  await expect(rules.locator('[data-rule="CA-R80"]')).toBeVisible();
  await noHorizontalScroll(page);
});
