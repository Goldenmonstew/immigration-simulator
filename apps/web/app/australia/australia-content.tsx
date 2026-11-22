'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AU_PERMANENT_SUBCLASSES,
  AU_TEMPORARY_SUBCLASSES,
  evaluateAustralia,
} from '@uk-immigration/engine';
import type { AuSubclass } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import {
  auRequest,
  emptyAuForm,
  emptyTrip,
  emptyVisa,
  validateAuForm,
} from '../../lib/australia';
import type { AuErrors, AuForm } from '../../lib/australia';
import { today } from '../../lib/questionnaire';
import { Field } from '../simulate/field';
import form from '../simulate/form.module.css';
import {
  PilotDate,
  PilotDateRows,
  PilotErrorSummary,
} from '../pilot/pilot-form';
import { PilotResult } from '../pilot/pilot-result';
import site from '../site.module.css';

const TRT = new Set<AuSubclass>(['457', '482']);
const FIELD_LABELS: Record<string, TranslationKey> = {
  'au-simulation-date': 'au.simulationDate',
  'au-date-of-birth': 'au.dateOfBirth',
  'au-first-arrival': 'au.firstArrival',
  'au-partner-lodged': 'au.partnerLodged',
  from: 'au.from',
  to: 'au.to',
  departed: 'au.departed',
  returned: 'au.returned',
};

export default function AustraliaContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<AuForm>(() => emptyAuForm(''));
  const [errors, setErrors] = useState<AuErrors>({});
  const [submitted, setSubmitted] = useState<AuForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateAustralia(auRequest(submitted, locale)),
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

  const set = (patch: Partial<AuForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateAuForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, kind, n, field] = id.match(/^au-(visa|trip)-(\d+)-(\w+)$/) ?? [];
    if (!kind) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'visa' ? 'au.visa' : 'au.trip').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };

  const date = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('au.title')}</h1>
        <p className={site.lead}>{t('au.intro')}</p>
        <p className={site.notice}>{t('au.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('au.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('au.basics')}</h2>
          {date(
            'au-simulation-date',
            t('au.simulationDate'),
            draft.simulationDate,
            (simulationDate) => set({ simulationDate }),
            t('au.simulationDateHint'),
          )}
          {date(
            'au-date-of-birth',
            t('au.dateOfBirth'),
            draft.dateOfBirth,
            (dateOfBirth) => set({ dateOfBirth }),
          )}
          {date(
            'au-first-arrival',
            t('au.firstArrival'),
            draft.firstArrival,
            (firstArrival) => set({ firstArrival }),
          )}

          <h2>{t('au.visas')}</h2>
          <p className={form.hint}>{t('au.visasHint')}</p>
          {draft.visas.map((visa, i) => {
            const update = (patch: Partial<typeof visa>) =>
              set({
                visas: draft.visas.map((v, n) =>
                  n === i ? { ...v, ...patch } : v,
                ),
              });
            return (
              <fieldset key={i} className={form.entry}>
                <legend>{t('au.visa').replace('{n}', String(i + 1))}</legend>
                <Field id={`au-visa-${i}-subclass`} label={t('au.subclass')}>
                  <select
                    id={`au-visa-${i}-subclass`}
                    value={visa.subclass}
                    onChange={(e) =>
                      update({ subclass: e.target.value as AuSubclass })
                    }
                  >
                    {[
                      ...AU_TEMPORARY_SUBCLASSES,
                      ...AU_PERMANENT_SUBCLASSES,
                    ].map((s) => (
                      <option key={s} value={s}>
                        {t(`au.sub.${s}` as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </Field>
                {date(`au-visa-${i}-from`, t('au.from'), visa.from, (from) =>
                  update({ from }),
                )}
                {date(`au-visa-${i}-to`, t('au.to'), visa.to, (to) =>
                  update({ to }),
                )}
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => {
                    // Row errors are keyed by index, so they go stale.
                    setErrors({});
                    set({ visas: draft.visas.filter((_, n) => n !== i) });
                  }}
                >
                  {t('au.remove')}
                </button>
              </fieldset>
            );
          })}
          <div className={form.field}>
            <button
              type="button"
              className={site.secondary}
              onClick={() => set({ visas: [...draft.visas, emptyVisa()] })}
            >
              {t('au.addVisa')}
            </button>
          </div>

          <h2>{t('au.trips')}</h2>
          <p className={form.hint}>{t('au.tripsHint')}</p>
          <PilotDateRows
            prefix="au-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('au.departed') },
              { key: 'returned', label: t('au.returned') },
            ]}
            legend={(n) => t('au.trip').replace('{n}', String(n))}
            addLabel={t('au.addTrip')}
            removeLabel={t('au.remove')}
            empty={emptyTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />
          <div className={form.checkboxes}>
            {draft.visas.some((v) => TRT.has(v.subclass)) && (
              <label>
                <input
                  type="checkbox"
                  checked={draft.sponsoredFullTime}
                  onChange={(e) => set({ sponsoredFullTime: e.target.checked })}
                />
                {t('au.sponsored')}
              </label>
            )}
            <label>
              <input
                type="checkbox"
                checked={draft.partner}
                onChange={(e) => set({ partner: e.target.checked })}
              />
              {t('au.partner')}
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.hongKong}
                onChange={(e) => set({ hongKong: e.target.checked })}
              />
              {t('au.hongKong')}
            </label>
          </div>
          {draft.hongKong && (
            <div className={form.followUp}>
              <div className={form.checkboxes}>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.regionalOnly}
                    onChange={(e) => set({ regionalOnly: e.target.checked })}
                  />
                  {t('au.regionalOnly')}
                </label>
              </div>
            </div>
          )}
          {draft.partner && (
            <div className={form.followUp}>
              {date(
                'au-partner-lodged',
                t('au.partnerLodged'),
                draft.partnerLodged,
                (partnerLodged) => set({ partnerLodged }),
              )}
              <fieldset className={form.fieldset}>
                <legend className={form.legend}>{t('au.partnerStream')}</legend>
                <div className={form.radios}>
                  {(['onshore', 'offshore'] as const).map((stream) => (
                    <label key={stream}>
                      <input
                        type="radio"
                        name="au-partner-stream"
                        checked={draft.partnerStream === stream}
                        onChange={() => set({ partnerStream: stream })}
                      />
                      {t(`au.${stream}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className={form.checkboxes}>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.longTermRelationship}
                    onChange={(e) =>
                      set({ longTermRelationship: e.target.checked })
                    }
                  />
                  {t('au.longTerm')}
                </label>
              </div>
            </div>
          )}
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('au.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
