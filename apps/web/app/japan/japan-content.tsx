'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  JP_NATURALISATION_ROUTES,
  JP_PR_ROUTES,
  evaluateJapan,
} from '@uk-immigration/engine';
import type { JpNaturalisationRoute, JpPrRoute } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { today } from '../../lib/questionnaire';
import {
  emptyJpExcluded,
  emptyJpForm,
  emptyJpTrip,
  jpRequest,
  needsStatusStart,
  validateJpForm,
} from '../../lib/japan';
import type { JpErrors, JpForm } from '../../lib/japan';
import {
  PilotDate,
  PilotDateRows,
  PilotErrorSummary,
} from '../pilot/pilot-form';
import { PilotResult } from '../pilot/pilot-result';
import { Field } from '../simulate/field';
import form from '../simulate/form.module.css';
import site from '../site.module.css';

type DateField =
  | 'simulationDate'
  | 'stayStart'
  | 'statusStart'
  | 'newStatusStart'
  | 'marriedLifeFrom'
  | 'marriedOn'
  | 'dateOfBirth';

const FIELD_LABELS: Record<string, TranslationKey> = {
  'jp-simulation-date': 'jp.simulationDate',
  'jp-stay-start': 'jp.stayStart',
  'jp-pr-route': 'jp.prRoute',
  'jp-new-status-start': 'jp.newStatusStart',
  'jp-married-life-from': 'jp.marriedLifeFrom',
  'jp-married-on': 'jp.marriedOn',
  'jp-nat-route': 'jp.natRoute',
  'jp-date-of-birth': 'jp.dateOfBirth',
  departed: 'jp.departed',
  returned: 'jp.returned',
  stayExpiry: 'jp.stayExpiry',
  from: 'jp.excludedFrom',
  to: 'jp.excludedTo',
};

