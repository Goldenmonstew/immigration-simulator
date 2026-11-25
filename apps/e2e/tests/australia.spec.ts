import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('au', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['au.policy.title'], exact: true });

// New drafts leave the travel history unanswered until confirmed.
async function confirmNoTrips(page: Page, dict: Dict) {
  await page
    .getByRole('group', { name: dict['au.field.trips'], exact: true })
    .getByRole('button', { name: dict['au.form.noRecords'], exact: true })
    .click();
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

test('Australia questionnaire flows to results, saves and shares scenarios, and links condition to What-if', async ({
  page,
  context,
  browser,
}) => {
  await page.goto('/');
  await page.locator('a[href="' + path() + '"]').click();
  await expect(page).toHaveURL(path());
  await page
    .getByRole('main')
    .getByRole('link', { name: zhCN['home.start'], exact: true })
    .click();
  await expect(page).toHaveURL(path('simulate'));

  await page.locator('#au-simulationDate').fill('2026-11-23');
  await page.locator('#au-pathway').selectOption('AU-CITIZENSHIP');
  await page.locator('#au-dateOfBirth').fill('1990-01-01');
  await page.locator('#au-firstArrival').fill('2020-01-01');
  await page
    .getByRole('button', {
      name: `${zhCN['au.form.add']} · ${zhCN['au.field.visas']}`,
      exact: true,
    })
    .click();
  await page.locator('#au-visas-0-subclass').selectOption('189');
  await page.locator('#au-visas-0-from').fill('2026-01-01');
  await confirmNoTrips(page, zhCN);

  const next = questionnaire(page).getByRole('button', {
    name: zhCN['form.continue'],
    exact: true,
  });
  await next.click();
  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');

  await next.click();
  await page.locator('#au-citizenship-medicalBranch').selectOption('none');
  await page.locator('#au-citizenship-permanentAtDecision').selectOption('yes');
  await page.locator('#au-citizenship-confinementEnded').fill('');
  await page
    .getByRole('group', {
      name: zhCN['au.field.confinementEnded'],
      exact: true,
    })
    .getByRole('checkbox', { name: zhCN['au.form.noneOption'] })
    .check();
  await page.locator('#au-citizenship-character').selectOption('confirmed');
  await page
    .locator('#au-citizenship-policeCertificatesIfRequired')
    .selectOption('yes');
  await page.locator('#au-citizenship-identity').selectOption('confirmed');
  await page.locator('#au-citizenship-securityBar').selectOption('no');
  await page.locator('#au-citizenship-currentCriminalBar').selectOption('no');
  await page.locator('#au-citizenship-lastPrisonSentence').selectOption('none');
  await page
    .getByRole('group', {
      name: zhCN['au.field.mostRecentCessation'],
      exact: true,
    })
    .getByRole('checkbox', { name: zhCN['au.form.neverOption'] })
    .check();
  await page.locator('#au-citizenship-intention').selectOption('reside');
  await page
    .locator('#au-citizenship-inAustraliaAtApproval')
    .selectOption('yes');
  await page.locator('#au-citizenship-willingToPledge').selectOption('yes');

  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', {
      name: '授予澳大利亚公民身份',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result
      .locator('[data-status="UNKNOWN"]')
      .getByText('入籍考试、英语与公民知识', { exact: true }),
  ).toBeVisible();
  const originalText = await result.innerText();

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('入籍方案');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '入籍方案', exact: true }),
  ).toBeVisible();

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const sharedUrl = await copyResult(page);
  expect(new URL(sharedUrl).pathname).toBe(path('result'));
  expect(new URL(sharedUrl).hash).toMatch(/^#s=.+/);

  const receiver = await browser.newContext();
  try {
    const shared = await receiver.newPage();
    await shared.goto(sharedUrl);
    await expect(
      shared.getByRole('main').getByText(zhCN['share.loaded'], { exact: true }),
    ).toBeVisible();
    await expect(assessment(shared, zhCN)).toHaveText(originalText, {
      useInnerText: true,
    });
  } finally {
    await receiver.close();
  }

  const gaps = result.getByRole('region', {
    name: zhCN['gap.title'],
    exact: true,
  });
  await gaps.locator('a[href*="?focus=citizenshipTest"]').click();
  await expect(page.locator('#au-whatif-cit-test')).toBeFocused();

  // The only visa on record is a 189 from 2026-01-01, so four years of lawful residence end on
  // 2030-01-01: passing the citizenship test gives that date, and moving the date there turns it MET.
  await page.locator('#au-whatif-cit-test').selectOption('true');
  const comparison = assessment(page, zhCN)
    .getByText(zhCN['au.result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText(
    `${zhCN['result.undetermined']}→2030-01-01`,
  );
  await page.locator('#au-whatif-date').fill('2030-01-01');
  await expect(
    assessment(page, zhCN).getByText(
      `${zhCN['country.status.UNKNOWN']}→${zhCN['country.status.MET']}`,
    ),
  ).toBeVisible();
});

test('English mobile flow checks horizontal overflow, accessibility and Australian policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(path());
  const header = page.getByRole('banner');
  await header.getByRole('button', { name: 'English', exact: true }).click();
  await noHorizontalScroll(page);

  await page
    .getByRole('main')
    .getByRole('link', { name: en['home.start'], exact: true })
    .click();
  await page.locator('#au-simulationDate').fill('2026-11-23');
  await page.locator('#au-pathway').selectOption('AU-RRV');
  await page.locator('#au-firstArrival').fill('2025-01-01');
  await page.locator('#au-locationAtApplication').selectOption('onshore');
  await page.locator('#au-locationAtDecision').selectOption('onshore');
  await page.locator('#au-noFurtherStay').selectOption('clear');
  await page.locator('#au-section48History').selectOption('none');
  await page
    .getByRole('button', {
      name: `${en['au.form.add']} · ${en['au.field.visas']}`,
      exact: true,
    })
    .click();
  await page.locator('#au-visas-0-subclass').selectOption('189');
  await page.locator('#au-visas-0-from').fill('2025-01-01');
  await confirmNoTrips(page, en);
  await noHorizontalScroll(page);

  const next = questionnaire(page).getByRole('button', {
    name: en['form.continue'],
    exact: true,
  });
  await next.click();
  await next.click();

  await page.locator('#au-rrv-status').selectOption('current-pr');
  await page.locator('#au-rrv-ties').selectOption('none');
  await page.locator('#au-rrv-familyBasis').selectOption('none');
  await page.locator('#au-rrv-compassionateDeparture').selectOption('none');
  await page.locator('#au-rrv-returnApplicationBar').selectOption('no');
  await next.click();

  await page.locator('#au-publicInterest-officialPassport').selectOption('yes');
  await page
    .locator('#au-publicInterest-character')
    .selectOption('clear-history');
  await page.locator('#au-publicInterest-returnBan5001').selectOption('no');
  await questionnaire(page)
    .getByRole('button', { name: en['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', {
      name: 'Resident Return (155 or 157)',
      exact: true,
    }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2027-01-01"]')).toBeVisible();
  await noHorizontalScroll(page);
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(
    violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
  ).toEqual([]);

  await page.goto(path('policy'));
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-200"] a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.legislation\.gov\.au\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  await expect(sources.locator('[data-source="SRC-110"]')).toHaveCount(0);
  await noHorizontalScroll(page);
});
