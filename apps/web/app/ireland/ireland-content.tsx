'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  IE_PERMISSION_KINDS,
  IE_STAMP4_ROUTES,
  evaluateIreland,
} from '@uk-immigration/engine';
import type { IePermissionKind, IeStamp4Route } from '@uk-immigration/engine';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { today } from '../../lib/questionnaire';
import {
  emptyIeForm,
  emptyIePermission,
  emptyIeTrip,
  fromEmployment,
  ieRequest,
  validateIeForm,
} from '../../lib/ireland';
import type { IeErrors, IeForm } from '../../lib/ireland';
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
  'ie-simulation-date': 'ie.simulationDate',
  'ie-married-on': 'ie.marriedOn',
  'ie-stamp4-route': 'ie.stamp4Route',
  'ie-employment-start': 'ie.employmentStart',
  from: 'ie.from',
  to: 'ie.to',
  departed: 'ie.departed',
  returned: 'ie.returned',
};

export default function IrelandContent() {
  const { t, locale } = useTranslation();
  // Today is set after hydration so the static page does not carry the build date.
  const [draft, setDraft] = useState<IeForm>(() => emptyIeForm(''));
  const [errors, setErrors] = useState<IeErrors>({});
  const [submitted, setSubmitted] = useState<IeForm>();
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const result = useMemo(
    () => submitted && evaluateIreland(ieRequest(submitted, locale)),
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

  const set = (patch: Partial<IeForm>) => setDraft((d) => ({ ...d, ...patch }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateIeForm(draft);
    setErrors(found);
    // A new object each time, so the result heading is focused again.
    setSubmitted(Object.keys(found).length ? undefined : { ...draft });
  };
  const fieldLabel = (id: string) => {
    const [, kind, n, field] = id.match(/^ie-(permit|trip)-(\d+)-(\w+)$/) ?? [];
    if (!kind) return t(FIELD_LABELS[id]);
    const entry = t(kind === 'permit' ? 'ie.permit' : 'ie.trip').replace(
      '{n}',
      String(Number(n) + 1),
    );
    return `${entry} · ${t(FIELD_LABELS[field])}`;
  };
  const date = (
    id: string,
    key: TranslationKey,
    field: 'simulationDate' | 'marriedOn' | 'employmentStart',
    hint?: string,
  ) => (
    <PilotDate
      id={id}
      label={t(key)}
      value={draft[field]}
      onChange={(value) => set({ [field]: value } as Partial<IeForm>)}
      hint={hint}
      error={errors[id]}
    />
  );

  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <h1>{t('ie.title')}</h1>
        <p className={site.lead}>{t('ie.intro')}</p>
        <p className={site.notice}>{t('ie.scope')}</p>
        <form noValidate onSubmit={submit}>
          <PilotErrorSummary
            errors={errors}
            title={t('ie.errorSummary')}
            label={fieldLabel}
            summaryRef={errorSummary}
          />
          <h2>{t('ie.basics')}</h2>
          {date(
            'ie-simulation-date',
            'ie.simulationDate',
            'simulationDate',
            t('ie.simulationDateHint'),
          )}

          <h2>{t('ie.permits')}</h2>
          <p className={form.hint}>{t('ie.permitsHint')}</p>
          {draft.permissions.map((permit, i) => {
            const update = (patch: Partial<typeof permit>) =>
              set({
                permissions: draft.permissions.map((p, n) =>
                  n === i ? { ...p, ...patch } : p,
                ),
              });
            return (
              <fieldset key={i} className={form.entry}>
                <legend>{t('ie.permit').replace('{n}', String(i + 1))}</legend>
                <Field id={`ie-permit-${i}-kind`} label={t('ie.kind')}>
                  <select
                    id={`ie-permit-${i}-kind`}
                    value={permit.kind}
                    onChange={(e) =>
                      update({ kind: e.target.value as IePermissionKind })
                    }
                  >
                    {IE_PERMISSION_KINDS.map((k) => (
                      <option key={k} value={k}>
                        {t(`ie.kind.${k}` as TranslationKey)}
                      </option>
                    ))}
                  </select>
                </Field>
                <PilotDate
                  id={`ie-permit-${i}-from`}
                  label={t('ie.from')}
                  value={permit.from}
                  onChange={(from) => update({ from })}
                  error={errors[`ie-permit-${i}-from`]}
                />
                <PilotDate
                  id={`ie-permit-${i}-to`}
                  label={t('ie.to')}
                  value={permit.to}
                  onChange={(to) => update({ to })}
                  error={errors[`ie-permit-${i}-to`]}
                />
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => {
                    // Row errors are keyed by index, so they go stale.
                    setErrors({});
                    set({
                      permissions: draft.permissions.filter((_, n) => n !== i),
                    });
                  }}
                >
                  {t('ie.remove')}
                </button>
              </fieldset>
            );
          })}
          <div className={form.field}>
            <button
              type="button"
              className={site.secondary}
              onClick={() =>
                set({
                  permissions: [...draft.permissions, emptyIePermission()],
                })
              }
            >
              {t('ie.addPermit')}
            </button>
          </div>

          <h2>{t('ie.trips')}</h2>
          <p className={form.hint}>{t('ie.tripsHint')}</p>
          <PilotDateRows
            prefix="ie-trip"
            rows={draft.trips}
            fields={[
              { key: 'departed', label: t('ie.departed') },
              { key: 'returned', label: t('ie.returned') },
            ]}
            legend={(n) => t('ie.trip').replace('{n}', String(n))}
            addLabel={t('ie.addTrip')}
            removeLabel={t('ie.remove')}
            empty={emptyIeTrip}
            errors={errors}
            onChange={(trips) => set({ trips })}
            onRemove={() => setErrors({})}
          />

          <h2>{t('ie.spouse')}</h2>
          {date(
            'ie-married-on',
            'ie.marriedOn',
            'marriedOn',
            t('ie.marriedOnHint'),
          )}

          <h2>{t('ie.stamp4')}</h2>
          <Field
            id="ie-stamp4-route"
            label={t('ie.stamp4Route')}
            error={errors['ie-stamp4-route']}
          >
            <select
              id="ie-stamp4-route"
              value={draft.stamp4Route}
              onChange={(e) =>
                set({ stamp4Route: e.target.value as IeStamp4Route })
              }
              aria-invalid={errors['ie-stamp4-route'] ? true : undefined}
              aria-describedby={
                errors['ie-stamp4-route'] ? 'ie-stamp4-route-error' : undefined
              }
            >
              <option value="">{t('ie.stamp4Route.choose')}</option>
              {IE_STAMP4_ROUTES.map((r) => (
                <option key={r} value={r}>
                  {t(`ie.stamp4Route.${r}` as TranslationKey)}
                </option>
              ))}
            </select>
          </Field>
          {fromEmployment(draft.stamp4Route) &&
            date(
              'ie-employment-start',
              'ie.employmentStart',
              'employmentStart',
              t('ie.employmentStartHint'),
            )}
          <div className={site.actions}>
            <button type="submit" className={site.button}>
              {t('ie.submit')}
            </button>
          </div>
        </form>
        {result && <PilotResult result={result} headingRef={resultHeading} />}
      </div>
    </main>
  );
}
