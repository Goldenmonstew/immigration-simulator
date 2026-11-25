import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('nz', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['nz.policy.title'], exact: true });
const next = (page: Page, dict: Dict, key: 'form.continue' | 'form.results') =>
  questionnaire(page)
    .getByRole('button', { name: dict[key], exact: true })
    .click();

// Dates checked in the unit tests: a 166-day trip in 2026 moves the
// citizenship presence date to 2027-06-12; returning on 2026-10-01 makes it 2027-05-29.
async function fillCitizenship(page: Page, dict: Dict, mobile = false) {
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

  // Submitting without a pathway focuses the pathway choices.
  await next(page, dict, 'form.continue');
  await expect(questionnaire(page).getByRole('alert')).toHaveText(
    dict['form.fixErrors'],
  );
  await expect(page.locator('#nz-goals')).toBeFocused();
  await page.locator('#nz-simulationDate').fill('2026-11-23');
  await page.locator('#nz-goal-citizenship').check();
  await page.locator('#nz-dateOfBirth').fill('1990-01-01');
  if (mobile) await noHorizontalScroll(page);
  await next(page, dict, 'form.continue');

  await page.locator('#nz-firstArrival').fill('2019-01-01');
  await page.locator('#nz-residentVisa-granted').fill('2020-01-01');
  await page.locator('#nz-residentVisa-category').selectOption('general');
  await page.locator('#nz-permanentResidentVisa').fill('2022-02-01');
  await questionnaire(page)
    .getByRole('button', {
      name: `${dict['nz.form.add']} · ${dict['nz.f.trips']}`,
      exact: true,
    })
    .click();
  await page.locator('#nz-trips-0-departed').fill('2026-05-01');
  await page.locator('#nz-trips-0-returned').fill('2026-10-15');
  await page.locator('#nz-resident-travel-currentlyInNz').selectOption('yes');
  if (mobile) await noHorizontalScroll(page);
  // The draft keeps its step and answers across a reload.
  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await expect(page.locator('#nz-trips-0-returned')).toHaveValue('2026-10-15');
  await next(page, dict, 'form.continue');

  // Travel and PRV details are optional for this record.
  await next(page, dict, 'form.continue');
  await next(page, dict, 'form.continue');

  const citizenship = (name: string, value: string) =>
    page.locator(`#nz-resident-citizenship-${name}`).selectOption(value);
  for (const [name, value] of [
    ['fullCapacity', 'yes'],
    ['presenceException', 'none'],
    ['character', 'clear'],
    ['foreignPoliceEvidence', 'not-requested'],
    ['understandsResponsibilities', 'yes'],
    ['english', 'evidenced'],
    ['residenceIntent', 'nz-or-realm'],
    ['identityDocumentsAndWitness', 'yes'],
    ['oath', 'willing'],
    ['feeCategory', 'standard'],
  ])
    await citizenship(name, value);
  if (mobile) await noHorizontalScroll(page);
  await next(page, dict, 'form.continue');

  // Citizenship alone ends with the fee: health and family steps are not used.
  await page.locator('#nz-common-requiredFeePaid').selectOption('yes');
  await expect(progress).toHaveAttribute('aria-valuenow', '6');
  await expect(progress).toHaveAttribute('aria-valuemax', '6');
  await next(page, dict, 'form.results');
  await expect(page).toHaveURL(path('result'));
}

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

test('a New Zealand citizenship questionnaire shows its conditions, saves, shares and compares a return date', async ({
  page,
  context,
  browser,
}) => {
  await fillCitizenship(page, zhCN);
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', { name: '归化入籍', exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.FUTURE'].replace('{date}', '2027-06-12'),
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result
      .locator('[data-status="FAIL"]')
      .getByText('在境或法定例外', { exact: true }),
  ).toBeVisible();
  await expect(
    result.locator('a', { hasText: /^SRC-070 / }).first(),
  ).toHaveAttribute('href', /legislation\.govt\.nz/);
  const original = await result.innerText();
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('入籍咨询');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '入籍咨询', exact: true }),
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

  // The presence condition opens the comparison at the trip controls.
  await result.locator('a[href*="?focus=trips"]').first().click();
  await expect(page.locator('#nz-whatif-trips')).toBeFocused();
  const earliest = assessment(page, zhCN)
    .getByText(zhCN['result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(earliest).toHaveText('2027-06-12→2027-06-12');
  await page.locator('#nz-whatif-last-return').fill('2026-10-01');
  await expect(earliest).toHaveText('2027-06-12→2027-05-29');
});

test('the English questionnaire works at phone width and the policy page lists New Zealand sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await fillCitizenship(page, en, true);
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', { name: 'Citizenship by grant', exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: en['country.status.FUTURE'].replace('{date}', '2027-06-12'),
      exact: true,
    }),
  ).toBeVisible();
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  await expect(
    page.getByRole('heading', { level: 1, name: en['nz.policy.pageTitle'] }),
  ).toBeVisible();
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-070"] a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.legislation\.govt\.nz\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  await expect(page.locator('[data-pathway]')).toHaveCount(10);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  const presence = '[data-rule="NZ-P3-1-PRESENCE"]';
  await rules
    .locator('details')
    .filter({ has: page.locator(presence) })
    .locator('summary')
    .click();
  await expect(rules.locator(presence)).toBeVisible();
  await noHorizontalScroll(page);
});
