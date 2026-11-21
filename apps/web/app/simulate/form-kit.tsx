'use client';

import { Field } from './field';
import { useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type {
  ImmigrationBreach,
  ImmigrationEpisode,
  PersonTimeline,
} from '@uk-immigration/engine';
import { useTranslation } from '../../i18n/locale';
import { punct } from '../../i18n/punctuation';
import {
  activePersonDraft,
  assessesSettledWorkerPartner,
  createDraft,
  currentEpisode,
  hasFamilyPartnerFiveYear,
  needsPrincipal,
  stepSequence,
  draftReducer,
  runSimulation,
  shortCircuitKeys,
  validateStep,
} from '../../lib/questionnaire';
import type { Draft, Errors, ScreeningKey } from '../../lib/questionnaire';
import { draftStorage, rememberResult } from '../../lib/storage';
import styles from './form.module.css';

export function useFormKit() {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  const router = useRouter();
  const [draft, dispatch] = useReducer(draftReducer, undefined, createDraft);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [compactRoutes, setCompactRoutes] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const active = activePersonDraft(draft);
  const { timeline } = active;
  const familyPartnerFiveYear = hasFamilyPartnerFiveYear(timeline);
  const current = currentEpisode(active);
  const protectionMain =
    current?.role === 'MAIN' &&
    [
      'CORE_PROTECTION',
      'PROTECTION_WORK_AND_STUDY',
      'SAFE_AND_LEGAL',
      'LEGACY_SAFE_AND_LEGAL',
    ].includes(current.route);
  const editingPrincipal = draft.principalStep !== undefined;
  const sequence = stepSequence(draft);
  const position = sequence.indexOf(active.step);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    const update = () => setCompactRoutes(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const stored = draftStorage();
    if (stored.draft)
      dispatch({
        type: 'restore',
        draft: stored.draft,
      });
    setStorageAvailable(stored.available);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) setStorageAvailable(draftStorage(draft).available);
  }, [draft, ready]);

  useEffect(() => {
    if (ready) heading.current?.focus();
  }, [draft.step, draft.principalStep, ready]);

  const update = (patch: Partial<PersonTimeline>) =>
    dispatch({ type: 'timeline', patch });
  const fieldProps = (id: string, hasHint = false) => ({
    id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby':
      [hasHint ? `${id}-hint` : '', errors[id] ? `${id}-error` : '']
        .filter(Boolean)
        .join(' ') || undefined,
  });
  const amount = (value: string) => (value === '' ? undefined : Number(value));
  const goTo = (step: number) => {
    setErrors({});
    dispatch({ type: 'step', step });
  };
  const finish = (value: Draft) => {
    const completed = { ...value, completed: true };
    const result = runSimulation(completed, locale);
    setStorageAvailable(draftStorage(completed).available);
    rememberResult(result, locale);
    dispatch({ type: 'restore', draft: completed });
    router.push('/result');
  };
  const screen = (key: ScreeningKey, answer: 'yes' | 'no') => {
    if (
      answer === 'yes' &&
      key === 'criminality' &&
      !independentPartnerScreening
    ) {
      finish(draftReducer(draft, { type: 'screening', key, answer }));
    } else dispatch({ type: 'screening', key, answer });
  };
  const independentPartnerScreening =
    editingPrincipal && assessesSettledWorkerPartner(draft);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (
      active.step === 1 &&
      !independentPartnerScreening &&
      shortCircuitKeys.some((key) => active.screening[key] === 'yes')
    ) {
      finish(draft);
      return;
    }
    const nextErrors = validateStep(active);
    if (active.step === 4 && familyPartnerFiveYear && errors['cash-savings'])
      nextErrors['cash-savings'] = errors['cash-savings'];
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() =>
        document.getElementById(Object.keys(nextErrors)[0])?.focus(),
      );
      return;
    }
    if (position === sequence.length - 1) {
      if (editingPrincipal)
        dispatch({ type: 'principal-return', completed: true });
      else if (needsPrincipal(draft) && !draft.principalCompleted) goTo(9);
      else finish(draft);
    } else goTo(sequence[position + 1]);
  };
  const updateEpisode = (index: number, patch: Partial<ImmigrationEpisode>) =>
    dispatch({ type: 'episode', index, patch });
  const updateBreach = (index: number, patch: Partial<ImmigrationBreach>) =>
    update({
      immigrationBreaches: timeline.immigrationBreaches.map((breach, i) =>
        i === index ? { ...breach, ...patch } : breach,
      ),
    });
  const dateField = (
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    required = false,
  ) => (
    <Field id={id} label={label} error={errors[id]}>
      <input
        {...fieldProps(id)}
        type="date"
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
  const remove = (label: string, onClick: () => void) => (
    <button
      type="button"
      className={styles.remove}
      aria-label={`${t('form.remove')} ${label}`}
      onClick={onClick}
    >
      {t('form.remove')} {label}
    </button>
  );

  return {
    t,
    locale,
    p,
    router,
    draft,
    dispatch,
    ready,
    setReady,
    storageAvailable,
    setStorageAvailable,
    errors,
    setErrors,
    compactRoutes,
    setCompactRoutes,
    heading,
    active,
    timeline,
    familyPartnerFiveYear,
    current,
    protectionMain,
    editingPrincipal,
    sequence,
    position,
    update,
    fieldProps,
    amount,
    goTo,
    finish,
    screen,
    submit,
    updateEpisode,
    updateBreach,
    dateField,
    remove,
  };
}

export type FormKit = ReturnType<typeof useFormKit>;
