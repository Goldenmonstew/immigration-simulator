'use client';

import {
  editJapanTripAnswer,
  japanTalentHistoricalDate,
  shareJapanTripAnswers,
} from '@uk-immigration/engine';
import { QuestionnaireShell } from '../../../components/questionnaire-shell';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  activeJapanAnswers,
  changedJapanAnswer,
  hasJapanResidenceRoute,
  japanDepartureStatus,
  japanSteps,
  datedJapanAnswers,
  ordinaryAnswersForDate,
  ordinaryFilingDays,
  residenceFilingDay,
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

function editTravelField(
  draft: JapanDraft,
  route: JapanDraft['reentry'][number],
  key: string,
  value: unknown,
  displayed: JapanDraft['reentry'][number],
) {
  const next = updateAnswer(route, key, value);
  const departureChanged =
    key === 'departureOn' && changedJapanAnswer(route.departureOn, value);
  if (
    departureChanged ||
    ((key === 'returnOn' || key === 'newLandingOn') &&
      changedJapanAnswer(displayed[key], value))
  )
    delete next.comparisonHistoryReturnOn;
  if (departureChanged) {
    delete next.timelyRenewalPending;
    delete next.specialPermanentResident;
  }
  if (route.route === 'ordinary' && next.route === 'ordinary') {
    const days = ordinaryFilingDays(draft, next);
    if (key === 'lawfulStatus')
      return {
        ...next,
        lawfulStatusOn: value === undefined ? undefined : days?.statusDate,
      };
    if (key === 'inJapanWhenApplying' || key === 'excludedStatusOrDetention')
      return { ...next, filingEvidenceOn: days?.date };
    if (departureChanged) {
      delete next.previouslyUsedSingleEntry;
      delete next.passportOrApprovedAlternative;
      delete next.residentCardOrCertificate;
    }
    return ordinaryAnswersForDate(draft, next, draft, route);
  }
  if (next.route === 'refugee-travel-document' && departureChanged) {
    delete next.refugeeRecognition;
    delete next.hasJapaneseTravelDocument;
  }
  if (next.route !== 'deemed') return next;
  if (key === 'alreadyDeparted' && value === undefined)
    next.alreadyDeparted = null;
  if (departureChanged) {
    delete next.lawfulStatus;
    delete next.temporaryVisitor;
    delete next.passportValid;
    delete next.formalPermitRequired;
    delete next.residentCardOrCertificate;
    delete next.alreadyDeparted;
  }
  if (
    departureChanged ||
    (key === 'alreadyDeparted' &&
      changedJapanAnswer(route.alreadyDeparted, value) &&
      value !== true)
  ) {
    delete next.declaredIntentAtDeparture;
    delete next.declarationForDepartureOn;
  }
  if (key === 'declaredIntentAtDeparture') {
    if (value !== undefined) next.alreadyDeparted = true;
    next.declarationForDepartureOn =
      value === undefined ? undefined : next.departureOn;
  }
  return next;
}

