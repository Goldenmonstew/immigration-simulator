'use client';

import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { CountryPathway, CountryResult } from '@uk-immigration/engine';
import { useTranslation } from '../i18n/locale';
import { punct } from '../i18n/punctuation';
import {
  type CountryDraft,
  type CountryModule,
  checkLabelStatus,
  isDecisionOutcome,
  pathwayDate,
  pathwayTitle,
} from '../lib/country-module';
import { readPageResult } from '../lib/page-result';
import { displayedColumns } from '../lib/policy';
import { countryPath } from '../lib/site-countries';
import { draftStorage } from '../lib/storage';
import { linkedResultDraft } from '../lib/share';
import {
  diffPathways,
  parseWhatIfFocus,
  takeWhatIfTarget,
  type WhatIfTarget,
} from '../lib/whatif';
import { PolicyStatus, RuleSetStatus } from './policy-status';
import { ShareLink } from './share-link';
import site from '../app/site.module.css';
import resultStyles from '../app/uk/result/result.module.css';
import styles from '../app/uk/whatif/whatif.module.css';

// Retain both sides when a control adds or removes an entire column or path.
function pairById<T extends { id: string }>(before: T[], after: T[]) {
  const ids = new Set([...before, ...after].map((item) => item.id));
  return Array.from(ids, (id) => ({
    id,
    before: before.find((item) => item.id === id),
    after: after.find((item) => item.id === id),
  }));
}

