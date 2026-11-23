'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  PT_NATIONALITY_ROUTES,
  PT_PERMIT_KINDS,
  evaluatePortugal,
} from '@uk-immigration/engine';
import type { PtNationalityRoute, PtPermitKind } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { today } from '../../lib/questionnaire';
import {
  emptyPtForm,
  emptyPtPermit,
  emptyPtTrip,
  ptRequest,
  validatePtForm,
} from '../../lib/portugal';
import type { PtErrors, PtForm } from '../../lib/portugal';
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
  'pt-simulation-date': 'pt.simulationDate',
  'pt-route': 'pt.route',
  'pt-applied-on': 'pt.appliedOn',
  'pt-residence-applied': 'pt.residenceApplied',
  from: 'pt.from',
  to: 'pt.to',
  departed: 'pt.departed',
  returned: 'pt.returned',
};

export default function PortugalContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<PtForm>(() => emptyPtForm(''));
  const [errors, setErrors] = useState<PtErrors>({});
  const [submitted, setSubmitted] = useState<PtForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluatePortugal(ptRequest(submitted, locale)),
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

  const set = (patch: Partial<PtForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validatePtForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, kind, n, field] = id.match(/^pt-(permit|trip)-(\d+)-(\w+)$/) ?? [];
    if (!kind) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'permit' ? 'pt.permit' : 'pt.trip').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field: 'simulationDate' | 'appliedOn' | 'residenceApplied',
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<PtForm>)}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('pt.title')}</h1>
        <p className={site.lead}>{t('pt.intro')}</p>
        <p className={site.notice}>{t('pt.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('pt.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('pt.basics')}</h2>
          {date(
            'pt-simulation-date',
            'pt.simulationDate',
            'simulationDate',
            t('pt.simulationDateHint'),
          )}

          <h2>{t('pt.permits')}</h2>
          <p className={form.hint}>{t('pt.permitsHint')}</p>
          {draft.permits.map((permit, i) => {
            const update = (patch: Partial<typeof permit>) =>
              set({
                permits: draft.permits.map((p, n) =>
                  n === i ? { ...p, ...patch } : p,
                ),
              });
            return (
              <fieldset key={i} className={form.entry}>
                <legend>{t('pt.permit').replace('{n}', String(i + 1))}</legend>
                <Field id={`pt-permit-${i}-kind`} label={t('pt.kind')}>
                  <select
                    id={`pt-permit-${i}-kind`}
                    value={permit.kind}
                    onChange={(e) =>
                      update({ kind: e.target.value as PtPermitKind })
                    }
                  >
                    {PT_PERMIT_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`pt.kind.${k}` as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </Field>
                <PilotDate
                  id={`pt-permit-${i}-from`}
                  label={t('pt.from')}
                  value={permit.from}
                  onChange={(from) => update({ from })}
                  error={errors[`pt-permit-${i}-from`]}
                />
                <PilotDate
                  id={`pt-permit-${i}-to`}
                  label={t('pt.to')}
                  value={permit.to}
                  onChange={(to) => update({ to })}
                  error={errors[`pt-permit-${i}-to`]}
                />
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => {
                    // Row errors are keyed by index, so they go stale.
                    setErrors({});
                    set({ permits: draft.permits.filter((_, n) => n !== i) });
                  }}
                >
                  {t('pt.remove')}
                </button>
              </fieldset>
            );
          })}
          <div className={form.field}>
            <button
              type="button"
              className={site.secondary}
              onClick={() =>
                set({ permits: [...draft.permits, emptyPtPermit()] })
              }
            >
              {t('pt.addPermit')}
            </button>
          </div>

          <h2>{t('pt.trips')}</h2>
          <p className={form.hint}>{t('pt.tripsHint')}</p>
          <PilotDateRows
            prefix="pt-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('pt.departed') },
              { key: 'returned', label: t('pt.returned') },
            ]}
            legend={(n) => t('pt.trip').replace('{n}', String(n))}
            addLabel={t('pt.addTrip')}
            removeLabel={t('pt.remove')}
            empty={emptyPtTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />

          <h2>{t('pt.nationality')}</h2>
          <Field id="pt-route" label={t('pt.route')} error={errors['pt-route']}>
            <select
              id="pt-route"
              value={draft.route}
              onChange={(e) =>
                set({ route: e.target.value as PtNationalityRoute })
              }
              aria-invalid={errors['pt-route'] ? true : undefined}
              aria-describedby={
                errors['pt-route'] ? 'pt-route-error' : undefined
              }
            >
              <option value="">{t('pt.route.choose')}</option>
              {PT_NATIONALITY_ROUTES.map((r) => (
                <option key={r} value={r}>
                  {t(`pt.route.${r}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          <div className={form.checkboxes}>
            <label>
              <input
                type="checkbox"
                checked={draft.pending}
                onChange={(e) => {
                  // Hidden dates must not keep their errors.
                  setErrors({});
                  set({ pending: e.target.checked });
                }}
              />
              {t('pt.pending')}
            </label>
          </div>
          {draft.pending && (
            <div className={form.followUp}>
              {date('pt-applied-on', 'pt.appliedOn', 'appliedOn')}
              {date(
                'pt-residence-applied',
                'pt.residenceApplied',
                'residenceApplied',
                t('pt.residenceAppliedHint'),
              )}
            </div>
          )}
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('pt.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
