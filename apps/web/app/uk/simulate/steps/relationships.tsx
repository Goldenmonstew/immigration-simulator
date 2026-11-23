'use client';

import type { Relationship } from '@uk-immigration/engine';
import site from '../../../site.module.css';
import styles from '../../../simulate/form.module.css';
import type { FormKit } from '../form-kit';
import { Field } from '../../../simulate/field';

export function RelationshipsStep({ form }: { form: FormKit }) {
  const { t, timeline, update, remove } = form;
  return (
    <>
      <p>{t('relationships.hint')}</p>
      {!timeline.relationships.length && (
        <p className={site.muted}>{t('relationships.empty')}</p>
      )}
      {timeline.relationships.map((relationship, index) => (
        <fieldset key={index} className={styles.entry}>
          <legend>
            {t('relationships.item')} {index + 1}
          </legend>
          <Field
            id={`relationship-${index}-type`}
            label={t('relationships.type')}
          >
            <select
              id={`relationship-${index}-type`}
              value={relationship.type}
              onChange={(event) =>
                update({
                  relationships: timeline.relationships.map((row, i) =>
                    i === index
                      ? {
                          ...row,
                          type: event.target.value as Relationship['type'],
                        }
                      : row,
                  ),
                })
              }
            >
              {(['PARTNER', 'PARENT', 'CHILD'] as const).map((value) => (
                <option key={value} value={value}>
                  {t(`relationships.${value}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id={`relationship-${index}-status`}
            label={t('relationships.status')}
          >
            <select
              id={`relationship-${index}-status`}
              value={relationship.otherPartyStatus}
              onChange={(event) =>
                update({
                  relationships: timeline.relationships.map((row, i) =>
                    i === index
                      ? {
                          ...row,
                          otherPartyStatus: event.target
                            .value as Relationship['otherPartyStatus'],
                        }
                      : row,
                  ),
                })
              }
            >
              {(['BRITISH_CITIZEN', 'SETTLED', 'OTHER'] as const).map(
                (value) => (
                  <option key={value} value={value}>
                    {t(`relationships.${value}`)}
                  </option>
                ),
              )}
            </select>
          </Field>
          {remove(`${t('relationships.item')} ${index + 1}`, () =>
            update({
              relationships: timeline.relationships.filter(
                (_, i) => i !== index,
              ),
            }),
          )}
        </fieldset>
      ))}
      <button
        type="button"
        className={site.secondary}
        onClick={() =>
          update({
            relationships: [
              ...timeline.relationships,
              { type: 'PARTNER', otherPartyStatus: 'OTHER' },
            ],
          })
        }
      >
        {t('relationships.add')}
      </button>
    </>
  );
}
