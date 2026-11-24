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

  const add = (field: keyof typeof zhCN) =>
    form
      .getByRole('button', {
        name: `${zhCN['de.form.add']} · ${zhCN[field]}`,
        exact: true,
      })
      .first();
  await add('de.field.permits').click();
  await page.locator('#de-permits-0-kind').selectOption('skilled');
  await page.locator('#de-permits-0-from').fill('2022-05-23');
  // Trips start unanswered; confirming none can be undone.
  const trips = form
    .getByRole('group', { name: zhCN['de.field.trips'], exact: true })
    .first();
  const button = (scope: typeof trips, key: keyof typeof zhCN) =>
    scope.getByRole('button', { name: zhCN[key], exact: true });
  await button(trips, 'de.form.noRecords').click();
  await expect(trips.getByText(zhCN['de.form.emptyConfirmed'])).toBeVisible();
  await button(trips, 'de.form.resetRecords').click();
  await expect(trips.getByText(zhCN['de.form.emptyConfirmed'])).toHaveCount(0);
  await button(trips, 'de.form.noRecords').click();
  await add('de.field.titles').click();
  await page.locator('#de-titles-0-kind').selectOption('skilled');
  await page.locator('#de-titles-0-noOtherLossEvent').selectOption('yes');
  await page.locator('#de-titles-0-validTo').fill('2028-05-22');
  const title = form.getByRole('group', {
    name: `${zhCN['de.field.titles']} 1`,
    exact: true,
  });
  // Removing the only trip under a document returns it to unanswered.
  await title
    .getByRole('button', {
      name: `${zhCN['de.form.add']} · ${zhCN['de.field.trips']}`,
      exact: true,
    })
    .click();
  await title
    .getByRole('group', { name: `${zhCN['de.field.trips']} 1`, exact: true })
    .getByRole('button', { name: zhCN['de.form.remove'], exact: true })
    .click();
  await button(title, 'de.form.noRecords').click();
  await expect(title.getByText(zhCN['de.form.emptyConfirmed'])).toBeVisible();
  await expect(button(title, 'de.form.resetRecords')).toBeVisible();
  await next.click();

  // Step 2: common statutory requirements (open each section and fill)
  await expect(progress).toHaveAttribute('aria-valuenow', '3');
  for (const summary of await form.locator('details > summary').all()) {
    await summary.click();
  }
  const select = (id: string, value: string) =>
    page.locator(`#de-common-${id}`).selectOption(value);
  for (const id of [
    'identityEstablished',
    'nationalityEstablishedOrNotRequired',
    'capableOrRepresented',
    'evidenceAndAttendance',
    'livelihoodConfirmed',
    'household-sustainable',
    'household-scopeAndDeductionsConfirmed',
    'employmentAuthorisedOrNotRequired',
    'permanentProfessionalPermissionOrNotRequired',
    'housing-qualityAndOccupancyConfirmed',
  ]) {
    await select(id, 'yes');
  }
  await select('passport', 'valid');
  await select('entry', 'required-visa-and-disclosed');
  await select('security', 'no-known-ground');
  await select('address', 'registered');
  await select('transition', 'ordinary');
  await select('benefits', 'none-or-permitted');
  await select('provenGerman', 'B1');
  await add('de.field.members').click();
  await select('household-members-0', 'single');
  await add('de.field.insurance').click();
  await select('insurance-0', 'statutory');
  for (const [id, value] of [
    ['household-countableMonthlyIncome', '1243'],
    ['household-warmRent', '550'],
    ['household-additionalNeeds', '50'],
    ['household-uncoveredPremiums', '80'],
    ['housing-localMinimumM2', '46'],
    ['housing-usableM2', '46'],
    ['orientationScore', '15'],
    ['contributionMonths', '60'],
  ]) {
    await page.locator(`#de-common-${id}`).fill(value);
  }
  await next.click();

  // Remaining steps (citizenship, fees) stay unconfirmed -> submit to results
  const results = form.getByRole('button', {
    name: zhCN['form.results'],
    exact: true,
  });
  while (!(await results.isVisible())) await next.click();
  await results.click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  for (const name of [
    '一般定居许可',
    zhCN['country.status.FUTURE'].replace('{date}', '2027-05-23'),
    '一般入籍',
    zhCN['country.status.NOT_MET'],
  ]) {
    await expect(
      result.getByRole('heading', { name, exact: true }).first(),
    ).toBeVisible();
  }
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

  // Knobs follow the chosen routes; citizenship livelihood has its own knob.
  await expect(page.locator('#de-whatif-salary')).toHaveCount(0);
  await page.locator('#de-whatif-nat-livelihood').selectOption('true');
  await expect(
    assessment(page, zhCN).locator('li', { hasText: 'DE-C49' }).first(),
  ).toContainText(zhCN['result.PASS']);

  // A date before the first entry is reported on the date control.
  await page.locator('#de-whatif-date').fill('2022-01-01');
  await expect(page.locator('#date-error')).toHaveText(
    zhCN['de.whatif.factAfterDate'],
  );
});

test('English mobile layout and Germany policy sources', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(path());
  const header = page.getByRole('banner');
  await header.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('h1')).toHaveText(en['de.title']);
  await noHorizontalScroll(page);

  // Nested records and open sections stay within a phone-width column.
  await page.goto(path('simulate'));
  const form = questionnaire(page);
  await page.locator('#de-route-R01').check();
  await page.locator('#de-firstEntry').fill('2022-05-23');
  await form.locator('button[type="submit"]').click();
  const add = (scope: typeof form, field: keyof typeof en) =>
    scope
      .getByRole('button', {
        name: `${en['de.form.add']} · ${en[field]}`,
        exact: true,
      })
      .last();
  await add(form, 'de.field.titles').click();
  await add(
    form.getByRole('group', {
      name: `${en['de.field.titles']} 1`,
      exact: true,
    }),
    'de.field.trips',
  ).click();
  await add(form, 'de.field.outsideArea').click();
  await expect(
    page.locator('#de-titles-0-trips-0-outsideArea-0-from'),
  ).toBeVisible();
  await noHorizontalScroll(page);
  await page.locator('#de-titles-0-kind').selectOption('skilled');
  await page.locator('#de-titles-0-trips-0-departed').fill('2024-01-01');
  await page
    .locator('#de-titles-0-trips-0-outsideArea-0-from')
    .fill('2024-01-01');
  await form.locator('button[type="submit"]').click();
  for (const summary of await form.locator('details > summary').all())
    await summary.click();
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
