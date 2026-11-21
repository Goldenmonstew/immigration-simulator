'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ES_NATIONALITY_ROUTES, evaluateSpain } from '@uk-immigration/engine';
import type { EsNationalityRoute } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { today } from '../../lib/questionnaire';
import {
  emptyEsForm,
  emptyEsPermit,
  emptyEsTrip,
  esRequest,
  validateEsForm,
} from '../../lib/spain';
import type { EsErrors, EsForm } from '../../lib/spain';
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
  'es-simulation-date': 'es.simulationDate',
  'es-married-on': 'es.marriedOn',
  from: 'es.from',
  to: 'es.to',
  departed: 'es.departed',
  returned: 'es.returned',
};

export default function SpainContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<EsForm>(() => emptyEsForm(''));
  const [errors, setErrors] = useState<EsErrors>({});
  const [submitted, setSubmitted] = useState<EsForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateSpain(esRequest(submitted, locale)),
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

  const set = (patch: Partial<EsForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateEsForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, kind, n, field] = id.match(/^es-(permit|trip)-(\d+)-(\w+)$/) ?? [];
    if (!kind) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'permit' ? 'es.permit' : 'es.trip').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field: 'simulationDate' | 'marriedOn',
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<EsForm>)}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('es.title')}</h1>
        <p className={site.lead}>{t('es.intro')}</p>
        <p className={site.notice}>{t('es.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('es.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('es.basics')}</h2>
          {date(
            'es-simulation-date',
            'es.simulationDate',
            'simulationDate',
            t('es.simulationDateHint'),
          )}

          <h2>{t('es.permits')}</h2>
          <p className={form.hint}>{t('es.permitsHint')}</p>
          {draft.permits.map((permit, i) => {
            const update = (patch: Partial<typeof permit>) =>
              set({
                permits: draft.permits.map((p, n) =>
                  n === i ? { ...p, ...patch } : p,
                ),
              });
            return (
              <fieldset key={i} className={form.entry}>
                <legend>{t('es.permit').replace('{n}', String(i + 1))}</legend>
                <PilotDate
                  id={`es-permit-${i}-from`}
                  label={t('es.from')}
                  value={permit.from}
                  onChange={(from) => update({ from })}
                  error={errors[`es-permit-${i}-from`]}
                />
                <PilotDate
                  id={`es-permit-${i}-to`}
                  label={t('es.to')}
                  value={permit.to}
                  onChange={(to) => update({ to })}
                  error={errors[`es-permit-${i}-to`]}
                />
                <div className={form.checkboxes}>
                  <label>
                    <input
                      type="checkbox"
                      checked={permit.study}
                      onChange={(e) => update({ study: e.target.checked })}
                    />
                    {t('es.study')}
                  </label>
                </div>
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => {
                    // Row errors are keyed by index, so they go stale.
                    setErrors({});
                    set({ permits: draft.permits.filter((_, n) => n !== i) });
                  }}
                >
                  {t('es.remove')}
                </button>
              </fieldset>
            );
          })}
          <div className={form.field}>
            <button
              type="button"
              className={site.secondary}
              onClick={() =>
                set({ permits: [...draft.permits, emptyEsPermit()] })
              }
            >
              {t('es.addPermit')}
            </button>
          </div>

          <h2>{t('es.trips')}</h2>
          <p className={form.hint}>{t('es.tripsHint')}</p>
          <PilotDateRows
            prefix="es-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('es.departed') },
              { key: 'returned', label: t('es.returned') },
            ]}
            legend={(n) => t('es.trip').replace('{n}', String(n))}
            addLabel={t('es.addTrip')}
            removeLabel={t('es.remove')}
            empty={emptyEsTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />

          <h2>{t('es.nationality')}</h2>
          <Field id="es-route" label={t('es.route')}>
            <select
              id="es-route"
              value={draft.route}
              onChange={(e) => {
                // A hidden marriage date must not keep its error.
                setErrors({});
                set({ route: e.target.value as EsNationalityRoute });
              }}
            >
              {ES_NATIONALITY_ROUTES.map((r) => (
                <option key={r} value={r}>
                  {t(`es.route.${r}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          {draft.route === 'marriage' && (
            <div className={form.followUp}>
              {date('es-married-on', 'es.marriedOn', 'marriedOn')}
            </div>
          )}
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('es.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
