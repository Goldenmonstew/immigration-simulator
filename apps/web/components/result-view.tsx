'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SimulationResult } from '@uk-immigration/engine';
import { ROUTE_GROUPS } from '@uk-immigration/policy-data';
import { useTranslation } from '../i18n/locale';
import { punct } from '../i18n/punctuation';
import { routeGroupNames, routeLabel } from '../i18n/routes';
import { displayedRuleSets } from '../lib/policy';
import { currentEpisode, type Draft } from '../lib/questionnaire';
import { issueUrl } from '../lib/report';
import { sourceUrls } from '../lib/sources';
import { PolicyStatus, RuleSetStatus } from './policy-status';
import { GapSummary } from './gap-summary';
import { basisRule, shorterPathwayBlocks } from '../lib/gap-summary';
import type { RuleOutcome } from '@uk-immigration/engine';
import site from '../app/site.module.css';
import styles from '../app/result/result.module.css';

function jumpToAssessment(id: string) {
  const heading = document.getElementById(id);
  heading?.focus({ preventScroll: true });
  heading?.scrollIntoView({ block: 'start' });
}

function Advice() {
  const { t } = useTranslation();
  return (
    <section className={site.notice}>
      <h2>{t('result.advice')}</h2>
      <p>{t('result.adviceText')}</p>
      <p>
        <a href={sourceUrls['SRC-016']} target="_blank" rel="noreferrer">
          {t('result.adviceLink')}
        </a>
      </p>
    </section>
  );
}

