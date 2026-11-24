'use client';

import { Field } from '../../simulate/field';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { SpainField } from '../../../lib/spain-fields';
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
  fields: SpainField[];
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
}: FieldsProps & { field: SpainField }) {
  const { t } = useTranslation();
  const id = prefix + '-' + field.name;
  const answers = values as Record<string, unknown>;
  const value = answers[field.name];
  if (field.name === 'marriedToSpaniard' && answers.route !== 'marriage')
    return null;
  const set = (next: unknown) => change(field.name, next);
  const label = t(`es.field.${field.label}`);
  const hint = field.hint && t(`es.form.${field.hint}`);

  if (field.type === 'group') {
    const record = (value ?? {}) as object;
    return (
      <fieldset className={form.entry}>
        <legend>{label}</legend>
        {field.fields.some((child) => child.required) && (
          <p className={form.hint}>{t('es.form.optionalGroup')}</p>
        )}
        <EvidenceFields
          fields={field.fields}
          values={record}
          prefix={id}
          errors={errors}
          change={(name, answer) => {
            const next = updateAnswer(record, name, answer);
            set(Object.keys(next).length ? next : undefined);
          }}
        />
      </fieldset>
    );
  }

  if (field.type === 'list') {
    const rows = (value ?? []) as object[];
    const supportsUnknown = field.supportsUnknown !== false;
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        {rows.map((row, i) => (
          <fieldset key={i} className={form.entry}>
            <legend>
              {label} {i + 1}
            </legend>
            <EvidenceFields
              fields={field.fields}
              values={row}
              prefix={id + '-' + i}
              errors={errors}
              change={(name, answer) => {
                const updated = updateAnswer(row, name, answer);
                set(rows.map((old, index) => (index === i ? updated : old)));
              }}
            />
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
              {t('es.form.remove')}
            </button>
          </fieldset>
        ))}
        {supportsUnknown && Array.isArray(value) && !rows.length && (
          <p>{t('es.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...rows, {}])}
          >
            {t('es.form.add')} · {label}
          </button>
          {supportsUnknown && !rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'es.form.noRecords'
                  : 'es.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'date-list') {
    const dates = (value ?? []) as string[];
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        {dates.map((item, i) => (
          <div key={i} className={form.entry}>
            <Field
              id={`${id}-${i}`}
              label={`${label} ${i + 1}`}
              error={errors[`${id}-${i}`]}
            >
              <input
                id={`${id}-${i}`}
                aria-invalid={errors[`${id}-${i}`] ? true : undefined}
                aria-describedby={
                  errors[`${id}-${i}`] ? `${id}-${i}-error` : undefined
                }
                type="date"
                value={item}
                onChange={(event) =>
                  set(
                    dates.map((old, index) =>
                      index === i ? event.target.value : old,
                    ),
                  )
                }
              />
            </Field>
            <button
              type="button"
              className={form.remove}
              onClick={() =>
                set(
                  dates.length === 1
                    ? undefined
                    : dates.filter((_, index) => index !== i),
                )
              }
            >
              {t('es.form.remove')}
            </button>
          </div>
        ))}
        {Array.isArray(value) && !dates.length && (
          <p>{t('es.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...dates, ''])}
          >
            {t('es.form.add')} · {label}
          </button>
          {!dates.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'es.form.noRecords'
                  : 'es.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'multi-choice') {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const { supportsUnknown } = field;
    return (
      <fieldset id={id} className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        <div className={form.checkboxes}>
          {field.options.map((option) => {
            const checked = selected.includes(option);
            return (
              <label key={option}>
                <input
                  type="checkbox"
                  id={`${id}-${option}`}
                  checked={checked}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option);
                    set(
                      next.length ? next : supportsUnknown ? [] : undefined,
                    );
                  }}
                />
                {t(`es.option.${option}`)}
              </label>
            );
          })}
        </div>
        {supportsUnknown && Array.isArray(value) && !selected.length && (
          <p>{t('es.form.emptyConfirmed')}</p>
        )}
        {supportsUnknown && !selected.length && (
          <div className={site.actions}>
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'es.form.noRecords'
                  : 'es.form.resetRecords',
              )}
            </button>
          </div>
        )}
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
  const required =
    !!field.required ||
    (!!field.requiredWith && answers[field.requiredWith] !== undefined);
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
            {t(required ? 'es.form.choose' : 'es.form.unknown')}
          </option>
          {field.type !== 'choice' ? (
            <>
              <option value="yes">{t('es.form.yes')}</option>
              <option value="no">{t('es.form.no')}</option>
            </>
          ) : (
            field.options.map((option) => (
              <option key={option} value={option}>
                {t(`es.option.${option}`)}
              </option>
            ))
          )}
        </select>
      </Field>
    );
  }

  const isNumber = field.type === 'number' || field.type === 'integer';
  return (
    <Field id={id} label={marked} hint={hint} error={errors[id]}>
      <input
        {...props}
        type={isNumber ? 'number' : 'date'}
        min={isNumber ? (field.min ?? 0) : undefined}
        step={isNumber ? (field.type === 'number' ? 'any' : 1) : undefined}
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
