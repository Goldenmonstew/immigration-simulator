'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import { PrincipalAssessment, ResultView } from './result-view';
import { ResultScenarioHash } from './gap-summary';
import { ShareLink } from './share-link';
import { SavedScenarios } from './saved-scenarios';
import { useTranslation } from '../i18n/locale';
import { countryPath } from '../lib/site-countries';
import { punct } from '../i18n/punctuation';
import type { CountryDraft, CountryModule } from '../lib/country-module';
import { readPageResult, type ResultPageState } from '../lib/page-result';
import {
  encodeDraft,
  rememberResultEdit,
  watchScenarioHash,
} from '../lib/share';
import styles from '../app/site.module.css';

export { readPageResult };

export function ResultPage<D extends CountryDraft, K>({
  country,
  preview,
}: {
  country: CountryModule<D, K>;
  preview?: (id: string, locale: Locale) => CountryResult | undefined;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const [page, setPage] = useState<ResultPageState<D> & { mock?: boolean }>();
  const displayedScenario = useRef<{ hash: string; source?: D | string }>(
    undefined,
  );
  useEffect(() => {
    const read = (linkHash?: string) => {
      const hash = linkHash ?? window.location.hash;
      const current = displayedScenario.current;
      const refresh =
        country.id === 'jp' &&
        current &&
        (linkHash === undefined || linkHash === current.hash);
      const source = refresh
        ? current.source
        : new URLSearchParams(hash.slice(1)).get('s');
      if (source === undefined) return;
      const previewId = new URLSearchParams(window.location.search).get('mock');
      const example =
        source === null && previewId && preview?.(previewId, locale);
      if (example) {
        displayedScenario.current = undefined;
        setPage({ result: example, mock: true });
      } else {
        const next = readPageResult(
          country,
          locale,
          source,
          refresh ? 'refresh' : 'result',
        );
        if (!refresh)
          displayedScenario.current =
            country.id === 'jp'
              ? { hash, source: source ?? next.draft }
              : undefined;
        setPage(next);
      }
    };
    read();
    if (country.id !== 'jp') {
      const openLocation = () => read(window.location.hash);
      window.addEventListener('hashchange', openLocation);
      return () => window.removeEventListener('hashchange', openLocation);
    }

    const stopWatching = watchScenarioHash(read);
    let timer: number;
    const scheduleMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = window.setTimeout(refresh, midnight.getTime() - now.getTime());
    };
    function refresh() {
      window.clearTimeout(timer);
      if (document.visibilityState !== 'visible') return;
      read();
      scheduleMidnight();
    }
    if (document.visibilityState === 'visible') scheduleMidnight();
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearTimeout(timer);
      stopWatching();
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [country, locale, preview]);

  const { draft, result, shared, mock, correction } = page ?? {};
  const principalResult = draft && country.principal?.(draft, locale);
  const scenarioHash =
    country.id === 'jp' && draft
      ? `#${shared ? 's' : 'draft'}=${encodeDraft(country, draft)}`
      : '';
  const compareHref = countryPath(country.id, 'whatif') + scenarioHash;
  const editHref = countryPath(country.id, 'simulate') + scenarioHash;
  const startEdit =
    scenarioHash && draft
      ? () => rememberResultEdit(scenarioHash, draft)
      : undefined;

  return (
    <main id="main" className={styles.main}>
      {!page ? (
        <p role="status">{t('result.loading')}</p>
      ) : result ? (
        <>
          <p className={styles.printOnly}>
            {t('site.name')} · {t('whatif.date')}
            {p.colon}
            {draft?.simulationDate ?? t('result.undetermined')} ·{' '}
            {t('policy.asOf')}
            {p.colon}
            {result.policyAsOf}
          </p>
          {shared && (
            <p className={`${styles.notice} ${styles.noPrint}`} role="status">
              {t('share.loaded')}
            </p>
          )}
          {draft && <ShareLink country={country} draft={draft} />}
          <ResultScenarioHash value={scenarioHash}>
            <ResultView
              country={country}
              result={result}
              mock={mock}
              draft={draft}
              actions={
                <div
                  className={`${styles.actions} ${styles.topActions} ${styles.noPrint}`}
                >
                  {!result.shortCircuit && (
                    <Link className={styles.secondary} href={compareHref}>
                      {t('whatif.title')}
                    </Link>
                  )}
                  <Link
                    className={styles.secondary}
                    href={editHref}
                    onNavigate={startEdit}
                  >
                    {t('result.edit')}
                  </Link>
                </div>
              }
            />
          </ResultScenarioHash>
          {principalResult && (
            <PrincipalAssessment
              country={country}
              result={principalResult}
              simulationDate={draft?.simulationDate}
            />
          )}
          <div className={`${styles.actions} ${styles.noPrint}`}>
            <button
              className={styles.secondary}
              type="button"
              onClick={() => window.print()}
            >
              {t('result.print')}
            </button>
            {!result.shortCircuit && (
              <Link className={styles.secondary} href={compareHref}>
                {t('whatif.title')}
              </Link>
            )}
            <Link
              className={styles.button}
              href={editHref}
              onNavigate={startEdit}
            >
              {t('result.edit')}
            </Link>
          </div>
        </>
      ) : (
        <div className={styles.narrow}>
          <h1>{t('result.title')}</h1>
          <p>{correction ?? t('result.empty')}</p>
          <Link
            className={styles.button}
            href={editHref}
            onNavigate={startEdit}
          >
            {t(correction && draft ? 'result.edit' : 'home.start')}
          </Link>
        </div>
      )}
      {page && (
        <SavedScenarios
          country={country}
          draft={result ? draft : undefined}
          onLoad={(next) => {
            if (country.id === 'jp')
              displayedScenario.current = { hash: '', source: next };
            setPage(readPageResult(country, locale, next));
          }}
        />
      )}
      {result && (
        <footer className={styles.printOnly}>{t('home.disclaimer')}</footer>
      )}
    </main>
  );
}