export function ResultView({
  result,
  mock = false,
  draft,
  actions,
}: {
  result: SimulationResult;
  mock?: boolean;
  draft?: Draft;
  /** Shortcuts shown near the overview as well as after the columns. */
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  const episode = draft && currentEpisode(draft);
  const protection =
    episode &&
    ROUTE_GROUPS[episode.route].some((group) => group === 'PROTECTION');
  return (
    <>
      <PolicyStatus asOf={result.policyAsOf} />
      {mock && (
        <p className={`${site.notice} ${site.warning}`}>{t('result.mock')}</p>
      )}
      {result.shortCircuit && Object.keys(result.byRuleSet).length === 0 ? (
        <div className={site.narrow}>
          <h1>{t('result.shortCircuit')}</h1>
          <p className={site.lead}>{result.shortCircuit.message}</p>
          <Advice />
        </div>
      ) : (
        <>
          <h1>{t('result.title')}</h1>
          <nav
            className={styles.columnNavigation}
            aria-label={t('result.navigation')}
          >
            {displayedRuleSets.map((ruleSet) => (
              <button
                key={ruleSet.id}
                type="button"
                onClick={() => jumpToAssessment(`${ruleSet.id}-heading`)}
              >
                {t(`policy.${ruleSet.kind}`)}
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
          <p className={`${site.notice} ${site.warning}`}>
            {t('policy.hypothesis')}
          </p>
          {protection && (
            <p className={`${site.notice} ${site.warning}`}>
              {t('result.protectionNotice')}
            </p>
          )}
          <AssessmentColumns
            result={result}
            simulationDate={draft?.simulationDate}
            canWhatIf={!!draft && !mock && !result.shortCircuit}
            dependant={episode?.role === 'DEPENDANT'}
          />
          <Advice />
        </>
      )}
      <p className={`${site.muted} ${site.noPrint}`}>
        {t('home.disclaimer')} <Link href="/about">{t('about.link')}</Link>
      </p>
    </>
  );
}

export function AssessmentColumns({
  result,
  idPrefix = '',
  simulationDate,
  canWhatIf = false,
  dependant = false,
}: {
  result: SimulationResult;
  idPrefix?: string;
  simulationDate?: string;
  canWhatIf?: boolean;
  dependant?: boolean;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  return (
    <div className={styles.columns}>
      {displayedRuleSets.map((ruleSet) => {
        const assessment = result.byRuleSet[ruleSet.id];
        return (
          <section
            key={ruleSet.id}
            className={`${styles.assessment} ${ruleSet.kind === 'ANNOUNCED' ? styles.announced : ''}`}
            aria-labelledby={`${idPrefix}${ruleSet.id}-heading`}
          >
            <h2
              id={`${idPrefix}${ruleSet.id}-heading`}
              className={styles.heading}
              tabIndex={-1}
            >
              {t(`policy.${ruleSet.kind}`)}
            </h2>
            {displayedRuleSets
              .filter((other) => other.id !== ruleSet.id)
              .map((other) => (
                <button
                  key={other.id}
                  type="button"
                  className={styles.columnJump}
                  onClick={() =>
                    jumpToAssessment(`${idPrefix}${other.id}-heading`)
                  }
                >
                  {t('result.jumpTo').replace(
                    '{column}',
                    t(`policy.${other.kind}`),
                  )}
                </button>
              ))}
            <span
              className={`${site.badge} ${ruleSet.kind === 'ANNOUNCED' ? site.announced : ''}`}
            >
              <RuleSetStatus ruleSet={ruleSet} />
            </span>
            {!assessment ? (
              <p className={site.notice}>{t('result.missingAssessment')}</p>
            ) : (
              <>
                <div
                  className={`${styles.outcome} ${assessment.outcome === 'LIKELY_ELIGIBLE' ? styles.success : assessment.outcome === 'LIKELY_NOT_ELIGIBLE' ? styles.failure : styles.unknown}`}
                >
                  <h3>{t(`outcome.${assessment.outcome}`)}</h3>
                  <p>{t(`outcome.${assessment.outcome}.description`)}</p>
                  {assessment.decidedBy &&
                    assessment.pathwayYears !== undefined && (
                      <p className={styles.basis}>
                        {(basisRule(assessment)
                          ? t('result.basis').replace(
                              '{route}',
                              basisRule(assessment)!.title,
                            )
                          : t('result.basisNoRoute')
                        ).replace('{years}', String(assessment.pathwayYears))}
                      </p>
                    )}
                  {shorterPathwayBlocks(assessment).length > 0 && (
                    <>
                      <p>{t('result.shorterBlocked')}</p>
                      <ul className={styles.shorterBlocked}>
                        {shorterPathwayBlocks(assessment).map(
                          ({ years, rules }) => (
                            <li key={years}>
                              {t('result.shorterBlockedPathway')
                                .replace('{years}', String(years))
                                .replace(
                                  '{rules}',
                                  rules.map((rule) => rule.title).join(p.list),
                                )}
                            </li>
                          ),
                        )}
                      </ul>
                    </>
                  )}
                </div>
                <GapSummary
                  assessment={assessment}
                  simulationDate={simulationDate}
                  canWhatIf={canWhatIf}
                  dependant={dependant}
                />
                <dl className={styles.facts}>
                  {assessment.routeGroup && (
                    <div>
                      <dt>{t('result.routeGroup')}</dt>
                      <dd>
                        {routeLabel(
                          routeGroupNames[assessment.routeGroup],
                          locale,
                        )}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>{t('result.pathway')}</dt>
                    <dd>
                      {assessment.pathwayYears === undefined
                        ? t('result.undetermined')
                        : `${assessment.pathwayYears} ${t('result.years')}`}
                    </dd>
                  </div>
                  {assessment.pathwayCompletionDate &&
                  !assessment.earliestDate ? (
                    <div>
                      <dt>{t('result.completion')}</dt>
                      <dd>
                        <time dateTime={assessment.pathwayCompletionDate}>
                          {assessment.pathwayCompletionDate}
                        </time>
                      </dd>
                    </div>
                  ) : (
                    <div>
                      <dt>{t('result.earliest')}</dt>
                      <dd>
                        {assessment.earliestDate ? (
                          <time dateTime={assessment.earliestDate}>
                            {assessment.earliestDate}
                          </time>
                        ) : (
                          t('result.undetermined')
                        )}
                      </dd>
                    </div>
                  )}
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
                {!assessment.rules.length ? (
                  <p className={site.muted}>{t('result.noRules')}</p>
                ) : assessment.decidedBy ? (
                  <>
                    <h4 className={styles.pathwayHeading}>
                      {t('result.thisPathway')}
                    </h4>
                    <RuleGroups
                      rules={assessment.rules.filter((rule) =>
                        assessment.decidedBy!.includes(rule.id),
                      )}
                      ruleSetId={ruleSet.id}
                    />
                    {assessment.rules.some(
                      (rule) => !assessment.decidedBy!.includes(rule.id),
                    ) && (
                      <details className={styles.otherPathways}>
                        <summary>{t('result.otherPathways')}</summary>
                        <RuleGroups
                          rules={assessment.rules.filter(
                            (rule) => !assessment.decidedBy!.includes(rule.id),
                          )}
                          ruleSetId={ruleSet.id}
                          collapsed
                        />
                      </details>
                    )}
                  </>
                ) : (
                  <RuleGroups rules={assessment.rules} ruleSetId={ruleSet.id} />
                )}
                {assessment.assumptions.length ? (
                  <details>
                    <summary>
                      {t('result.assumptions')}
                      {p.openParen}
                      {assessment.assumptions.length}{' '}
                      {t('result.assumptionCount')}
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
            )}
          </section>
        );
      })}
    </div>
  );
}

function RuleGroups({
  rules: all,
  ruleSetId,
  collapsed = false,
}: {
  rules: RuleOutcome[];
  ruleSetId: string;
  collapsed?: boolean;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  return (['FAIL', 'UNKNOWN', 'PASS'] as const).map((status) => {
    const rules = all.filter((rule) => rule.status === status);
    if (collapsed && !rules.length) return null;
    return (
      <details
        key={status}
        className={styles.group}
        open={!collapsed && status !== 'PASS'}
      >
        <summary>
          <h4>
            {t(`result.${status}`)}
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
                <p>{rule.explanation}</p>
                <details className={styles.sourceDetails}>
                  <summary>
                    {t('result.sources')}
                    {p.openParen}
                    {rule.sources.length}
                    {p.closeParen}
                  </summary>
                  <div className={styles.sources}>
                    {rule.sources.map((source, index) =>
                      sourceUrls[source.srcId] ? (
                        <a
                          key={index}
                          href={sourceUrls[source.srcId]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {source.srcId} {source.locator}
                        </a>
                      ) : (
                        <span key={index}>
                          {source.srcId} {source.locator}
                        </span>
                      ),
                    )}
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
                    {t('result.pendingDetails')}
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

export function PrincipalAssessment({
  result,
  simulationDate,
}: {
  result: SimulationResult;
  simulationDate?: string;
}) {
  const { t } = useTranslation();
  return (
    <details className={styles.principal}>
      <summary>{t('result.principal')}</summary>
      {result.shortCircuit && (
        <p className={site.notice}>{result.shortCircuit.message}</p>
      )}
      {!!Object.keys(result.byRuleSet).length && (
        <AssessmentColumns
          result={result}
          idPrefix="principal-"
          simulationDate={simulationDate}
        />
      )}
    </details>
  );
}
