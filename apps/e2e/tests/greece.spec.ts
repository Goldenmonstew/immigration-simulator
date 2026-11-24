import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

// The answers match longTermDraft() in apps/web/test/greece.test.tsx, where
// the module gives Μ.1 the earliest date 2027-06-01 and 2027-07-01 a met result.
const path = (sub = '') => countryPath('gr', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['gr.policy.title'], exact: true });

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

async function fillLongTerm(page: Page, dict: Dict) {
  const main = page.getByRole('main');
  const form = questionnaire(page);
  const progress = main.getByRole('progressbar');
  const next = form.locator('button[type="submit"]');
  const select = (id: string, value: string) =>
    page.locator(`#${id}`).selectOption(value);
  const fill = (id: string, value: string) =>
    page.locator(`#${id}`).fill(value);
  const confirmNone = (id: string) =>
    page
      .locator(`#${id}`)
      .getByRole('button', { name: dict['gr.form.noRecords'], exact: true })
      .click();
  const openSections = async () => {
    for (const summary of await form.locator('details > summary').all())
      await summary.click();
  };

  // Step 1: no route chosen yet, so the route group takes the focus.
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await next.click();
  await expect(form.getByRole('alert')).toHaveText(dict['form.fixErrors']);
  await expect(page.locator('#gr-pathways')).toBeFocused();
  await fill('gr-simulationDate', '2026-11-23');
  await fill('gr-birthDate', '1985-04-07');
  await select('gr-citizenship', 'third-country');
  await page.locator('#gr-pathway-GR-LONG-TERM').check();
  await next.click();

  // Step 2: permits and trips. The draft survives a reload.
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await form
    .getByRole('button', {
      name: `${dict['gr.form.add']} · ${dict['gr.field.permits']}`,
      exact: true,
    })
    .click();
  await select('gr-permits-0-kind', 'regular');
  await fill('gr-permits-0-from', '2022-06-01');
  await confirmNone('gr-trips');
  await expect(
    page.locator('#gr-trips').getByText(dict['gr.form.emptyConfirmed']),
  ).toBeVisible();
  await next.click();

  // Step 3: documents, conduct, filing and insurance.
  await expect(progress).toHaveAttribute('aria-valuenow', '3');
  await openSections();
  await select('gr-entry', 'permit');
  await select('gr-passport-kind', 'recognised');
  await fill('gr-passport-issuedOn', '2023-08-13');
  await fill('gr-passport-expiresOn', '2033-08-12');
  await fill('gr-passport-blankPages', '2');
  await fill('gr-passport-expectedDeparture', '2033-05-12');
  await select('gr-publicOrder', 'clear');
  await select('gr-filingDocuments-formReady', 'yes');
  await select('gr-filingDocuments-feeReceiptReady', 'yes');
  await select('gr-biometrics', 'awaiting-appointment');
  await confirmNone('gr-changes');
  await select('gr-insurance-kind', 'public');
  await select('gr-insurance-coversFamily', 'yes');
  await next.click();

  // Step 4: the Μ.1 questions.
  await expect(progress).toHaveAttribute('aria-valuenow', '4');
  await openSections();
  await select('gr-longTerm-stage', 'initial');
  await select('gr-longTerm-category', 'ordinary');
  await select('gr-longTerm-passportHistory', 'complete');
  await select('gr-integration-basis', 'language');
  await select('gr-integration-greekLevel', 'B1');
  await fill('gr-residenceIncome-netEur', '12880');
  await fill('gr-residenceIncome-dependants', '0');
  await select('gr-residenceIncome-regularAndDocumented', 'yes');
  await expect(next).toHaveText(dict['form.results']);
  await next.click();
  await expect(page).toHaveURL(path('result'));
}

async function expectLongTermResult(page: Page, dict: Dict) {
  const result = assessment(page, dict);
  for (const name of [
    dict['gr.pathway.GR-LONG-TERM'],
    dict['country.status.FUTURE'].replace('{date}', '2027-06-01'),
  ])
    await expect(
      result.getByRole('heading', { name, exact: true }).first(),
    ).toBeVisible();
  await expect(result.locator('time[datetime="2027-06-01"]')).toBeVisible();
  return result;
}

test('Greece questionnaire, result, saved scenario, share link and what-if', async ({
  page,
  context,
  browser,
}) => {
  const main = page.getByRole('main');
  await page.goto('/');
  await main.locator('a[href="' + path() + '"]').click();
  await expect(page).toHaveURL(path());
  await expect(page.locator('h1')).toHaveText(zhCN['gr.title']);
  await main
    .getByRole('link', { name: zhCN['home.start'], exact: true })
    .click();
  await fillLongTerm(page, zhCN);

  const result = await expectLongTermResult(page, zhCN);
  const originalText = await result.innerText();

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('希腊长期居留');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '希腊长期居留', exact: true }),
  ).toBeVisible();

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

  // The unmet residence condition opens the comparison at the date control.
  await result
    .getByRole('region', { name: zhCN['gap.title'], exact: true })
    .locator('a[href*="?focus=date"]')
    .first()
    .click();
  await expect(page.locator('#gr-whatif-date')).toBeFocused();
  await page.locator('#gr-whatif-date').fill('2027-07-01');
  await expect(assessment(page, zhCN)).toContainText('2027-06-01→2027-07-01');
});

test('English questionnaire on a phone and the Greek policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(path());
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'English', exact: true })
    .click();
  await expect(page.locator('h1')).toHaveText(en['gr.title']);
  await noHorizontalScroll(page);
  await page
    .getByRole('main')
    .getByRole('link', { name: en['home.start'], exact: true })
    .click();
  await fillLongTerm(page, en);
  await expectLongTermResult(page, en);
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  await expect(page.locator('h1')).toHaveText(en['gr.policy.pageTitle']);
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  for (const id of ['SRC-086', 'SRC-089', 'SRC-350'])
    await expect(sources.locator(`[data-source="${id}"] a`)).toHaveAttribute(
      'href',
      /^https:\/\//,
    );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  await expect(sources.locator('[data-source="SRC-110"]')).toHaveCount(0);
  await noHorizontalScroll(page);
});
