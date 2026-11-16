'use client';

import type { CefrLevel } from '@uk-immigration/engine';
import type { FormKit } from '../form-kit';
import { Field } from '../field';

export function EnglishStep({ form }: { form: FormKit }) {
  const { t, timeline, update } = form;
  return (
    <>
      <p>{t('english.hint')}</p>
      <Field id="english" label={t('english.level')}>
        <select
          id="english"
          value={
            timeline.english
              ? 'exempt' in timeline.english
                ? 'exempt'
                : timeline.english.cefrLevel
              : ''
          }
          onChange={(event) =>
            update({
              english:
                event.target.value === ''
                  ? undefined
                  : event.target.value === 'exempt'
                    ? { exempt: true }
                    : {
                        cefrLevel: event.target.value as CefrLevel,
                      },
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
          <option value="exempt">{t('english.exempt')}</option>
        </select>
      </Field>
      <Field id="life" label={t('english.life')}>
        <select
          id="life"
          value={
            timeline.lifeInTheUk
              ? 'passed' in timeline.lifeInTheUk
                ? 'passed'
                : 'exempt'
              : ''
          }
          onChange={(event) =>
            update({
              lifeInTheUk:
                event.target.value === ''
                  ? undefined
                  : event.target.value === 'passed'
                    ? { passed: true }
                    : { exempt: true },
            })
          }
        >
          <option value="">{t('form.unknown')}</option>
          <option value="passed">{t('english.passed')}</option>
          <option value="exempt">{t('english.exempt')}</option>
        </select>
      </Field>
    </>
  );
}
