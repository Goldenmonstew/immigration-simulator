import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('jp', sub);
type Dict = Record<keyof typeof zhCN, string>;

const questionnaire = (page: Page) => page.locator('main form');
const assessment = (page: Page, dict: Dict) =>
  page.getByRole('region', { name: dict['jp.policy.title'], exact: true });

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

async function begin(page: Page, dict: Dict) {
  const main = page.getByRole('main');
  await page.goto('/');
  await main.locator('a[href="' + path() + '"]').click();
  if (dict === en) {
    const header = page.getByRole('banner');
    await expect(
      header
        .getByRole('button', { name: '中文', exact: true })
        .getByText('中', { exact: true }),
    ).toBeVisible();
    await header
      .getByRole('button', { name: 'English EN', exact: true })
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
  await expect(page.locator('#jp-routes')).toBeFocused();
  await expect(page.locator('#jp-routes')).toHaveAccessibleDescription(
    dict['jp.form.routeError'],
  );
  await page.locator('#jp-simulationDate').fill('2027-04-03');
}

test('a Japanese questionnaire restores its step, shares its pending assessment and focuses the chosen condition', async ({
  page,
  context,
  browser,
}) => {
  await begin(page, zhCN);
  const header = page.getByRole('banner');
  for (const name of ['中文', 'English']) {
    await expect(
      header.getByRole('button', { name, exact: true }),
    ).toBeVisible();
  }
  await page.locator('#jp-route-nat-general').check();
  await page.locator('#jp-dateOfBirth').fill('1990-01-01');
  await page.locator('#jp-stayStart').fill('2014-04-01');
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
  await page.locator('#jp-nat-general-homeMajorityAge').fill('18');
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();

  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, zhCN);
  await expect(
    result.getByRole('heading', { name: '一般帰化', exact: true }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: zhCN['country.status.UNKNOWN'],
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result
      .locator('[data-status="UNKNOWN"]')
      .getByText('日语会话、阅读与书写', { exact: true }),
  ).toBeVisible();
  await expect(result).toContainText('PD-364');
  const original = await result.innerText();

  const scenarios = page.getByRole('region', {
    name: zhCN['scenarios.title'],
    exact: true,
  });
  await scenarios
    .getByLabel(zhCN['scenarios.name'], { exact: true })
    .fill('帰化咨询');
  await scenarios
    .getByRole('button', { name: zhCN['scenarios.save'], exact: true })
    .click();
  await page.reload();
  await expect(
    scenarios.getByRole('heading', { name: '帰化咨询', exact: true }),
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

  const gaps = result.getByRole('region', {
    name: zhCN['gap.title'],
    exact: true,
  });
  await gaps
    .getByRole('button', { name: zhCN['gap.more'], exact: true })
    .click();
  await gaps.locator('a[href$="?focus=natJapanese"]').click();
  await expect(page.locator('#jp-whatif-nat-japanese')).toBeFocused();
});

test('English mobile questionnaire compares filing dates and shows Japanese policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  const header = page.getByRole('banner');
  for (const [short, full] of [
    ['ZH', 'Chinese'],
    ['EN', 'English'],
  ]) {
    const button = header.getByRole('button', {
      name: `${full} ${short}`,
      exact: true,
    });
    await expect(button.getByText(short, { exact: true })).toBeVisible();
  }
  await page.locator('#jp-route-travel-ordinary').check();
  await noHorizontalScroll(page);
  const next = questionnaire(page).getByRole('button', {
    name: en['form.continue'],
    exact: true,
  });
  await expect(page.locator('#jp-stayStart')).toHaveCount(0);
  await next.click();
  const field = (key: string) => page.locator('#jp-travel-ordinary-' + key);
  await field('departureOn').fill('2027-04-12');
  await field('returnOn').fill('2027-04-19');
  await field('permit-effectiveOn').fill('2027-04-05');
  await field('permit-expiresOn').fill('2028-04-04');
  for (const key of [
    'lawfulStatus',
    'inJapanWhenApplying',
    'intendsReturn',
    'passportOrApprovedAlternative',
    'residentCardOrCertificate',
    'stayIndefinite',
  ]) {
    await field(key).selectOption('yes');
  }
  for (const key of [
    'excludedStatusOrDetention',
    'permitVoided',
    'permit-extensionApproved',
  ]) {
    await field(key).selectOption('no');
  }
  await field('visits').selectOption('multiple');
  await field('channel').selectOption('counter');
  await noHorizontalScroll(page);
  await questionnaire(page)
    .getByRole('button', { name: en['form.results'], exact: true })
    .click();
  await expect(page).toHaveURL(path('result'));
  const result = assessment(page, en);
  await expect(
    result.getByRole('heading', {
      name: 'Ordinary re-entry permit',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    result.getByRole('heading', {
      name: en['country.status.MET'],
      exact: true,
    }),
  ).toBeVisible();
  await result
    .locator('summary')
    .filter({ hasText: /^Met\s*\(/ })
    .click();
  await expect(
    result.getByText('Ordinary permit eligibility and documents', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(result.locator('time[datetime="2027-04-05"]')).toBeVisible();
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
  const comparison = assessment(page, en)
    .getByText(en['result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText('2027-04-05→2027-04-05');
  await page.locator('#jp-whatif-date').fill('2027-04-06');
  await expect(comparison).toHaveText(
    '2027-04-05→' + en['result.undetermined'],
  );
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  const sources = page.getByRole('region', {
    name: en['policyPage.sources'],
    exact: true,
  });
  await expect(sources.locator('[data-source="SRC-461"] a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.moj\.go\.jp\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  const rules = page.getByRole('region', {
    name: en['policyPage.rules'],
    exact: true,
  });
  const validity = '[data-rule="jp.reentry.ordinary-validity"]';
  await rules
    .locator('details')
    .filter({ has: page.locator(validity) })
    .locator('summary')
    .click();
  await expect(rules.locator(validity)).toBeVisible();
  await noHorizontalScroll(page);
});

test('returning to results after another tab submits uses the same draft for display and sharing', async ({
  page,
  context,
}) => {
  await begin(page, zhCN);
  const ordinary = '#jp-route-travel-ordinary';
  await page.locator(ordinary).check();
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.continue'], exact: true })
    .click();
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();
  await expect(
    assessment(page, zhCN).getByRole('heading', {
      name: '普通再入国許可',
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole('main')
    .getByRole('link', { name: zhCN['whatif.title'], exact: true })
    .first()
    .click();
  const back = page
    .getByRole('region', { name: zhCN['whatif.controls'], exact: true })
    .getByRole('link', {
      name: zhCN['whatif.back'],
      exact: true,
    });
  await expect(back).toBeVisible();

  const other = await context.newPage();
  await other.goto(path('simulate'));
  await other.locator(ordinary).uncheck();
  await other.locator('#jp-route-travel-deemed').check();
  await questionnaire(other)
    .getByRole('button', { name: zhCN['form.continue'], exact: true })
    .click();
  const departure = '2027-04-12';
  await other.locator('#jp-travel-deemed-departureOn').fill(departure);
  await expect(
    other.locator('#jp-travel-deemed-declaredIntentAtDeparture'),
  ).toHaveCount(0);
  await expect(
    questionnaire(other).getByText(
      zhCN['jp.result.plannedDeparture'].replace('{date}', departure),
      { exact: true },
    ),
  ).toBeVisible();
  await questionnaire(other)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();
  const deemed = { name: 'みなし再入国許可', exact: true };
  await expect(
    assessment(other, zhCN).getByRole('heading', deemed),
  ).toBeVisible();

  await back.click();
  await expect(
    assessment(page, zhCN).getByRole('heading', deemed),
  ).toBeVisible();
  await expect(
    assessment(page, zhCN).getByRole('heading', {
      name: '普通再入国許可',
      exact: true,
    }),
  ).toHaveCount(0);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.bringToFront();
  const shared = new URL(await copyResult(page));
  const encoded = new URLSearchParams(shared.hash.slice(1)).get('s')!;
  expect(
    JSON.parse(Buffer.from(encoded, 'base64url').toString()).draft.reentry,
  ).toEqual([{ route: 'deemed', departureOn: departure }]);
});
