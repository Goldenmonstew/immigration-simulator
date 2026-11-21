'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  GR_NATIONALITY_ROUTES,
  GR_PERMIT_KINDS,
  evaluateGreece,
} from '@uk-immigration/engine';
import type { GrNationalityRoute, GrPermitKind } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { today } from '../../lib/questionnaire';
import {
  emptyGrForm,
  emptyGrPermit,
  emptyGrTrip,
  grRequest,
  validateGrForm,
} from '../../lib/greece';
import type { GrErrors, GrForm } from '../../lib/greece';
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
  'gr-simulation-date': 'gr.simulationDate',
  'gr-route': 'gr.route',
  from: 'gr.from',
  to: 'gr.to',
  departed: 'gr.departed',
  returned: 'gr.returned',
};

export default function GreeceContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<GrForm>(() => emptyGrForm(''));
  const [errors, setErrors] = useState<GrErrors>({});
  const [submitted, setSubmitted] = useState<GrForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateGreece(grRequest(submitted, locale)),
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

  const set = (patch: Partial<GrForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateGrForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, kind, n, field] = id.match(/^gr-(permit|trip)-(\d+)-(\w+)$/) ?? [];
    if (!kind) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'permit' ? 'gr.permit' : 'gr.trip').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field: 'simulationDate',
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<GrForm>)}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('gr.title')}</h1>
        <p className={site.lead}>{t('gr.intro')}</p>
        <p className={site.notice}>{t('gr.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('gr.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('gr.basics')}</h2>
          {date(
            'gr-simulation-date',
            'gr.simulationDate',
            'simulationDate',
            t('gr.simulationDateHint'),
          )}

          <h2>{t('gr.permits')}</h2>
          <p className={form.hint}>{t('gr.permitsHint')}</p>
          {draft.permits.map((permit, i) => {
            const update = (patch: Partial<typeof permit>) =>
              set({
                permits: draft.permits.map((p, n) =>
                  n === i ? { ...p, ...patch } : p,
                ),
              });
            return (
              <fieldset key={i} className={form.entry}>
                <legend>{t('gr.permit').replace('{n}', String(i + 1))}</legend>
                <PilotDate
                  id={`gr-permit-${i}-from`}
                  label={t('gr.from')}
                  value={permit.from}
                  onChange={(from) => update({ from })}
                  error={errors[`gr-permit-${i}-from`]}
                />
                <PilotDate
                  id={`gr-permit-${i}-to`}
                  label={t('gr.to')}
                  value={permit.to}
                  onChange={(to) => update({ to })}
                  error={errors[`gr-permit-${i}-to`]}
                />
                <Field id={`gr-permit-${i}-kind`} label={t('gr.kind')}>
                  <select
                    id={`gr-permit-${i}-kind`}
                    value={permit.kind}
                    onChange={(e) =>
                      update({ kind: e.target.value as GrPermitKind })
                    }
                  >
                    {GR_PERMIT_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`gr.kind.${k}` as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </Field>
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => {
                    // Row errors are keyed by index, so they go stale.
                    setErrors({});
                    set({ permits: draft.permits.filter((_, n) => n !== i) });
                  }}
                >
                  {t('gr.remove')}
                </button>
              </fieldset>
            );
          })}
          <div className={form.field}>
            <button
              type="button"
              className={site.secondary}
              onClick={() =>
                set({ permits: [...draft.permits, emptyGrPermit()] })
              }
            >
              {t('gr.addPermit')}
            </button>
          </div>

          <h2>{t('gr.trips')}</h2>
          <p className={form.hint}>{t('gr.tripsHint')}</p>
          <PilotDateRows
            prefix="gr-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('gr.departed') },
              { key: 'returned', label: t('gr.returned') },
            ]}
            legend={(n) => t('gr.trip').replace('{n}', String(n))}
            addLabel={t('gr.addTrip')}
            removeLabel={t('gr.remove')}
            empty={emptyGrTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />

          <h2>{t('gr.nationality')}</h2>
          <Field id="gr-route" label={t('gr.route')} error={errors['gr-route']}>
            <select
              id="gr-route"
              value={draft.route}
              onChange={(e) =>
                set({ route: e.target.value as GrNationalityRoute })
              }
              aria-invalid={errors['gr-route'] ? true : undefined}
              aria-describedby={
                errors['gr-route'] ? 'gr-route-error' : undefined
              }
            >
              <option value="">{t('gr.route.choose')}</option>
              {GR_NATIONALITY_ROUTES.map((r) => (
                <option key={r} value={r}>
                  {t(`gr.route.${r}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('gr.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
