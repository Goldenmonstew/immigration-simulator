'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import type { TranslationKey } from '../i18n';
import { useTranslation } from '../i18n/locale';
import type { CountryDraft, CountryModule } from '../lib/country-module';
import { countryPath } from '../lib/site-countries';
import { draftStorage } from '../lib/storage';
import site from '../app/site.module.css';
import form from '../app/simulate/form.module.css';

type Errors = Record<string, TranslationKey>;

export function QuestionnaireShell<D extends CountryDraft, K>({
  country,
  steps,
  children,
}: {
  country: CountryModule<D, K>;
  steps: (draft: D) => { step: number; title: TranslationKey }[];
  children: (props: {
    draft: D;
    update: (patch: Partial<D>) => void;
    errors: Errors;
  }) => ReactNode;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [draft, setDraft] = useState<D>();
  const [available, setAvailable] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const stored = draftStorage(country);
    const restored = country.decodeDraft(stored.draft);
    const next = restored ?? country.createDraft();
    // Reopening a result starts at the first step for editing.
    const visible = steps(next);
    setDraft(
      next.completed || !visible.some(({ step }) => step === next.step)
        ? { ...next, step: visible[0].step }
        : next,
    );
    setAvailable(stored.available);
  }, [country, steps]);

  useEffect(() => {
    if (draft) setAvailable(draftStorage(country, draft).available);
  }, [country, draft]);
  useEffect(() => {
    heading.current?.focus();
  }, [draft?.step]);

  if (!draft)
    return (
      <main id="main" className={site.main}>
        <p role="status">{t('result.loading')}</p>
      </main>
    );

  const sequence = steps(draft);
  const position = sequence.findIndex(({ step }) => step === draft.step);
  const last = position === sequence.length - 1;
  const goTo = (step: number) => {
    setErrors({});
    setDraft({ ...draft, step });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    // Recheck earlier steps on completion, including restored drafts.
    const toCheck = last ? sequence : [sequence[position]];
    for (const { step } of toCheck) {
      const issues = country.validateStep({ ...draft, step });
      const first = Object.keys(issues)[0];
      if (first) {
        setErrors(issues);
        if (step !== draft.step) setDraft({ ...draft, step });
        requestAnimationFrame(() => document.getElementById(first)?.focus());
        return;
      }
    }
    if (!last) {
      goTo(sequence[position + 1].step);
      return;
    }
    const completed = { ...draft, completed: true };
    draftStorage(country, completed);
    router.push(countryPath(country.id, 'result'));
  };
  return (
    <main id="main" className={site.main}>
      <div className={site.narrow}>
        <p id="form-progress-label" className={form.progress}>
          {t('form.step')} {position + 1} {t('form.of')} {sequence.length}
        </p>
        <div
          className={form.stepProgress}
          role="progressbar"
          aria-labelledby="form-progress-label"
          aria-valuemin={0}
          aria-valuemax={sequence.length}
          aria-valuenow={position + 1}
        >
          <span
            style={{ width: `${((position + 1) / sequence.length) * 100}%` }}
          />
        </div>
        <h1 ref={heading} tabIndex={-1}>
          {t(sequence[position].title)}
        </h1>
        <p role="status" className={available ? form.saved : site.notice}>
          {t(available ? 'form.saved' : 'form.storageUnavailable')}
        </p>
        <form onSubmit={submit} noValidate autoComplete="off">
          {Object.keys(errors).length > 0 && (
            <p role="alert" className={form.errorSummary}>
              {t('form.fixErrors')}
            </p>
          )}
          {children({
            draft,
            errors,
            update: (patch) =>
              setDraft({ ...draft, ...patch, completed: false }),
          })}
          <div className={site.actions}>
            <button className={site.button} type="submit">
              {t(last ? 'form.results' : 'form.continue')}
            </button>
            {position > 0 ? (
              <button
                className={site.secondary}
                type="button"
                onClick={() => goTo(sequence[position - 1].step)}
              >
                {t('form.back')}
              </button>
            ) : (
              <Link href={countryPath(country.id)}>{t('site.home')}</Link>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
