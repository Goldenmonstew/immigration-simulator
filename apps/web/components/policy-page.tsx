'use client';

import type { ParameterSet, SourceRef } from '@uk-immigration/policy-data';
import { RuleSetStatus } from './policy-status';
import { useTranslation } from '../i18n/locale';
import { punct } from '../i18n/punctuation';
import { ruleSetTitle, type CountryPolicy } from '../lib/policy';
import site from '../app/site.module.css';
import styles from '../app/uk/policy/policy.module.css';

function Sources({
  sources,
  urls,
}: {
  sources: SourceRef[];
  urls: CountryPolicy['sourceUrls'];
}) {
  const { locale } = useTranslation();
  return (
    <ul className={styles.sources}>
      {sources.map(({ srcId, locator, url }, index) => (
        <li key={`${srcId}-${index}`}>
          <a href={url ?? urls[srcId]} target="_blank" rel="noreferrer">
            {srcId}{' '}
            {locale === 'en' ? locator.replace('版本', 'version') : locator}
          </a>
        </li>
      ))}
    </ul>
  );
}

function ParameterValue({
  value,
}: {
  value: ParameterSet['values'][string]['value'];
}) {
  const { t, locale } = useTranslation();
  if (typeof value === 'number') return value.toLocaleString(locale);
  if (typeof value === 'string')
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? (
      <time dateTime={value}>{value}</time>
    ) : (
      value
    );
  if (Array.isArray(value)) return value.join(punct(locale).list);
  if ('required' in value && 'window' in value)
    return t('policyPage.bestYears')
      .replace('{required}', String(value.required))
      .replace('{window}', String(value.window));
  if (!('cefrLevel' in value && 'applicationsFrom' in value))
    return Object.entries(value)
      .map(([key, entry]) => `${key} ${entry}`)
      .join(punct(locale).list);
  return (
    <>
      {value.cefrLevel} · {t('policyPage.applicationsFrom')}{' '}
      <time dateTime={String(value.applicationsFrom)}>
        {value.applicationsFrom}
      </time>
    </>
  );
}

export function PolicyPage({
  country,
}: {
  country: { policy: CountryPolicy };
}) {
  const {
    ruleSets,
    displayedRuleSets,
    parameters,
    rules,
    changelog,
    sourceUrls,
  } = country.policy;
  const { t, locale } = useTranslation();
  const p = punct(locale);
  return (
    <main id="main" className={site.main}>
      <h1>{t('policyPage.title')}</h1>
      <section className={site.section} aria-labelledby="rule-sets-heading">
        <h2 id="rule-sets-heading">{t('policyPage.ruleSets')}</h2>
        <div className={styles.ruleSets}>
          {ruleSets.map((ruleSet) => (
            <article
              key={ruleSet.id}
              className={`${styles.card} ${ruleSet.kind === 'ANNOUNCED' ? styles.announcedCard : ''}`}
              data-rule-set={ruleSet.id}
            >
              <h3>{ruleSetTitle(ruleSet, locale)}</h3>
              <p
                className={`${site.badge} ${ruleSet.kind === 'ANNOUNCED' ? site.announced : ''}`}
              >
                <RuleSetStatus ruleSet={ruleSet} />
              </p>
              {!displayedRuleSets.some((set) => set.id === ruleSet.id) && (
                <p className={site.muted}>{t('policyPage.notDisplayed')}</p>
              )}
              <p>
                <code>{ruleSet.id}</code>
              </p>
              <p>
                {t('policy.asOf')}{' '}
                <time dateTime={parameters[ruleSet.id].asOf}>
                  {parameters[ruleSet.id].asOf}
                </time>
              </p>
              <Sources urls={sourceUrls} sources={ruleSet.sources} />
            </article>
          ))}
        </div>
      </section>
      <section className={site.section} aria-labelledby="parameters-heading">
        <h2 id="parameters-heading">{t('policyPage.parameters')}</h2>
        {ruleSets.map((ruleSet) => (
          <details key={ruleSet.id} className={styles.group}>
            <summary id={`${ruleSet.id}-parameters`}>
              <h3>
                {ruleSetTitle(ruleSet, locale)}
                {p.openParen}
                {Object.keys(parameters[ruleSet.id].values).length}
                {p.closeParen}
              </h3>
            </summary>
            <div
              className={styles.tableScroll}
              role="region"
              aria-labelledby={`${ruleSet.id}-parameters`}
              tabIndex={0}
            >
              <table className={styles.parameters}>
                <caption>{ruleSetTitle(ruleSet, locale)}</caption>
                <thead>
                  <tr>
                    <th scope="col">{t('policyPage.name')}</th>
                    <th scope="col">{t('policyPage.value')}</th>
                    <th scope="col">{t('result.sources')}</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(parameters[ruleSet.id].values).map(
                    ([name, parameter]) => (
                      <tr key={name} data-parameter={name}>
                        <th scope="row">
                          <code>{name}</code>
                        </th>
                        <td data-label={t('policyPage.value')}>
                          <ParameterValue value={parameter.value} />
                        </td>
                        <td data-label={t('result.sources')}>
                          <Sources
                            urls={sourceUrls}
                            sources={parameter.sources}
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </section>
      <section className={site.section} aria-labelledby="rules-heading">
        <h2 id="rules-heading">{t('policyPage.rules')}</h2>
        {ruleSets.map((ruleSet) => (
          <details key={ruleSet.id} className={styles.group}>
            <summary>
              <h3>
                {ruleSetTitle(ruleSet, locale)}
                {p.openParen}
                {rules[ruleSet.id].length}
                {p.closeParen}
              </h3>
            </summary>
            <ul className={styles.entries}>
              {rules[ruleSet.id].map((meta) => (
                <li key={meta.id} data-rule={meta.id}>
                  <h4>{locale === 'en' ? meta.titleEn : meta.title}</h4>
                  <p>
                    <code>{meta.id}</code>
                  </p>
                  <Sources urls={sourceUrls} sources={meta.sources} />
                  {!!meta.pendingDetails?.length && (
                    <p className={site.muted}>
                      {t('result.pendingDetails')}
                      {p.colon}
                      {meta.pendingDetails.join(p.list)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </section>
      <section className={site.section} aria-labelledby="changelog-heading">
        <h2 id="changelog-heading">{t('policyPage.changelog')}</h2>
        <ol className={`${styles.entries} ${styles.changelog}`}>
          {[...changelog]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((change) => (
              <li
                key={`${change.date} ${change.titleEn}`}
                data-policy-change={change.date}
              >
                <time dateTime={change.date}>{change.date}</time>
                <h3>{locale === 'en' ? change.titleEn : change.title}</h3>
                <p>{locale === 'en' ? change.summaryEn : change.summary}</p>
                <Sources urls={sourceUrls} sources={change.sources} />
              </li>
            ))}
        </ol>
      </section>
      <section className={site.section} aria-labelledby="sources-heading">
        <h2 id="sources-heading">{t('policyPage.sources')}</h2>
        <ul className={`${styles.entries} ${styles.sourceList}`}>
          {Object.entries(sourceUrls).map(([id, url]) => (
            <li key={id} data-source={id}>
              <strong>{id}</strong>
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
