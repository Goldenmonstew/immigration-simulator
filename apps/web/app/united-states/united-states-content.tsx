'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { US_CONDITIONAL, evaluateUnitedStates } from '@uk-immigration/engine';
import type { UsConditional } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { today } from '../../lib/questionnaire';
import {
  emptyUsForm,
  emptyUsTrip,
  usRequest,
  validateUsForm,
} from '../../lib/united-states';
import type { UsErrors, UsForm } from '../../lib/united-states';
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
  'us-simulation-date': 'us.simulationDate',
  'us-date-of-birth': 'us.dateOfBirth',
  'us-permanent-resident': 'us.permanentResident',
  'us-principal-since': 'us.principalSince',
  'us-state-residence-from': 'us.stateResidenceFrom',
  'us-married-on': 'us.marriedOn',
  'us-spouse-citizen-since': 'us.spouseCitizenSince',
  departed: 'us.departed',
  returned: 'us.returned',
};

type DateField =
  | 'simulationDate'
  | 'dateOfBirth'
  | 'permanentResident'
  | 'principalSince'
  | 'stateResidenceFrom'
  | 'marriedOn'
  | 'spouseCitizenSince';

export default function UnitedStatesContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<UsForm>(() => emptyUsForm(''));
  const [errors, setErrors] = useState<UsErrors>({});
  const [submitted, setSubmitted] = useState<UsForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateUnitedStates(usRequest(submitted, locale)),
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

  const set = (patch: Partial<UsForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateUsForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, n, field] = id.match(/^us-trip-(\d+)-(\w+)$/) ?? [];
    if (!field) return t(FIELD_LABELS[id]);
    const entry = t('us.trip').replace('{n}', String(Number(n) + 1));
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field: DateField,
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<UsForm>)}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('us.title')}</h1>
        <p className={site.lead}>{t('us.intro')}</p>
        <p className={site.notice}>{t('us.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('us.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('us.basics')}</h2>
          {date(
            'us-simulation-date',
            'us.simulationDate',
            'simulationDate',
            t('us.simulationDateHint'),
          )}
          {date('us-date-of-birth', 'us.dateOfBirth', 'dateOfBirth')}

          <h2>{t('us.greenCard')}</h2>
          {date(
            'us-permanent-resident',
            'us.permanentResident',
            'permanentResident',
            t('us.permanentResidentHint'),
          )}
          <Field id="us-conditional" label={t('us.conditional')}>
            <select
              id="us-conditional"
              value={draft.conditional}
              onChange={(e) => {
                // Hidden principal-applicant fields must not keep their errors.
                setErrors({});
                set({ conditional: e.target.value as UsConditional });
              }}
            >
              {US_CONDITIONAL.map((c) => (
                <option key={c} value={c}>
                  {t(`us.conditional.${c}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          {draft.conditional !== 'none' && (
            <div className={form.followUp}>
              <div className={form.checkboxes}>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.joint}
                    onChange={(e) => {
                      setErrors({});
                      set({ joint: e.target.checked });
                    }}
                  />
                  {t('us.joint')}
                </label>
              </div>
              {draft.joint &&
                date(
                  'us-principal-since',
                  'us.principalSince',
                  'principalSince',
                )}
            </div>
          )}
          {date(
            'us-state-residence-from',
            'us.stateResidenceFrom',
            'stateResidenceFrom',
          )}
          <div className={form.checkboxes}>
            <label>
              <input
                type="checkbox"
                checked={draft.married}
                onChange={(e) => {
                  // Hidden marriage fields must not keep their errors.
                  setErrors({});
                  set({ married: e.target.checked });
                }}
              />
              {t('us.married')}
            </label>
          </div>
          {draft.married && (
            <div className={form.followUp}>
              {date('us-married-on', 'us.marriedOn', 'marriedOn')}
              {date(
                'us-spouse-citizen-since',
                'us.spouseCitizenSince',
                'spouseCitizenSince',
              )}
            </div>
          )}

          <h2>{t('us.trips')}</h2>
          <p className={form.hint}>{t('us.tripsHint')}</p>
          <PilotDateRows
            prefix="us-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('us.departed') },
              { key: 'returned', label: t('us.returned') },
            ]}
            legend={(n) => t('us.trip').replace('{n}', String(n))}
            addLabel={t('us.addTrip')}
            removeLabel={t('us.remove')}
            empty={emptyUsTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('us.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
