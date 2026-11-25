'use client';

import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  answersAt,
  canadaQuestionnaireSteps,
  sectionId,
  withAnswersAt,
  type CanadaDraft,
} from '../../../lib/canada-draft';
import {
  canadaGoals,
  canadaSteps,
  equitySharePercent,
  initialPrGoals,
  residenceGoals,
  visibleSections,
  type CanadaSectionTitle,
} from '../../../lib/canada-fields';
import { canadaModule } from '../../../lib/canada-module';
import { Field } from '../../simulate/field';
import form from '../../simulate/form.module.css';
import styles from '../../japan/simulate/questionnaire.module.css';
import { CanadaFields } from './fields';

const sectionHints: Partial<Record<CanadaSectionTitle, TranslationKey>> = {
  trips: 'ca.form.tripsHint',
  temporaryPeriods: 'ca.form.periodsHint',
  taxYears: 'ca.form.taxYearsHint',
  investment: 'ca.form.equityShareHint',
};

function CanadaStep({
  draft,
  errors,
  update,
}: {
  draft: CanadaDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<CanadaDraft>) => void;
}) {
  const { t } = useTranslation();
  const step = canadaSteps.find((item) => item.step === draft.step)!;
  const sections = visibleSections(step, draft);
  const goalError = errors['ca-goals'];
  const setGoal = (goal: (typeof canadaGoals)[number], checked: boolean) =>
    update({
      goals: canadaGoals.filter((item) =>
        item === goal ? checked : draft.goals.includes(item),
      ),
    });
  return (
    <>
      <p className={form.hint}>{t('ca.form.optional')}</p>
      {draft.step === 0 && (
        <>
          <Field
            id="ca-simulationDate"
            label={`${t('ca.field.simulationDate')} *`}
            hint={t('ca.form.simulationDateHint')}
            error={errors['ca-simulationDate']}
          >
            <input
              id="ca-simulationDate"
              type="date"
              required
              value={draft.simulationDate}
              aria-invalid={errors['ca-simulationDate'] ? true : undefined}
              aria-describedby={
                errors['ca-simulationDate']
                  ? 'ca-simulationDate-hint ca-simulationDate-error'
                  : 'ca-simulationDate-hint'
              }
              onChange={(event) =>
                update({ simulationDate: event.target.value })
              }
            />
          </Field>
          <fieldset
            id="ca-goals"
            className={form.fieldset}
            tabIndex={-1}
            aria-invalid={goalError ? true : undefined}
            aria-describedby={goalError ? 'ca-goals-error' : undefined}
          >
            <legend className={form.legend}>{t('ca.form.goals')} *</legend>
            {goalError && (
              <p id="ca-goals-error" className={form.error}>
                {t(goalError)}
              </p>
            )}
            {(
              [
                ['ca.form.goalsResidence', residenceGoals],
                ['ca.form.goalsInitial', initialPrGoals],
              ] as const
            ).map(([legend, goals]) => (
              <fieldset key={legend} className={form.fieldset}>
                <legend className={form.legend}>{t(legend)}</legend>
                <div className={form.checkboxes}>
                  {goals.map((goal) => (
                    <label key={goal}>
                      <input
                        type="checkbox"
                        id={`ca-goal-${goal}`}
                        checked={draft.goals.includes(goal)}
                        onChange={(event) =>
                          setGoal(goal, event.target.checked)
                        }
                      />
                      {t(`ca.goal.${goal}`)}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </fieldset>
        </>
      )}
      {sections.map((section) => {
        const id = sectionId(section.path);
        const fields = (
          <>
            {sectionHints[section.id] && (
              <p className={form.hint}>
                {t(sectionHints[section.id]!).replace(
                  '{percent}',
                  String(equitySharePercent),
                )}
              </p>
            )}
            <CanadaFields
              fields={section.fields}
              values={answersAt(draft.answers, section.path)}
              id={id}
              errors={errors}
              draft={draft}
              change={(next) =>
                update({
                  answers: withAnswersAt(draft.answers, section.path, next),
                })
              }
            />
          </>
        );
        if (draft.step === 0 || sections.length === 1)
          return (
            <section key={section.id} className={styles.section}>
              <h2>{t(`ca.section.${section.id}`)}</h2>
              {fields}
            </section>
          );
        const fieldIds = section.fields.map((field) => `${id}-${field.name}`);
        const hasError = Object.keys(errors).some((key) =>
          fieldIds.some(
            (field) => key === field || key.startsWith(field + '-'),
          ),
        );
        return (
          <details
            key={section.id}
            open={hasError || undefined}
            className={styles.evidence}
          >
            <summary>{t(`ca.section.${section.id}`)}</summary>
            {fields}
          </details>
        );
      })}
    </>
  );
}

export default function CanadaSimulatePage() {
  return (
    <QuestionnaireShell country={canadaModule} steps={canadaQuestionnaireSteps}>
      {(props) => <CanadaStep {...props} />}
    </QuestionnaireShell>
  );
}
