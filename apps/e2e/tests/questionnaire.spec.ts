import { expect, test, type Page } from '@playwright/test';
import { en } from '../../web/i18n/en';
import { zhCN } from '../../web/i18n/zh-CN';

// Clicks through the whole questionnaire from the home page, as a user would,
// and checks the result page against golden cases from
// packages/engine/test/golden/cases.ts.

type Dict = Record<keyof typeof zhCN, string>;

interface Scenario {
  date: string;
  absence?: [string, string];
  outcome: 'outcome.LIKELY_ELIGIBLE' | 'outcome.LIKELY_NOT_ELIGIBLE';
  earliest: string;
}

async function runQuestionnaire(page: Page, t: Dict, s: Scenario) {
  const next = () =>
    page.getByRole('button', { name: t['form.continue'] }).click();
  await page.getByRole('link', { name: t['home.start'] }).click();

  await page.getByLabel(t['basic.dob']).fill('1992-04-10');
  await page
    .getByRole('combobox', { name: t['basic.nationality'] })
    .fill('IND');
  await next();

  for (const key of [
    'screening.criminality',
    'screening.breach',
    'screening.debt',
  ] as const)
    await page
      .getByRole('group', { name: t[key] })
      .getByRole('radio', { name: t['form.no'] })
      .check();
  await next();

  await page.getByRole('button', { name: t['episodes.add'] }).click();
  const episode = page.getByRole('group', { name: `${t['episodes.item']} 1` });
  await episode.getByLabel(t['episodes.route']).selectOption('SKILLED_WORKER');
  await episode.getByLabel(t['episodes.from']).fill('2021-06-01');
  await episode.getByLabel(t['episodes.to']).fill('2027-05-31');
  await episode.getByLabel(t['episodes.soc']).fill('2136');
  await episode.getByLabel(t['episodes.salary']).fill('52000');
  await next();

  if (s.absence) {
    await page.getByRole('button', { name: t['absences.add'] }).click();
    const absence = page.getByRole('group', {
      name: `${t['absences.item']} 1`,
    });
    await absence.getByLabel(t['absences.from']).fill(s.absence[0]);
    await absence.getByLabel(t['absences.to']).fill(s.absence[1]);
  }
  await next();

  for (const year of ['2021-22', '2022-23', '2023-24', '2024-25', '2025-26'])
    await page
      .getByRole('group', { name: year })
      .getByLabel(t['income.earnings'], { exact: true })
      .fill('52000');
  await next();
  await next(); // no benefits
  await next(); // no relationships

  await page.getByLabel(t['english.level']).selectOption({ label: 'B2' });
  await page
    .getByLabel(t['english.life'])
    .selectOption({ label: t['english.passed'] });
  await next();

  await page.getByLabel(t['date.label']).fill(s.date);
  await page.getByRole('button', { name: t['form.results'] }).click();

  await expect(page).toHaveURL(/\/result/);
  await expect(
    page.getByRole('heading', { level: 1, name: t['result.title'] }),
  ).toBeVisible();
  for (const column of ['policy.CURRENT_LAW', 'policy.ANNOUNCED'] as const) {
    const region = page.getByRole('region', { name: t[column], exact: true });
    await expect(
      region.getByRole('heading', { level: 3, name: t[s.outcome] }),
    ).toBeVisible();
    await expect(
      region
        .locator('dt', { hasText: t['result.earliest'] })
        .locator('xpath=following-sibling::dd[1]'),
    ).toHaveText(s.earliest);
  }
}

test('questionnaire by clicks: 5-year Skilled Worker on the day (G-SW-5Y-ON-DAY)', async ({
  page,
}) => {
  await page.goto('/');
  await runQuestionnaire(page, zhCN, {
    date: '2026-06-01',
    outcome: 'outcome.LIKELY_ELIGIBLE',
    earliest: '2026-06-01',
  });
});

test('questionnaire by clicks in English: 200 days abroad (G-SW-ABSENCE-200-DAYS)', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English' }).click();
  await runQuestionnaire(page, en, {
    date: '2026-06-01',
    absence: ['2023-01-10', '2023-07-28'],
    outcome: 'outcome.LIKELY_NOT_ELIGIBLE',
    earliest: '2028-07-29',
  });
});
