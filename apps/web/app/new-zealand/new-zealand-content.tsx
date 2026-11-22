'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  NZ_RESIDENT_CATEGORIES,
  evaluateNewZealand,
} from '@uk-immigration/engine';
import type { NzResidentCategory } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import {
  emptyNzForm,
  emptyNzTrip,
  nzRequest,
  validateNzForm,
} from '../../lib/new-zealand';
import type { NzErrors, NzForm } from '../../lib/new-zealand';
import { today } from '../../lib/questionnaire';
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
  'nz-simulation-date': 'nz.simulationDate',
  'nz-date-of-birth': 'nz.dateOfBirth',
  'nz-first-arrival': 'nz.firstArrival',
  'nz-resident-granted': 'nz.residentGranted',
  'nz-prv-granted': 'nz.prvGranted',
  'nz-travel-conditions-end': 'nz.travelConditionsEnd',
  departed: 'nz.departed',
  returned: 'nz.returned',
};

export default function NewZealandContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<NzForm>(() => emptyNzForm(''));
  const [errors, setErrors] = useState<NzErrors>({});
  const [submitted, setSubmitted] = useState<NzForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateNewZealand(nzRequest(submitted, locale)),
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

  const set = (patch: Partial<NzForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateNzForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, n, field] = id.match(/^nz-trip-(\d+)-(\w+)$/) ?? [];
    if (!field) return t(FIELD_LABELS[id]);
    const entry = t('nz.trip').replace('{n}', String(Number(n) + 1));
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field:
      | 'simulationDate'
      | 'dateOfBirth'
      | 'firstArrival'
      | 'residentGranted'
      | 'travelConditionsEnd'
      | 'prvGranted',
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<NzForm>)}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('nz.title')}</h1>
        <p className={site.lead}>{t('nz.intro')}</p>
        <p className={site.notice}>{t('nz.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('nz.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('nz.basics')}</h2>
          {date(
            'nz-simulation-date',
            'nz.simulationDate',
            'simulationDate',
            t('nz.simulationDateHint'),
          )}
          {date('nz-date-of-birth', 'nz.dateOfBirth', 'dateOfBirth')}
          {date('nz-first-arrival', 'nz.firstArrival', 'firstArrival')}

          <h2>{t('nz.visas')}</h2>
          {date(
            'nz-resident-granted',
            'nz.residentGranted',
            'residentGranted',
            t('nz.residentGrantedHint'),
          )}
          <Field id="nz-category" label={t('nz.category')}>
            <select
              id="nz-category"
              value={draft.category}
              onChange={(e) =>
                set({ category: e.target.value as NzResidentCategory })
              }
            >
              {NZ_RESIDENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`nz.category.${c}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          {date(
            'nz-travel-conditions-end',
            'nz.travelConditionsEnd',
            'travelConditionsEnd',
            t('nz.travelConditionsEndHint'),
          )}
          <Field id="nz-conditions" label={t('nz.conditions')}>
            <select
              id="nz-conditions"
              value={draft.conditions}
              onChange={(e) =>
                set({ conditions: e.target.value as NzForm['conditions'] })
              }
            >
              {(['', 'none', 'met', 'outstanding'] as const).map((c) => (
                <option key={c} value={c}>
                  {t(`nz.conditions.${c || 'unsure'}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          <div className={form.checkboxes}>
            <label>
              <input
                type="checkbox"
                checked={draft.nonPrincipal}
                onChange={(e) => set({ nonPrincipal: e.target.checked })}
              />
              {t('nz.nonPrincipal')}
            </label>
          </div>
          {date('nz-prv-granted', 'nz.prvGranted', 'prvGranted')}

          <h2>{t('nz.trips')}</h2>
          <p className={form.hint}>{t('nz.tripsHint')}</p>
          <PilotDateRows
            prefix="nz-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('nz.departed') },
              { key: 'returned', label: t('nz.returned') },
            ]}
            legend={(n) => t('nz.trip').replace('{n}', String(n))}
            addLabel={t('nz.addTrip')}
            removeLabel={t('nz.remove')}
            empty={emptyNzTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('nz.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
