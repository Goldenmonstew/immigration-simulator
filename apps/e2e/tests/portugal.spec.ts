import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('pt', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
// The engine names its single column after the applicable law.
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', {
    name: dict === en ? 'Applicable Portuguese law' : '葡萄牙适用法律',
    exact: true,
  });
const partnerTitle = {
  zh: '与葡萄牙公民结婚或为事实伴侣取得国籍',
  en: 'Nationality by marriage or de facto partnership',
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
  // Nationality and routes have no default answer.
  await questionnaire(page).locator('button[type="submit"]').click();
  await expect(questionnaire(page).getByRole('alert')).toHaveText(
    dict['form.fixErrors'],
  );
  await expect(page.locator('#pt-route')).toBeFocused();
  await expect(page.locator('#pt-targets')).toContainText(
    dict['pt.form.routeError'],
  );
  await page.locator('#pt-simulationDate').fill('2026-11-23');
  await page.locator('#pt-route').selectOption('other');
}

async function next(page: Page, dict: Dict, last = false) {
  await questionnaire(page)
    .getByRole('button', {
      name: dict[last ? 'form.results' : 'form.continue'],
      exact: true,
    })
    .click();
}

async function openSection(page: Page, name: string) {
  await questionnaire(page)
    .locator('summary')
    .filter({ hasText: new RegExp(`^${name}$`) })
    .click();
}

// Criminal, security and sanctions findings are shared by both nationality routes.
async function fillReview(page: Page, dict: Dict) {
  await openSection(page, dict['pt.section.natReview']);
  await page.locator('#pt-nationality-crime-record').selectOption('none');
  await page.locator('#pt-nationality-security').selectOption('clear');
  await page.locator('#pt-nationality-sanctions').selectOption('clear');
}

async function fillPartner(page: Page, dict: Dict) {
  await openSection(page, dict['pt.section.partnerRelationship']);
  const field = (name: string) => page.locator(`#pt-partner-${name}`);
  await field('kind').selectOption('marriage');
  await field('relationshipFrom').fill('2025-06-01');
  await field('current').selectOption('yes');
  await field('portuguesePartner').selectOption('yes');
  await field('partnerPortugueseSince').fill('1990-01-01');
  await field('registrationAccepted').selectOption('yes');
  await openSection(page, dict['pt.section.partnerOpposition']);
  await field('connectionReview').selectOption('clear');
  await field('foreignService').selectOption('none');
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

test('a Portuguese questionnaire reaches results, saves and shares them and focuses a what-if control', async ({
  page,
  context,
  browser,
}) => {
  await begin(page, zhCN);
  await page.locator('#pt-target-naturalisation').check();
  await page.locator('#pt-target-partner').check();
  await next(page, zhCN);
  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');

  // Trips must be listed or confirmed as none.
  await page
    .getByRole('button', {
      name: `${zhCN['pt.form.add']} · ${zhCN['pt.field.permits']}`,
      exact: true,
    })
    .click();
  await page.locator('#pt-permits-0-kind').selectOption('temporary');
  await page.locator('#pt-permits-0-from').fill('2020-01-01');
  // An unfinished step keeps a reversed trip through a reload and reports it
  // when submitted (review102-1).
  const trips = page.locator('#pt-trips');
  await trips
    .getByRole('button', {
      name: `${zhCN['pt.form.add']} · ${zhCN['pt.field.trips']}`,
      exact: true,
    })
    .click();
  await page.locator('#pt-trips-0-departed').fill('2025-05-01');
  await page.locator('#pt-trips-0-returned').fill('2025-04-01');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await expect(page.locator('#pt-permits-0-from')).toHaveValue('2020-01-01');
  await expect(page.locator('#pt-trips-0-returned')).toHaveValue('2025-04-01');
  await next(page, zhCN);
  await expect(page.locator('#pt-trips-0-returned')).toBeFocused();
  await expect(trips).toContainText(zhCN['pt.error.order']);
  await trips
    .getByRole('button', { name: zhCN['form.remove'], exact: true })
    .click();
  await next(page, zhCN);
  await expect(page.locator('#pt-trips')).toBeFocused();
  await page
    .locator('#pt-trips')
    .getByRole('button', { name: zhCN['pt.form.noRecords'], exact: true })
    .click();
  await expect(page.locator('#pt-trips')).toContainText(
    zhCN['pt.form.emptyConfirmed'],
  );
  await next(page, zhCN);
  await fillReview(page, zhCN);
  // Hiding a sub-answer clears it (review102-1).
  const record = page.locator('#pt-nationality-crime-record');
  await record.selectOption('conviction');
  await page.locator('#pt-nationality-crime-years').fill('2');
  await record.selectOption('none');
  await expect(page.locator('#pt-nationality-crime-years')).toHaveCount(0);
  await record.selectOption('conviction');
  await expect(page.locator('#pt-nationality-crime-years')).toHaveValue('');
  await record.selectOption('none');
  // Answers at the draft root are cleared as well.
  await openSection(page, zhCN['pt.section.natFiling']);
  const emancipation = page.locator('#pt-emancipation');
  await emancipation.selectOption('recognized');
  await page.locator('#pt-emancipationFrom').fill('2008-01-01');
  await emancipation.selectOption('none');
  await expect(page.locator('#pt-emancipationFrom')).toHaveCount(0);
  await emancipation.selectOption('recognized');
  await expect(page.locator('#pt-emancipationFrom')).toHaveValue('');
  await emancipation.selectOption('');
  await next(page, zhCN);
  await fillPartner(page, zhCN);
  await next(page, zhCN, true);

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', { name: partnerTitle.zh, exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.FUTURE'].replace('{date}', '2028-06-02'),
      exact: true,
    }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2028-06-02"]')).toBeVisible();
  // Naturalisation still needs the current law's language and means rules.
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.UNKNOWN'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result
      .locator('[data-status="UNKNOWN"]')
      .getByText('新制葡语能力', { exact: true }),
  ).toBeVisible();
  await expect(result).toContainText('PD-380');
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
    .fill('伴侣入籍');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '伴侣入籍', exact: true }),
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

  await result.locator('a[href*="?focus=natLanguage"]').click();
  await expect(page.locator('#pt-whatif-nat-language')).toBeFocused();
});

