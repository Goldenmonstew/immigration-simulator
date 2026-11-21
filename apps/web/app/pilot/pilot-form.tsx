'use client';

import type { Ref } from 'react';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import { punct } from '../../i18n/punctuation';
import { Field } from '../simulate/field';
import form from '../simulate/form.module.css';
import site from '../site.module.css';

// Form pieces shared by the country pilot pages.

export type PilotErrors = Partial<Record<string, TranslationKey>>;

export function PilotDate({
  id,
  label,
  value,
  onChange,
  hint,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: TranslationKey;
}) {
  return (
    <Field id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint && `${id}-hint`, error && `${id}-error`]
            .filter(Boolean)
            .join(' ') || undefined
        }
      />
    </Field>
  );
}

/** The error list above a form; each item links to its field. */
export function PilotErrorSummary({
  errors,
  title,
  label,
  summaryRef,
}: {
  errors: PilotErrors;
  title: string;
  label: (id: string) => string;
  summaryRef: Ref<HTMLDivElement>;
}) {
  const { t, locale } = useTranslation();
  const p = punct(locale);
  if (Object.keys(errors).length === 0) return null;
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      className={form.errorSummary}
    >
      <p>{title}</p>
      <ul>
        {Object.entries(errors).map(([id, key]) => (
          <li key={id}>
            <a href={`#${id}`}>
              {label(id)}
              {p.colon}
              {key && t(key)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Rows of dates, such as trips: one fieldset per row with a remove button.
 * Field ids are `${prefix}-${row}-${field}`.
 */
export function PilotDateRows<Row extends Record<keyof Row, string>>({
  prefix,
  rows,
  fields,
  legend,
  addLabel,
  removeLabel,
  empty,
  errors,
  onChange,
  onRemove,
}: {
  prefix: string;
  rows: Row[];
  fields: { key: keyof Row & string; label: string }[];
  legend: (n: number) => string;
  addLabel: string;
  removeLabel: string;
  empty: () => Row;
  errors: PilotErrors;
  onChange: (rows: Row[]) => void;
  /** Row errors are keyed by index, so a removal makes them stale. */
  onRemove: () => void;
}) {
  return (
    <>
      {rows.map((row, i) => (
        <fieldset key={i} className={form.entry}>
          <legend>{legend(i + 1)}</legend>
          {fields.map(({ key, label }) => {
            const id = `${prefix}-${i}-${key}`;
            return (
              <PilotDate
                key={key}
                id={id}
                label={label}
                value={row[key]}
                onChange={(value) =>
                  onChange(
                    rows.map((r, n) => (n === i ? { ...r, [key]: value } : r)),
                  )
                }
                error={errors[id]}
              />
            );
          })}
          <button
            type="button"
            className={form.remove}
            onClick={() => {
              onRemove();
              onChange(rows.filter((_, n) => n !== i));
            }}
          >
            {removeLabel}
          </button>
        </fieldset>
      ))}
      <div className={form.field}>
        <button
          type="button"
          className={site.secondary}
          onClick={() => onChange([...rows, empty()])}
        >
          {addLabel}
        </button>
      </div>
    </>
  );
}
