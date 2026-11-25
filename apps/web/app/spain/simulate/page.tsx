'use client';

import { ES_FULL_TARGETS, type EsFullTarget } from '@uk-immigration/engine';
import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  spainHistoryFieldsFor,
  spainResidenceSectionsFor,
  spainSteps,
  type SpainDraft,
} from '../../../lib/spain-draft';
import {
  spainFreeMovementSections,
  spainLongTermCardFields,
  spainMobilitySections,
  spainNatSections,
  spainNatTopFields,
  spainRecoverySections,
  spainStep0Fields,
  type SpainField,
} from '../../../lib/spain-fields';
import { spainModule } from '../../../lib/spain-module';
import form from '../../simulate/form.module.css';
import styles from '../../japan/simulate/questionnaire.module.css';
import { EvidenceFields, updateAnswer } from './evidence-fields';

interface StepProps {
  draft: SpainDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<SpainDraft>) => void;
}

function SpainStep({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();
  const targetError = !draft.targets.length && errors['es-targets'];

  const renderSections = (
    sections: Record<string, SpainField[]>,
    values: object,
    prefix: string,
    save: (next: object) => void,
  ) =>
    Object.entries(sections).map(([section, fields]) => {
      const hasError = fields.some((field) => {
        const id = prefix + '-' + field.name;
        return Object.keys(errors).some(
          (key) => key === id || key.startsWith(id + '-'),
        );
      });
      return (
        <details
          key={section}
          open={hasError || undefined}
          className={styles.evidence}
        >
          <summary>{t(`es.form.${section}` as TranslationKey)}</summary>
          <EvidenceFields
            fields={fields}
            values={values}
            prefix={prefix}
            errors={errors}
            change={(key, value) => save(updateAnswer(values, key, value))}
          />
        </details>
      );
    });

  return (
    <>
      <p className={form.hint}>{t('es.form.optional')}</p>
      {draft.step === 0 && (
        <>
          <EvidenceFields
            fields={spainStep0Fields}
            values={draft}
            prefix="es"
            errors={errors}
            change={(key, value) =>
              update({ [key]: value ?? '' } as Partial<SpainDraft>)
            }
          />
          <fieldset
            id="es-targets"
            className={form.fieldset}
            tabIndex={-1}
            aria-invalid={targetError ? true : undefined}
            aria-describedby={targetError ? 'es-targets-error' : undefined}
          >
            <legend className={form.legend}>{t('es.form.scope')}</legend>
            {targetError && (
              <p id="es-targets-error" className={form.error}>
                {t(targetError)}
              </p>
            )}
            <div className={form.checkboxes}>
              {ES_FULL_TARGETS.map((target) => {
                const checked = draft.targets.includes(target);
                const id = `es-target-${target}`;
                return (
                  <label key={target}>
                    <input
                      type="checkbox"
                      id={id}
                      checked={checked}
                      onChange={(event) => {
                        const next: EsFullTarget[] = event.target.checked
                          ? [...draft.targets, target]
                          : draft.targets.filter((item) => item !== target);
                        update({ targets: next });
                      }}
                    />
                    {t(`es.target.${target}`)}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </>
      )}
      {draft.step === 1 && (
        <>
          <p>{t('es.form.historyHint')}</p>
          <EvidenceFields
            fields={spainHistoryFieldsFor(draft.targets)}
            values={draft}
            prefix="es"
            errors={errors}
            change={(key, value) =>
              update({ [key]: value } as Partial<SpainDraft>)
            }
          />
        </>
      )}
      {draft.step === 2 && (
        <>
          <EvidenceFields
            fields={spainNatTopFields}
            values={draft}
            prefix="es-nat"
            errors={errors}
            change={(key, value) =>
              update({ [key]: value } as Partial<SpainDraft>)
            }
          />
          {renderSections(
            spainNatSections,
            draft.nationality,
            'es-nat',
            (next) => update({ nationality: next }),
          )}
        </>
      )}
      {draft.step === 3 &&
        renderSections(
          spainResidenceSectionsFor(draft.targets),
          draft.residence,
          'es-res',
          (next) => update({ residence: next }),
        )}
      {draft.step === 4 &&
        renderSections(
          spainMobilitySections,
          draft.mobility,
          'es-mob',
          (next) => update({ mobility: next }),
        )}
      {draft.step === 5 && (
        <>
          {draft.targets.some((item) => item === 'R-N' || item === 'R-E') &&
            renderSections(
              spainRecoverySections,
              draft.recovery,
              'es-rec',
              (next) => update({ recovery: next }),
            )}
          {draft.targets.some(
            (item) => item === 'L' || item === 'E' || item === 'M',
          ) &&
            renderSections(
              { ltCard: spainLongTermCardFields },
              draft.longTermCard,
              'es-ltc',
              (next) => update({ longTermCard: next }),
            )}
        </>
      )}
      {draft.step === 6 &&
        renderSections(
          spainFreeMovementSections,
          draft.freeMovement,
          'es-fm',
          (next) => update({ freeMovement: next }),
        )}
    </>
  );
}

export default function SpainSimulatePage() {
  return (
    <QuestionnaireShell country={spainModule} steps={spainSteps}>
      {(props) => <SpainStep {...props} />}
    </QuestionnaireShell>
  );
}
