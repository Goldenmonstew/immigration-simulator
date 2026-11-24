import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';
import { countryPath } from '../../web/lib/site-countries';
import { noHorizontalScroll } from './helpers';

const path = (sub = '') => countryPath('jp', sub);
type Dict = Record<keyof typeof zhCN, string>;

async function begin(page: Page, dict: Dict) {
  await page.goto('/');
  await page.locator('a[href="' + path() + '"]').click();
  if (dict === en) await page.getByRole('button', { name: 'English' }).click();
  await page
    .locator('main a[href="' + path('simulate') + '"]')
    .first()
    .click();
  await expect(page.getByRole('progressbar')).toBeVisible();
  await page.getByRole('button', { name: dict['form.continue'] }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.locator('#jp-simulationDate').fill('2027-04-03');
  await page.locator('#jp-stayStart').fill('2014-04-01');
}

test('a Japanese questionnaire restores its step, shares its pending assessment and focuses the chosen condition', async ({
  page,
  context,
  browser,
}) => {
  await begin(page, zhCN);
  await page.locator('#jp-dateOfBirth').fill('1990-01-01');
  await page.locator('#jp-route-nat-general').check();
  const next = page.getByRole('button', { name: zhCN['form.continue'] });
  await next.click();
  const progress = page.getByRole('progressbar');
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await next.click();
  await page.locator('#jp-nat-general-homeMajorityAge').fill('18');
  await page.getByRole('button', { name: zhCN['form.results'] }).click();

  await expect(page).toHaveURL(path('result'));
  await expect(
    page.getByRole('heading', { name: '一般帰化', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      name: zhCN['country.status.UNKNOWN'],
      exact: true,
    }),
  ).toBeVisible();
  const result = page.getByRole('region', {
    name: '日本现行及已公布规则',
    exact: true,
  });
  await expect(
    result
      .locator('[data-status="UNKNOWN"]')
      .getByText('日语会话、阅读与书写', { exact: true }),
  ).toBeVisible();
  await expect(result).toContainText('PD-364');
  const original = await result.innerText();

  await page.getByLabel(zhCN['scenarios.name']).fill('帰化咨询');
  await page.getByRole('button', { name: zhCN['scenarios.save'] }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: '帰化咨询' })).toBeVisible();

  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: zhCN['share.copy'] }).click();
  await expect(
    page.getByText(zhCN['share.copied'], { exact: true }),
  ).toBeVisible();
  const url = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(url).pathname).toBe(path('result'));
  expect(new URL(url).hash).toMatch(/^#s=.+/);
  const receiver = await browser.newContext();
  try {
    const shared = await receiver.newPage();
    await shared.goto(url);
    await expect(shared.getByText(zhCN['share.loaded'])).toBeVisible();
    await expect(
      shared.getByRole('region', { name: '日本现行及已公布规则', exact: true }),
    ).toHaveText(original, { useInnerText: true });
  } finally {
    await receiver.close();
  }

  const gaps = page.getByRole('region', {
    name: zhCN['gap.title'],
    exact: true,
  });
  await gaps.getByRole('button', { name: zhCN['gap.more'] }).click();
  await gaps.locator('a[href$="?focus=natJapanese"]').click();
  await expect(page.locator('#jp-whatif-nat-japanese')).toBeFocused();
});

test('English mobile questionnaire compares filing dates and shows Japanese policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  await page.locator('#jp-route-travel-ordinary').check();
  await noHorizontalScroll(page);
  const next = page.getByRole('button', { name: en['form.continue'] });
  await next.click();
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
  for (const key of ['excludedStatusOrDetention', 'permitVoided']) {
    await field(key).selectOption('no');
  }
  await field('visits').selectOption('multiple');
  await field('channel').selectOption('counter');
  await noHorizontalScroll(page);
  await page.getByRole('button', { name: en['form.results'] }).click();
  await expect(page).toHaveURL(path('result'));
  await expect(
    page.getByRole('heading', {
      name: 'Ordinary re-entry permit',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: en['country.status.MET'], exact: true }),
  ).toBeVisible();
  const result = page.getByRole('region', {
    name: 'Japan’s current and published rules',
    exact: true,
  });
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
    .getByRole('link', { name: en['whatif.title'], exact: true })
    .first()
    .click();
  const comparison = page
    .getByText(en['result.earliest'], { exact: true })
    .locator('xpath=following-sibling::dd[1]');
  await expect(comparison).toHaveText('2027-04-05→2027-04-05');
  await page.locator('#jp-whatif-date').fill('2027-04-06');
  await expect(comparison).toHaveText('2027-04-05→2027-04-06');
  await noHorizontalScroll(page);

  await page.goto(path('policy'));
  const sources = page.getByRole('region', { name: en['policyPage.sources'] });
  await expect(sources.locator('[data-source="SRC-461"] a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.moj\.go\.jp\//,
  );
  await expect(sources.locator('[data-source="SRC-001"]')).toHaveCount(0);
  await page
    .getByRole('region', { name: en['policyPage.rules'] })
    .locator('summary')
    .last()
    .click();
  await expect(
    page.locator('[data-rule="jp.reentry.ordinary-validity"]'),
  ).toBeVisible();
  await noHorizontalScroll(page);
});
