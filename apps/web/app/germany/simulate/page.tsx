'use client';

import type { DeFullRoute } from '@uk-immigration/engine';
import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  germanySteps,
  needsGermanyFirstEntry,
  selectedSettlementDetailRoutes,
  type GermanyDraft,
} from '../../../lib/germany-draft';
import {
  basicFields,
  citizenshipRouteFields,
  citizenshipSections,
  commonSections,
  feeFields,
  GERMANY_ROUTE_GROUPS,
  historyFields,
  settlementRouteFields,
  type GermanyField,
} from '../../../lib/germany-fields';
import { germanyModule } from '../../../lib/germany-module';
import form from '../../simulate/form.module.css';
import { EvidenceFields, updateAnswer } from './evidence-fields';
import styles from './questionnaire.module.css';

interface StepProps {
  draft: GermanyDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<GermanyDraft>) => void;
}

function GermanyStep({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();
  const routeError = !draft.routes.length && errors['de-routes'];

  const toggleRoute = (route: DeFullRoute, checked: boolean) => {
    const next = checked
      ? [...draft.routes, route]
      : draft.routes.filter((r) => r !== route);
    update({ routes: next });
  };

  const renderCollapsibleSections = (
    sections: Record<string, GermanyField[]>,
    values: object,
    prefix: string,
    onChange: (key: string, value: unknown) => void,
  ) =>
    Object.entries(sections).map(([section, fields]) => {
      const hasError = fields.some((field) => {
        const id = `${prefix}-${field.name}`;
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
          <summary>{t(`de.form.${section}` as TranslationKey)}</summary>
          <EvidenceFields
            fields={fields}
            values={values}
            prefix={prefix}
            errors={errors}
            change={onChange}
          />
        </details>
      );
    });

  return (
    <>
      <p className={form.hint}>{t('de.form.optional')}</p>

      {draft.step === 0 && (
        <>
          <EvidenceFields
            fields={basicFields(needsGermanyFirstEntry(draft))}
            values={draft}
            prefix="de"
            errors={errors}
            change={(key, value) =>
              update({
                [key]: value ?? (key === 'simulationDate' ? '' : undefined),
              })
            }
          />
          <fieldset
            id="de-routes"
            className={form.fieldset}
            tabIndex={-1}
            aria-invalid={routeError ? true : undefined}
            aria-describedby={routeError ? 'de-routes-error' : undefined}
          >
            <legend className={form.legend}>{t('de.form.scope')}</legend>
            {routeError && (
              <p id="de-routes-error" className={form.error}>
                {t(routeError)}
              </p>
            )}
            {(['settlement', 'citizenship', 'mobility'] as const).map(
              (group) => (
                <fieldset key={group} className={form.fieldset}>
                  <legend className={form.legend}>
                    {t(`de.form.group.${group}`)}
                  </legend>
                  <div className={form.checkboxes}>
                    {GERMANY_ROUTE_GROUPS[group].map((route) => {
                      const checked = draft.routes.includes(route);
                      const id = `de-route-${route}`;
                      return (
                        <label key={route}>
                          <input
                            type="checkbox"
                            id={id}
                            checked={checked}
                            onChange={(event) =>
                              toggleRoute(route, event.target.checked)
                            }
                          />
                          {t(`de.route.${route}` as TranslationKey)}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ),
            )}
          </fieldset>
        </>
      )}

      {draft.step === 1 && (
        <>
          <p>{t('de.form.historyHint')}</p>
          <EvidenceFields
            fields={historyFields}
            values={{
              permits: draft.permits,
              trips: draft.trips,
              titles: draft.mobility?.titles,
            }}
            prefix="de"
            errors={errors}
            change={(key, value) => {
              if (key === 'titles') {
                update({
                  mobility: updateAnswer(draft.mobility ?? {}, 'titles', value),
                });
              } else {
                update({ [key]: value });
              }
            }}
          />
        </>
      )}

      {draft.step === 2 &&
        renderCollapsibleSections(
          commonSections,
          {
            ...draft.common,
            contributionMonths: draft.contributionMonths,
          },
          'de-common',
          (key, value) => {
            if (key === 'contributionMonths') {
              update({ contributionMonths: value as number | undefined });
            } else {
              update({
                common: updateAnswer(draft.common ?? {}, key, value),
              });
            }
          },
        )}

      {draft.step === 3 &&
        selectedSettlementDetailRoutes(draft).map((routeKey) => {
          const fields = settlementRouteFields[
            routeKey
          ] as unknown as GermanyField[];
          const values =
            routeKey === 'R02'
              ? {
                  ...draft.settlement,
                  trainedInGermany: draft.trainedInGermany,
                }
              : routeKey === 'R03'
                ? {
                    blueCardEmploymentMonths: draft.blueCardEmploymentMonths,
                    germanB1: draft.germanB1,
                    blueCard: draft.mobility?.blueCard,
                  }
                : routeKey === 'R05'
                  ? {
                      ...draft.settlement,
                      germanC1: draft.germanC1,
                    }
                  : routeKey === 'R18'
                    ? { freedom: draft.mobility?.freedom }
                    : (draft.settlement ?? {});
          return (
            <section key={routeKey} className={styles.section}>
              <h2>{t(`de.route.${routeKey}` as TranslationKey)}</h2>
              <EvidenceFields
                fields={fields}
                values={values}
                prefix={`de-route-${routeKey}`}
                errors={errors}
                change={(key, value) => {
                  if (key === 'trainedInGermany') {
                    update({ trainedInGermany: value as boolean | undefined });
                  } else if (key === 'blueCardEmploymentMonths') {
                    update({
                      blueCardEmploymentMonths: value as number | undefined,
                    });
                  } else if (key === 'germanB1') {
                    update({ germanB1: value as boolean | undefined });
                  } else if (key === 'germanC1') {
                    update({ germanC1: value as boolean | undefined });
                  } else if (key === 'blueCard') {
                    update({
                      mobility: updateAnswer(
                        draft.mobility ?? {},
                        'blueCard',
                        value,
                      ),
                    });
                  } else if (key === 'freedom') {
                    update({
                      mobility: updateAnswer(
                        draft.mobility ?? {},
                        'freedom',
                        value,
                      ),
                    });
                  } else {
                    update({
                      settlement: updateAnswer(
                        draft.settlement ?? {},
                        key,
                        value,
                      ),
                    });
                  }
                }}
              />
            </section>
          );
        })}

      {draft.step === 4 && (
        <>
          {renderCollapsibleSections(
            citizenshipSections,
            draft.citizenship ?? {},
            'de-nat',
            (key, value) =>
              update({
                citizenship: updateAnswer(draft.citizenship ?? {}, key, value),
              }),
          )}
          {(['R08', 'R16', 'R17'] as const)
            .filter((routeKey) => draft.routes.includes(routeKey))
            .map((routeKey) => {
              const fields = citizenshipRouteFields[
                routeKey
              ] as unknown as GermanyField[];
              const values =
                routeKey === 'R08'
                  ? {
                      marriedOn: draft.marriedOn,
                      spouseGermanSince: draft.spouseGermanSince,
                      spouse: draft.citizenship?.spouse,
                    }
                  : (draft.citizenship ?? {});
              return (
                <section key={routeKey} className={styles.section}>
                  <h2>{t(`de.route.${routeKey}` as TranslationKey)}</h2>
                  <EvidenceFields
                    fields={fields}
                    values={values}
                    prefix={`de-nat-${routeKey}`}
                    errors={errors}
                    change={(key, value) => {
                      if (key === 'marriedOn' || key === 'spouseGermanSince') {
                        update({ [key]: value as string | undefined });
                      } else {
                        update({
                          citizenship: updateAnswer(
                            draft.citizenship ?? {},
                            key,
                            value,
                          ),
                        });
                      }
                    }}
                  />
                </section>
              );
            })}
        </>
      )}

      {draft.step === 5 && (
        <>
          <p>{t('de.form.feesHint')}</p>
          <EvidenceFields
            fields={feeFields}
            values={draft.fees ?? {}}
            prefix="de-fees"
            errors={errors}
            change={(key, value) =>
              update({
                fees: updateAnswer(draft.fees ?? {}, key, value),
              })
            }
          />
        </>
      )}
    </>
  );
}

export default function GermanySimulatePage() {
  return (
    <QuestionnaireShell country={germanyModule} steps={germanySteps}>
      {(props) => <GermanyStep {...props} />}
    </QuestionnaireShell>
  );
}
