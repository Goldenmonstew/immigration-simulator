'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type {
  CountryResult,
  CountryPathway,
  CountryCheck,
  RuleSet,
  SimulationResult,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';
import { useTranslation } from '../i18n/locale';
import { displayedColumns } from '../lib/policy';
import { countryPath, sitePagePaths } from '../lib/site-countries';
import { sourceUrls as registeredSources } from '../lib/sources';
import { punct } from '../i18n/punctuation';
import { routeGroupNames, routeLabel } from '../i18n/routes';
import {
  checkLabelStatus,
  isDecisionOutcome,
  pathwayDate,
  pathwayTitle,
  type CountryDraft,
  type CountryModule,
} from '../lib/country-module';
import { ukModule, ukResult } from '../lib/uk-module';
import { issueUrl } from '../lib/report';
import { PolicyStatus, RuleSetStatus } from './policy-status';
import { GapSummary } from './gap-summary';
import { basisRule, shorterPathwaysNotUsed } from '../lib/gap-summary';
import site from '../app/site.module.css';
import styles from '../app/uk/result/result.module.css';

function jumpToAssessment(id: string) {
  const heading = document.getElementById(id);
  heading?.focus({ preventScroll: true });
  heading?.scrollIntoView({ block: 'start' });
}

function Advice<D extends CountryDraft, K>({
  country,
}: {
  country: CountryModule<D, K>;
}) {
  const { t } = useTranslation();
  const { advice } = country;
  if (!advice) return null;
  return (
    <section className={site.notice}>
      <h2>{t('result.advice')}</h2>
      <p>{t(advice.text)}</p>
      <p>
        <a
          href={
            country.policy.sourceUrls[advice.sourceId] ??
            registeredSources[advice.sourceId]
          }
          target="_blank"
          rel="noreferrer"
        >
          {t(advice.linkLabel)}
        </a>
      </p>
    </section>
  );
}

