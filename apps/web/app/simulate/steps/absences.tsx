'use client';

import site from '../../site.module.css';
import styles from '../form.module.css';
import type { FormKit } from '../form-kit';

export function AbsencesStep({ form }: { form: FormKit }) {
  const { t, timeline, update, dateField, remove } = form;
  return (
    <>
      <p>{t('absences.hint')}</p>
      {!timeline.absences.length && (
        <p className={site.muted}>{t('absences.empty')}</p>
      )}
      {timeline.absences.map((absence, index) => (
        <fieldset key={index} className={styles.entry}>
          <legend>
            {t('absences.item')} {index + 1}
          </legend>
          {dateField(
            `absence-${index}-from`,
            t('absences.from'),
            absence.from,
            (from) =>
              update({
                absences: timeline.absences.map((row, i) =>
                  i === index ? { ...row, from } : row,
                ),
              }),
          )}
          {dateField(
            `absence-${index}-to`,
            t('absences.to'),
            absence.to,
            (to) =>
              update({
                absences: timeline.absences.map((row, i) =>
                  i === index ? { ...row, to } : row,
                ),
              }),
          )}
          {remove(`${t('absences.item')} ${index + 1}`, () =>
            update({
              absences: timeline.absences.filter((_, i) => i !== index),
            }),
          )}
        </fieldset>
      ))}
      <button
        type="button"
        className={site.secondary}
        onClick={() =>
          update({
            absences: [...timeline.absences, { from: '', to: '' }],
          })
        }
      >
        {t('absences.add')}
      </button>
    </>
  );
}
