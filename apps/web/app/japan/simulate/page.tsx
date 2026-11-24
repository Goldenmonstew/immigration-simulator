'use client';

import { shareJapanTripAnswers } from '@uk-immigration/engine';
import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  canConfirmJapanDeparture,
  hasJapanResidenceRoute,
  japanDepartureTiming,
  japanSteps,
  withJapanFilingDate,
  type JapanDraft,
} from '../../../lib/japan-draft';
import {
  basicFields,
  natRouteFields,
  natSections,
  prFilingSections,
  prRouteFields,
  prStatusSections,
  travelRouteFields,
  tripList,
  type JapanField,
} from '../../../lib/japan-fields';
import { japanModule } from '../../../lib/japan-module';
import form from '../../simulate/form.module.css';
import styles from './questionnaire.module.css';
import { EvidenceFields, updateAnswer } from './evidence-fields';

type RouteGroup = 'pr' | 'nat' | 'travel';
const routeFields = {
  pr: prRouteFields,
  nat: natRouteFields,
  travel: travelRouteFields,
};
interface StepProps {
  draft: JapanDraft;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<JapanDraft>) => void;
}

function JapanStep({ draft, errors, update }: StepProps) {
  const { t } = useTranslation();
  const pr = draft.permanentResidence;
  const nat = draft.naturalisation;
  const routeLabel = (group: RouteGroup, route: string) =>
    t(`jp.${group}.${route}` as TranslationKey);
  const { trips, reentry } = shareJapanTripAnswers(draft.trips, draft.reentry);
  const routes = { pr: pr.routes, nat: nat.routes, travel: reentry };
  const residence = hasJapanResidenceRoute(draft);
  const routeError = !residence && !draft.reentry.length && errors['jp-routes'];
  // Required answers remain blank while a route is being edited. The shell
  // validates each selected route before any request is sent to the engine.
  const setRoutes = (
    group: RouteGroup,
    selected: { route: string }[],
    edited?: { route: string; field: string },
  ) => {
    if (group === 'pr')
      update({
        permanentResidence: { ...pr, routes: selected as typeof pr.routes },
      });
    else if (group === 'nat')
      update({
        naturalisation: { ...nat, routes: selected as typeof nat.routes },
      });
    else {
      const next = selected as typeof reentry;
      const travel = next.find((route) => route.route === edited?.route);
      const previous = reentry.find((route) => route.route === edited?.route);
      update(
        shareJapanTripAnswers(
          trips,
          next,
          edited && travel && previous
            ? { travel, previous, field: edited.field }
            : undefined,
        ),
      );
    }
  };
  const routeQuestions = (group: RouteGroup) =>
    routes[group].map((route) => {
      const fields = (routeFields[group] as Record<string, JapanField[]>)[
        route.route
      ];
      const planned =
        route.route === 'deemed' && !canConfirmJapanDeparture(draft, route);
      const sameDay =
        route.route === 'deemed' &&
        japanDepartureTiming(draft.simulationDate, route.departureOn) ===
          'same-day';
      return (
        <section key={route.route} className={styles.section}>
          <h2>{routeLabel(group, route.route)}</h2>
          {group === 'pr' &&
            ['hsp70', 'hsp80', 'j-skip'].includes(route.route) && (
              <p>{t('jp.form.talent')}</p>
            )}
          {fields.length ? (
            <EvidenceFields
              fields={fields.filter(
                (field) =>
                  (field.name !== 'alreadyDeparted' ||
                    sameDay ||
                    errors['jp-travel-deemed-departureOn'] ===
                      'jp.error.futureFact') &&
                  (field.name !== 'declaredIntentAtDeparture' || !planned),
              )}
              prefix={'jp-' + group + '-' + route.route}
              values={route}
              errors={errors}
              change={(key, value) =>
                setRoutes(
                  group,
                  routes[group].map((r) => {
                    if (r.route !== route.route) return r;
                    let next = updateAnswer(r, key, value);
                    if (
                      group === 'travel' &&
                      ['departureOn', 'returnOn', 'newLandingOn'].includes(key)
                    )
                      next = updateAnswer(
                        next,
                        'comparisonHistoryReturnOn',
                        undefined,
                      );
                    if (r.route !== 'deemed') return next;
                    if (key === 'declaredIntentAtDeparture')
                      return {
                        ...next,
                        alreadyDeparted:
                          value === undefined ? r.alreadyDeparted : true,
                        declarationForDepartureOn:
                          value === undefined ? undefined : r.departureOn,
                      };
                    if (key === 'departureOn' && value !== r.departureOn)
                      return {
                        ...next,
                        alreadyDeparted: undefined,
                        declaredIntentAtDeparture: undefined,
                        declarationForDepartureOn: undefined,
                      };
                    if (key === 'alreadyDeparted' && value !== true)
                      return {
                        ...next,
                        declaredIntentAtDeparture: undefined,
                        declarationForDepartureOn: undefined,
                      };
                    return next;
                  }),
                  { route: route.route, field: key },
                )
              }
            />
          ) : (
            <p>{t('jp.form.noExtra')}</p>
          )}
          {planned && route.departureOn && (
            <p>
              {t('jp.result.plannedDeparture').replace(
                '{date}',
                route.departureOn,
              )}
            </p>
          )}
        </section>
      );
    });
  const evidence = (
    sections: Record<string, JapanField[]>,
    group: 'pr' | 'nat',
  ) =>
    Object.entries(sections).map(([section, fields]) => {
      const values = group === 'pr' ? pr.evidence : nat.evidence;
      const hasError = fields.some((field) => {
        const id = 'jp-' + group + '-' + field.name;
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
          <summary>{t(`jp.form.${section}` as TranslationKey)}</summary>
          <EvidenceFields
            fields={fields}
            values={values}
            prefix={'jp-' + group}
            errors={errors}
            change={(key, value) => {
              if (group === 'pr')
                update({
                  permanentResidence: {
                    ...pr,
                    evidence: updateAnswer(pr.evidence, key, value),
                  },
                });
              else
                update({
                  naturalisation: {
                    ...nat,
                    evidence: updateAnswer(nat.evidence, key, value),
                  },
                });
            }}
          />
        </details>
      );
    });

  return (
    <>
      <p className={form.hint}>{t('jp.form.optional')}</p>
      {draft.step === 0 && (
        <>
          <EvidenceFields
            fields={basicFields(residence)}
            values={draft}
            prefix="jp"
            errors={errors}
            change={(key, value) => {
              if (key === 'applicationDate' || key === 'simulationDate') {
                const dates = {
                  ...draft,
                  [key]: value ?? (key === 'simulationDate' ? '' : undefined),
                };
                update(
                  withJapanFilingDate(
                    draft,
                    dates.applicationDate,
                    dates.simulationDate,
                  ),
                );
              } else
                update({
                  [key]: value ?? (key === 'stayStart' ? '' : undefined),
                });
            }}
          />
          <fieldset
            id="jp-routes"
            className={form.fieldset}
            tabIndex={-1}
            aria-invalid={routeError ? true : undefined}
            aria-describedby={routeError ? 'jp-routes-error' : undefined}
          >
            <legend className={form.legend}>{t('jp.form.scope')}</legend>
            {routeError && (
              <p id="jp-routes-error" className={form.error}>
                {t(routeError)}
              </p>
            )}
            {(['pr', 'nat', 'travel'] as const).map((group) => (
              <fieldset key={group} className={form.fieldset}>
                <legend className={form.legend}>{t(`jp.form.${group}`)}</legend>
                <div className={form.checkboxes}>
                  {Object.keys(routeFields[group]).map((route) => {
                    const checked = routes[group].some(
                      (r) => r.route === route,
                    );
                    const id = 'jp-route-' + group + '-' + route;
                    return (
                      <label key={route}>
                        <input
                          type="checkbox"
                          id={id}
                          checked={checked}
                          onChange={(event) =>
                            setRoutes(
                              group,
                              event.target.checked
                                ? [...routes[group], { route }]
                                : routes[group].filter(
                                    (r) => r.route !== route,
                                  ),
                            )
                          }
                        />
                        {routeLabel(group, route)}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </fieldset>
        </>
      )}
      {draft.step === 1 && (
        <>
          <p>{t('jp.form.history')}</p>
          <EvidenceFields
            fields={[tripList]}
            values={{ trips }}
            prefix="jp"
            errors={errors}
            change={(_, value, row) => {
              const next = value as typeof trips;
              update(
                shareJapanTripAnswers(
                  next,
                  reentry,
                  row && { history: next[row.index], field: row.field },
                ),
              );
            }}
          />
        </>
      )}
      {draft.step === 2 && routeQuestions('pr')}
      {draft.step === 3 && evidence(prStatusSections, 'pr')}
      {draft.step === 4 && evidence(prFilingSections, 'pr')}
      {draft.step === 5 && (
        <>
          {routeQuestions('nat')}
          {evidence(natSections, 'nat')}
        </>
      )}
      {draft.step === 6 && (
        <>
          <p>{t('jp.form.travelHint')}</p>
          {routeQuestions('travel')}
        </>
      )}
    </>
  );
}

export default function JapanSimulatePage() {
  return (
    <QuestionnaireShell country={japanModule} steps={japanSteps}>
      {(props) => <JapanStep {...props} />}
    </QuestionnaireShell>
  );
}
