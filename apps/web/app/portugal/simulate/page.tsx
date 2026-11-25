'use client';

import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  clearHiddenPortugalAnswers,
  portugalStepList,
  readPath,
  sectionPrefix,
  visibleSections,
  writePath,
  type PortugalDraft,
} from '../../../lib/portugal-draft';
import { PT_TARGETS, type PtTarget } from '../../../lib/portugal-fields';
import { portugalModule } from '../../../lib/portugal-module';
import form from '../../simulate/form.module.css';
import styles from '../../japan/simulate/questionnaire.module.css';
import { EvidenceFields, updateAnswer } from './evidence-fields';

interface StepProps {
  draft: PortugalDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<PortugalDraft>) => void;
}

function Targets({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();
  const error = !draft.targets.length && errors['pt-targets'];
  return (
    <fieldset
      id="pt-targets"
      className={form.fieldset}
      tabIndex={-1}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? 'pt-targets-error' : undefined}
    >
      <legend className={form.legend}>{t('pt.form.scope')} *</legend>
      {error && (
        <p id="pt-targets-error" className={form.error}>
          {t(error)}
        </p>
      )}
      <div className={form.checkboxes}>
        {PT_TARGETS.map((target) => (
          <label key={target}>
            <input
              type="checkbox"
              id={`pt-target-${target}`}
              checked={draft.targets.includes(target)}
              onChange={(event) => {
                const targets: PtTarget[] = event.target.checked
                  ? PT_TARGETS.filter(
                      (item) => item === target || draft.targets.includes(item),
                    )
                  : draft.targets.filter((item) => item !== target);
                update({ targets });
              }}
            />
            {t(`pt.target.${target}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PortugalStep(props: StepProps) {
  const { draft, errors, update } = props;
  const { t } = useTranslation();
  const sections = visibleSections(draft, draft.step);
  return (
    <>
      {draft.step === 0 && <p className={form.hint}>{t('pt.form.intro')}</p>}
      {sections.map((section) => {
        const prefix = sectionPrefix(section);
        const values = readPath(draft, section.path) ?? {};
        const fields = (
          <EvidenceFields
            fields={section.fields}
            values={values}
            prefix={prefix}
            errors={errors}
            change={(name, value) => {
              const next = updateAnswer(values, name, value);
              // The simulation date stays a string, as every draft has one.
              if (name === 'simulationDate') next.simulationDate ??= '';
              update(
                clearHiddenPortugalAnswers(
                  writePath(draft, section.path, next),
                ),
              );
            }}
          />
        );
        if (section.id === 'basics' || section.id === 'history')
          return <div key={section.id}>{fields}</div>;
        const open = Object.keys(errors).some(
          (key) =>
            key.startsWith(`${prefix}-`) &&
            section.fields.some(
              (field) =>
                key === `${prefix}-${field.name}` ||
                key.startsWith(`${prefix}-${field.name}-`),
            ),
        );
        return (
          <details
            key={section.id}
            open={open || undefined}
            className={styles.evidence}
          >
            <summary>{t(`pt.section.${section.id}`)}</summary>
            {fields}
          </details>
        );
      })}
      {draft.step === 0 && <Targets {...props} />}
    </>
  );
}

export default function PortugalSimulatePage() {
  return (
    <QuestionnaireShell country={portugalModule} steps={portugalStepList}>
      {(props) => <PortugalStep {...props} />}
    </QuestionnaireShell>
  );
}
