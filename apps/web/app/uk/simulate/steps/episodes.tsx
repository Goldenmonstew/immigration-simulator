'use client';

import {
  resettlementSchemeNames,
  sustainedActivityNames,
} from '@uk-immigration/policy-data';
import type { ImmigrationEpisode, Route } from '@uk-immigration/engine';
import { routeLabel, routeNames } from '../../../../i18n/routes';
import site from '../../../site.module.css';
import styles from '../../../simulate/form.module.css';
import type { FormKit } from '../form-kit';
import { Field } from '../../../simulate/field';
import { sourceUrls } from '../../../../lib/sources';

export function EpisodesStep({ form }: { form: FormKit }) {
  const {
    t,
    locale,
    errors,
    compactRoutes,
    timeline,
    update,
    fieldProps,
    amount,
    updateEpisode,
    dateField,
    remove,
  } = form;
  return (
    <>
      <p>{t('episodes.hint')}</p>
      {!timeline.episodes.length && (
        <p className={site.muted}>{t('episodes.empty')}</p>
      )}
      {timeline.episodes.map((episode, index) => {
        const prefix = `episode-${index}`;
        const innovatorFounder =
          episode.route === 'INNOVATOR_FOUNDER' && episode.role === 'MAIN';
        return (
          <fieldset key={index} className={styles.entry}>
            <legend>
              {t('episodes.item')} {index + 1}
            </legend>
            <Field id={`${prefix}-route`} label={t('episodes.route')}>
              <select
                id={`${prefix}-route`}
                value={episode.route}
                onChange={(event) =>
                  updateEpisode(index, {
                    route: event.target.value as Route,
                  })
                }
              >
                {Object.entries(routeNames).map(([route, name]) => (
                  <option key={route} value={route}>
                    {routeLabel(name, locale, compactRoutes)}
                  </option>
                ))}
              </select>
            </Field>
            {dateField(
              `${prefix}-from`,
              t('episodes.from'),
              episode.validFrom,
              (validFrom) => updateEpisode(index, { validFrom }),
            )}
            {dateField(
              `${prefix}-to`,
              t('episodes.to'),
              episode.validTo,
              (validTo) => updateEpisode(index, { validTo }),
            )}
            <Field
              id={`${prefix}-role`}
              label={t('episodes.role')}
              hint={t('episodes.roleHint')}
            >
              <select
                id={`${prefix}-role`}
                value={episode.role}
                onChange={(event) =>
                  updateEpisode(index, {
                    role: event.target.value as ImmigrationEpisode['role'],
                  })
                }
              >
                <option value="MAIN">{t('episodes.MAIN')}</option>
                <option value="DEPENDANT">{t('episodes.DEPENDANT')}</option>
              </select>
            </Field>
            {episode.role === 'DEPENDANT' && (
              <Field
                id={`${prefix}-dependantOf`}
                label={t('episodes.dependantOf')}
                error={errors[`${prefix}-dependantOf`]}
              >
                <select
                  {...fieldProps(`${prefix}-dependantOf`)}
                  required
                  value={episode.dependantOf ?? ''}
                  onChange={(event) =>
                    updateEpisode(index, {
                      dependantOf: (event.target.value ||
                        undefined) as ImmigrationEpisode['dependantOf'],
                    })
                  }
                >
                  <option value="">{t('form.choose')}</option>
                  <option value="PARTNER">
                    {t('episodes.partnerDependant')}
                  </option>
                  <option value="PARENT">{t('episodes.childDependant')}</option>
                  {episode.route === 'HONG_KONG_BNO' && (
                    <option value="RELATIVE">
                      {t('episodes.relativeDependant')}
                    </option>
                  )}
                </select>
              </Field>
            )}
            {episode.route === 'GLOBAL_TALENT' && episode.role === 'MAIN' && (
              <>
                <Field
                  id={`${prefix}-endorsement`}
                  label={t('episodes.globalTalentEndorsement')}
                  hint={t('episodes.globalTalentEndorsementHint')}
                >
                  <select
                    {...fieldProps(`${prefix}-endorsement`, true)}
                    value={episode.globalTalentEndorsement ?? ''}
                    onChange={(event) =>
                      updateEpisode(index, {
                        globalTalentEndorsement: (event.target.value ||
                          undefined) as ImmigrationEpisode['globalTalentEndorsement'],
                        globalTalentCriteria: undefined,
                      })
                    }
                  >
                    <option value="">{t('form.unknown')}</option>
                    {(
                      [
                        'RESEARCH_BODY',
                        'ARTS_COUNCIL_ENGLAND',
                        'TECH_NATION',
                        'PRIZE',
                      ] as const
                    ).map((value) => (
                      <option key={value} value={value}>
                        {t(`episodes.endorsement.${value}`)}
                      </option>
                    ))}
                  </select>
                </Field>
                {(episode.globalTalentEndorsement === 'ARTS_COUNCIL_ENGLAND' ||
                  episode.globalTalentEndorsement === 'TECH_NATION') && (
                  <Field
                    id={`${prefix}-criteria`}
                    label={t('episodes.globalTalentCriteria')}
                  >
                    <select
                      id={`${prefix}-criteria`}
                      value={episode.globalTalentCriteria ?? ''}
                      onChange={(event) =>
                        updateEpisode(index, {
                          globalTalentCriteria: (event.target.value ||
                            undefined) as ImmigrationEpisode['globalTalentCriteria'],
                        })
                      }
                    >
                      <option value="">{t('form.unknown')}</option>
                      <option value="EXCEPTIONAL_TALENT">
                        {t('episodes.criteria.EXCEPTIONAL_TALENT')}
                      </option>
                      <option value="EXCEPTIONAL_PROMISE">
                        {t('episodes.criteria.EXCEPTIONAL_PROMISE')}
                      </option>
                    </select>
                  </Field>
                )}
              </>
            )}
            {episode.route === 'FAMILY_PARTNER_OR_PARENT' &&
              episode.role === 'MAIN' && (
                <Field
                  id={`${prefix}-familyPermission`}
                  label={t('episodes.familyPermission')}
                  hint={
                    episode.familyPermission === 'PARTNER_FIVE_YEAR' ||
                    episode.familyPermission === 'PARTNER_TEN_YEAR'
                      ? t('episodes.familyPermissionHint')
                      : undefined
                  }
                >
                  <select
                    {...fieldProps(
                      `${prefix}-familyPermission`,
                      episode.familyPermission === 'PARTNER_FIVE_YEAR' ||
                        episode.familyPermission === 'PARTNER_TEN_YEAR',
                    )}
                    value={episode.familyPermission ?? ''}
                    onChange={(event) =>
                      updateEpisode(index, {
                        familyPermission: (event.target.value ||
                          undefined) as ImmigrationEpisode['familyPermission'],
                      })
                    }
                  >
                    <option value="">{t('form.unknown')}</option>
                    <option value="PARTNER_FIVE_YEAR">
                      {t('episodes.familyPermission.PARTNER_FIVE_YEAR')}
                    </option>
                    <option value="PARTNER_TEN_YEAR">
                      {t('episodes.familyPermission.PARTNER_TEN_YEAR')}
                    </option>
                    <option value="PARENT">
                      {t('episodes.familyPermission.PARENT')}
                    </option>
                  </select>
                </Field>
              )}
            {innovatorFounder && (
              <Field
                id={`${prefix}-settlement-endorser`}
                label={t('episodes.innovatorSettlementEndorser')}
                hint={t('episodes.innovatorSettlementEndorserHint')}
              >
                <select
                  {...fieldProps(`${prefix}-settlement-endorser`, true)}
                  value={episode.innovatorSettlementEndorser ?? ''}
                  onChange={(event) =>
                    updateEpisode(index, {
                      innovatorSettlementEndorser: (event.target.value ||
                        undefined) as ImmigrationEpisode['innovatorSettlementEndorser'],
                    })
                  }
                >
                  <option value="">{t('form.unknown')}</option>
                  <option value="NON_LEGACY">
                    {t('episodes.innovatorEndorser.NON_LEGACY')}
                  </option>
                  <option value="LEGACY_SAME">
                    {t('episodes.innovatorEndorser.LEGACY_SAME')}
                  </option>
                  <option value="LEGACY_DIFFERENT">
                    {t('episodes.innovatorEndorser.LEGACY_DIFFERENT')}
                  </option>
                </select>
              </Field>
            )}
            {innovatorFounder && (
              <fieldset className={styles.fieldset}>
                <legend className={styles.legend}>
                  {t('episodes.innovatorSettlementCriteria')}
                </legend>
                <div className={styles.checkboxes}>
                  <label>
                    <input
                      id={`${prefix}-innovator-unknown`}
                      type="checkbox"
                      checked={
                        episode.innovatorSettlementCriteria === undefined
                      }
                      onChange={(event) =>
                        updateEpisode(index, {
                          innovatorSettlementCriteria: event.target.checked
                            ? undefined
                            : [],
                        })
                      }
                    />
                    <span>{t('form.unknown')}</span>
                  </label>
                  {episode.innovatorSettlementCriteria !== undefined && (
                    <>
                      <p className={styles.hint}>
                        {t('episodes.innovatorCriteriaHint')}
                      </p>
                      {(
                        [
                          'INVESTMENT',
                          'CUSTOMERS',
                          'RESEARCH_AND_IP',
                          'REVENUE',
                          'EXPORT_REVENUE',
                          'JOBS',
                          'JOBS_WITH_SALARY',
                        ] as const
                      ).map((criterion) => (
                        <label key={criterion}>
                          <input
                            id={`${prefix}-innovator-${criterion}`}
                            type="checkbox"
                            checked={episode.innovatorSettlementCriteria!.includes(
                              criterion,
                            )}
                            onChange={(event) =>
                              updateEpisode(index, {
                                innovatorSettlementCriteria: event.target
                                  .checked
                                  ? [
                                      ...episode.innovatorSettlementCriteria!,
                                      criterion,
                                    ]
                                  : episode.innovatorSettlementCriteria!.filter(
                                      (value) => value !== criterion,
                                    ),
                              })
                            }
                          />
                          <span>
                            {t(`episodes.innovatorCriteria.${criterion}`)}
                          </span>
                        </label>
                      ))}
                      {episode.innovatorSettlementCriteria.length === 0 && (
                        <p>{t('episodes.innovatorCriteriaNone')}</p>
                      )}
                    </>
                  )}
                </div>
              </fieldset>
            )}
            {episode.route === 'FAMILY_AND_PRIVATE_LIFE' &&
              episode.role === 'MAIN' && (
                <Field
                  id={`${prefix}-privateLifeRoute`}
                  label={t('episodes.privateLifeRoute')}
                >
                  <select
                    id={`${prefix}-privateLifeRoute`}
                    value={episode.privateLifeRoute ?? ''}
                    onChange={(event) =>
                      updateEpisode(index, {
                        privateLifeRoute: (event.target.value ||
                          undefined) as ImmigrationEpisode['privateLifeRoute'],
                      })
                    }
                  >
                    <option value="">{t('form.unknown')}</option>
                    {(['CHILD', 'YOUNG_ADULT', 'ADULT'] as const).map(
                      (value) => (
                        <option key={value} value={value}>
                          {t(`episodes.privateLifeRoute.${value}`)}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              )}
            {episode.route === 'SAFE_AND_LEGAL' && (
              <Field
                id={`${prefix}-resettlement`}
                label={t('episodes.resettlementScheme')}
              >
                <select
                  id={`${prefix}-resettlement`}
                  value={episode.resettlementScheme ?? ''}
                  onChange={(event) =>
                    updateEpisode(index, {
                      resettlementScheme: (event.target.value ||
                        undefined) as ImmigrationEpisode['resettlementScheme'],
                    })
                  }
                >
                  <option value="">{t('form.unknown')}</option>
                  {Object.entries(resettlementSchemeNames).map(
                    ([value, name]) => (
                      <option key={value} value={value}>
                        {name[locale]}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            )}
            {episode.route === 'PROTECTION_WORK_AND_STUDY' && (
              <Field
                id={`${prefix}-activity`}
                label={t('episodes.sustainedActivity')}
              >
                <select
                  id={`${prefix}-activity`}
                  value={episode.sustainedActivity ?? ''}
                  onChange={(event) =>
                    updateEpisode(index, {
                      sustainedActivity: (event.target.value ||
                        undefined) as ImmigrationEpisode['sustainedActivity'],
                    })
                  }
                >
                  <option value="">{t('form.unknown')}</option>
                  {Object.entries(sustainedActivityNames).map(
                    ([value, name]) => (
                      <option key={value} value={value}>
                        {name[locale]}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            )}
            {episode.route === 'SKILLED_WORKER' && (
              <>
                <Field
                  id={`${prefix}-soc`}
                  label={t('episodes.soc')}
                  error={errors[`${prefix}-soc`]}
                >
                  <input
                    {...fieldProps(`${prefix}-soc`)}
                    inputMode="numeric"
                    maxLength={4}
                    value={episode.socCode ?? ''}
                    onChange={(event) =>
                      updateEpisode(index, {
                        socCode: event.target.value || undefined,
                      })
                    }
                  />
                </Field>
                <Field
                  id={`${prefix}-salary`}
                  label={t('episodes.salary')}
                  error={errors[`${prefix}-salary`]}
                >
                  <input
                    {...fieldProps(`${prefix}-salary`)}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={episode.salary ?? ''}
                    onChange={(event) =>
                      updateEpisode(index, {
                        salary: amount(event.target.value),
                      })
                    }
                  />
                </Field>
                {episode.role === 'MAIN' && (
                  <Field
                    id={`${prefix}-isl`}
                    label={t('episodes.immigrationSalaryList')}
                    hint={t('episodes.immigrationSalaryListHint')}
                  >
                    <select
                      {...fieldProps(`${prefix}-isl`, true)}
                      value={
                        episode.immigrationSalaryList === undefined
                          ? ''
                          : episode.immigrationSalaryList
                            ? 'yes'
                            : 'no'
                      }
                      onChange={(event) =>
                        updateEpisode(index, {
                          immigrationSalaryList:
                            event.target.value === ''
                              ? undefined
                              : event.target.value === 'yes',
                        })
                      }
                    >
                      <option value="">{t('form.unknown')}</option>
                      <option value="yes">{t('form.yes')}</option>
                      <option value="no">{t('form.no')}</option>
                    </select>
                    <a
                      className={styles.hint}
                      href={sourceUrls['SRC-019']}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('episodes.immigrationSalaryListLink')}
                    </a>
                  </Field>
                )}
              </>
            )}
            {remove(`${t('episodes.item')} ${index + 1}`, () =>
              update({
                episodes: timeline.episodes.filter((_, i) => i !== index),
              }),
            )}
          </fieldset>
        );
      })}
      <button
        type="button"
        className={site.secondary}
        onClick={() =>
          update({
            episodes: [
              ...timeline.episodes,
              {
                route: 'SKILLED_WORKER',
                role: 'MAIN',
                validFrom: '',
                validTo: '',
              },
            ],
          })
        }
      >
        {t('episodes.add')}
      </button>
    </>
  );
}
