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
    await header.getByRole('button', { name: 'English', exact: true }).click();
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

test('an old named plan shows the same renewal correction from home, results, reload and a shared link', async ({
  page,
  context,
  browser,
}) => {
  await page.goto(path('result'));
  await page.evaluate(() => {
    localStorage.setItem(
      'jp-immigration-scenarios-v1',
      JSON.stringify([
        {
          id: 'old-renewal',
          name: '旧续期方案',
          savedAt: '2026-11-24',
          draft: {
            version: 1,
            step: 0,
            completed: true,
            simulationDate: '2026-11-24',
            stayStart: '',
            trips: [],
            permanentResidence: { routes: [], evidence: {} },
            naturalisation: { routes: [], evidence: {} },
            reentry: [
              {
                route: 'ordinary',
                departureOn: '2024-04-01',
                returnOn: '2024-04-07',
                stayExpiresOn: '2024-04-03',
                timelyRenewalPending: true,
                renewalDecisionOn: '2024-03-29',
              },
            ],
          },
        },
      ]),
    );
  });
  await page.reload();
  const load = page.getByRole('link', {
    name: zhCN['scenarios.load'] + ' 旧续期方案',
    exact: true,
  });
  const share = page.getByRole('button', {
    name: zhCN['share.copy'],
    exact: true,
  });
  const stored = (tab: Page) =>
    tab.evaluate(() =>
      JSON.parse(localStorage.getItem('jp-immigration-draft-v1') ?? 'null'),
    );
  const correction = zhCN['jp.result.correctRenewalAtDeparture'].replace(
    '{step}',
    zhCN['jp.form.step6'],
  );
  async function expectCorrection(tab: Page) {
    const heading = tab.getByRole('heading', {
      level: 1,
      name: zhCN['result.title'],
    });
    await expect(
      heading.locator('..').getByText(correction, { exact: true }),
    ).toBeVisible();
    await expect(
      tab.getByRole('button', { name: zhCN['share.copy'], exact: true }),
    ).toHaveCount(0);
    await expect(
      tab.getByRole('button', { name: zhCN['scenarios.save'], exact: true }),
    ).toHaveCount(0);
    await expect(
      tab.getByText(zhCN['result.empty'], { exact: true }),
    ).toHaveCount(0);
  }

  const card = page.getByRole('listitem').filter({ has: load });
  await expect(card.getByText(zhCN['scenarios.needsCorrection'])).toBeVisible();
  await expect(card.locator('dl')).toHaveCount(0);
  await load.click();
  await expect
    .poll(() => stored(page))
    .toMatchObject({ completed: false, step: 6 });
  await expectCorrection(page);
  await page.reload();
  await expect(load).toBeVisible();
  await expectCorrection(page);
  expect(await stored(page)).toMatchObject({ completed: false, step: 6 });

  await page.evaluate(() => localStorage.removeItem('jp-immigration-draft-v1'));
  await page.goto(path());
  await expect(card.getByText(zhCN['scenarios.needsCorrection'])).toBeVisible();
  await expect(card.locator('dl')).toHaveCount(0);
  await load.click();
  await expect(page).toHaveURL(path('result'));
  await expectCorrection(page);

  const legacyShare = Buffer.from(
    JSON.stringify({
      country: 'jp',
      v: 1,
      draft: { ...(await stored(page)), completed: true },
    }),
  ).toString('base64url');

  await page
    .getByRole('link', { name: zhCN['result.edit'], exact: true })
    .click();
  await page
    .locator('#jp-travel-ordinary-renewalDecisionOn')
    .fill('2024-04-05');
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();
  await expect(share).toBeVisible();
  const corrected = await stored(page);
  expect(corrected).toMatchObject({
    completed: true,
    reentry: [{ renewalDecisionOn: '2024-04-05' }],
  });
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const link = await copyResult(page);
  const receiver = await browser.newPage();
  try {
    await receiver.goto(
      new URL(path('result') + '#s=' + legacyShare, link).href,
    );
    await expectCorrection(receiver);
    expect(await stored(receiver)).toBeNull();
    await receiver.goto(link);
    await expect(
      receiver.getByText(zhCN['share.loaded'], { exact: true }),
    ).toBeVisible();
    expect(await stored(receiver)).toEqual(corrected);
  } finally {
    await receiver.close();
  }
});

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
  await gaps.locator('a[href*="?focus=natJapanese"]').click();
  await expect(page.locator('#jp-whatif-nat-japanese')).toBeFocused();
});