test('English mobile questionnaire compares dates and shows Portuguese policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  await page.locator('#pt-target-partner').check();
  await noHorizontalScroll(page);
  await next(page, en);
  await fillReview(page, en);
  await next(page, en);
  await fillPartner(page, en);
  await noHorizontalScroll(page);
  await next(page, en, true);

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', { name: partnerTitle.en, exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: en['country.status.FUTURE'].replace('{date}', '2028-06-02'),
      exact: true,
    }),
  ).toBeVisible();
  await noHorizontalScroll(page);

  // Editing a result carries its scenario in the fragment, and an answer
  // cleared at the draft root stays cleared in that edit (review102-1).
  await page
    .getByRole('main')
    .getByRole('link', { name: en['result.edit'], exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`${path('simulate')}#draft=`));
  const birth = page.locator('#pt-birthDate');
  await birth.fill('1990-01-01');
  await birth.fill('');
  await expect(birth).toHaveValue('');
  await page.reload();
  await expect(birth).toHaveValue('');
  await expect(page.locator('#pt-route')).toHaveValue('other');
  await page.goBack();
  await expect(page).toHaveURL(path('result'));

  await page
    .getByRole('main')
    .getByRole('link', { name: en['whatif.title'], exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(new RegExp(`${path('whatif')}#draft=`));
  const comparison = assessment(page, en)
    .getByText(en['pt.result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText('2028-06-02→2028-06-02');
  await page.locator('#pt-whatif-date').fill('2028-07-01');
  await expect(comparison).toHaveText('2028-06-02→2028-07-01');
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: en['pt.policy.pageTitle'],
      exact: true,
    }),
  ).toBeVisible();
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-120"] a')).toHaveAttribute(
    'href',
    /^https:\/\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  const condition = '[data-rule="PT-G01"]';
  await rules
    .locator('details')
    .filter({ has: page.locator(condition) })
    .locator('summary')
    .click();
  await expect(rules.locator(condition)).toBeVisible();
  await noHorizontalScroll(page);
});
