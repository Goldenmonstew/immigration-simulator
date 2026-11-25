import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('ie', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', {
    name: dict === en ? 'Current law and policy' : '现行法律与政策',
    exact: true,
  });
const button = (page: Page, name: string) =>
  questionnaire(page).getByRole('button', { name, exact: true });
// Questions in a collapsed section are answered after opening it.
const openSection = (page: Page, title: string) =>
  questionnaire(page).locator('summary', { hasText: title }).click();

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
  // Submitting without a pathway focuses the pathway list.
  await questionnaire(page).locator('button[type="submit"]').click();
  await expect(questionnaire(page).getByRole('alert')).toHaveText(
    dict['form.fixErrors'],
  );
  await expect(page.locator('#ie-pathways')).toBeFocused();
  await expect(page.locator('#ie-pathways')).toHaveAccessibleDescription(
    dict['ie.error.pathways'],
  );
}

async function answer(page: Page, values: Record<string, string>) {
  for (const [id, value] of Object.entries(values)) {
    const field = page.locator('#' + id);
    if ((await field.evaluate((element) => element.tagName)) === 'SELECT')
      await field.selectOption(value);
    else await field.fill(value);
  }
}

const registration = {
  'ie-registration-basis': 'required',
  'ie-registration-irpExpiresOn': '2027-01-31',
  'ie-registration-validPermission': 'yes',
  'ie-registration-passportValid': 'yes',
  'ie-registration-addressCurrent': 'yes',
  'ie-registration-registrationDate': '2026-11-23',
  'ie-registration-feeExemption': 'none',
  'ie-registration-feePrepared': 'yes',
};
const work = {
  'ie-work-basis': 'csep',
  'ie-work-validCorrespondingPermission': 'yes',
  'ie-work-employedInState': 'yes',
  'ie-work-passportIrpAndPermits': 'yes',
  'ie-work-payslipAndRevenueEvidence': 'yes',
  'ie-work-employerLetterOn': '2026-08-23',
  'ie-work-recordsConsistent': 'yes',
  'ie-work-termsComplied': 'yes',
  'ie-work-character-record': 'none',
  'ie-work-character-disclosed': 'yes',
  'ie-work-permissionRevoked': 'no',
  'ie-work-isdApproved': 'yes',
};
// 21 months on a Critical Skills permit from 2025-05-20 (unit test: 2027-02-20).
const workTitle = '就业类 Stamp 4（CSEP、研究员、多地点 GEP 医师）';

test('a work Stamp 4 questionnaire shows conditions, saves, shares and compares a later start of work', async ({
  page,
  context,
  browser,
}) => {
  await begin(page, zhCN);
  await answer(page, {
    'ie-simulationDate': '2026-11-23',
    'ie-dateOfBirth': '1990-01-01',
    'ie-currentLocation': 'state',
  });
  await page.locator('#ie-pathway-IE-STAMP4-21').check();
  await button(page, zhCN['form.continue']).click();

  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  // Lists must be answered: records added, or "none" confirmed.
  await button(page, zhCN['form.continue']).click();
  await expect(page.locator('#ie-permissions')).toBeFocused();
  await expect(page.locator('#ie-permissions')).toHaveAccessibleDescription(
    zhCN['ie.error.list'],
  );
  await button(
    page,
    `${zhCN['ie.form.add']} · ${zhCN['ie.field.permissions']}`,
  ).click();
  await answer(page, {
    'ie-permissions-0-kind': 'stamp1-csep',
    'ie-permissions-0-from': '2025-05-20',
  });
  await page
    .locator('#ie-trips')
    .getByRole('button', { name: zhCN['ie.form.confirmNone'], exact: true })
    .click();
  await expect(page.locator('#ie-trips')).toContainText(
    zhCN['ie.form.noneConfirmed'],
  );
  await openSection(page, zhCN['ie.form.section.registration']);
  await answer(page, registration);
  await button(page, zhCN['form.continue']).click();
  await expect(progress).toHaveAttribute('aria-valuenow', '3');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '3');

  await answer(page, { 'ie-employmentStart': '2025-05-20' });
  await openSection(page, zhCN['ie.form.section.workUpgrade']);
  await answer(page, work);
  await button(page, zhCN['form.results']).click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', { name: workTitle, exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.FUTURE'].replace('{date}', '2027-02-20'),
      exact: true,
    }),
  ).toBeVisible();
  // The unmet time condition has a short title and its sentence below it.
  const workTime = result.locator('[data-status="FAIL"]');
  await expect(workTime.locator('strong')).toHaveText(
    zhCN['ie.policy.rule.stamp4WorkTime'],
  );
  await expect(workTime).toContainText('自 2025-05-20 开始受雇满 21 个月');
  await expect(result).toContainText(zhCN['ie.result.projected']);
  const original = await result.innerText();

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('Stamp 4 升级');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: 'Stamp 4 升级', exact: true }),
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

  // The unmet condition links to the start-of-work control.
  await result
    .getByRole('region', { name: zhCN['gap.title'], exact: true })
    .locator('a[href*="?focus=employment"]')
    .click();
  const control = page.locator('#ie-whatif-employment');
  await expect(control).toBeFocused();
  const comparison = assessment(page, zhCN)
    .getByText(zhCN['result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText('2027-02-20→2027-02-20');
  await control.fill('2025-09-10');
  await expect(comparison).toHaveText('2027-02-20→2027-06-10');
});

test('English mobile questionnaire, results and policy sources for naturalisation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  await answer(page, { 'ie-simulationDate': '2026-11-23' });
  await page.locator('#ie-pathway-IE-NATURALISATION').check();
  await noHorizontalScroll(page);
  await button(page, en['form.continue']).click();

  await button(
    page,
    `${en['ie.form.add']} · ${en['ie.field.permissions']}`,
  ).click();
  await answer(page, {
    'ie-permissions-0-kind': 'stamp4',
    'ie-permissions-0-from': '2016-01-01',
  });
  await page
    .locator('#ie-trips')
    .getByRole('button', { name: en['ie.form.confirmNone'], exact: true })
    .click();
  await noHorizontalScroll(page);
  await button(page, en['form.continue']).click();

  await openSection(page, en['ie.form.section.natDocuments']);
  await noHorizontalScroll(page);
  await button(page, en['form.results']).click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', {
      name: 'Ordinary naturalisation',
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
      .getByText('Adult age and citizenship', { exact: true }),
  ).toBeVisible();
  await expect(result).toContainText('PD-320');
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
  await expect(page.locator('#ie-whatif-date')).toHaveValue('2026-11-23');
  await expect(page.locator('#ie-whatif-irp')).toBeVisible();
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: en['ie.policy.pageTitle'],
      exact: true,
    }),
  ).toBeVisible();
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-091"] a')).toHaveAttribute(
    'href',
    /^https:\/\/revisedacts\.lawreform\.ie\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  await expect(sources.locator('[data-source="SRC-110"]')).toHaveCount(0);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  await rules.locator('summary').first().click();
  await expect(rules.locator('[data-rule="IE-A01"]')).toBeVisible();
  await noHorizontalScroll(page);
});
