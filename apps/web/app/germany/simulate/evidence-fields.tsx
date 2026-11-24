'use client';

import type { DePermitKind } from '@uk-immigration/engine';
import { Field } from '../../simulate/field';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import { endDateRequired } from '../../../lib/germany-draft';
import type { GermanyField } from '../../../lib/germany-fields';
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
  fields: GermanyField[];
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
}: FieldsProps & { field: GermanyField }) {
  const { t } = useTranslation();
  const id = prefix + '-' + field.name;
  const answers = values as Record<string, unknown>;
  if (field.when && !field.when(answers)) return null;
  const value = answers[field.name];
  const set = (next: unknown) => change(field.name, next);
  const label = t(`de.field.${field.label}`);
  const hint = field.hint && t(`de.form.${field.hint}`);

  const nested = (
    definitions: GermanyField[],
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
        const updated = updateAnswer(record, name, answer) as Record<
          string,
          unknown
        >;
        for (const child of definitions) {
          if (child.when && !child.when(updated)) {
            delete updated[child.name];
          }
        }
        replace(updated);
      }}
    />
  );

  if (field.type === 'group') {
    const record = (value ?? {}) as object;
    return (
      <fieldset className={form.entry}>
        <legend>{label}</legend>
        {field.fields.some((child) => child.required) && (
          <p className={form.hint}>{t('de.form.optionalGroup')}</p>
        )}
        {nested(field.fields, record, id, (next) =>
          set(Object.keys(next).length ? next : undefined),
        )}
      </fieldset>
    );
  }

  if (field.type === 'list') {
    const rows = (value ?? []) as object[];
    const requiredList = field.name === 'permits' || field.name === 'trips';
    const supportsUnknown = !requiredList;
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        {hint && <p className={form.hint}>{hint}</p>}
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
              {t('de.form.remove')}
            </button>
          </fieldset>
        ))}
        {supportsUnknown && Array.isArray(value) && !rows.length && (
          <p>{t('de.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() =>
              set([
                ...rows,
                field.name === 'permits' ? { kind: 'skilled' } : {},
              ])
            }
          >
            {t('de.form.add')} · {label}
          </button>
          {(supportsUnknown || value === undefined) && !rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'de.form.noRecords'
                  : 'de.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'choice-list') {
    const items = (value ?? []) as string[];
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        {hint && <p className={form.hint}>{hint}</p>}
        {items.map((item, i) => {
          const itemId = `${id}-${i}`;
          return (
            <div key={i} className={form.entry}>
              <Field id={itemId} label={`${label} ${i + 1}`} error={errors[id]}>
                <select
                  id={itemId}
                  value={item}
                  onChange={(event) =>
                    set(
                      items.map((old, idx) =>
                        idx === i ? event.target.value : old,
                      ),
                    )
                  }
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {t(`de.option.${option}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                className={form.remove}
                onClick={() =>
                  set(
                    items.length === 1
                      ? undefined
                      : items.filter((_, idx) => idx !== i),
                  )
                }
              >
                {t('de.form.remove')}
              </button>
            </div>
          );
        })}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...items, field.options[0]])}
          >
            {t('de.form.add')} · {label}
          </button>
        </div>
      </fieldset>
    );
  }

  if (field.type === 'number-list' || field.type === 'integer-list') {
    const items = (value ?? []) as number[];
    const isInt = field.type === 'integer-list';
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>
          {label}
          {field.required && ' *'}
        </legend>
        {hint && <p className={form.hint}>{hint}</p>}
        {items.map((item, i) => {
          const itemId = `${id}-${i}`;
          return (
            <div key={i} className={form.entry}>
              <Field id={itemId} label={`${label} ${i + 1}`} error={errors[id]}>
                <input
                  id={itemId}
                  type="number"
                  min={0}
                  step={isInt ? 1 : 'any'}
                  value={String(item)}
                  onChange={(event) => {
                    const num =
                      event.target.value === ''
                        ? 0
                        : Number(event.target.value);
                    set(items.map((old, idx) => (idx === i ? num : old)));
                  }}
                />
              </Field>
              <button
                type="button"
                className={form.remove}
                onClick={() =>
                  set(
                    items.length === 1
                      ? undefined
                      : items.filter((_, idx) => idx !== i),
                  )
                }
              >
                {t('de.form.remove')}
              </button>
            </div>
          );
        })}
        {Array.isArray(value) && !items.length && (
          <p>{t('de.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...items, 0])}
          >
            {t('de.form.add')} · {label}
          </button>
          {!items.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'de.form.noRecords'
                  : 'de.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  const dynamicRequired =
    !!field.required ||
    (field.name === 'to' &&
      typeof answers.kind === 'string' &&
      !!endDateRequired(answers.kind as DePermitKind));
  const marked = label + (dynamicRequired ? ' *' : '');
  const props = {
    id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby':
      [hint && id + '-hint', errors[id] && id + '-error']
        .filter(Boolean)
        .join(' ') || undefined,
  };

  if (field.type === 'boolean' || field.type === 'choice') {
    const isBool = field.type === 'boolean';
    const selected =
      value === true ? 'yes' : value === false ? 'no' : String(value ?? '');
    return (
      <Field id={id} label={marked} hint={hint} error={errors[id]}>
        <select
          {...props}
          required={dynamicRequired}
          value={selected}
          onChange={(event) => {
            const answer = event.target.value;
            set(answer === '' ? undefined : isBool ? answer === 'yes' : answer);
          }}
        >
          <option value="">
            {t(dynamicRequired ? 'de.form.choose' : 'de.form.unknown')}
          </option>
          {field.type !== 'choice' ? (
            <>
              <option value="yes">{t('de.form.yes')}</option>
              <option value="no">{t('de.form.no')}</option>
            </>
          ) : (
            field.options.map((option) => (
              <option key={option} value={option}>
                {t(`de.option.${option}`)}
              </option>
            ))
          )}
        </select>
      </Field>
    );
  }

  const isNumber = field.type === 'number' || field.type === 'integer';
  const alternative =
    field.type === 'nullable-date'
      ? ({ value: null, label: `de.form.${field.nullLabel}` } as const)
      : undefined;
  const usesAlternative = !!alternative && value === null;
  const inputType = isNumber
    ? 'number'
    : field.type === 'month' || field.type === 'text'
      ? 'text'
      : 'date';
  return (
    <>
      <Field id={id} label={marked} hint={hint} error={errors[id]}>
        <input
          {...props}
          type={inputType}
          placeholder={field.type === 'month' ? 'YYYY-MM' : undefined}
          min={isNumber ? 0 : undefined}
          step={isNumber ? (field.type === 'number' ? 'any' : 1) : undefined}
          required={dynamicRequired && !usesAlternative}
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
    </>
  );
}
