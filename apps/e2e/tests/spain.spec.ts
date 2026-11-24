import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('es', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['es.policy.title'], exact: true });

async function copyResult(page: Page, dict: Dict = zhCN) {
  const share = page.getByRole('region', {
    name: dict['share.copy'],
    exact: true,
  });
  await share
    .getByRole('button', { name: dict['share.copy'], exact: true })
    .click();
  await expect(
    share.getByText(dict['share.copied'], { exact: true }),
  ).toBeVisible();
  return page.evaluate(() => navigator.clipboard.readText());
}

async function begin(page: Page, dict: Dict) {
  const main = page.getByRole('main');
  await page.goto('/');
  await main.locator('a[href="' + path() + '"]').click();
  if (dict === en) {
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'English', exact: true })
      .click();
  }
  await main
    .getByRole('link', { name: dict['home.start'], exact: true })
    .click();
  await expect(main.getByRole('progressbar')).toBeVisible();
  const form = questionnaire(page);
  await form.locator('button[type="submit"]').click();
  const error = form.getByRole('alert');
  await expect(error).toBeVisible();
  await expect(error).toHaveText(dict['form.fixErrors']);
  await expect(page.locator('#es-targets')).toBeFocused();
  await expect(page.locator('#es-targets')).toHaveAccessibleDescription(
    dict['es.form.routeError'],
  );
  await page.locator('#es-simulationDate').fill('2026-11-23');
}

test('Spanish questionnaire assesses pathways, saves scenarios, shares links and jumps to what-if controls', async ({
  page,
  context,
  browser,
}) => {
  await begin(page, zhCN);
  await page.locator('#es-target-L').check();
  await page.locator('#es-target-N').check();
  const next = questionnaire(page).getByRole('button', {
    name: zhCN['form.continue'],
    exact: true,
  });
  await next.click();

  const progress = page.getByRole('main').getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.locator('#es-timeRecordsComplete').selectOption('yes');
  await page
    .getByRole('button', {
      name: `${zhCN['es.form.add']} · ${zhCN['es.field.permits']}`,
      exact: true,
    })
    .click();
  await page.locator('#es-permits-0-from').fill('2022-01-01');
  await page
    .getByRole('group', { name: zhCN['es.field.trips'], exact: true })
    .getByRole('button', { name: zhCN['es.form.noRecords'], exact: true })
    .click();
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await expect(page.locator('#es-permits-0-from')).toHaveValue('2022-01-01');

  // Step 2: Nationality
  await next.click();
  await page.locator('#es-nat-route').selectOption('general');
  // Step 3: National Long-Term Residence
  await next.click();
  await page
    .locator('summary')
    .filter({ hasText: zhCN['es.form.resCommon'] })
    .click();
  for (const id of [
    'thirdCountryRegime',
    'entryRestrictionsClear',
    'noReturnCommitmentClear',
    'residentInSpain',
    'validIdentityDocument',
    'competentOfficeAndApplication',
    'criminalCertificatesWhereRequired',
  ]) {
    await page.locator(`#es-res-${id}`).selectOption('yes');
  }
  await page.locator('#es-res-securityDecision').selectOption('clear');
  await page
    .locator('summary')
    .filter({ hasText: zhCN['es.form.resNational'] })
    .click();
  await page
    .locator('#es-res-nationalAlternatives')
    .getByRole('button', { name: zhCN['es.form.noRecords'], exact: true })
    .click();
  await page
    .getByRole('group', { name: zhCN['es.field.children'], exact: true })
    .getByRole('button', { name: zhCN['es.form.noRecords'], exact: true })
    .click();

  // Step 5: Long-term TIE card
  await next.click();
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', {
      name: '长期居留（residencia de larga duración nacional）',
      exact: true,
    }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2027-01-01"]').first()).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: '入籍（nacionalidad por residencia）',
      exact: true,
    }),
  ).toBeVisible();
  await expect(result).toContainText('PD-283');
  const original = await result.innerText();

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('西班牙长居与入籍');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '西班牙长居与入籍', exact: true }),
  ).toBeVisible();

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const url = await copyResult(page, zhCN);
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

  const gaps = result
    .getByRole('region', { name: zhCN['gap.title'], exact: true })
    .last();
  await gaps.locator('a[href*="?focus=dele"]').click();
  await expect(page.locator('#es-whatif-dele')).toBeFocused();
});

test('English mobile questionnaire compares dates on what-if and shows Spanish policy sources without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  await page.locator('#es-target-L').check();
  await noHorizontalScroll(page);

  const next = questionnaire(page).getByRole('button', {
    name: en['form.continue'],
    exact: true,
  });
  await next.click();
  await page.locator('#es-timeRecordsComplete').selectOption('yes');
  await page
    .getByRole('button', {
      name: `${en['es.form.add']} · ${en['es.field.permits']}`,
      exact: true,
    })
    .click();
  await page.locator('#es-permits-0-from').fill('2022-01-01');
  await page
    .getByRole('group', { name: en['es.field.trips'], exact: true })
    .getByRole('button', { name: en['es.form.noRecords'], exact: true })
    .click();
  await noHorizontalScroll(page);

  await next.click();
  await page
    .locator('summary')
    .filter({ hasText: en['es.form.resCommon'] })
    .click();
  for (const id of [
    'thirdCountryRegime',
    'entryRestrictionsClear',
    'noReturnCommitmentClear',
    'residentInSpain',
    'validIdentityDocument',
    'competentOfficeAndApplication',
    'criminalCertificatesWhereRequired',
  ]) {
    await page.locator(`#es-res-${id}`).selectOption('yes');
  }
  await page.locator('#es-res-securityDecision').selectOption('clear');
  await page
    .locator('summary')
    .filter({ hasText: en['es.form.resNational'] })
    .click();
  await page
    .locator('#es-res-nationalAlternatives')
    .getByRole('button', { name: en['es.form.noRecords'], exact: true })
    .click();
  await page
    .getByRole('group', { name: en['es.field.children'], exact: true })
    .getByRole('button', { name: en['es.form.noRecords'], exact: true })
    .click();
  await noHorizontalScroll(page);

  await next.click();
  await questionnaire(page)
    .getByRole('button', { name: en['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', {
      name: 'Long-term residence (residencia de larga duración nacional)',
      exact: true,
    }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2027-01-01"]')).toBeVisible();
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
  const outcome = assessment(page, en)
    .getByText(en['whatif.outcome'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(outcome).toHaveText(
    'Requirements met from 2027-01-01→Requirements met from 2027-01-01',
  );
  await page.locator('#es-whatif-date').fill('2027-01-01');
  await expect(outcome).toHaveText(
    'Requirements met from 2027-01-01→Requirements met',
  );
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-083"] a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.boe\.es\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  const ruleSelector = '[data-rule="ES-L01"]';
  await rules
    .locator('details')
    .filter({ has: page.locator(ruleSelector) })
    .locator('summary')
    .click();
  await expect(rules.locator(ruleSelector)).toBeVisible();
  await noHorizontalScroll(page);
});
