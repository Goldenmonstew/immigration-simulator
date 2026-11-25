'use client';

import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  clearHiddenMalaysiaAnswers,
  familyNote,
  malaysiaStepList,
  readPath,
  sectionPrefix,
  visibleSections,
  writePath,
  type MalaysiaDraft,
} from '../../../lib/malaysia-draft';
import {
  MY_TARGETS,
  myTargetGroups,
  scopeOf,
  type MyTarget,
} from '../../../lib/malaysia-fields';
import { malaysiaModule } from '../../../lib/malaysia-module';
import form from '../../simulate/form.module.css';
import { EvidenceFields, updateAnswer } from './evidence-fields';

interface StepProps {
  draft: MalaysiaDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<MalaysiaDraft>) => void;
}

function Targets({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();
  const error = !draft.targets.length && errors['my-targets'];
  return (
    <fieldset
      id="my-targets"
      className={form.fieldset}
      tabIndex={-1}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? 'my-targets-error' : undefined}
    >
      <legend className={form.legend}>{t('my.form.scope')} *</legend>
      {error && (
        <p id="my-targets-error" className={form.error}>
          {t(error)}
        </p>
      )}
      {Object.entries(myTargetGroups).map(([group, targets]) => (
        <fieldset key={group} className={form.entry}>
          <legend>{t(`my.targetGroup.${group}` as TranslationKey)}</legend>
          <div className={form.checkboxes}>
            {targets.map((target: MyTarget) => (
              <label key={target}>
                <input
                  type="checkbox"
                  id={`my-target-${target}`}
                  checked={draft.targets.includes(target)}
                  onChange={(event) => {
                    const chosen: MyTarget[] = event.target.checked
                      ? MY_TARGETS.filter(
                          (item) =>
                            item === target || draft.targets.includes(item),
                        )
                      : draft.targets.filter((item) => item !== target);
                    update({ targets: chosen });
                  }}
                />
                {t(`my.target.${target}`)}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </fieldset>
  );
}

function MalaysiaStep(props: StepProps) {
  const { draft, errors, update } = props;
  const { t } = useTranslation();
  return (
    <>
      {draft.step === 0 && <p className={form.hint}>{t('my.form.intro')}</p>}
      {visibleSections(draft, draft.step).map((section) => {
        const values = readPath(draft, section.path) ?? {};
        const fields = (
          <EvidenceFields
            fields={section.fields}
            values={values}
            prefix={sectionPrefix(section)}
            scope={scopeOf(draft)}
            errors={errors}
            change={(name, value) => {
              const next = updateAnswer(values, name, value);
              // The simulation date stays a string, as every draft has one.
              if (name === 'simulationDate') next.simulationDate ??= '';
              const updated = clearHiddenMalaysiaAnswers(
                writePath(draft, section.path, next),
              );
              // The shell merges the patch into the draft, so answers removed
              // at the draft root are sent as undefined.
              update({
                ...Object.fromEntries(
                  Object.keys(draft).map((key) => [key, undefined]),
                ),
                ...updated,
              });
            }}
          />
        );
        if (
          section.id === 'basics' ||
          section.id === 'passes' ||
          section.id === 'trips'
        )
          return <div key={section.id}>{fields}</div>;
        const heading = `my-section-${section.id}`;
        const note = section.id === 'family' && familyNote(draft);
        return (
          <section key={section.id} aria-labelledby={heading}>
            <h2 id={heading}>{t(`my.section.${section.id}`)}</h2>
            {note && <p className={form.hint}>{t(note)}</p>}
            {fields}
          </section>
        );
      })}
      {draft.step === 0 && <Targets {...props} />}
    </>
  );
}

export default function MalaysiaSimulatePage() {
  return (
    <QuestionnaireShell country={malaysiaModule} steps={malaysiaStepList}>
      {(props) => <MalaysiaStep {...props} />}
    </QuestionnaireShell>
  );
}
