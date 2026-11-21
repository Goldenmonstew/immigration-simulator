'use client';

import type { Route } from '@uk-immigration/engine';
import { routeLabel, routeNames } from '../../../i18n/routes';
import type { FormKit } from '../form-kit';
import { Field } from '../field';
import {
  countries,
  countryName,
  nationalityFromInput,
} from '../../../lib/country-names';
import site from '../../site.module.css';

export function BasicStep({ form }: { form: FormKit }) {
  const {
    t,
    locale,
    errors,
    compactRoutes,
    timeline,
    editingPrincipal,
    update,
    fieldProps,
    dateField,
  } = form;
  return (
    <>
      {dateField('dob', t('basic.dob'), timeline.dateOfBirth, (dateOfBirth) =>
        update({ dateOfBirth }),
      )}
      <Field
        id="nationality"
        label={t('basic.nationality')}
        hint={t('basic.nationalityHint')}
        error={errors.nationality}
      >
        <input
          {...fieldProps('nationality', true)}
          value={timeline.nationality}
          list="nationalities"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) =>
            update({ nationality: nationalityFromInput(event.target.value) })
          }
        />
        <datalist id="nationalities">
          {countries().map(({ code, zh, en }) => (
            <option key={code} value={code}>
              {zh} · {en}
            </option>
          ))}
        </datalist>
        {countryName(timeline.nationality) && (
          <p className={site.muted}>
            {t('basic.nationalitySelected')
              .replace('{name}', countryName(timeline.nationality)!)
              .replace('{code}', timeline.nationality)}
          </p>
        )}
      </Field>
      {editingPrincipal && (
        <>
          <Field id="principal-settled" label={t('principal.settled')}>
            <select
              id="principal-settled"
              value={timeline.settled ? 'yes' : 'no'}
              onChange={(event) =>
                update({
                  settled:
                    event.target.value === 'yes'
                      ? { date: '', route: 'SKILLED_WORKER' }
                      : undefined,
                })
              }
            >
              <option value="no">{t('form.no')}</option>
              <option value="yes">{t('form.yes')}</option>
            </select>
          </Field>
          {timeline.settled && (
            <>
              {dateField(
                'principal-settled-date',
                t('principal.settledDate'),
                timeline.settled.date,
                (date) =>
                  update({
                    settled: { ...timeline.settled!, date },
                  }),
              )}
              <Field
                id="principal-settled-route"
                label={t('principal.settledRoute')}
              >
                <select
                  id="principal-settled-route"
                  value={timeline.settled.route}
                  onChange={(event) =>
                    update({
                      settled: {
                        ...timeline.settled!,
                        route: event.target.value as Route,
                      },
                    })
                  }
                >
                  {Object.entries(routeNames).map(([route, name]) => (
                    <option key={route} value={route}>
                      {routeLabel(name, locale, compactRoutes)}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
        </>
      )}
    </>
  );
}