function JapanStep({ draft: stored, errors, update: save }: StepProps) {
  const draft = datedJapanAnswers(stored);
  const { t } = useTranslation();
  const residence = hasJapanResidenceRoute(draft);
  const residenceDay = residence ? residenceFilingDay(draft) : undefined;
  const update = (patch: Partial<JapanDraft>) =>
    save({
      ...draft,
      ...(residence && { residenceEvidenceOn: residenceDay }),
      ...patch,
    });
  const pr = draft.permanentResidence;
  const nat = draft.naturalisation;
  const routeLabel = (group: RouteGroup, route: string) =>
    t(`jp.${group}.${route}` as TranslationKey);
  const active = activeJapanAnswers(draft);
  const { trips, reentry } = shareJapanTripAnswers(
    active.trips,
    active.reentry,
  );
  const routes = { pr: pr.routes, nat: nat.routes, travel: active.reentry };
  const routeError = !residence && !draft.reentry.length && errors['jp-routes'];
  // Required answers remain blank while a route is being edited. The shell
  // validates each selected route before any request is sent to the engine.
  const saveTravel = (records: Pick<JapanDraft, 'trips' | 'reentry'>) => {
    const { trips, reentry } = activeJapanAnswers({ ...draft, ...records });
    update(residence ? { trips, reentry } : { reentry });
  };
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
      saveTravel(
        edited && travel
          ? editJapanTripAnswer(active.trips, next, {
              travel,
              field: edited.field,
            })
          : { trips: active.trips, reentry: next },
      );
    }
  };
  const routeQuestions = (group: RouteGroup) =>
    routes[group].map((route, index) => {
      const fields = (routeFields[group] as Record<string, JapanField[]>)[
        route.route
      ];
      const ordinaryDays =
        route.route === 'ordinary'
          ? ordinaryFilingDays(draft, route)
          : undefined;
      const departure =
        route.route === 'deemed'
          ? japanDepartureStatus(draft, route)
          : undefined;
      return (
        <section key={route.route} className={styles.section}>
          <h2>{routeLabel(group, route.route)}</h2>
          {residenceDay &&
            (route.route === 'hsp70' ||
              route.route === 'hsp80' ||
              route.route === 'j-skip') && (
              <p>
                {t('jp.form.talent')
                  .replace('{date}', residenceDay)
                  .replace(
                    '{past}',
                    japanTalentHistoricalDate(route.route, residenceDay),
                  )}
              </p>
            )}
          {ordinaryDays && (
            <p>
              {t(
                ordinaryDays.held
                  ? 'jp.form.ordinaryHeldDay'
                  : 'jp.form.ordinaryFilingDay',
              ).replace(
                '{date}',
                (ordinaryDays.held
                  ? ordinaryDays.statusDate
                  : ordinaryDays.date) ?? t('jp.form.unknown'),
              )}
            </p>
          )}
          {fields.length ? (
            <EvidenceFields
              fields={fields.filter(
                (field) =>
                  (field.name !== 'alreadyDeparted' ||
                    departure?.askIfDeparted ||
                    errors['jp-travel-deemed-departureOn'] ===
                      'jp.error.futureFact') &&
                  (field.name !== 'declaredIntentAtDeparture' ||
                    departure?.departed),
              )}
              prefix={'jp-' + group + '-' + route.route}
              values={route}
              displayValues={group === 'travel' ? reentry[index] : route}
              errors={errors}
              change={(key, value) =>
                setRoutes(
                  group,
                  routes[group].map((r) => {
                    if (r.route !== route.route) return r;
                    if (
                      r.route === 'ordinary' ||
                      r.route === 'deemed' ||
                      r.route === 'refugee-travel-document'
                    )
                      return editTravelField(
                        draft,
                        r,
                        key,
                        value,
                        reentry[index],
                      );
                    return updateAnswer(r, key, value);
                  }),
                  { route: route.route, field: key },
                )
              }
            />
          ) : (
            <p>{t('jp.form.noExtra')}</p>
          )}
          {departure?.date && !departure.departed && (
            <p>{t(departure.hint).replace('{date}', departure.date)}</p>
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
          {draft.tripsForReentryOnly !== undefined && (
            <div className={form.checkboxes}>
              <label>
                <input
                  type="checkbox"
                  checked={draft.tripsForReentryOnly}
                  onChange={(event) =>
                    update({ tripsForReentryOnly: event.target.checked })
                  }
                />
                {t('jp.form.reentryOnlyHistory')}
              </label>
            </div>
          )}
          <EvidenceFields
            fields={[tripList]}
            values={{ trips: active.trips }}
            displayValues={{ trips }}
            prefix="jp"
            errors={errors}
            change={(_, value, row) => {
              const next = value as typeof trips;
              saveTravel(
                row
                  ? editJapanTripAnswer(next, active.reentry, {
                      history: next[row.index],
                      field: row.field,
                    })
                  : { trips: next, reentry: active.reentry },
              );
            }}
          />
        </>
      )}
      {draft.step >= 2 && draft.step <= 5 && (
        <p>
          {t('jp.form.residenceFilingDay').replace(
            '{date}',
            residenceDay ?? t('jp.form.unknown'),
          )}
        </p>
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