test('English mobile questionnaire compares filing dates and shows Japanese policy sources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page, en);
  const header = page.getByRole('banner');
  for (const [short, name] of [
    ['ZH', 'Chinese ZH'],
    ['EN', 'English'],
  ]) {
    const button = header.getByRole('button', { name, exact: true });
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
  await field('permit-effectiveOn').fill('2027-04-06');
  await field('permit-expiresOn').fill('2028-04-04');
  await field('channel').selectOption('counter');
  await expect(questionnaire(page)).toContainText(
    'The candidate filing date is 2027-04-05',
  );
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
    result.getByText(
      'Eligibility and documents for a new ordinary re-entry permit',
      {
        exact: true,
      },
    ),
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
  ).toMatchObject([
    {
      route: 'deemed',
      departureOn: departure,
      alreadyDeparted: null,
      passportValid: null,
    },
  ]);
});

const departure = '2026-11-23';
const draftKey = 'jp-immigration-draft-v1';
function shareFragment(route: 'deemed' | 'ordinary', returnOn: string) {
  const draft = {
    version: 1,
    step: 0,
    completed: true,
    simulationDate: '2026-11-26',
    stayStart: '',
    trips: [],
    permanentResidence: { routes: [], evidence: {} },
    naturalisation: { routes: [], evidence: {} },
    reentry: [{ route, departureOn: departure, returnOn }],
  };
  return (
    '#s=' +
    Buffer.from(JSON.stringify({ country: 'jp', v: 1, draft })).toString(
      'base64url',
    )
  );
}
const deemedHash = shareFragment('deemed', '2026-11-27');
const deemedShare = path('result') + deemedHash;

test('switching Japanese scenario links in one tab restores the selected route, dates and edit history', async ({
  page,
}) => {
  const ordinaryHash = shareFragment('ordinary', '2026-12-03');
  const switchToOrdinary = () =>
    page.evaluate((hash) => {
      location.hash = hash;
    }, ordinaryHash);
  const title = (name: string) =>
    assessment(page, zhCN).getByRole('heading', { name, exact: true });
  await page.goto(deemedShare);
  await expect(title('みなし再入国許可')).toBeVisible();
  await switchToOrdinary();
  await expect(title('普通再入国許可')).toBeVisible();
  await page.goBack();
  await expect(title('みなし再入国許可')).toBeVisible();
  const main = page.getByRole('main');
  const edit = await main
    .getByRole('link', { name: zhCN['result.edit'], exact: true })
    .first()
    .getAttribute('href');
  await main
    .getByRole('link', { name: zhCN['whatif.title'], exact: true })
    .first()
    .click();
  await expect(page.locator('#jp-whatif-deemed')).toHaveValue('2026-11-27');
  await switchToOrdinary();
  await expect(title('普通再入国許可')).toBeVisible();
  await expect(page.locator('#jp-whatif-ordinary')).toHaveValue('2026-12-03');
  await expect(page.locator('#jp-whatif-deemed')).toHaveCount(0);

  await page.goto(edit!);
  await expect(page.locator('#jp-route-travel-deemed')).toBeChecked();
  await switchToOrdinary();
  await expect(page.locator('#jp-route-travel-ordinary')).toBeChecked();
  await expect(page.locator('#jp-route-travel-deemed')).not.toBeChecked();
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.continue'], exact: true })
    .click();
  const returnDate = page.locator('#jp-travel-ordinary-returnOn');
  await expect(returnDate).toHaveValue('2026-12-03');
  await returnDate.fill('2026-12-04');
  await page.goBack();
  await expect(page.locator('#jp-route-travel-deemed')).toBeChecked();
  await page.goForward();
  await expect(returnDate).toHaveValue('2026-12-04');
  await page.reload();
  await expect(returnDate).toHaveValue('2026-12-04');
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    draftKey,
  );
  expect(saved.reentry).toEqual([
    { route: 'deemed', departureOn: departure, returnOn: '2026-11-27' },
  ]);
});

