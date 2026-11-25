'use client';

import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  unitedStatesSteps,
  type UsDraft,
} from '../../../lib/united-states-draft';
import { usStepDefinitions, valueAt } from '../../../lib/united-states-fields';
import { unitedStatesModule } from '../../../lib/united-states-module';
import form from '../../simulate/form.module.css';
import { UsFields, updateAnswer } from './fields';
import styles from './questionnaire.module.css';

type Answers = Record<string, unknown>;

// Return the changed top-level answer for one edited question.
function patchAt(
  draft: UsDraft,
  path: readonly string[],
  name: string,
  value: unknown,
) {
  if (!path.length) return { [name]: value };
  const [key, ...rest] = path;
  const record = updateAnswer(
    (valueAt(draft, path) ?? {}) as Answers,
    name,
    value,
  );
  const current = (draft as unknown as Answers)[key];
  const nested = rest.reduceRight<Answers>((child, childName, index) => {
    const parent = valueAt(current, rest.slice(0, index)) as
      Answers | undefined;
    return updateAnswer(
      parent ?? {},
      childName,
      Object.keys(child).length ? child : undefined,
    );
  }, record);
  return { [key]: Object.keys(nested).length ? nested : undefined };
}

function UnitedStatesStep({
  draft,
  errors,
  update,
}: {
  draft: UsDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<UsDraft>) => void;
}) {
  const { t } = useTranslation();
  const definition = usStepDefinitions[draft.step];
  return (
    <>
      <p className={form.hint}>{t('us.form.optional')}</p>
      <p>{t(`us.intro.${definition.title}`)}</p>
      {definition.sections
        .filter((section) => !section.when || section.when(draft))
        .map((section) => {
          const record = (valueAt(draft, section.path) ?? {}) as Answers;
          return (
            <section
              key={`${section.path.join('.')}:${section.title ?? ''}`}
              className={styles.section}
            >
              {section.title && <h2>{t(`us.section.${section.title}`)}</h2>}
              <UsFields
                fields={section.fields}
                values={record}
                prefix={['us', ...section.path].join('-')}
                draft={draft}
                errors={errors}
                change={(name, value) =>
                  update(
                    patchAt(
                      draft,
                      section.path,
                      name,
                      value,
                    ) as Partial<UsDraft>,
                  )
                }
              />
            </section>
          );
        })}
    </>
  );
}

export default function UnitedStatesSimulatePage() {
  return (
    <QuestionnaireShell country={unitedStatesModule} steps={unitedStatesSteps}>
      {(props) => <UnitedStatesStep {...props} />}
    </QuestionnaireShell>
  );
}
