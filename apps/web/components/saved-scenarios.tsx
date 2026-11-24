'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/locale';
import { countryPath } from '../lib/site-countries';
import { punct } from '../i18n/punctuation';
import { readPageResult } from '../lib/page-result';
import { displayedColumns, ruleSetTitle } from '../lib/policy';
import {
  type CountryDraft,
  type CountryModule,
  pathwayTitle,
} from '../lib/country-module';
import {
  type SavedScenario,
  deleteScenario,
  loadScenario,
  readScenarios,
  saveScenario,
} from '../lib/storage';
import site from '../app/site.module.css';
import styles from './saved-scenarios.module.css';

interface SavedScenariosProps<D extends CountryDraft, K> {
  country: CountryModule<D, K>;
  draft?: D;
  onLoad?: (draft: D) => void;
}

export function SavedScenarios<D extends CountryDraft, K>(
  props: SavedScenariosProps<D, K>,
) {
  return <CountryScenarios key={props.country.id} {...props} />;
}

function CountryScenarios<D extends CountryDraft, K>({
  country,
  draft,
  onLoad,
}: SavedScenariosProps<D, K>) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const [scenarios, setScenarios] = useState<SavedScenario<D>[]>([]);
  const [name, setName] = useState<string>();
  const [available, setAvailable] = useState(true);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const stored = readScenarios(country);
    setScenarios(stored.scenarios);
    setAvailable(stored.available);
    setReady(true);
  }, [country]);
  const summaries = useMemo(
    () =>
      scenarios.map((scenario) => {
        const { result } = readPageResult(
          country,
          locale,
          scenario.draft,
          'preview',
        );
        if (!result) return { ...scenario, columns: undefined };
        const columns = result.columns.length
          ? displayedColumns(country, result)
          : country.policy.displayedRuleSets.map((ruleSet) => ({
              id: ruleSet.id,
              title: ruleSetTitle(ruleSet, locale),
              pathways: [],
            }));
        return { ...scenario, columns, shortCircuit: result.shortCircuit };
      }),
    [country, scenarios, locale],
  );
  const defaultName = `${t('scenarios.defaultName')} ${scenarios.length + 1}`;

  return (
    <section
      className={`${site.section} ${site.noPrint}`}
      aria-labelledby="scenarios-heading"
    >
      <h2 id="scenarios-heading">{t('scenarios.title')}</h2>
      <p className={site.muted}>{t('scenarios.privacy')}</p>
      {draft && ready && (
        <form
          className={styles.save}
          onSubmit={(event) => {
            event.preventDefault();
            const stored = saveScenario(
              country,
              name?.trim() || defaultName,
              draft,
            );
            setScenarios(stored.scenarios);
            setAvailable(stored.available);
            setSaved(stored.available);
            if (stored.available) setName(undefined);
          }}
        >
          <label htmlFor="scenario-name">{t('scenarios.name')}</label>
          <div className={styles.row}>
            <input
              id="scenario-name"
              value={name ?? defaultName}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
            <button className={site.secondary} type="submit">
              {t('scenarios.save')}
            </button>
          </div>
        </form>
      )}
      <div role="status">
        {!ready && <p>{t('result.loading')}</p>}
        {!available && (
          <p className={site.notice}>{t('scenarios.unavailable')}</p>
        )}
        {saved && <p>{t('scenarios.saved')}</p>}
      </div>
      {ready && available && !scenarios.length && <p>{t('scenarios.empty')}</p>}
      <ul className={styles.list}>
        {summaries.map((scenario) => (
          <li key={scenario.id} className={styles.card}>
            <h3>{scenario.name}</h3>
            <p>
              {t('whatif.date')}
              {p.colon}
              <time dateTime={scenario.draft.simulationDate}>
                {scenario.draft.simulationDate}
              </time>
            </p>
            {scenario.columns ? (
              <dl className={styles.summaries}>
                {scenario.columns.map((column) => (
                  <div key={column.id}>
                    <dt>{column.title}</dt>
                    {column.pathways.length ? (
                      column.pathways.map((pathway) => (
                        <dd key={pathway.id}>
                          {column.pathways.length > 1 &&
                            `${pathway.title}${p.colon}`}
                          {pathwayTitle(pathway, t)}
                        </dd>
                      ))
                    ) : (
                      <dd>
                        {scenario.shortCircuit?.message ??
                          t('result.missingAssessment')}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            ) : (
              <p>{t('scenarios.needsCorrection')}</p>
            )}
            <div className={styles.row}>
              <Link
                href={countryPath(country.id, 'result')}
                className={site.button}
                aria-label={`${t('scenarios.load')} ${scenario.name}`}
                onClick={() => {
                  const next = loadScenario(country, scenario);
                  onLoad?.(next);
                  setSaved(false);
                }}
              >
                {t('scenarios.load')}
              </Link>
              <button
                className={site.secondary}
                type="button"
                aria-label={`${t('scenarios.delete')} ${scenario.name}`}
                onClick={() => {
                  if (
                    !window.confirm(
                      t('scenarios.confirmDelete').replace(
                        '{name}',
                        scenario.name,
                      ),
                    )
                  )
                    return;
                  const stored = deleteScenario(country, scenario.id);
                  setScenarios(stored.scenarios);
                  setAvailable(stored.available);
                  setSaved(false);
                }}
              >
                {t('scenarios.delete')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
