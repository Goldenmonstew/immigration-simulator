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

export function ResultPage<D extends CountryDraft, K>({
  country,
  preview,
}: {
  country: CountryModule<D, K>;
  preview?: (id: string, locale: Locale) => CountryResult | undefined;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const [result, setResult] = useState<CountryResult>();
  const [draft, setDraft] = useState<D>();
  const [shared, setShared] = useState(false);
  const [ready, setReady] = useState(false);
  const [mock, setMock] = useState(false);
  useEffect(() => {
    const load = () => {
      setResult(undefined);
      setDraft(undefined);
      setShared(false);
      setMock(false);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const previewId = new URLSearchParams(window.location.search).get('mock');
      if (hash.has('s')) {
        const incoming = decodeDraft(country, hash.get('s')!);
        try {
          if (
            incoming &&
            (incoming.completed ||
              country.decodeDraft({ ...incoming, completed: true }))
          ) {
            const nextResult = country.run(incoming, locale);
            draftStorage(country, incoming);
            rememberResult(country, incoming, nextResult, locale);
            setDraft(incoming);
            setResult(nextResult);
            setShared(true);
          }
        } catch {
          // A malformed external scenario must not replace the saved draft.
        }
      } else {
        const example = previewId && preview?.(previewId, locale);
        if (example) {
          setResult(example);
          setMock(true);
          setReady(true);
          return;
        }
        const { draft } = draftStorage(country);
        if (draft?.completed) {
          setDraft(draft);
          setResult(
            getRememberedResult(country, draft, locale) ??
              country.run(draft, locale),
          );
        }
      }
      setReady(true);
    };
    load();
    window.addEventListener('hashchange', load);
    return () => window.removeEventListener('hashchange', load);
  }, [country, locale, preview]);

  const principalResult = draft && country.principal?.(draft, locale);

  return (
    <main id="main" className={styles.main}>
      {!ready ? (
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
          <p>{t('result.empty')}</p>
          <Link
            className={styles.button}
            href={countryPath(country.id, 'simulate')}
          >
            {t('home.start')}
          </Link>
        </div>
      )}
      {ready && (
        <SavedScenarios
          country={country}
          draft={draft}
          onLoad={(next) => {
            setDraft(next);
            setResult(country.run(next, locale));
            setShared(false);
            setMock(false);
          }}
        />
      )}
      {result && (
        <footer className={styles.printOnly}>{t('home.disclaimer')}</footer>
      )}
    </main>
  );
}