function Comparison({
  before,
  after,
}: {
  before?: CountryPathway;
  after?: CountryPathway;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const diff = diffPathways(before, after);
  const beforeDate = pathwayDate(before);
  const afterDate = pathwayDate(after);
  const primaryDate = afterDate ?? beforeDate;
  const years = (assessment?: CountryPathway) =>
    assessment?.pathwayYears === undefined
      ? t('result.undetermined')
      : `${assessment.pathwayYears} ${t('result.years')}`;
  return (
    <>
      <p className={styles.direction}>
        {t('whatif.before')} → {t('whatif.after')}
      </p>
      <dl className={resultStyles.facts}>
        {[
          [
            t('whatif.outcome'),
            before ? pathwayTitle(before, t) : '—',
            after ? pathwayTitle(after, t) : '—',
          ],
          ...(before?.pathwayYears !== undefined ||
          after?.pathwayYears !== undefined ||
          (before && isDecisionOutcome(before.status))
            ? [[t('result.pathway'), years(before), years(after)]]
            : []),
          ...(primaryDate
            ? [
                [
                  t(primaryDate.label),
                  beforeDate
                    ? (beforeDate.date ?? t('result.undetermined'))
                    : '—',
                  afterDate
                    ? (afterDate.date ?? t('result.undetermined'))
                    : '—',
                ],
              ]
            : []),
          ...(before?.timeEarliestDate || after?.timeEarliestDate
            ? [
                [
                  t('country.timeDate'),
                  before?.timeEarliestDate ?? '—',
                  after?.timeEarliestDate ?? '—',
                ],
              ]
            : []),
          // A6#7: a conditional completion is not an earliest date.
          ...(before?.pathwayCompletionDate || after?.pathwayCompletionDate
            ? [
                [
                  t('result.completion'),
                  before?.pathwayCompletionDate ?? '—',
                  after?.pathwayCompletionDate ?? '—',
                ],
              ]
            : []),
          ...(before?.publicFundsReassessmentDate ||
          after?.publicFundsReassessmentDate
            ? [
                [
                  t('result.reassessment'),
                  before?.publicFundsReassessmentDate ?? '—',
                  after?.publicFundsReassessmentDate ?? '—',
                ],
              ]
            : []),
        ].map(([label, previous, next]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={styles.change}>
              <span className={site.muted}>{previous}</span>
              <span aria-hidden="true">→</span>
              <span>{next}</span>
            </dd>
          </div>
        ))}
      </dl>
      {after?.summary && <p>{after.summary}</p>}
      {!diff.changed && <p className={site.notice}>{t('whatif.unchanged')}</p>}
      {(['becameMet', 'becameUnmet', 'stillUnmet'] as const).map((group) => (
        <section
          key={group}
          className={resultStyles.group}
          aria-label={t(`whatif.${group}`)}
        >
          <h3>
            {t(`whatif.${group}`)}
            {p.openParen}
            {diff[group].length}
            {p.closeParen}
          </h3>
          {!diff[group].length ? (
            <p className={site.muted}>{t('result.noGroupRules')}</p>
          ) : (
            <ul className={resultStyles.rules}>
              {diff[group].map((rule) => (
                <li
                  key={rule.id}
                  className={resultStyles.rule}
                  data-status={checkLabelStatus[rule.status]}
                >
                  <strong>{rule.title}</strong>
                  <div className={styles.ruleMeta}>
                    {rule.id} · {t(`result.${checkLabelStatus[rule.status]}`)}
                  </div>
                  <p>{rule.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {after?.assumptions.length ? (
        <details>
          <summary>
            {t('result.assumptions')}
            {p.openParen}
            {after.assumptions.length} {t('result.assumptionCount')}
            {p.closeParen}
          </summary>
          <ul className={resultStyles.assumptions}>
            {after.assumptions.map((assumption, index) => (
              <li key={index}>{assumption}</li>
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

function WhatIfLab<D extends CountryDraft, K>({
  country,
  draft,
  before,
  target,
  backHref,
}: {
  country: CountryModule<D, K>;
  draft: D;
  before: CountryResult;
  target?: WhatIfTarget;
  backHref: string;
}) {
  const { t, locale } = useTranslation();
  const controls = country.whatif;
  const [knobs, setKnobs] = useState<K>(() => {
    if (!target || target.assessment) return controls.initial(draft, target);
    // A direct focus link has no clicked row. Start with the first matching gap.
    for (const column of before.columns) {
      for (const assessment of column.pathways) {
        const check = assessment.checks.find(
          (rule) =>
            rule.status !== 'MET' &&
            controls.focusForRule(rule.id, assessment.id) === target.focus,
        );
        if (check)
          return controls.initial(draft, {
            ...target,
            assessment,
            ruleId: target.ruleId ?? check.id,
          });
      }
    }
    return controls.initial(draft, target);
  });
  useEffect(() => {
    if (!target) return;
    const control = document.getElementById(
      controls.focusControls[target.focus],
    );
    control?.scrollIntoView({ block: 'center' });
    control?.focus({ preventScroll: true });
  }, [controls, target]);
  const afterDraft = controls.apply(draft, knobs);
  const errors = controls.validate(afterDraft, knobs);
  const compared = Object.keys(errors).length
    ? undefined
    : readPageResult(country, locale, afterDraft, 'preview');
  const after = compared?.result;
  const beforeColumns = displayedColumns(country, before);
  return (
    <>
      <p className={site.lead}>{t('whatif.intro')}</p>
      {after && compared.draft && (
        <ShareLink country={country} draft={compared.draft} />
      )}
      {country.resultNotes?.().notices.map((key) => (
        <p key={key} className={`${site.notice} ${site.warning}`}>
          {t(key)}
        </p>
      ))}
      <div className={styles.layout}>
        <section className={styles.controls} aria-labelledby="whatif-controls">
          <h2 id="whatif-controls">{t('whatif.controls')}</h2>
          <controls.Controls
            afterDraft={afterDraft}
            knobs={knobs}
            errors={errors}
            update={(patch) =>
              setKnobs((current) => ({ ...current, ...patch }))
            }
          />
          <div className={site.actions}>
            <button
              type="button"
              className={site.secondary}
              onClick={() => setKnobs(() => controls.initial(draft))}
            >
              {t('whatif.reset')}
            </button>
            <Link href={backHref}>{t('whatif.back')}</Link>
          </div>
        </section>
        <div
          className={styles.comparisons}
          style={
            country.policy.displayedRuleSets.length === 1
              ? { gridTemplateColumns: 'minmax(0, 1fr)' }
              : undefined
          }
          aria-live="polite"
        >
          {!after ? (
            <p role="status">{t('form.fixErrors')}</p>
          ) : (
            pairById(beforeColumns, displayedColumns(country, after)).map(
              ({ id, before: previous, after: next }) => {
                const column = (next ?? previous)!;
                const ruleSet = column.ruleSet;
                // Screening can stop the whole run before any column is assessed.
                const paths =
                  after.shortCircuit && !after.columns.length
                    ? []
                    : pairById(previous?.pathways ?? [], next?.pathways ?? []);
                return (
                  <section
                    key={id}
                    aria-labelledby={`${id}-heading`}
                    className={`${resultStyles.assessment} ${ruleSet?.kind === 'ANNOUNCED' ? resultStyles.announced : ''}`}
                  >
                    <h2 id={`${id}-heading`}>{column.title}</h2>
                    {ruleSet && (
                      <span
                        className={`${site.badge} ${ruleSet.kind === 'ANNOUNCED' ? site.announced : ''}`}
                      >
                        <RuleSetStatus ruleSet={ruleSet} />
                      </span>
                    )}
                    {paths.length ? (
                      paths.map((path) => {
                        const title = (path.after ?? path.before)!.title;
                        return (
                          <Fragment key={path.id}>
                            {(paths.length > 1 || title !== column.title) && (
                              <h3>{title}</h3>
                            )}
                            <Comparison
                              before={path.before}
                              after={path.after}
                            />
                          </Fragment>
                        );
                      })
                    ) : (
                      <p>{t('result.missingAssessment')}</p>
                    )}
                  </section>
                );
              },
            )
          )}
        </div>
      </div>
      <p className={`${site.notice} ${site.muted}`}>{t('home.disclaimer')}</p>
    </>
  );
}

export function WhatIfView<D extends CountryDraft, K>({
  country,
  draft,
  target,
  resultHash = '',
}: {
  country: CountryModule<D, K>;
  draft?: D;
  target?: WhatIfTarget;
  resultHash?: string;
}) {
  const { t, locale } = useTranslation();
  const page = draft && readPageResult(country, locale, draft);
  const before = page?.result;
  const backHref = countryPath(country.id, 'result') + resultHash;
  if (!page?.draft || !before)
    return (
      <div className={site.narrow}>
        <h1>{t('whatif.title')}</h1>
        <p>{page?.correction ?? t('whatif.empty')}</p>
        <Link
          className={site.button}
          href={countryPath(country.id, 'simulate')}
        >
          {t('home.start')}
        </Link>
      </div>
    );
  return (
    <>
      <PolicyStatus country={country} asOf={before.policyAsOf} />
      <h1>{t('whatif.title')}</h1>
      {before.shortCircuit ? (
        <div className={site.narrow}>
          <p className={site.notice}>{t('whatif.unsupported')}</p>
          <p>{before.shortCircuit.message}</p>
          <ShareLink country={country} draft={page.draft} />
          <Link className={site.secondary} href={backHref}>
            {t('whatif.back')}
          </Link>
        </div>
      ) : (
        <WhatIfLab
          country={country}
          draft={page.draft}
          before={before}
          target={target}
          backHref={backHref}
        />
      )}
    </>
  );
}

export function WhatIfPageContent<D extends CountryDraft, K>({
  country,
}: {
  country: CountryModule<D, K>;
}) {
  return <StoredWhatIfPage key={country.id} country={country} />;
}

function StoredWhatIfPage<D extends CountryDraft, K>({
  country,
}: {
  country: CountryModule<D, K>;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<D>();
  const [ready, setReady] = useState(false);
  const [target, setTarget] = useState<WhatIfTarget>();
  const [resultHash, setResultHash] = useState('');
  const loaded = useRef<CountryModule<D, K> | undefined>(undefined);
  useEffect(() => {
    if (loaded.current === country) return;
    loaded.current = country;
    const url = new URL(window.location.href);
    const linked = linkedResultDraft(country, url.hash);
    setDraft(linked ? linked.draft : draftStorage(country).draft);
    setResultHash(linked?.resultHash ?? '');
    setTarget(
      takeWhatIfTarget(
        country.id,
        parseWhatIfFocus(
          country.whatif.focusControls,
          url.searchParams.get('focus'),
        ),
      ),
    );
    if (url.searchParams.has('focus')) {
      url.searchParams.delete('focus');
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
    setReady(true);
  }, [country]);
  return (
    <main id="main" className={site.main}>
      {ready ? (
        <WhatIfView
          country={country}
          draft={draft}
          target={target}
          resultHash={resultHash}
        />
      ) : (
        <p role="status">{t('result.loading')}</p>
      )}
    </main>
  );
}