test('a shared result keeps its scenario for comparison and editing after another tab saves a draft', async ({
  page,
  context,
}) => {
  await page.clock.setFixedTime(new Date('2026-11-23T23:59:00Z'));
  await page.goto(deemedShare);
  const main = page.getByRole('main');
  const planned = zhCN['jp.result.plannedDeparture'].replace(
    '{date}',
    departure,
  );
  const actual = zhCN['jp.result.confirmDeparture'].replace(
    '{date}',
    departure,
  );
  await expect(main).toContainText(planned);
  const other = await context.newPage();
  await other.goto(path('simulate'));
  await other.locator('#jp-route-travel-deemed').uncheck();
  await other.locator('#jp-route-travel-ordinary').check();
  await questionnaire(other)
    .getByRole('button', { name: zhCN['form.continue'], exact: true })
    .click();
  await questionnaire(other)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();
  await expect(
    assessment(other, zhCN).getByRole('heading', {
      name: '普通再入国許可',
      exact: true,
    }),
  ).toBeVisible();
  const stored = () =>
    other.evaluate((key) => localStorage.getItem(key), draftKey);
  const edited = await stored();
  expect(JSON.parse(edited!).reentry).toEqual([{ route: 'ordinary' }]);

  await main
    .getByRole('link', { name: zhCN['whatif.title'], exact: true })
    .first()
    .click();
  await expect(
    assessment(page, zhCN).getByRole('heading', {
      name: 'みなし再入国許可',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('#jp-whatif-deemed')).toHaveValue('2026-11-27');
  await expect(page.locator('#jp-whatif-ordinary')).toHaveCount(0);
  expect(await stored()).toBe(edited);
  await main
    .getByRole('link', { name: zhCN['whatif.back'], exact: true })
    .click();
  await expect(main).toContainText(planned);
  expect(await stored()).toBe(edited);

  const setVisibility = (state: DocumentVisibilityState) =>
    page.evaluate((state) => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: state,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    }, state);
  await setVisibility('hidden');
  await page.clock.setFixedTime(new Date('2026-11-24T00:01:00Z'));
  await expect(main).toContainText(planned);
  await setVisibility('visible');
  await expect(main).toContainText(actual);
  await expect(main).not.toContainText(planned);
  expect(await stored()).toBe(edited);

  await main
    .getByRole('link', { name: zhCN['result.edit'], exact: true })
    .last()
    .click();
  await expect(page.locator('#jp-route-travel-deemed')).toBeChecked();
  await expect(page.locator('#jp-route-travel-ordinary')).not.toBeChecked();
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.continue'], exact: true })
    .click();
  await expect(page.locator('#jp-travel-deemed-departureOn')).toHaveValue(
    departure,
  );
  await page.locator('#jp-travel-deemed-returnOn').fill('2026-11-28');
  await page.reload();
  await expect(page.locator('#jp-travel-deemed-returnOn')).toHaveValue(
    '2026-11-28',
  );
  expect(await stored()).toBe(edited);
  await questionnaire(page)
    .getByRole('button', { name: zhCN['form.results'], exact: true })
    .click();
  await expect(
    assessment(page, zhCN).getByRole('heading', {
      name: 'みなし再入国許可',
      exact: true,
    }),
  ).toBeVisible();
  expect(JSON.parse((await stored())!).reentry).toMatchObject([
    { route: 'deemed', returnOn: '2026-11-28' },
  ]);
});

test.describe('device in Japan', () => {
  test.use({ timezoneId: 'Asia/Tokyo' });

  for (const { name, entry, answer } of [
    {
      name: 'default pending on departure day',
      entry: '2026-11-23',
      answer: '',
    },
    { name: 'a plan entered one day ahead', entry: '2026-11-22', answer: '' },
    { name: 'explicit no on departure day', entry: '2026-11-23', answer: 'no' },
  ]) {
    test(`${name} still requires departure confirmation after midnight locally and when shared`, async ({
      page,
      context,
      browser,
    }) => {
      const start = new Date(entry + 'T23:59:00+09:00');
      const after = new Date('2026-11-24T00:01:00+09:00');
      await page.clock.install({ time: start });
      await page.goto(path('simulate'));
      await page.locator('#jp-simulationDate').fill('2026-11-26');
      await page.locator('#jp-route-travel-deemed').check();
      const submit = (tab: Page) =>
        questionnaire(tab).locator('button[type="submit"]').click();
      const departed = (tab: Page) =>
        tab.locator('#jp-travel-deemed-alreadyDeparted');
      const declaration = (tab: Page) =>
        tab.locator('#jp-travel-deemed-declaredIntentAtDeparture');
      await submit(page);
      await page.locator('#jp-travel-deemed-departureOn').fill(departure);
      if (entry === departure) await expect(departed(page)).toHaveValue('');
      else await expect(departed(page)).toHaveCount(0);
      if (answer) await departed(page).selectOption(answer);
      await submit(page);
      const hint = (
        key: 'plannedDeparture' | 'unconfirmedDeparture' | 'confirmDeparture',
      ) => zhCN[`jp.result.${key}`].replace('{date}', departure);
      await expect(page.getByRole('main')).toContainText(
        hint('plannedDeparture'),
      );
      const stored = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        draftKey,
      );
      expect(stored.reentry[0].alreadyDeparted).toBe(answer ? false : null);
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const link = await copyResult(page);
      await page.clock.fastForward(after.getTime() - start.getTime());

      const receiver = await browser.newPage({
        timezoneId: 'Asia/Tokyo',
        locale: 'zh-CN',
      });
      try {
        await receiver.clock.setFixedTime(after);
        await receiver.goto(link);
        await expect(
          receiver.getByText(zhCN['share.loaded'], { exact: true }),
        ).toBeVisible();
        for (const tab of [page, receiver]) {
          const main = tab.getByRole('main');
          await expect(main).toContainText(hint('unconfirmedDeparture'));
          await expect(main).not.toContainText(hint('confirmDeparture'));
          await main
            .getByRole('link', { name: zhCN['result.edit'], exact: true })
            .first()
            .click();
          await submit(tab);
          await expect(departed(tab)).toHaveValue(answer);
          await expect(declaration(tab)).toHaveCount(0);
        }
        await departed(page).selectOption('yes');
        await expect(declaration(page)).toBeVisible();
        await submit(page);
        await expect(page.getByRole('main')).toContainText(
          hint('confirmDeparture'),
        );
      } finally {
        await receiver.close();
      }
    });
  }

  for (const shared of [true, false]) {
    test(`a continuously visible Japanese ${shared ? 'shared' : 'local'} result keeps its scenario at device midnight`, async ({
      page,
      context,
    }) => {
      const other = await context.newPage();
      await other.goto(path());
      await page.bringToFront();
      await page.clock.install({ time: new Date('2026-11-23T23:59:00+09:00') });
      await page.goto(deemedShare);
      const main = page.getByRole('main');
      const planned = zhCN['jp.result.plannedDeparture'].replace(
        '{date}',
        departure,
      );
      await expect(main).toContainText(planned);
      if (!shared) {
        await page.goto(path('result'));
        await expect(main).not.toContainText(zhCN['share.loaded']);
        await expect(main).toContainText(planned);
      }
      const unfinished = await other.evaluate((key) => {
        const draft = JSON.parse(localStorage.getItem(key)!);
        draft.completed = false;
        draft.reentry = [{ route: 'ordinary' }];
        const saved = JSON.stringify(draft);
        localStorage.setItem(key, saved);
        return saved;
      }, draftKey);
      expect(await page.evaluate(() => document.visibilityState)).toBe(
        'visible',
      );
      await page.getByRole('button', { name: 'English', exact: true }).click();
      await expect(main).toContainText(
        en['jp.result.plannedDeparture'].replace('{date}', departure),
      );
      await page.clock.fastForward('01:01');
      await expect(main).toContainText(
        en['jp.result.confirmDeparture'].replace('{date}', departure),
      );
      await page
        .getByRole('button', { name: en['site.chinese'], exact: true })
        .click();
      await expect(main).toContainText(
        zhCN['jp.result.confirmDeparture'].replace('{date}', departure),
      );
      await expect(main).not.toContainText(planned);
      await expect(
        assessment(page, zhCN).getByRole('heading', {
          name: 'みなし再入国許可',
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await other.evaluate((key) => localStorage.getItem(key), draftKey),
      ).toBe(unfinished);
    });
  }
});
