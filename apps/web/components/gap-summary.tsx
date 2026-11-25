'use client';

import Link from 'next/link';
import { createContext, useContext, useId, useState } from 'react';
import type { CountryPathway } from '@uk-immigration/engine';
import { withCount } from '../i18n';
import { useTranslation } from '../i18n/locale';
import { countryPath } from '../lib/site-countries';
import { punct } from '../i18n/punctuation';
import { firstSentence, gapRules, remainingTime } from '../lib/gap-summary';
import {
  earliestLabelFor,
  type CountryDraft,
  type CountryModule,
} from '../lib/country-module';
import { rememberWhatIfTarget } from '../lib/whatif';
import site from '../app/site.module.css';
import styles from '../app/uk/result/result.module.css';

export const ResultScenarioHash = createContext('');

export function GapSummary<D extends CountryDraft, K>({
  country,
  assessment,
  simulationDate,
  canWhatIf = false,
  dependant = false,
}: {
  country: CountryModule<D, K>;
  assessment: CountryPathway;
  simulationDate?: string;
  canWhatIf?: boolean;
  /** A dependant's reassessment date comes from the principal's record. */
  dependant?: boolean;
}) {
  const { t, locale } = useTranslation();
  const scenarioHash = useContext(ResultScenarioHash);
  const p = punct(locale);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  if (
    assessment.status === 'REQUIRES_REGULATED_REVIEW' ||
    assessment.status === 'POLICY_NOT_YET_IN_FORCE' ||
    assessment.status === 'NOT_APPLICABLE'
  )
    return null;
  const eligible =
    assessment.status === 'LIKELY_ELIGIBLE' || assessment.status === 'MET';
  const rules = eligible ? [] : gapRules(assessment);
  const date =
    assessment.status === 'LIKELY_NOT_ELIGIBLE' ||
    assessment.status === 'FUTURE'
      ? assessment.earliestDate
      : undefined;
  const wait =
    date && simulationDate ? remainingTime(simulationDate, date) : undefined;
  const visibleRules = 5 - (date ? 1 : 0);
  return (
    <section className={styles.gap} aria-labelledby={`${id}-heading`}>
      <h3 id={`${id}-heading`}>{t('gap.title')}</h3>
      {eligible ? (
        <p>{t('gap.met')}</p>
      ) : (
        <>
          {!date && !rules.length && !assessment.pathwayCompletionDate && (
            <p>{t('result.noRules')}</p>
          )}
          <ul id={id} className={styles.gapList}>
            {assessment.pathwayCompletionDate && (
              <li>
                {t('gap.completion').replace(
                  '{date}',
                  assessment.pathwayCompletionDate,
                )}
              </li>
            )}
            {assessment.publicFundsReassessmentDate && (
              <li>
                {t(
                  dependant ? 'gap.reassessPrincipal' : 'gap.reassess',
                ).replace('{date}', assessment.publicFundsReassessmentDate)}
              </li>
            )}
            {date && (
              <li>
                {assessment.status === 'FUTURE'
                  ? `${t(earliestLabelFor(assessment, country.earliestLabel))}${p.colon}${date}`
                  : t('gap.earliest').replace('{date}', date)}
                {wait &&
                  withCount(
                    withCount(t('gap.wait'), 'years', wait.years),
                    'months',
                    wait.months,
                  )}
              </li>
            )}
            {rules.map((rule, index) => {
              const focus = canWhatIf
                ? country.whatif.focusForRule(rule.id, assessment.id)
                : undefined;
              return (
                <li
                  key={rule.id}
                  className={
                    index >= visibleRules && !expanded
                      ? styles.gapCollapsed
                      : undefined
                  }
                >
                  <strong>
                    {rule.title}
                    {rule.status === 'UNKNOWN' && (
                      <>
                        {p.openParen}
                        {t(
                          rule.pendingDetails?.length
                            ? rule.kind
                              ? 'pilot.pending'
                              : 'gap.pending'
                            : 'gap.input',
                        )}
                        {p.closeParen}
                      </>
                    )}
                  </strong>
                  {p.colon}
                  {firstSentence(rule.explanation, locale)}
                  {focus && (
                    <Link
                      className={`${styles.gapAction} ${site.noPrint}`}
                      href={`${countryPath(country.id, 'whatif')}?focus=${focus}${scenarioHash}`}
                      scroll={false}
                      onClick={() =>
                        rememberWhatIfTarget(country.id, {
                          focus,
                          ruleId: rule.id,
                          assessment,
                        })
                      }
                      aria-label={`${t('gap.try')}${p.colon}${rule.title}`}
                    >
                      {t('gap.try')}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          {rules.length > visibleRules && (
            <button
              type="button"
              className={`${site.secondary} ${site.noPrint}`}
              aria-expanded={expanded}
              aria-controls={id}
              onClick={() => setExpanded(!expanded)}
            >
              {t(expanded ? 'gap.less' : 'gap.more')}
            </button>
          )}
        </>
      )}
    </section>
  );
}
