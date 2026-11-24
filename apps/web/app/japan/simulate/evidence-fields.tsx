'use client';

import { japanFull2026_11 } from '@uk-immigration/policy-data';
import { Field } from '../../simulate/field';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { JapanField } from '../../../lib/japan-fields';
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
  fields: JapanField[];
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
}: FieldsProps & { field: JapanField }) {
  const { t } = useTranslation();
  const id = prefix + '-' + field.name;
  const answers = values as Record<string, unknown>;
  const value = answers[field.name];
  const set = (next: unknown) => change(field.name, next);
  const label = t(`jp.field.${field.label}`).replace(
    '{date}',
    japanFull2026_11.values.longestPeriod.value.transitionOn,
  );
  const hint = field.hint && t(`jp.form.${field.hint}`);
  const nested = (
    definitions: JapanField[],
    record: object,
    key: string,
    replace: (next: object) => void,
  ) => (
    <EvidenceFields
      fields={definitions}
      values={record}
      prefix={key}
      errors={errors}
      change={(name, answer) => {
        let updated = updateAnswer(record, name, answer);
        if (
          field.name === 'status' &&
          name === 'kind' &&
          answer !== 'businessManager'
        )
          updated = updateAnswer(updated, 'businessManager', undefined);
        replace(updated);
      }}
    />
  );
  if (field.type === 'group') {
    const record = (value ?? {}) as object;
    // Status-specific evidence is relevant only for the Business Manager category.
    if (field.name === 'businessManager' && answers.kind !== 'businessManager')
      return null;
    return (
      <fieldset className={form.entry}>
        <legend>{label}</legend>
        {field.fields.some((child) => child.required) && (
          <p className={form.hint}>{t('jp.form.optionalGroup')}</p>
        )}
        {nested(field.fields, record, id, (next) =>
          set(Object.keys(next).length ? next : undefined),
        )}
      </fieldset>
    );
  }
  if (field.type === 'list') {
    const rows = (value ?? []) as object[];
    const requiredList = field.name === 'trips';
    const supportsUnknown = !requiredList && field.name !== 'excluded';
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        {rows.map((row, i) => (
          <fieldset key={i} className={form.entry}>
            <legend>
              {label} {i + 1}
            </legend>
            {nested(field.fields, row, id + '-' + i, (next) =>
              set(rows.map((old, index) => (index === i ? next : old))),
            )}
            <button
              type="button"
              className={form.remove}
              onClick={() =>
                set(
                  supportsUnknown && rows.length === 1
                    ? undefined
                    : rows.filter((_, index) => index !== i),
                )
              }
            >
              {t('jp.form.remove')}
            </button>
          </fieldset>
        ))}
        {supportsUnknown && Array.isArray(value) && !rows.length && (
          <p>{t('jp.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...rows, {}])}
          >
            {t('jp.form.add')} · {label}
          </button>
          {supportsUnknown && !rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'jp.form.noRecords'
                  : 'jp.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }
  const props = {
    id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby':
      [hint && id + '-hint', errors[id] && id + '-error']
        .filter(Boolean)
        .join(' ') || undefined,
  };
  const required = !!field.required;
  const marked = label + (required ? ' *' : '');
  if (field.type === 'boolean' || field.type === 'choice') {
    const isBool = field.type === 'boolean';
    const selected =
      value === true ? 'yes' : value === false ? 'no' : String(value ?? '');
    return (
      <Field id={id} label={marked} hint={hint} error={errors[id]}>
        <select
          {...props}
          required={required}
          value={selected}
          onChange={(event) => {
            const answer = event.target.value;
            set(answer === '' ? undefined : isBool ? answer === 'yes' : answer);
          }}
        >
          <option value="">
            {t(required ? 'jp.form.choose' : 'jp.form.unknown')}
          </option>
          {field.type !== 'choice' ? (
            <>
              <option value="yes">{t('jp.form.yes')}</option>
              <option value="no">{t('jp.form.no')}</option>
            </>
          ) : (
            field.options.map((option) => (
              <option key={option} value={option}>
                {t(`jp.option.${option}`)}
              </option>
            ))
          )}
        </select>
      </Field>
    );
  }
  const isNumber =
    field.type === 'number' ||
    field.type === 'integer' ||
    field.type === 'period';
  const alternative =
    field.type === 'status-date'
      ? ({ value: 'none', label: 'jp.form.noneYet' } as const)
      : field.type === 'period'
        ? ({ value: 'indefinite', label: 'jp.form.indefinite' } as const)
        : field.type === 'notice'
          ? ({ value: null, label: 'jp.form.noNotice' } as const)
          : undefined;
  const usesAlternative = !!alternative && alternative.value === value;
  return (
    <>
      <Field id={id} label={marked} hint={hint} error={errors[id]}>
        <input
          {...props}
          type={isNumber ? 'number' : 'date'}
          min={isNumber ? 0 : undefined}
          step={isNumber ? (field.type === 'number' ? 'any' : 1) : undefined}
          required={required && !usesAlternative}
          disabled={usesAlternative}
          value={usesAlternative ? '' : String(value ?? '')}
          onChange={(event) => {
            const text = event.target.value;
            set(text === '' ? undefined : isNumber ? Number(text) : text);
          }}
        />
      </Field>
      {alternative && (
        <div className={form.checkboxes}>
          <label>
            <input
              type="checkbox"
              checked={usesAlternative}
              onChange={(event) =>
                set(event.target.checked ? alternative.value : undefined)
              }
            />
            {t(alternative.label)}
          </label>
        </div>
      )}
      {field.name === 'newStatusStart' && !!answers.statusStart && (
        <button
          type="button"
          className={form.copyRow}
          onClick={() => set(answers.statusStart)}
        >
          {t('jp.form.sameStart')}
        </button>
      )}
    </>
  );
}
