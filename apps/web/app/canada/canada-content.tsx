'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { evaluateCanada } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import {
  caRequest,
  emptyCaForm,
  emptyCaPeriod,
  emptyCaTrip,
  validateCaForm,
} from '../../lib/canada';
import type { CaErrors, CaForm } from '../../lib/canada';
import { today } from '../../lib/questionnaire';
import {
  PilotDate,
  PilotDateRows,
  PilotErrorSummary,
} from '../pilot/pilot-form';
import { PilotResult } from '../pilot/pilot-result';
import form from '../simulate/form.module.css';
import site from '../site.module.css';

const FIELD_LABELS: Record<string, TranslationKey> = {
  'ca-simulation-date': 'ca.simulationDate',
  'ca-date-of-birth': 'ca.dateOfBirth',
  'ca-permanent-resident': 'ca.permanentResident',
  from: 'ca.from',
  to: 'ca.to',
  departed: 'ca.departed',
  returned: 'ca.returned',
};

export default function CanadaContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<CaForm>(() => emptyCaForm(''));
  const [errors, setErrors] = useState<CaErrors>({});
  const [submitted, setSubmitted] = useState<CaForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateCanada(caRequest(submitted, locale)),
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

  const set = (patch: Partial<CaForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateCaForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, kind, n, field] = id.match(/^ca-(period|trip)-(\d+)-(\w+)$/) ?? [];
    if (!kind) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'period' ? 'ca.period' : 'ca.trip').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field: 'simulationDate' | 'dateOfBirth' | 'permanentResident',
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<CaForm>)}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('ca.title')}</h1>
        <p className={site.lead}>{t('ca.intro')}</p>
        <p className={site.notice}>{t('ca.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('ca.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('ca.basics')}</h2>
          {date(
            'ca-simulation-date',
            'ca.simulationDate',
            'simulationDate',
            t('ca.simulationDateHint'),
          )}
          {date('ca-date-of-birth', 'ca.dateOfBirth', 'dateOfBirth')}
          {date(
            'ca-permanent-resident',
            'ca.permanentResident',
            'permanentResident',
          )}

          <h2>{t('ca.periods')}</h2>
          <p className={form.hint}>{t('ca.periodsHint')}</p>
          <PilotDateRows
            prefix="ca-period"
            rows={draft.periods}
            fields={[
              { key: 'from', label: t('ca.from') },
              { key: 'to', label: t('ca.to') },
            ]}
            legend={(n) => t('ca.period').replace('{n}', String(n))}
            addLabel={t('ca.addPeriod')}
            removeLabel={t('ca.remove')}
            empty={emptyCaPeriod}
            errors={errors}
            onChange={(periods) => set({ periods })}
            onRemove={() => setErrors({})}
          />

          <h2>{t('ca.trips')}</h2>
          <p className={form.hint}>{t('ca.tripsHint')}</p>
          <PilotDateRows
            prefix="ca-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('ca.departed') },
              { key: 'returned', label: t('ca.returned') },
            ]}
            legend={(n) => t('ca.trip').replace('{n}', String(n))}
            addLabel={t('ca.addTrip')}
            removeLabel={t('ca.remove')}
            empty={emptyCaTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('ca.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
