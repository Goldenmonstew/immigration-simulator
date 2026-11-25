'use client';

import { Fragment } from 'react';
import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  nzGoalGroups,
  nzGoals,
  nzSectionShown,
  nzStepDefinitions,
  nzSteps,
  recordAt,
  withRecordAt,
  type NzDraft,
} from '../../../lib/new-zealand-draft';
import { newZealandModule } from '../../../lib/new-zealand-module';
import { Field } from '../../simulate/field';
import form from '../../simulate/form.module.css';
import { NzFields } from './nz-fields';

interface StepProps {
  draft: NzDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<NzDraft>) => void;
}

function Basics({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();
  const goalError = errors['nz-goals'];
  return (
    <>
      <p className={form.hint}>{t('nz.form.basicsHint')}</p>
      <Field
        id="nz-simulationDate"
        label={t('nz.f.simulationDate') + ' *'}
        error={errors['nz-simulationDate']}
      >
        <input
          id="nz-simulationDate"
          type="date"
          value={draft.simulationDate}
          aria-invalid={errors['nz-simulationDate'] ? true : undefined}
          aria-describedby={
            errors['nz-simulationDate'] ? 'nz-simulationDate-error' : undefined
          }
          onChange={(event) => update({ simulationDate: event.target.value })}
        />
      </Field>
      <fieldset
        id="nz-goals"
        className={form.fieldset}
        tabIndex={-1}
        aria-invalid={goalError ? true : undefined}
        aria-describedby={goalError ? 'nz-goals-error' : undefined}
      >
        <legend className={form.legend}>{t('nz.goal.legend')} *</legend>
        {goalError && (
          <p id="nz-goals-error" className={form.error}>
            {t(goalError)}
          </p>
        )}
        {Object.entries(nzGoalGroups).map(([group, goals]) => (
          <fieldset key={group} className={form.fieldset}>
            <legend className={form.legend}>
              {t(`nz.goal.${group}` as TranslationKey)}
            </legend>
            <div className={form.checkboxes}>
              {goals.map((goal) => (
                <label key={goal}>
                  <input
                    type="checkbox"
                    id={`nz-goal-${goal}`}
                    checked={draft.goals.includes(goal)}
                    onChange={(event) =>
                      update({
                        goals: nzGoals.filter((item) =>
                          item === goal
                            ? event.target.checked
                            : draft.goals.includes(item),
                        ),
                      })
                    }
                  />
                  {t(`nz.goal.${goal}`)}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </fieldset>
    </>
  );
}

function NzStep(props: StepProps) {
  const { draft, errors, update } = props;
  const { t } = useTranslation();
  return (
    <>
      {draft.step === 0 && <Basics {...props} />}
      {nzStepDefinitions[draft.step].sections.map((section, index) =>
        nzSectionShown(section, draft) ? (
          <Fragment key={index}>
            {/* An answer group such as English can be left blank. */}
            {section.path.length > 0 &&
              section.fields.some((field) => field.required) && (
                <p className={form.hint}>{t('nz.form.optionalGroup')}</p>
              )}
            <NzFields
              fields={section.fields}
              values={recordAt(draft.answers, section.path)}
              prefix={['nz', ...section.path].join('-')}
              errors={errors}
              change={(record) =>
                update({
                  answers: withRecordAt(draft.answers, section.path, record),
                })
              }
            />
          </Fragment>
        ) : null,
      )}
    </>
  );
}

export default function NewZealandSimulatePage() {
  return (
    <QuestionnaireShell country={newZealandModule} steps={nzSteps}>
      {(props) => <NzStep {...props} />}
    </QuestionnaireShell>
  );
}
