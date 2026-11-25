'use client';

import { portugal2026_11 } from '@uk-immigration/policy-data';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import { fieldShown, type PortugalField } from '../../../lib/portugal-fields';
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

interface FieldsProps {
  fields: PortugalField[];
  values: object;
  prefix: string;
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
  errors,
  change,
}: FieldsProps & { field: PortugalField }) {
  const { t } = useTranslation();
  if (!fieldShown(field, values)) return null;
  const id = `${prefix}-${field.name}`;
  const value = (values as Record<string, unknown>)[field.name];
  const set = (next: unknown) => change(field.name, next);
  const label = t(`pt.field.${field.label}`);
  const hint =
    field.hint &&
    t(`pt.hint.${field.hint}`).replace(
      '{lawInForce}',
      portugal2026_11.values.lawInForce.value,
    );
  const error = errors[id];
  const nested = (
    record: Record<string, unknown>,
    key: string,
    replace: (next: Record<string, unknown>) => void,
  ) =>
    field.type === 'group' || field.type === 'list' ? (
      <EvidenceFields
        fields={field.fields}
        values={record}
        prefix={key}
        errors={errors}
        change={(name, answer) => replace(updateAnswer(record, name, answer))}
      />
    ) : null;

  if (field.type === 'group') {
    const record = (value ?? {}) as Record<string, unknown>;
    return (
      <fieldset className={form.entry}>
        <legend>{label}</legend>
        {nested(record, id, (next) =>
          set(Object.keys(next).length ? next : undefined),
        )}
      </fieldset>
    );
  }
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
            {nested(row, `${id}-${i}`, (next) =>
              set(rows.map((old, index) => (index === i ? next : old))),
            )}
            <button
              type="button"
              className={form.remove}
              onClick={() =>
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
          <p>{t('pt.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...rows, {}])}
          >
            {t('pt.form.add')} · {label}
          </button>
          {!rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'pt.form.noRecords'
                  : 'pt.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }
  if (field.type === 'multi') {
    const selected = (value ?? []) as string[];
    return (
      <fieldset
        id={id}
        tabIndex={-1}
        className={form.fieldset}
        aria-describedby={error ? `${id}-hint ${id}-error` : `${id}-hint`}
      >
        <legend className={form.legend}>{label}</legend>
        <p id={`${id}-hint`} className={form.hint}>
          {t('pt.form.multiHint')}
        </p>
        {error && (
          <p id={`${id}-error`} className={form.error}>
            {t(error)}
          </p>
        )}
        <div className={form.checkboxes}>
          {field.options.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option);
                  set(next.length ? next : undefined);
                }}
              />
              {t(`pt.option.${field.set}.${option}` as TranslationKey)}
            </label>
          ))}
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
  if (field.type === 'boolean' || field.type === 'choice') {
    const selected =
      value === true ? 'yes' : value === false ? 'no' : String(value ?? '');
    const options =
      field.type === 'choice'
        ? field.options.map((option) => [
            option,
            t(`pt.option.${field.set}.${option}` as TranslationKey),
          ])
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
  // Percentages are stored as fractions, as the engine compares them.
  const shown =
    typeof value === 'number' && field.type === 'percent'
      ? Math.round(value * 10000) / 100
      : value;
  return (
    <Field id={id} label={marked} hint={hint} error={error}>
      <input
        {...props}
        type={isNumber ? 'number' : 'date'}
        min={isNumber ? 0 : undefined}
        max={field.type === 'percent' ? 100 : undefined}
        step={isNumber ? (field.type === 'integer' ? 1 : 'any') : undefined}
        required={required}
        value={String(shown ?? '')}
        onChange={(event) => {
          const text = event.target.value;
          set(
            text === ''
              ? undefined
              : !isNumber
                ? text
                : field.type === 'percent'
                  ? Number(text) / 100
                  : Number(text),
          );
        }}
      />
    </Field>
  );
}
