import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('my', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
// The engine names its single column after the current rules.
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', {
    name: dict === en ? 'Current Malaysian rules' : '马来西亚现行规则',
    exact: true,
  });
const naturalisationTitle = {
  zh: '公民身份：归化（宪法第 19 条）',
  en: 'Citizenship: naturalisation (Article 19)',
};

async function begin(page: Page, dict: Dict) {
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
  // Routes have no default answer.
  await questionnaire(page).locator('button[type="submit"]').click();
  await expect(questionnaire(page).getByRole('alert')).toHaveText(
    dict['form.fixErrors'],
  );
  await expect(page.locator('#my-targets')).toBeFocused();
  await expect(page.locator('#my-targets')).toContainText(
    dict['my.form.routeError'],
  );
  await page.locator('#my-simulationDate').fill('2026-11-25');
  await page.locator('#my-nationality').selectOption('CN');
  await page.locator('#my-dateOfBirth').fill('1985-06-01');
  await page.locator('#my-target-cit-naturalisation').check();
}

async function next(page: Page, dict: Dict, last = false) {
  await questionnaire(page)
    .getByRole('button', {
      name: dict[last ? 'form.results' : 'form.continue'],
      exact: true,
    })
    .click();
}

const list = (page: Page, name: 'passes' | 'trips') =>
  page.locator(`#my-${name}`);
async function confirmNone(page: Page, dict: Dict, name: 'passes' | 'trips') {
  await list(page, name)
    .getByRole('button', { name: dict['my.form.noRecords'], exact: true })
    .click();
  await expect(list(page, name)).toContainText(dict['my.form.emptyConfirmed']);
}

// A permanent resident since 2017-03-01 with the evidence naturalisation asks.
async function fillCitizenship(page: Page) {
  const field = (name: string) => page.locator(`#my-citizenship-${name}`);
  await field('prHeld').selectOption('yes');
  await field('permanentResidentSince').fill('2017-03-01');
  await field('intendsToResidePermanently').selectOption('yes');
  await field('qualifyingReferees').fill('2');
  await field('renounceOtherNationality').selectOption('yes');
  await field('completeTravelRecords').selectOption('yes');
  await field('taxReturnsFiveYears').selectOption('yes');
  await field('inFederationOnMerdekaDay').selectOption('no');
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

test('a Malaysian questionnaire reaches results, saves and shares them and focuses a what-if control', async ({
  page,
  context,
  browser,
}) => {
  await begin(page, zhCN);
  await page.locator('#my-target-pass-employment').check();
  await next(page, zhCN);
  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');

  // Removing the last pass returns the list to unanswered.
  const passes = list(page, 'passes');
  await passes
    .getByRole('button', {
      name: `${zhCN['my.form.add']} · ${zhCN['my.field.passes']}`,
      exact: true,
    })
    .click();
  await page.locator('#my-passes-0-kind').selectOption('employment');
  await page.locator('#my-passes-0-from').fill('2014-01-01');
  await passes
    .getByRole('button', { name: zhCN['form.remove'], exact: true })
    .click();
  await expect(page.locator('#my-passes-0-kind')).toHaveCount(0);
  await expect(passes).not.toContainText(zhCN['my.form.emptyConfirmed']);
  // An unfinished step keeps a reversed trip through a reload and reports
  // it when submitted.
  const trips = list(page, 'trips');
  await trips
    .getByRole('button', {
      name: `${zhCN['my.form.add']} · ${zhCN['my.field.trips']}`,
      exact: true,
    })
    .click();
  await page.locator('#my-trips-0-departed').fill('2025-05-01');
  await page.locator('#my-trips-0-returned').fill('2025-04-01');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await expect(page.locator('#my-trips-0-returned')).toHaveValue('2025-04-01');
  await next(page, zhCN);
  await expect(passes).toBeFocused();
  await expect(passes).toContainText(zhCN['my.form.listRequired']);
  await expect(trips).toContainText(zhCN['my.error.order']);
  await confirmNone(page, zhCN, 'passes');
  await trips
    .getByRole('button', { name: zhCN['form.remove'], exact: true })
    .click();
  await confirmNone(page, zhCN, 'trips');
  await next(page, zhCN);

  await expect(progress).toHaveAttribute('aria-valuenow', '3');
  await page.locator('#my-criminalRecord').selectOption('none');
  await page.locator('#my-language-malay').selectOption('good');
  await next(page, zhCN);

  // Hiding the issue date clears it.
  const held = page.locator('#my-citizenship-prHeld');
  await held.selectOption('yes');
  await page
    .locator('#my-citizenship-permanentResidentSince')
    .fill('2016-01-01');
  await held.selectOption('no');
  await expect(
    page.locator('#my-citizenship-permanentResidentSince'),
  ).toHaveCount(0);
  await held.selectOption('yes');
  await expect(
    page.locator('#my-citizenship-permanentResidentSince'),
  ).toHaveValue('');
  await fillCitizenship(page);
  await next(page, zhCN);
  await page.locator('#my-work-basicMonthlySalaryRm').fill('12000');
  await next(page, zhCN, true);

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', { name: naturalisationTitle.zh, exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.NOT_MET'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2027-03-01"]')).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.MET'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(result).toContainText('PD-414');
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);
  const original = await result.innerText();

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('归化与就业准证');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '归化与就业准证', exact: true }),
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

  await result.locator('a[href*="?focus=date"]').first().click();
  await expect(page.locator('#my-whatif-date')).toBeFocused();
});

test('English mobile questionnaire compares dates and shows Malaysian policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  await noHorizontalScroll(page);
  await next(page, en);
  await confirmNone(page, en, 'passes');
  await confirmNone(page, en, 'trips');
  await next(page, en);
  await page.locator('#my-criminalRecord').selectOption('none');
  await next(page, en);
  await fillCitizenship(page);
  await noHorizontalScroll(page);
  await next(page, en, true);

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', { name: naturalisationTitle.en, exact: true }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2027-03-01"]')).toBeVisible();
  await noHorizontalScroll(page);

  await page
    .getByRole('main')
    .getByRole('link', { name: en['whatif.title'], exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`${path('whatif')}#draft=`));
  const comparison = assessment(page, en)
    .getByText(en['country.timeDate'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText('2027-03-01→2027-03-01');
  await page.locator('#my-whatif-pr-since').fill('2016-03-01');
  await expect(comparison).toHaveText('2027-03-01→2026-11-25');
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: en['my.policy.pageTitle'],
      exact: true,
    }),
  ).toBeVisible();
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-500"] a')).toHaveAttribute(
    'href',
    /^https:\/\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  const condition = '[data-rule="my.cit.residence"]';
  await rules
    .locator('details')
    .filter({ has: page.locator(condition) })
    .locator('summary')
    .click();
  await expect(rules.locator(condition)).toBeVisible();
  await noHorizontalScroll(page);
});
