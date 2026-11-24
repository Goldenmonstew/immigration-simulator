import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('us', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
// The assessment column carries the rule set title.
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['us.policy.title'], exact: true });
const field = (page: Page, id: string) => page.locator('#us-' + id);

async function seriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  return violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
}

// Opens the questionnaire from the site hub and checks the first required question.
async function begin(page: Page, dict: Dict) {
  const main = page.getByRole('main');
  await page.goto('/');
  await main.locator('a[href="' + path() + '"]').click();
  await expect(page).toHaveURL(path());
  if (dict === en)
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'English', exact: true })
      .click();
  await expect(
    main.getByRole('heading', { level: 1, name: dict['us.title'] }),
  ).toBeVisible();
  await main
    .getByRole('link', { name: dict['home.start'], exact: true })
    .click();
  await expect(main.getByRole('progressbar')).toBeVisible();
  await questionnaire(page).locator('button[type="submit"]').click();
  await expect(questionnaire(page).getByRole('alert')).toHaveText(
    dict['form.fixErrors'],
  );
  await expect(field(page, 'pathway')).toBeFocused();
  await field(page, 'simulationDate').fill('2026-11-21');
}

async function next(page: Page, dict: Dict) {
  await questionnaire(page)
    .getByRole('button', { name: dict['form.continue'], exact: true })
    .click();
}

test('a return trip is assessed, saved, shared and compared with a later return date', async ({
  page,
  context,
  browser,
}) => {
  await begin(page, zhCN);
  await field(page, 'pathway-US-TRAVEL').check();
  await field(page, 'dateOfBirth').fill('1990-05-01');
  await next(page, zhCN);

  await field(page, 'permanentResident').fill('2022-03-01');
  await field(page, 'conditional').selectOption('none');
  await questionnaire(page)
    .getByRole('button', {
      name: `${zhCN['us.form.add']} · ${zhCN['us.field.trips']}`,
    })
    .click();
  await field(page, 'trips-0-departed').fill('2026-11-01');
  await field(page, 'trips-0-returned').fill('2026-12-20');
  await next(page, zhCN);
  // The step is restored after a reload.
  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '3');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '3');

  const travel = (id: string) => field(page, 'travel-' + id);
  await travel('registration').selectOption('registered');
  await travel('carryingEvidence').selectOption('yes');
  await travel('movedOn-mode').selectOption('no-move');
  await travel('cardExpiresOn').fill('2032-03-01');
  await travel('otherReplacementGround').selectOption('no');
  await travel('admissionTriggers').selectOption('none');
  await travel('deportability').selectOption('cleared');
  await travel('returnDocument').selectOption('green-card');
  await travel('documentValidAtReturn').selectOption('yes');
  await travel('abandonment').selectOption('cleared');
  await travel('feeForm').selectOption('ar11');
  await next(page, zhCN);
  await next(page, zhCN);
  await field(page, 'fees-relief').selectOption('none');
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.FUTURE'].replace('{date}', '2026-12-20'),
      exact: true,
    }),
  ).toBeVisible();
  // Collapsed groups stay out of the text compared with the shared link.
  const original = await result.innerText();
  await result
    .locator('summary')
    .filter({ hasText: new RegExp('^' + zhCN['result.PASS']) })
    .click();
  await expect(
    result
      .locator('[data-status="PASS"]')
      .getByText('绿卡作为返美证件的离境时限', { exact: true }),
  ).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('年底返美');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '年底返美', exact: true }),
  ).toBeVisible();

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
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
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(url).pathname).toBe(path('result'));
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

  await page
    .getByRole('main')
    .getByRole('link', { name: zhCN['whatif.title'], exact: true })
    .first()
    .click();
  const outcome = assessment(page, zhCN)
    .getByText(zhCN['whatif.outcome'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  const future = (date: string) =>
    zhCN['country.status.FUTURE'].replace('{date}', date);
  await expect(outcome).toHaveText(
    `${future('2026-12-20')}→${future('2026-12-20')}`,
  );
  await page.locator('#us-whatif-return').fill('2027-01-05');
  await expect(outcome).toHaveText(
    `${future('2026-12-20')}→${future('2027-01-05')}`,
  );
});

test('English mobile naturalization lists open requirements, links to the English test control and shows U.S. sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  await field(page, 'pathway-US-NATURALIZATION').check();
  await field(page, 'dateOfBirth').fill('1990-05-01');
  await noHorizontalScroll(page);
  await next(page, en);
  await field(page, 'permanentResident').fill('2022-03-01');
  await field(page, 'conditional').selectOption('none');
  await questionnaire(page)
    .getByRole('button', { name: en['us.form.noRecords'], exact: true })
    .click();
  await expect(
    questionnaire(page).getByText(en['us.form.noneConfirmed'], {
      exact: true,
    }),
  ).toBeVisible();
  await next(page, en);
  await field(page, 'stateResidenceFrom').fill('2020-01-01');
  await noHorizontalScroll(page);
  await next(page, en);
  await noHorizontalScroll(page);
  await next(page, en);
  await questionnaire(page)
    .getByRole('button', { name: en['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', {
      name: 'General naturalization',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: en['country.status.UNKNOWN'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result
      .locator('[data-status="UNKNOWN"]')
      .getByText('English reading, writing and speaking', { exact: true }),
  ).toBeVisible();
  await noHorizontalScroll(page);

  const gaps = result.getByRole('region', { name: en['gap.title'] });
  await gaps.locator('a[href*="?focus=english"]').click();
  await expect(page.locator('#us-whatif-english')).toBeFocused();
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  await expect(
    page.getByRole('heading', { level: 1, name: en['us.policy.pageTitle'] }),
  ).toBeVisible();
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-315"] a')).toHaveAttribute(
    'href',
    /^https:\/\/uscode\.house\.gov\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  const ability = '[data-rule="US-C29-ABILITY-TO-PAY"]';
  await rules
    .locator('details')
    .filter({ has: page.locator(ability) })
    .locator('summary')
    .click();
  await expect(rules.locator(ability)).toBeVisible();
  await noHorizontalScroll(page);
});