export default function JapanContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<JpForm>(() => emptyJpForm(''));
  const [errors, setErrors] = useState<JpErrors>({});
  const [submitted, setSubmitted] = useState<JpForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateJapan(jpRequest(submitted, locale)),
    [submitted, locale],
  );

  useEffect(() => {
    setDraft((d) => (d.simulationDate ? d : { ...d, simulationDate: today() }));
  }, []);
  useEffect(() => {
    if (submitted) resultHeading.current?.focus();
  }, [submitted]);
  useEffect(() => {
    if (Object.keys(errors).length) errorSummary.current?.focus();
  }, [errors]);

  const set = (patch: Partial<JpForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateJpForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const statusLabel = `jp.statusStart.${draft.prRoute}` as TranslationKey;
  const fieldLabel = (id: string) => {
    if (id === 'jp-status-start') return t(statusLabel);
    const [, kind, n, field] =
      id.match(/^jp-(trip|excluded)-(\d+)-(\w+)$/) ?? [];
    if (!field) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'trip' ? 'jp.trip' : 'jp.excludedPeriod').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (id: string, label: string, field: DateField, hint?: string) => (
    <PilotDate
      id={id}
      label={label}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<JpForm>)}
      hint={hint}
      error={errors[id]}
    />
  );
  const route = (
    id: string,
    key: TranslationKey,
    value: string,
    options: readonly string[],
    onChange: (value: string) => void,
  ) => (
    <Field id={id} label={t(key)} error={errors[id]}>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          // Hidden follow-up dates must not keep their errors.
          setErrors({});
          onChange(e.target.value);
        }}
        aria-invalid={errors[id] ? true : undefined}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
      >
        <option value="">{t(`${key}.choose` as TranslationKey)}</option>
        {options.map((r) => (
          <option key={r} value={r}>
            {t(`${key}.${r}` as TranslationKey)}
          </option>
        ))}
      </select>
    </Field>
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('jp.title')}</h1>
        <p className={site.lead}>{t('jp.intro')}</p>
        <p className={site.notice}>{t('jp.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('jp.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('jp.basics')}</h2>
          {date(
            'jp-simulation-date',
            t('jp.simulationDate'),
            'simulationDate',
            t('jp.simulationDateHint'),
          )}
          {date(
            'jp-stay-start',
            t('jp.stayStart'),
            'stayStart',
            t('jp.stayStartHint'),
          )}

          <h2>{t('jp.pr')}</h2>
          {route(
            'jp-pr-route',
            'jp.prRoute',
            draft.prRoute,
            JP_PR_ROUTES,
            (r) => set({ prRoute: r as JpPrRoute }),
          )}
          {needsStatusStart(draft.prRoute) && (
            <div className={form.followUp}>
              {date(
                'jp-status-start',
                t(statusLabel),
                'statusStart',
                draft.prRoute === 'general'
                  ? t('jp.statusStartHint.general')
                  : undefined,
              )}
            </div>
          )}
          {draft.prRoute === 'general' && (
            <div className={form.followUp}>
              <Field
                id="jp-new-status"
                label={t('jp.newStatus')}
                hint={t('jp.newStatusHint')}
              >
                <select
                  id="jp-new-status"
                  value={draft.newStatus}
                  onChange={(e) => {
                    // A hidden date must not keep its error.
                    setErrors({});
                    set({ newStatus: e.target.value as JpForm['newStatus'] });
                  }}
                  aria-describedby="jp-new-status-hint"
                >
                  {(['same', 'own', 'none'] as const).map((k) => (
                    <option key={k} value={k}>
                      {t(`jp.newStatus.${k}`)}
                    </option>
                  ))}
                </select>
              </Field>
              {draft.newStatus === 'own' &&
                date(
                  'jp-new-status-start',
                  t('jp.newStatusStart'),
                  'newStatusStart',
                )}
              <p className={form.hint}>{t('jp.excludedHint')}</p>
              <PilotDateRows
                prefix="jp-excluded"
                rows={draft.excluded}
                fields={[
                  { key: 'from', label: t('jp.excludedFrom') },
                  { key: 'to', label: t('jp.excludedTo') },
                ]}
                legend={(n) => t('jp.excludedPeriod').replace('{n}', String(n))}
                addLabel={t('jp.addExcluded')}
                removeLabel={t('jp.remove')}
                empty={emptyJpExcluded}
                errors={errors}
                onChange={(excluded) => set({ excluded })}
                onRemove={() => setErrors({})}
              />
            </div>
          )}
          {draft.prRoute === 'spouse' && (
            <div className={form.followUp}>
              {date(
                'jp-married-life-from',
                t('jp.marriedLifeFrom'),
                'marriedLifeFrom',
                t('jp.marriedLifeFromHint'),
              )}
            </div>
          )}

          <h2>{t('jp.naturalisation')}</h2>
          {route(
            'jp-nat-route',
            'jp.natRoute',
            draft.natRoute,
            JP_NATURALISATION_ROUTES,
            (r) => set({ natRoute: r as JpNaturalisationRoute }),
          )}
          {draft.natRoute === 'general' && (
            <div className={form.followUp}>
              {date('jp-date-of-birth', t('jp.dateOfBirth'), 'dateOfBirth')}
            </div>
          )}
          {draft.natRoute === 'spouse' && (
            <div className={form.followUp}>
              {date(
                'jp-married-on',
                t('jp.marriedOn'),
                'marriedOn',
                t('jp.marriedOnHint'),
              )}
            </div>
          )}

          <h2>{t('jp.trips')}</h2>
          <p className={form.hint}>{t('jp.tripsHint')}</p>
          {draft.trips.map((trip, i) => {
            const update = (patch: Partial<typeof trip>) =>
              set({
                trips: draft.trips.map((r, n) =>
                  n === i ? { ...r, ...patch } : r,
                ),
              });
            return (
              <fieldset key={i} className={form.entry}>
                <legend>{t('jp.trip').replace('{n}', String(i + 1))}</legend>
                <PilotDate
                  id={`jp-trip-${i}-departed`}
                  label={t('jp.departed')}
                  value={trip.departed}
                  onChange={(departed) => update({ departed })}
                  error={errors[`jp-trip-${i}-departed`]}
                />
                <PilotDate
                  id={`jp-trip-${i}-returned`}
                  label={t('jp.returned')}
                  value={trip.returned}
                  onChange={(returned) => update({ returned })}
                  error={errors[`jp-trip-${i}-returned`]}
                />
                <PilotDate
                  id={`jp-trip-${i}-stayExpiry`}
                  label={t('jp.stayExpiry')}
                  value={trip.stayExpiry}
                  onChange={(stayExpiry) => update({ stayExpiry })}
                  hint={t('jp.stayExpiryHint')}
                  error={errors[`jp-trip-${i}-stayExpiry`]}
                />
                <div className={form.checkboxes}>
                  <label>
                    <input
                      type="checkbox"
                      checked={trip.reentryPermit}
                      onChange={(e) =>
                        update({ reentryPermit: e.target.checked })
                      }
                    />
                    {t('jp.reentryPermit')}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={trip.renewalPending}
                      onChange={(e) =>
                        update({ renewalPending: e.target.checked })
                      }
                    />
                    {t('jp.renewalPending')}
                  </label>
                </div>
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => {
                    // Row errors are keyed by index, so they go stale.
                    setErrors({});
                    set({ trips: draft.trips.filter((_, n) => n !== i) });
                  }}
                >
                  {t('jp.remove')}
                </button>
              </fieldset>
            );
          })}
          <div className={form.field}>
            <button
              type="button"
              className={site.secondary}
              onClick={() => set({ trips: [...draft.trips, emptyJpTrip()] })}
            >
              {t('jp.addTrip')}
            </button>
          </div>
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('jp.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
