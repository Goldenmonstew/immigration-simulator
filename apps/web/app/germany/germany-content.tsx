'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  DE_NATURALISATION_ROUTES,
  DE_PERMIT_KINDS,
  DE_SETTLEMENT_ROUTES,
  evaluateGermany,
} from '@uk-immigration/engine';
import type {
  DeNaturalisationRoute,
  DePermitKind,
  DeSettlementRoute,
} from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { today } from '../../lib/questionnaire';
import {
  contributionRoute,
  deRequest,
  emptyDeForm,
  emptyDePermit,
  emptyDeTrip,
  endDateRequired,
  hasEndDate,
  validateDeForm,
} from '../../lib/germany';
import type { DeErrors, DeForm } from '../../lib/germany';
import {
  PilotDate,
  PilotDateRows,
  PilotErrorSummary,
} from '../pilot/pilot-form';
import { PilotResult } from '../pilot/pilot-result';
import { Field } from '../simulate/field';
import form from '../simulate/form.module.css';
import site from '../site.module.css';

const FIELD_LABELS: Record<string, TranslationKey> = {
  'de-simulation-date': 'de.simulationDate',
  'de-first-entry': 'de.firstEntry',
  'de-contributions': 'de.contributions',
  'de-blue-card-months': 'de.blueCardMonths',
  'de-married-on': 'de.marriedOn',
  'de-spouse-german-since': 'de.spouseGermanSince',
  from: 'de.from',
  to: 'de.to',
  departed: 'de.departed',
  returned: 'de.returned',
};

// The language or training answer that shortens each settlement route.
const ROUTE_FLAGS: Partial<
  Record<
    DeSettlementRoute,
    { key: 'trainedInGermany' | 'germanB1' | 'germanC1'; label: TranslationKey }
  >
> = {
  skilled: { key: 'trainedInGermany', label: 'de.trained' },
  'blue-card': { key: 'germanB1', label: 'de.b1' },
  refugee: { key: 'germanC1', label: 'de.c1' },
};

