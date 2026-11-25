'use client';

import type { ReactNode } from 'react';
import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  familyRoute,
  GR_PATHWAYS,
  greeceSteps,
  has,
  settlementRoute,
  type GreeceDraft,
} from '../../../lib/greece-draft';
import {
  basicFields,
  commonSections,
  euFamilySections,
  familyTcnSections,
  goldenVisaSections,
  greekFamilySections,
  historyFields,
  nationalitySections,
  routeField,
  settlementFields,
  tripList,
  workSections,
  type GreeceField,
  type GreeceSection,
} from '../../../lib/greece-fields';
import { greeceModule } from '../../../lib/greece-module';
import form from '../../simulate/form.module.css';
import styles from '../../japan/simulate/questionnaire.module.css';
import { EvidenceFields, nestedChange } from './evidence-fields';

interface StepProps {
  draft: GreeceDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<GreeceDraft>) => void;
}

type GroupKey =
  | 'nationality'
  | 'goldenVisa'
  | 'greekFamily'
  | 'euFamily'
  | 'work'
  | 'familyTcn';

function GreeceStep({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();
  const hasError = (prefix: string) =>
    Object.keys(errors).some((key) => key.startsWith(prefix));
  // Top-level answers: an emptied value is removed from the draft.
  const top = (fields: GreeceField[]) => (
    <EvidenceFields
      fields={fields}
      values={draft}
      prefix="gr"
      errors={errors}
      change={(name, value) =>
        update({
          [name]: value ?? (name === 'simulationDate' ? '' : undefined),
        } as Partial<GreeceDraft>)
      }
    />
  );
  const details = (
    key: string,
    summary: string,
    open: boolean,
    body: ReactNode,
  ) => (
    <details key={key} className={styles.evidence} open={open || undefined}>
      <summary>{summary}</summary>
      {body}
    </details>
  );
  // One collapsible block per top-level group.
  const groups = (fields: GreeceField[]) =>
    fields.map((field) =>
      details(
        field.name,
        t(`gr.field.${field.label}` as TranslationKey),
        hasError(`gr-${field.name}`),
        top([field]),
      ),
    );
  // Sections of one route group, each bound to the same answers object.
  const sections = (
    key: GroupKey,
    definitions: Partial<Record<GreeceSection, GreeceField[]>>,
  ) => {
    const record = (draft[key] ?? {}) as object;
    return Object.entries(definitions).map(([section, fields]) =>
      details(
        section,
        t(`gr.section.${section as GreeceSection}`),
        (fields ?? []).some((field) => hasError(`gr-${key}-${field.name}`)),
        <EvidenceFields
          fields={fields ?? []}
          values={record}
          prefix={`gr-${key}`}
          errors={errors}
          change={(name, value) => {
            const next = nestedChange(fields ?? [], record, name, value);
            update({
              [key]: Object.keys(next).length ? next : undefined,
            } as Partial<GreeceDraft>);
          }}
        />,
      ),
    );
  };
  const routeHeading = (id: (typeof GR_PATHWAYS)[number]) => (
    <h2>{t(`gr.pathway.${id}`)}</h2>
  );
  const pathwayError = errors['gr-pathways'];

  return (
    <>
      <p className={form.hint}>{t('gr.form.optional')}</p>
      {draft.step === 0 && (
        <>
          {top(basicFields)}
          <fieldset
            id="gr-pathways"
            className={form.fieldset}
            tabIndex={-1}
            aria-invalid={pathwayError ? true : undefined}
            aria-describedby={
              pathwayError ? 'gr-pathways-error' : 'gr-pathways-hint'
            }
          >
            <legend className={form.legend}>{t('gr.form.pathways')} *</legend>
            <p id="gr-pathways-hint" className={form.hint}>
              {t('gr.form.pathwaysHint')}
            </p>
            {pathwayError && (
              <p id="gr-pathways-error" className={form.error}>
                {t(pathwayError)}
              </p>
            )}
            <div className={form.checkboxes}>
              {GR_PATHWAYS.map((id) => (
                <label key={id}>
                  <input
                    type="checkbox"
                    id={`gr-pathway-${id}`}
                    checked={draft.pathways.includes(id)}
                    onChange={(event) =>
                      update({
                        pathways: event.target.checked
                          ? GR_PATHWAYS.filter(
                              (p) => p === id || draft.pathways.includes(p),
                            )
                          : draft.pathways.filter((p) => p !== id),
                      })
                    }
                  />
                  {t(`gr.pathway.${id}`)}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}
      {draft.step === 1 &&
        top([
          historyFields.permits,
          historyFields.permitHistoryComplete,
          tripList(familyRoute(draft)),
          ...(settlementRoute(draft) ? [historyFields.backlogRenewals] : []),
          ...historyFields.renewal,
        ])}
      {draft.step === 2 &&
        Object.entries(
          commonSections(
            has(draft, 'GR-EU-FAMILY-PR'),
            has(draft, 'GR-GOLDEN-VISA'),
          ),
        ).map(([section, fields]) =>
          details(
            section,
            t(`gr.section.${section as GreeceSection}`),
            (fields ?? []).some((field) => hasError(`gr-${field.name}`)),
            top(fields ?? []),
          ),
        )}
      {draft.step === 3 &&
        groups([
          ...(has(draft, 'GR-LONG-TERM')
            ? [
                settlementFields.longTerm,
                settlementFields.grantedProtection,
                settlementFields.blueCardMobility,
              ]
            : []),
          settlementFields.integration,
          settlementFields.residenceIncome,
          ...(has(draft, 'GR-TEN-YEAR') ? [settlementFields.tenYear] : []),
        ])}
      {draft.step === 4 && (
        <>
          {top([routeField])}
          {sections('nationality', nationalitySections)}
        </>
      )}
      {draft.step === 5 && sections('goldenVisa', goldenVisaSections)}
      {draft.step === 6 && (
        <>
          {has(draft, 'GR-GREEK-FAMILY-PR') && (
            <section className={styles.section}>
              {routeHeading('GR-GREEK-FAMILY-PR')}
              {sections('greekFamily', greekFamilySections)}
            </section>
          )}
          {has(draft, 'GR-EU-FAMILY-PR') && (
            <section className={styles.section}>
              {routeHeading('GR-EU-FAMILY-PR')}
              {sections('euFamily', euFamilySections)}
            </section>
          )}
        </>
      )}
      {draft.step === 7 && (
        <>
          {has(draft, 'GR-WORK') && (
            <section className={styles.section}>
              {routeHeading('GR-WORK')}
              {sections('work', workSections)}
            </section>
          )}
          {has(draft, 'GR-FAMILY-TCN') && (
            <section className={styles.section}>
              {routeHeading('GR-FAMILY-TCN')}
              {sections('familyTcn', familyTcnSections)}
            </section>
          )}
        </>
      )}
    </>
  );
}

export default function GreeceSimulatePage() {
  return (
    <QuestionnaireShell country={greeceModule} steps={greeceSteps}>
      {(props) => <GreeceStep {...props} />}
    </QuestionnaireShell>
  );
}
