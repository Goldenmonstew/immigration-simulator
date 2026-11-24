'use client';

import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  australiaSteps,
  type AustraliaDraft,
} from '../../../lib/australia-draft';
import {
  citizenshipFields,
  employerCommonFields,
  englishFields,
  feeFields,
  innovationFields,
  nominationFields,
  partnerApplicationField,
  partnerFields,
  publicInterestFields,
  regionalFields,
  rrvFields,
  skillsFields,
  step0Fields,
} from '../../../lib/australia-fields';
import { australiaModule } from '../../../lib/australia-module';
import form from '../../simulate/form.module.css';
import site from '../../site.module.css';
import styles from '../../japan/simulate/questionnaire.module.css';
import { EvidenceFields, updateAnswer } from './evidence-fields';

interface StepProps {
  draft: AustraliaDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<AustraliaDraft>) => void;
}

function AustraliaStep({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();

  const updateGroup = <K extends keyof AustraliaDraft>(
    groupKey: K,
    fieldKey: string,
    value: unknown,
  ) => {
    const current = (draft[groupKey] ?? {}) as object;
    const next = updateAnswer(current, fieldKey, value);
    update({
      [groupKey]: Object.keys(next).length ? next : undefined,
    } as Partial<AustraliaDraft>);
  };

  const nominations = draft.employer?.nominations;
  const setNominations = (
    next: NonNullable<AustraliaDraft['employer']>['nominations'],
  ) => {
    const current = draft.employer ?? {};
    const updated = updateAnswer(current, 'nominations', next);
    update({
      employer: Object.keys(updated).length ? updated : undefined,
    });
  };

  return (
    <>
      <p className={form.hint}>{t('au.form.optional')}</p>

      {draft.step === 0 && (
        <section className={styles.section}>
          <EvidenceFields
            fields={step0Fields}
            values={draft}
            prefix="au"
            errors={errors}
            change={(key, value) =>
              update({
                [key]: value ?? (key === 'simulationDate' ? '' : undefined),
              } as Partial<AustraliaDraft>)
            }
          />
        </section>
      )}

      {draft.step === 1 && (
        <>
          <section className={styles.section}>
            <h2>{t('au.section.english')}</h2>
            <EvidenceFields
              fields={englishFields}
              values={draft.english ?? {}}
              prefix="au-english"
              errors={errors}
              change={(key, value) => updateGroup('english', key, value)}
            />
            <EvidenceFields
              fields={[
                {
                  name: 'secondInstalmentPaid',
                  label: 'secondInstalmentPaid',
                  type: 'boolean',
                },
              ]}
              values={draft}
              prefix="au"
              errors={errors}
              change={(key, value) =>
                update({ [key]: value } as Partial<AustraliaDraft>)
              }
            />
          </section>
          <section className={styles.section}>
            <h2>{t('au.section.fees')}</h2>
            <EvidenceFields
              fields={feeFields}
              values={draft.fees ?? {}}
              prefix="au-fees"
              errors={errors}
              change={(key, value) => updateGroup('fees', key, value)}
            />
          </section>
        </>
      )}

      {draft.step === 2 && (
        <>
          <section className={styles.section}>
            <h2>{t('au.section.employerCommon')}</h2>
            <EvidenceFields
              fields={employerCommonFields}
              values={draft.employer ?? {}}
              prefix="au-employer"
              errors={errors}
              change={(key, value) => updateGroup('employer', key, value)}
            />
          </section>
          <p className={form.hint}>{t('au.form.nominationsHint')}</p>
          <div className={site.actions}>
            <button
              type="button"
              className={form.copyRow}
              onClick={() =>
                setNominations(nominations === undefined ? {} : undefined)
              }
            >
              {t(
                nominations === undefined
                  ? 'au.form.noNominations'
                  : 'au.form.resetNominations',
              )}
            </button>
          </div>
          {nominations && !Object.keys(nominations).length && (
            <p>{t('au.form.emptyConfirmed')}</p>
          )}
          {(
            [
              ['AU-186-TRT', 'au.section.employerTrt'],
              ['AU-186-DE', 'au.section.employerDe'],
            ] as const
          ).map(([stream, sectionTitle]) => {
            const streamRecord = nominations?.[stream] ?? {};
            return (
              <section key={stream} className={styles.section}>
                <h2>{t(sectionTitle)}</h2>
                <EvidenceFields
                  fields={nominationFields}
                  values={streamRecord}
                  prefix={`au-employer-nominations-${stream}`}
                  errors={errors}
                  change={(key, value) => {
                    const nextStream = updateAnswer(streamRecord, key, value);
                    const base = { ...(nominations ?? {}) };
                    if (Object.keys(nextStream).length) {
                      base[stream] = nextStream;
                    } else {
                      delete base[stream];
                    }
                    setNominations(Object.keys(base).length ? base : undefined);
                  }}
                />
              </section>
            );
          })}
        </>
      )}

      {draft.step === 3 && (
        <>
          <section className={styles.section}>
            <h2>{t('au.section.skills')}</h2>
            <EvidenceFields
              fields={skillsFields}
              values={draft.skills ?? {}}
              prefix="au-skills"
              errors={errors}
              change={(key, value) => updateGroup('skills', key, value)}
            />
          </section>
          <section className={styles.section}>
            <h2>{t('au.section.innovation')}</h2>
            <EvidenceFields
              fields={innovationFields}
              values={draft.innovation ?? {}}
              prefix="au-innovation"
              errors={errors}
              change={(key, value) => updateGroup('innovation', key, value)}
            />
          </section>
        </>
      )}

      {draft.step === 4 && (
        <section className={styles.section}>
          <h2>{t('au.section.regional')}</h2>
          <EvidenceFields
            fields={regionalFields}
            values={draft.regional ?? {}}
            prefix="au-regional"
            errors={errors}
            change={(key, value) => updateGroup('regional', key, value)}
          />
        </section>
      )}

      {draft.step === 5 && (
        <>
          <section className={styles.section}>
            <h2>{t('au.section.partner')}</h2>
            <EvidenceFields
              fields={[partnerApplicationField]}
              values={draft}
              prefix="au"
              errors={errors}
              change={(key, value) =>
                update({ [key]: value } as Partial<AustraliaDraft>)
              }
            />
            <EvidenceFields
              fields={partnerFields}
              values={draft.partner ?? {}}
              prefix="au-partner"
              errors={errors}
              change={(key, value) => updateGroup('partner', key, value)}
            />
          </section>
          <section className={styles.section}>
            <h2>{t('au.section.rrv')}</h2>
            <EvidenceFields
              fields={rrvFields}
              values={draft.rrv ?? {}}
              prefix="au-rrv"
              errors={errors}
              change={(key, value) => updateGroup('rrv', key, value)}
            />
          </section>
        </>
      )}

      {draft.step === 6 && (
        <>
          <section className={styles.section}>
            <h2>{t('au.section.citizenship')}</h2>
            <EvidenceFields
              fields={citizenshipFields}
              values={draft.citizenship ?? {}}
              prefix="au-citizenship"
              errors={errors}
              change={(key, value) => updateGroup('citizenship', key, value)}
            />
          </section>
          <section className={styles.section}>
            <h2>{t('au.section.publicInterest')}</h2>
            <EvidenceFields
              fields={publicInterestFields}
              values={draft.publicInterest ?? {}}
              prefix="au-publicInterest"
              errors={errors}
              change={(key, value) => updateGroup('publicInterest', key, value)}
            />
          </section>
        </>
      )}
    </>
  );
}

export default function AustraliaSimulatePage() {
  return (
    <QuestionnaireShell country={australiaModule} steps={australiaSteps}>
      {(props) => <AustraliaStep {...props} />}
    </QuestionnaireShell>
  );
}