export default function GermanyContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<DeForm>(() => emptyDeForm(''));
  const [errors, setErrors] = useState<DeErrors>({});
  const [submitted, setSubmitted] = useState<DeForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateGermany(deRequest(submitted, locale)),
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

  const set = (patch: Partial<DeForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateDeForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, kind, n, field] = id.match(/^de-(permit|trip)-(\d+)-(\w+)$/) ?? [];
    if (!kind) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'permit' ? 'de.permit' : 'de.trip').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field: 'simulationDate' | 'firstEntry' | 'marriedOn' | 'spouseGermanSince',
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<DeForm>)}
      hint={hint}
      error={errors[id]}
    />
  );
  const months = (
    id: string,
    label: TranslationKey,
    hint: TranslationKey,
    field: 'contributionMonths' | 'blueCardMonths',
  ) => (
    <Field id={id} label={t(label)} hint={t(hint)} error={errors[id]}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={draft[field]}
        onChange={(e) => set({ [field]: e.target.value.trim() })}
        aria-invalid={errors[id] ? true : undefined}
        aria-describedby={[`${id}-hint`, errors[id] && `${id}-error`]
          .filter(Boolean)
          .join(' ')}
      />
    </Field>
  );
  const flag = ROUTE_FLAGS[draft.settlementRoute];

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('de.title')}</h1>
        <p className={site.lead}>{t('de.intro')}</p>
        <p className={site.notice}>{t('de.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('de.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('de.basics')}</h2>
          {date(
            'de-simulation-date',
            'de.simulationDate',
            'simulationDate',
            t('de.simulationDateHint'),
          )}
          {date(
            'de-first-entry',
            'de.firstEntry',
            'firstEntry',
            t('de.firstEntryHint'),
          )}

          <h2>{t('de.permits')}</h2>
          <p className={form.hint}>{t('de.permitsHint')}</p>
          {draft.permits.map((permit, i) => {
            const update = (patch: Partial<typeof permit>) =>
              set({
                permits: draft.permits.map((p, n) =>
                  n === i ? { ...p, ...patch } : p,
                ),
              });
            return (
              <fieldset key={i} className={form.entry}>
                <legend>{t('de.permit').replace('{n}', String(i + 1))}</legend>
                <Field id={`de-permit-${i}-kind`} label={t('de.kind')}>
                  <select
                    id={`de-permit-${i}-kind`}
                    value={permit.kind}
                    onChange={(e) =>
                      update({ kind: e.target.value as DePermitKind })
                    }
                  >
                    {DE_PERMIT_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`de.kind.${k}` as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </Field>
                <PilotDate
                  id={`de-permit-${i}-from`}
                  label={t('de.from')}
                  value={permit.from}
                  onChange={(from) => update({ from })}
                  error={errors[`de-permit-${i}-from`]}
                />
                {hasEndDate(permit.kind) && (
                  <>
                    <PilotDate
                      id={`de-permit-${i}-to`}
                      label={t(
                        endDateRequired(permit.kind)
                          ? 'de.toRequired'
                          : 'de.to',
                      )}
                      value={permit.to}
                      onChange={(to) => update({ to })}
                      error={errors[`de-permit-${i}-to`]}
                    />
                    <div className={form.checkboxes}>
                      <label>
                        <input
                          type="checkbox"
                          checked={permit.renewing}
                          onChange={(e) =>
                            update({ renewing: e.target.checked })
                          }
                        />
                        {t('de.renewing')}
                      </label>
                    </div>
                  </>
                )}
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => {
                    // Row errors are keyed by index, so they go stale.
                    setErrors({});
                    set({ permits: draft.permits.filter((_, n) => n !== i) });
                  }}
                >
                  {t('de.remove')}
                </button>
              </fieldset>
            );
          })}
          <div className={form.field}>
            <button
              type="button"
              className={site.secondary}
              onClick={() =>
                set({ permits: [...draft.permits, emptyDePermit()] })
              }
            >
              {t('de.addPermit')}
            </button>
          </div>

          <h2>{t('de.trips')}</h2>
          <p className={form.hint}>{t('de.tripsHint')}</p>
          <PilotDateRows
            prefix="de-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('de.departed') },
              { key: 'returned', label: t('de.returned') },
            ]}
            legend={(n) => t('de.trip').replace('{n}', String(n))}
            addLabel={t('de.addTrip')}
            removeLabel={t('de.remove')}
            empty={emptyDeTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />

          <h2>{t('de.settlement')}</h2>
          <Field id="de-settlement-route" label={t('de.settlementRoute')}>
            <select
              id="de-settlement-route"
              value={draft.settlementRoute}
              onChange={(e) => {
                // Hidden month fields must not keep their errors.
                setErrors({});
                set({ settlementRoute: e.target.value as DeSettlementRoute });
              }}
            >
              {DE_SETTLEMENT_ROUTES.map((r) => (
                <option key={r} value={r}>
                  {t(`de.settlementRoute.${r}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          {flag && (
            <div className={form.checkboxes}>
              <label>
                <input
                  type="checkbox"
                  checked={draft[flag.key]}
                  onChange={(e) => set({ [flag.key]: e.target.checked })}
                />
                {t(flag.label)}
              </label>
            </div>
          )}
          {contributionRoute(draft.settlementRoute) &&
            months(
              'de-contributions',
              'de.contributions',
              'de.contributionsHint',
              'contributionMonths',
            )}
          {draft.settlementRoute === 'blue-card' &&
            months(
              'de-blue-card-months',
              'de.blueCardMonths',
              'de.blueCardMonthsHint',
              'blueCardMonths',
            )}

          <h2>{t('de.naturalisation')}</h2>
          <Field
            id="de-naturalisation-route"
            label={t('de.naturalisationRoute')}
          >
            <select
              id="de-naturalisation-route"
              value={draft.naturalisationRoute}
              onChange={(e) => {
                // A hidden marriage date must not keep its error.
                setErrors({});
                set({
                  naturalisationRoute: e.target.value as DeNaturalisationRoute,
                });
              }}
            >
              {DE_NATURALISATION_ROUTES.map((r) => (
                <option key={r} value={r}>
                  {t(`de.naturalisationRoute.${r}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          {draft.naturalisationRoute === 'spouse' && (
            <div className={form.followUp}>
              {date('de-married-on', 'de.marriedOn', 'marriedOn')}
              {date(
                'de-spouse-german-since',
                'de.spouseGermanSince',
                'spouseGermanSince',
              )}
            </div>
          )}
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('de.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
