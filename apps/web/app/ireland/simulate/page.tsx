'use client';

import { IRELAND_FULL_PATHWAY_TITLES } from '@uk-immigration/engine';
import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  irelandSteps,
  shownField,
  stepFields,
  type IrelandDraft,
} from '../../../lib/ireland-draft';
import {
  PATHWAY_GROUPS,
  citizenshipSections,
  familySections,
  ltrFields,
  registrationFields,
  stamp5Fields,
  topFields,
  treatySections,
  workSections,
  type IrelandFields,
} from '../../../lib/ireland-fields';
import { irelandModule } from '../../../lib/ireland-module';
import form from '../../simulate/form.module.css';
import styles from './questionnaire.module.css';
import { IrelandFieldsView, setAnswer } from './fields';

type Answers = Record<string, unknown>;
interface StepProps {
  draft: IrelandDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<IrelandDraft>) => void;
}
interface Section {
  title: string;
  path: string[];
  fields: IrelandFields;
}

const sections = (
  group: string,
  parts: Record<string, IrelandFields>,
): Section[] =>
  Object.entries(parts).map(([title, fields]) => ({
    title,
    path: [group],
    fields,
  }));
const treaty = (group: 'eu' | 'wa') =>
  sections(
    group,
    group === 'eu'
      ? {
          treatyBasis: treatySections.treatyBasis,
          treatyResidence: treatySections.treatyResidence,
          treatyDocument: treatySections.treatyDocument,
        }
      : treatySections,
  );
const stepSections: Record<number, Section[]> = {
  1: [
    {
      title: 'registration',
      path: ['registration'],
      fields: registrationFields,
    },
  ],
  2: sections('citizenship', citizenshipSections),
  3: sections('work', workSections),
  4: familySections.map((section) => ({
    ...section,
    path: ['family', ...section.path],
  })),
  5: [
    { title: 'stamp5', path: ['stamp5'], fields: stamp5Fields },
    { title: 'ltr', path: ['ltr'], fields: ltrFields },
  ],
  6: [...treaty('eu'), ...treaty('wa')],
};
// Questions answered directly on a step, before its collapsible sections.
const directFields: Record<number, string[]> = {
  0: ['simulationDate', 'dateOfBirth', 'birthplace', 'currentLocation'],
  1: ['permissions', 'trips'],
  2: ['marriedOn'],
  3: ['employmentStart'],
};

function IrelandStep({ draft, errors, update }: StepProps) {
  const { t, locale } = useTranslation();
  const answers = draft as unknown as Answers;
  const step = draft.step;
  const direct = Object.fromEntries(
    (directFields[step] ?? []).map((name) => [
      name,
      topFields[name as keyof typeof topFields],
    ]),
  );
  // Each section belongs to a top-level group shown on this step and has at
  // least one question for the selected pathways.
  const visible = (stepSections[step] ?? []).filter((section) => {
    const top = topFields[section.path[0] as keyof typeof topFields];
    return (
      stepFields(step).includes(section.path[0] as never) &&
      shownField(top, draft) &&
      Object.values(section.fields).some((field) => shownField(field, draft))
    );
  });
  const pathwayError = errors['ie-pathways'];
  return (
    <>
      <p className={form.hint}>{t(`ie.form.intro${step}` as TranslationKey)}</p>
      <IrelandFieldsView
        fields={direct}
        values={answers}
        prefix="ie"
        errors={errors}
        draft={draft}
        change={(name, value) =>
          update({
            [name]: value ?? (name === 'simulationDate' ? '' : undefined),
          })
        }
      />
      {step === 0 && (
        <fieldset
          id="ie-pathways"
          className={form.fieldset}
          tabIndex={-1}
          aria-invalid={pathwayError ? true : undefined}
          aria-describedby={pathwayError ? 'ie-pathways-error' : undefined}
        >
          <legend className={form.legend}>{t('ie.form.pathways')}</legend>
          {pathwayError && (
            <p id="ie-pathways-error" className={form.error}>
              {t(pathwayError)}
            </p>
          )}
          {Object.entries(PATHWAY_GROUPS).map(([group, ids]) => (
            <fieldset key={group} className={form.fieldset}>
              <legend className={form.legend}>
                {t(`ie.form.group.${group}` as TranslationKey)}
              </legend>
              <div className={form.checkboxes}>
                {ids.map((id) => {
                  const [zh, en] = IRELAND_FULL_PATHWAY_TITLES[id];
                  return (
                    <label key={id}>
                      <input
                        type="checkbox"
                        id={`ie-pathway-${id}`}
                        checked={draft.pathways.includes(id)}
                        onChange={(event) =>
                          update({
                            pathways: event.target.checked
                              ? [...draft.pathways, id]
                              : draft.pathways.filter((item) => item !== id),
                          })
                        }
                      />
                      {locale === 'en' ? en : zh}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </fieldset>
      )}
      {visible.map((section) => {
        const [group, child] = section.path;
        const parent = answers[group] as Answers | undefined;
        const record = (child ? parent?.[child] : parent) as
          Answers | undefined;
        const prefix = ['ie', ...section.path].join('-');
        const save = (next: Answers) => {
          const value = Object.keys(next).length ? next : undefined;
          update({
            [group]: child
              ? (() => {
                  const outer = setAnswer(parent, child, value);
                  return Object.keys(outer).length ? outer : undefined;
                })()
              : value,
          });
        };
        const open = Object.keys(errors).some((id) =>
          Object.keys(section.fields).some(
            (name) =>
              id === `${prefix}-${name}` || id.startsWith(`${prefix}-${name}-`),
          ),
        );
        return (
          <details
            key={`${group}-${section.title}`}
            open={open || undefined}
            className={styles.evidence}
          >
            <summary>
              {t(`ie.form.section.${section.title}` as TranslationKey)}
              {group === 'eu' || group === 'wa'
                ? ` · ${t(`ie.form.section.${group}` as TranslationKey)}`
                : ''}
            </summary>
            <IrelandFieldsView
              fields={section.fields}
              values={record ?? {}}
              prefix={prefix}
              errors={errors}
              draft={draft}
              change={(name, value) => save(setAnswer(record, name, value))}
            />
          </details>
        );
      })}
    </>
  );
}

export default function IrelandSimulatePage() {
  return (
    <QuestionnaireShell country={irelandModule} steps={irelandSteps}>
      {(props) => <IrelandStep {...props} />}
    </QuestionnaireShell>
  );
}
