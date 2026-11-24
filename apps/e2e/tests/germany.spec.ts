import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('de', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['de.policy.title'], exact: true });

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

test('Germany questionnaire, result, what-if comparison, share link, and saved scenarios', async ({
  page,
  context,
  browser,
}) => {
  const main = page.getByRole('main');
  await page.goto('/');
  await main.locator('a[href="' + path() + '"]').click();
  await expect(page).toHaveURL(path());

  await main
    .getByRole('link', { name: zhCN['home.start'], exact: true })
    .click();
  await expect(main.getByRole('progressbar')).toBeVisible();

  // Submitting step 0 without selecting any route focuses #de-routes
  const form = questionnaire(page);
  await form.locator('button[type="submit"]').click();
  const error = form.getByRole('alert');
  await expect(error).toBeVisible();
  await expect(error).toHaveText(zhCN['form.fixErrors']);
  await expect(page.locator('#de-routes')).toBeFocused();

  // Select R01 (§ 9 settlement) and R07 (§ 10 StAG naturalisation)
  await page.locator('#de-simulationDate').fill('2026-11-23');
  await page.locator('#de-route-R01').check();
  await page.locator('#de-route-R07').check();
  await page.locator('#de-firstEntry').fill('2022-05-23');

  const next = form.getByRole('button', {
    name: zhCN['form.continue'],
    exact: true,
  });
  await next.click();

  // Step 1: residence history
  const progress = main.getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');

  await form
    .getByRole('button', {
      name: `${zhCN['de.form.add']} · ${zhCN['de.field.permits']}`,
      exact: true,
    })
    .click();
  await page.locator('#de-permits-0-kind').selectOption('skilled');
  await page.locator('#de-permits-0-from').fill('2022-05-23');
  await next.click();

  // Step 2: common statutory requirements (open each details section and fill)
  for (const summary of await form.locator('details > summary').all()) {
    await summary.click();
  }
  await page
    .locator('#de-common-currentStatusKind')
    .selectOption('residence-permit');
  await page
    .locator('#de-common-currentTitleSection')
    .selectOption('§ 18b AufenthG');
  for (const id of [
    '#de-common-applicationCoveredByStatusOrFiction',
    '#de-common-hasActiveResidenceTitle',
    '#de-common-livelihoodConfirmed',
    '#de-common-orientationTestPassed',
    '#de-common-permittedToWork',
    '#de-common-professionalLicenceIfNeeded',
    '#de-common-noPublicSafetyThreat',
    '#de-common-adequateHousing',
    '#de-common-passportOrSubstituteHeld',
    '#de-common-identityAndNationalityClarified',
    '#de-common-registeredAddressHeld',
    '#de-common-registrationInTime',
    '#de-common-noExpulsionInterest',
  ]) {
    await page.locator(id).selectOption('yes');
  }
  await page.locator('#de-common-benefits').selectOption('none-or-permitted');
  await page.locator('#de-common-provenGerman').selectOption('B1');
  await page.locator('#de-common-orientationScore').fill('22');
  await page.locator('#de-common-contributionMonths').fill('60');
  await next.click();

  // Step 4: citizenship requirements (leave unconfirmed so R07 is UNKNOWN)
  await next.click();

  // Step 5: fees -> submit to results
  await form
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', {
      name: zhCN['de.route.R01'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.FUTURE'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.UNKNOWN'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2027-05-23"]')).toBeVisible();
  const originalText = await result.innerText();

  // Save scenario and verify persistence across reload
  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('德国永居与入籍');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '德国永居与入籍', exact: true }),
  ).toBeVisible();

  // Copy share link and open in a fresh browser context
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const shareUrl = await copyResult(page);
  expect(new URL(shareUrl).pathname).toBe(path('result'));
  expect(new URL(shareUrl).hash).toMatch(/^#s=.+/);

  const receiver = await browser.newContext();
  try {
    const shared = await receiver.newPage();
    await shared.goto(shareUrl);
    await expect(
      shared.getByRole('main').getByText(zhCN['share.loaded'], { exact: true }),
    ).toBeVisible();
    await expect(assessment(shared, zhCN)).toHaveText(originalText, {
      useInnerText: true,
    });
  } finally {
    await receiver.close();
  }

  // Navigate to What-if comparison from condition focus link and advance simulation date
  const gaps = result.getByRole('region', {
    name: zhCN['gap.title'],
    exact: true,
  });
  await gaps.locator('a[href*="?focus=date"]').first().click();
  await expect(page.locator('#de-whatif-date')).toBeFocused();

  await page.locator('#de-whatif-date').fill('2027-06-01');
  await expect(assessment(page, zhCN)).toContainText('2027-05-23→2027-06-01');
});

test('English mobile layout and Germany policy sources', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(path());
  const header = page.getByRole('banner');
  await header.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('h1')).toContainText(
    'Germany Permanent Residence & Naturalisation Checker',
  );
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-100"] a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.gesetze-im-internet\.de\//,
  );
  await expect(sources.locator('[data-source="SRC-410"] a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.gesetze-im-internet\.de\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  await expect(sources.locator('[data-source="SRC-110"]')).toHaveCount(0);
  await noHorizontalScroll(page);
});
