'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CountryResult, Locale } from '@uk-immigration/engine';
import { PrincipalAssessment, ResultView } from './result-view';
import { ShareLink } from './share-link';
import { SavedScenarios } from './saved-scenarios';
import { useTranslation } from '../i18n/locale';
import { countryPath } from '../lib/site-countries';
import { punct } from '../i18n/punctuation';
import type { CountryDraft, CountryModule } from '../lib/country-module';
import { decodeDraft } from '../lib/share';
import {
  draftStorage,
  getRememberedResult,
  rememberResult,
} from '../lib/storage';
import styles from '../app/site.module.css';

interface ResultPageState<D> {
  draft?: D;
  result?: CountryResult;
  correction?: string;
  shared?: boolean;
  mock?: boolean;
}

export function readPageResult<D extends CountryDraft, K>(
  country: CountryModule<D, K>,
  locale: Locale,
  source: D | string | null = null,
): ResultPageState<D> {
  const shared = typeof source === 'string';
  function assess(draft?: D): ResultPageState<D> {
    if (!draft) return {};
    if (!draft.completed) {
      if (country.incompleteResultMessage) {
        return {
          draft: shared ? undefined : draft,
          correction: country.incompleteResultMessage(draft, locale),
        };
      }
      // Older UK comparison links can carry an otherwise complete draft.
      if (!shared || !country.decodeDraft({ ...draft, completed: true }))
        return {};
    }
    const result =
      (!shared && getRememberedResult(country, draft, locale)) ||
      country.run(draft, locale);
    if (shared) {
      draftStorage(country, draft);
      rememberResult(country, draft, result, locale);
    }
    return { draft, result, shared };
  }

  if (!shared) return assess(source ?? draftStorage(country).draft);
  try {
    return assess(decodeDraft(country, source, 'show-correction'));
  } catch {
    // A malformed external scenario must not replace the saved draft.
    return {};
  }
}

export function ResultPage<D extends CountryDraft, K>({
  country,
  preview,
}: {
  country: CountryModule<D, K>;
  preview?: (id: string, locale: Locale) => CountryResult | undefined;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const [page, setPage] = useState<ResultPageState<D>>();
  useEffect(() => {
    const load = () => {
      const encoded = new URLSearchParams(window.location.hash.slice(1)).get(
        's',
      );
      const previewId = new URLSearchParams(window.location.search).get('mock');
      const example =
        encoded === null && previewId && preview?.(previewId, locale);
      setPage(
        example
          ? { result: example, mock: true }
          : readPageResult(country, locale, encoded),
      );
    };
    load();
    window.addEventListener('hashchange', load);
    return () => window.removeEventListener('hashchange', load);
  }, [country, locale, preview]);

  const { draft, result, shared, mock, correction } = page ?? {};
  const principalResult = draft && country.principal?.(draft, locale);

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
                  <Link
                    className={styles.secondary}
                    href={countryPath(country.id, 'whatif')}
                  >
                    {t('whatif.title')}
                  </Link>
                )}
                <Link
                  className={styles.secondary}
                  href={countryPath(country.id, 'simulate')}
                >
                  {t('result.edit')}
                </Link>
              </div>
            }
          />
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
              <Link
                className={styles.secondary}
                href={countryPath(country.id, 'whatif')}
              >
                {t('whatif.title')}
              </Link>
            )}
            <Link
              className={styles.button}
              href={countryPath(country.id, 'simulate')}
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
            href={countryPath(country.id, 'simulate')}
          >
            {t(correction && draft ? 'result.edit' : 'home.start')}
          </Link>
        </div>
      )}
      {page && (
        <SavedScenarios
          country={country}
          draft={draft}
          onLoad={(next) => setPage(readPageResult(country, locale, next))}
        />
      )}
      {result && (
        <footer className={styles.printOnly}>{t('home.disclaimer')}</footer>
      )}
    </main>
  );
}