export function ResultView<D extends CountryDraft, K>({
  country,
  result,
  mock = false,
  draft,
  actions,
}: {
  country: CountryModule<D, K>;
  result: CountryResult;
  mock?: boolean;
  draft?: D;
  /** Shortcuts shown near the overview as well as after the columns. */
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  const notes = country.resultNotes?.(draft);
  const columns = displayedColumns(country, result);
  return (
    <>
      <PolicyStatus country={country} asOf={result.policyAsOf} />
      {mock && (
        <p className={`${site.notice} ${site.warning}`}>{t('result.mock')}</p>
      )}
      {result.shortCircuit && result.columns.length === 0 ? (
        <div className={site.narrow}>
          <h1>{t('result.shortCircuit')}</h1>
          <p className={site.lead}>{result.shortCircuit.message}</p>
          <Advice country={country} />
        </div>
      ) : (
        <>
          <h1>{t('result.title')}</h1>
          <nav
            className={styles.columnNavigation}
            aria-label={t('result.navigation')}
          >
            {columns.map((column) => (
              <button
                key={column.id}
                type="button"
                onClick={() => jumpToAssessment(`${column.id}-heading`)}
              >
                {column.title}
              </button>
            ))}
          </nav>
          {actions}
          {result.shortCircuit && (
            <p className={`${site.notice} ${site.warning}`}>
              {result.shortCircuit.message}
            </p>
          )}
          <p className={site.lead}>{t('result.intro')}</p>
          {notes?.notices.map((key) => (
            <p key={key} className={`${site.notice} ${site.warning}`}>
              {t(key)}
            </p>
          ))}
          <CountryAssessmentColumns
            country={country}
            result={result}
            simulationDate={draft?.simulationDate}
            canWhatIf={!!draft && !mock && !result.shortCircuit}
            dependant={notes?.dependant}
          />
          <Advice country={country} />
        </>
      )}
      <p className={`${site.muted} ${site.noPrint}`}>
        {t('home.disclaimer')}{' '}
        {sitePagePaths.includes(countryPath(country.id, 'about')) ? (
          <Link href={countryPath(country.id, 'about')}>{t('about.link')}</Link>
        ) : (
          <Link href={countryPath(country.id, 'policy')}>
            {t('site.policy')}
          </Link>
        )}
      </p>
    </>
  );
}

export function CountryAssessmentColumns<D extends CountryDraft, K>({
  country,
  result,
  idPrefix = '',
  simulationDate,
  canWhatIf = false,
  dependant = false,
}: {
  country: CountryModule<D, K>;
  result: CountryResult;
  idPrefix?: string;
  simulationDate?: string;
  canWhatIf?: boolean;
  dependant?: boolean;
}) {
  const { t } = useTranslation();
  const columns = displayedColumns(country, result);
  return (
    <div
      className={styles.columns}
      style={
        country.policy.displayedRuleSets.length === 1
          ? { gridTemplateColumns: 'minmax(0, 1fr)' }
          : undefined
      }
    >
      {columns.map((column) => {
        const { ruleSet } = column;
        return (
          <section
            key={column.id}
            className={`${styles.assessment} ${ruleSet?.kind === 'ANNOUNCED' ? styles.announced : ''}`}
            aria-labelledby={`${idPrefix}${column.id}-heading`}
          >
            <h2
              id={`${idPrefix}${column.id}-heading`}
              className={styles.heading}
              tabIndex={-1}
            >
              {column.title}
            </h2>
            {columns
              .filter((other) => other.id !== column.id)
              .map((other) => (
                <button
                  key={other.id}
                  type="button"
                  className={styles.columnJump}
                  onClick={() =>
                    jumpToAssessment(`${idPrefix}${other.id}-heading`)
                  }
                >
                  {t('result.jumpTo').replace('{column}', other.title)}
                </button>
              ))}
            {ruleSet && (
              <span
                className={`${site.badge} ${ruleSet?.kind === 'ANNOUNCED' ? site.announced : ''}`}
              >
                <RuleSetStatus ruleSet={ruleSet} />
              </span>
            )}
            {!column.pathways.length ? (
              <p className={site.notice}>{t('result.missingAssessment')}</p>
            ) : (
              column.pathways.map((assessment) => (
                <PathwayAssessment
                  key={assessment.id}
                  country={country}
                  assessment={assessment}
                  columnId={column.id}
                  showTitle={
                    column.pathways.length > 1 ||
                    assessment.title !== column.title
                  }
                  simulationDate={simulationDate}
                  canWhatIf={canWhatIf}
                  dependant={dependant}
                />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}

function PathwayAssessment<D extends CountryDraft, K>({
  country,
  assessment,
  columnId,
  showTitle,
  simulationDate,
  canWhatIf,
  dependant,
}: {
  country: CountryModule<D, K>;
  assessment: CountryPathway;
  columnId: string;
  showTitle: boolean;
  simulationDate?: string;
  canWhatIf: boolean;
  dependant: boolean;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const basis = basisRule(assessment);
  const primaryDate = pathwayDate(assessment, country.earliestLabel);
  const shorter = shorterPathwaysNotUsed(assessment);
  const eligible =
    assessment.status === 'LIKELY_ELIGIBLE' || assessment.status === 'MET';
  const ineligible =
    assessment.status === 'LIKELY_NOT_ELIGIBLE' ||
    assessment.status === 'NOT_MET';
  return (
    <>
      {showTitle && <h3>{assessment.title}</h3>}
      <div
        className={`${styles.outcome} ${eligible ? styles.success : ineligible ? styles.failure : styles.unknown}`}
      >
        <h3>{pathwayTitle(assessment, t)}</h3>
        {isDecisionOutcome(assessment.status) && (
          <p>{t(`outcome.${assessment.status}.description`)}</p>
        )}
        {assessment.summary && <p>{assessment.summary}</p>}
        {assessment.decidedBy && assessment.pathwayYears !== undefined && (
          <p className={styles.basis}>
            {(basis
              ? t('result.basis').replace('{route}', basis.title)
              : t('result.basisNoRoute')
            ).replace('{years}', String(assessment.pathwayYears))}
          </p>
        )}
        {shorter.length > 0 && (
          <>
            <p>{t('result.shorterBlocked')}</p>
            <ul className={styles.shorterBlocked}>
              {shorter.map(({ years, entry, status, rules }) => (
                <li key={`${years}-${entry}`}>
                  {t(
                    status === 'FAIL'
                      ? 'result.shorterNotMet'
                      : 'result.shorterUnconfirmed',
                  )
                    .replace(
                      '{pathway}',
                      (entry
                        ? t('result.shorterPathwayEntry').replace(
                            '{entry}',
                            t(`result.entry.${entry}` as TranslationKey),
                          )
                        : t('result.shorterPathway')
                      ).replace('{years}', String(years)),
                    )
                    .replace(
                      '{rules}',
                      rules.map((rule) => rule.title).join(p.list),
                    )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <GapSummary
        country={country}
        assessment={assessment}
        simulationDate={simulationDate}
        canWhatIf={canWhatIf}
        dependant={dependant}
      />
      <dl className={styles.facts}>
        {assessment.timeStatus && (
          <div>
            <dt>{t('country.timeConditions')}</dt>
            <dd>
              {t(`country.status.${assessment.timeStatus}`).replace(
                '{date}',
                assessment.timeEarliestDate ?? t('result.undetermined'),
              )}
            </dd>
          </div>
        )}
        {assessment.timeEarliestDate && (
          <div>
            <dt>{t('country.timeDate')}</dt>
            <dd>
              <time dateTime={assessment.timeEarliestDate}>
                {assessment.timeEarliestDate}
              </time>
            </dd>
          </div>
        )}
        {assessment.routeGroup && (
          <div>
            <dt>{t('result.routeGroup')}</dt>
            <dd>
              {routeLabel(routeGroupNames[assessment.routeGroup], locale)}
            </dd>
          </div>
        )}
        {(isDecisionOutcome(assessment.status) ||
          assessment.pathwayYears !== undefined) && (
          <div>
            <dt>{t('result.pathway')}</dt>
            <dd>
              {assessment.pathwayYears === undefined
                ? t('result.undetermined')
                : `${assessment.pathwayYears} ${t('result.years')}`}
            </dd>
          </div>
        )}
        {assessment.pathwayCompletionDate && !assessment.earliestDate ? (
          <div>
            <dt>{t('result.completion')}</dt>
            <dd>
              <time dateTime={assessment.pathwayCompletionDate}>
                {assessment.pathwayCompletionDate}
              </time>
            </dd>
          </div>
        ) : primaryDate ? (
          <div>
            <dt>{t(primaryDate.label)}</dt>
            <dd>
              {primaryDate.date ? (
                <time dateTime={primaryDate.date}>{primaryDate.date}</time>
              ) : (
                t('result.undetermined')
              )}
            </dd>
          </div>
        ) : null}
        {assessment.publicFundsReassessmentDate && (
          <div>
            <dt>{t('result.reassessment')}</dt>
            <dd>
              <time dateTime={assessment.publicFundsReassessmentDate}>
                {assessment.publicFundsReassessmentDate}
              </time>
            </dd>
          </div>
        )}
      </dl>
      <h3>{t('result.why')}</h3>
      {!assessment.checks.length ? (
        <p className={site.muted}>{t('result.noRules')}</p>
      ) : assessment.decidedBy ? (
        <>
          <h4 className={styles.pathwayHeading}>{t('result.thisPathway')}</h4>
          <RuleGroups
            rules={assessment.checks.filter((rule) =>
              assessment.decidedBy!.includes(rule.id),
            )}
            sourceUrls={country.policy.sourceUrls}
            ruleSetId={columnId}
          />
          {assessment.checks.some(
            (rule) => !assessment.decidedBy!.includes(rule.id),
          ) && (
            <details className={styles.otherPathways}>
              <summary>
                {t(
                  country.id === 'es'
                    ? 'es.result.otherChecks'
                    : 'result.otherPathways',
                )}
              </summary>
              <RuleGroups
                rules={assessment.checks.filter(
                  (rule) => !assessment.decidedBy!.includes(rule.id),
                )}
                sourceUrls={country.policy.sourceUrls}
                ruleSetId={columnId}
                collapsed
              />
            </details>
          )}
        </>
      ) : (
        <RuleGroups
          rules={assessment.checks}
          sourceUrls={country.policy.sourceUrls}
          ruleSetId={columnId}
        />
      )}
      {!!assessment.notChecked?.length && (
        <>
          <h3>{t('pilot.notChecked')}</h3>
          <ul>
            {assessment.notChecked.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
      {!!assessment.pendingDetails?.length && (
        <p>
          {t(
            isDecisionOutcome(assessment.status)
              ? 'result.pendingDetails'
              : 'pilot.pending',
          )}
          {p.colon}
          {assessment.pendingDetails.join(p.list)}
        </p>
      )}
      {assessment.assumptions.length ? (
        <details>
          <summary>
            {t('result.assumptions')}
            {p.openParen}
            {assessment.assumptions.length} {t('result.assumptionCount')}
            {p.closeParen}
          </summary>
          <ul className={styles.assumptions}>
            {assessment.assumptions.map((assumption, i) => (
              <li key={i}>{assumption}</li>
            ))}
          </ul>
        </details>
      ) : (
        <>
          <h3>{t('result.assumptions')}</h3>
          <p className={site.muted}>{t('result.noAssumptions')}</p>
        </>
      )}
    </>
  );
}

function RuleGroups({
  sourceUrls,
  rules: all,
  ruleSetId,
  collapsed = false,
}: {
  sourceUrls: Record<string, string>;
  rules: CountryCheck[];
  ruleSetId: string;
  collapsed?: boolean;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const groups = ['NOT_MET', 'UNKNOWN', 'MET', 'NOT_APPLICABLE'] as const;
  return groups.map((checkStatus) => {
    const status =
      checkStatus === 'NOT_APPLICABLE'
        ? checkStatus
        : checkLabelStatus[checkStatus];
    const rules = all.filter(
      (rule) =>
        (rule.applicable === false ? 'NOT_APPLICABLE' : rule.status) ===
        checkStatus,
    );
    if ((collapsed || status === 'NOT_APPLICABLE') && !rules.length)
      return null;
    return (
      <details
        key={status}
        className={styles.group}
        open={!collapsed && (status === 'FAIL' || status === 'UNKNOWN')}
      >
        <summary>
          <h4>
            {t(
              status === 'NOT_APPLICABLE'
                ? 'country.status.NOT_APPLICABLE'
                : `result.${status}`,
            )}
            {p.openParen}
            {rules.length}
            {p.closeParen}
          </h4>
        </summary>
        {!rules.length ? (
          <p className={site.muted}>{t('result.noGroupRules')}</p>
        ) : (
          <ul className={styles.rules}>
            {rules.map((rule) => (
              <li className={styles.rule} key={rule.id} data-status={status}>
                <strong>{rule.title}</strong>
                {rule.kind && (
                  <span className={site.muted}>
                    {' '}
                    ·{' '}
                    {t(
                      rule.applicable === false
                        ? 'country.status.NOT_APPLICABLE'
                        : `country.check.${rule.kind}`,
                    )}
                  </span>
                )}
                <p>{rule.explanation}</p>
                {rule.fee && (
                  <p>
                    {t('country.fee')}
                    {p.colon}
                    {rule.fee.currency} {rule.fee.amount.toLocaleString(locale)}
                    {rule.fee.possibleReducedAmount !== undefined && (
                      <>
                        {' '}
                        · {t('country.reducedFee')}
                        {p.colon}
                        {rule.fee.currency}{' '}
                        {rule.fee.possibleReducedAmount.toLocaleString(locale)}
                      </>
                    )}
                  </p>
                )}
                <details className={styles.sourceDetails}>
                  <summary>
                    {t('result.sources')}
                    {p.openParen}
                    {rule.sources.length}
                    {p.closeParen}
                  </summary>
                  <div className={styles.sources}>
                    {rule.sources.map((source, index) => {
                      const url =
                        source.url ??
                        sourceUrls[source.srcId] ??
                        registeredSources[source.srcId];
                      return url ? (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.srcId} {source.locator}
                        </a>
                      ) : (
                        <span key={index}>
                          {source.srcId} {source.locator}
                        </span>
                      );
                    })}
                    <a
                      href={issueUrl(`[${rule.id}] ${rule.title}`, [
                        `rule set: ${ruleSetId}`,
                        `rule: ${rule.id}`,
                        `status: ${status}`,
                        '',
                        '<!-- What is wrong, and which official source says otherwise? Do not paste share links or personal details. -->',
                      ])}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('result.reportRule')}
                    </a>
                  </div>
                </details>
                {!!rule.pendingDetails?.length && (
                  <p className={site.badge}>
                    {t(rule.kind ? 'pilot.pending' : 'result.pendingDetails')}
                    {p.colon}
                    {rule.pendingDetails.join(p.list)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </details>
    );
  });
}

export function PrincipalAssessment<D extends CountryDraft, K>({
  country,
  result,
  simulationDate,
}: {
  country: CountryModule<D, K>;
  result: CountryResult;
  simulationDate?: string;
}) {
  const { t } = useTranslation();
  return (
    <details className={styles.principal}>
      <summary>{t('result.principal')}</summary>
      {result.shortCircuit && (
        <p className={site.notice}>{result.shortCircuit.message}</p>
      )}
      {!!result.columns.length && (
        <CountryAssessmentColumns
          country={country}
          result={result}
          idPrefix="principal-"
          simulationDate={simulationDate}
        />
      )}
    </details>
  );
}

// The UK game still supplies engine assessments directly.
export function AssessmentColumns({
  result,
  ruleSets,
  ...props
}: {
  result: SimulationResult;
  ruleSets?: readonly RuleSet[];
  idPrefix?: string;
  simulationDate?: string;
}) {
  const { locale } = useTranslation();
  const countryResult = ukResult(result, locale);
  if (ruleSets) {
    countryResult.columns = countryResult.columns.filter((column) =>
      ruleSets.some((ruleSet) => ruleSet.id === column.id),
    );
  }
  return (
    <CountryAssessmentColumns
      country={ukModule}
      result={countryResult}
      {...props}
    />
  );
}
