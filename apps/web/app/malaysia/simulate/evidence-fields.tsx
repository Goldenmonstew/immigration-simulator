'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import {
  MY_NATIONALITIES,
  fieldShown,
  type MalaysiaField,
  type MyScope,
} from '../../../lib/malaysia-fields';
import { Field } from '../../simulate/field';
import form from '../../simulate/form.module.css';
import site from '../../site.module.css';

export function updateAnswer<T extends object>(
  record: T,
  name: string,
  value: unknown,
): T {
  const next = { ...record, [name]: value };
  if (value === undefined) delete (next as Record<string, unknown>)[name];
  return next;
}

// Countries by name in the page language, then "stateless".
function nationalityOptions(locale: string, stateless: string) {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  return MY_NATIONALITIES.map(
    (code) =>
      [
        code,
        code === 'stateless' ? stateless : (names.of(code) ?? code),
      ] as const,
  ).sort((a, b) =>
    a[0] === 'stateless'
      ? 1
      : b[0] === 'stateless'
        ? -1
        : a[1].localeCompare(b[1], locale),
  );
}

interface FieldsProps {
  fields: MalaysiaField[];
  values: object;
  prefix: string;
  scope: MyScope;
  errors: Record<string, TranslationKey>;
  change: (name: string, value: unknown) => void;
}

export function EvidenceFields(props: FieldsProps) {
  return props.fields.map((field) => (
    <Question key={field.name} {...props} field={field} />
  ));
}

function Question({
  field,
  values,
  prefix,
  scope,
  errors,
  change,
}: FieldsProps & { field: MalaysiaField }) {
  const { t, locale } = useTranslation();
  if (!fieldShown(field, values, scope)) return null;
  const id = `${prefix}-${field.name}`;
  const value = (values as Record<string, unknown>)[field.name];
  const set = (next: unknown) => change(field.name, next);
  const label = t(`my.field.${field.label}`);
  const hint = field.hint && t(`my.hint.${field.hint}`);
  const error = errors[id];

  if (field.type === 'list') {
    const rows = (value ?? []) as Record<string, unknown>[];
    const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
      .filter(Boolean)
      .join(' ');
    return (
      <fieldset
        id={id}
        tabIndex={-1}
        className={form.fieldset}
        aria-describedby={describedBy || undefined}
      >
        <legend className={form.legend}>
          {label}
          {field.required ? ' *' : ''}
        </legend>
        {hint && (
          <p id={`${id}-hint`} className={form.hint}>
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className={form.error}>
            {t(error)}
          </p>
        )}
        {rows.map((row, i) => (
          <fieldset key={i} className={form.entry}>
            <legend>
              {label} {i + 1}
            </legend>
            <EvidenceFields
              fields={field.fields}
              values={row}
              prefix={`${id}-${i}`}
              scope={scope}
              errors={errors}
              change={(name, answer) =>
                set(
                  rows.map((old, index) =>
                    index === i ? updateAnswer(row, name, answer) : old,
                  ),
                )
              }
            />
            <button
              type="button"
              className={form.remove}
              onClick={() =>
                // Removing the last row returns the list to unanswered.
                set(
                  rows.length === 1
                    ? undefined
                    : rows.filter((_, index) => index !== i),
                )
              }
            >
              {t('form.remove')}
            </button>
          </fieldset>
        ))}
        {Array.isArray(value) && !rows.length && (
          <p>{t('my.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...rows, {}])}
          >
            {t('my.form.add')} · {label}
          </button>
          {!rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'my.form.noRecords'
                  : 'my.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }
  const props = {
    id,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby':
      [hint && `${id}-hint`, error && `${id}-error`]
        .filter(Boolean)
        .join(' ') || undefined,
  };
  const required = !!field.required;
  const marked = label + (required ? ' *' : '');
  if (
    field.type !== 'date' &&
    field.type !== 'number' &&
    field.type !== 'integer'
  ) {
    const selected =
      value === true ? 'yes' : value === false ? 'no' : String(value ?? '');
    const options =
      field.type === 'choice'
        ? field.options.map((option) => [
            option,
            t(`my.option.${field.set}.${option}` as TranslationKey),
          ])
        : field.type === 'country'
          ? nationalityOptions(locale, t('my.form.stateless'))
          : [
              ['yes', t('form.yes')],
              ['no', t('form.no')],
            ];
    return (
      <Field id={id} label={marked} hint={hint} error={error}>
        <select
          {...props}
          required={required}
          value={selected}
          onChange={(event) => {
            const answer = event.target.value;
            set(
              answer === ''
                ? undefined
                : field.type === 'boolean'
                  ? answer === 'yes'
                  : answer,
            );
          }}
        >
          <option value="">
            {t(required ? 'form.choose' : 'form.unknown')}
          </option>
          {options.map(([option, text]) => (
            <option key={option} value={option}>
              {text}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  const isNumber = field.type !== 'date';
  return (
    <Field id={id} label={marked} hint={hint} error={error}>
      <input
        {...props}
        type={isNumber ? 'number' : 'date'}
        min={isNumber ? 0 : undefined}
        step={isNumber ? (field.type === 'integer' ? 1 : 'any') : undefined}
        required={required}
        value={String(value ?? '')}
        onChange={(event) => {
          const text = event.target.value;
          set(text === '' ? undefined : isNumber ? Number(text) : text);
        }}
      />
    </Field>
  );
}
