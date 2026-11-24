'use client';

import { AU_FULL_PATHWAYS } from '@uk-immigration/engine';
import { Field } from '../../simulate/field';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { AustraliaField } from '../../../lib/australia-fields';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

interface FieldsProps {
  fields: AustraliaField[];
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
}: FieldsProps & { field: AustraliaField }) {
  const { t } = useTranslation();
  const id = `${prefix}-${field.name}`;
  const answers = values as Record<string, unknown>;
  const value = answers[field.name];
  const set = (next: unknown) => change(field.name, next);
  const label = t(`au.field.${field.label}`);
  const hint = field.hint && t(`au.form.${field.hint}`);
  const required = !!field.required;
  const marked = label + (required ? ' *' : '');

  const props = {
    id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby':
      [hint && `${id}-hint`, errors[id] && `${id}-error`]
        .filter(Boolean)
        .join(' ') || undefined,
  };

  if (field.type === 'pathway') {
    return (
      <Field id={id} label={marked} hint={hint} error={errors[id]}>
        <select
          {...props}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => set(e.target.value || undefined)}
        >
          <option value="">{t('au.form.allPathways')}</option>
          {AU_FULL_PATHWAYS.map((pathwayId) => (
            <option key={pathwayId} value={pathwayId}>
              {t(`au.pathway.${pathwayId}` as TranslationKey)}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  if (field.type === 'group') {
    const record = (isRecord(value) ? value : {}) as object;
    return (
      <fieldset className={form.entry}>
        <legend>{label}</legend>
        <EvidenceFields
          fields={field.fields}
          values={record}
          prefix={id}
          errors={errors}
          change={(name, answer) => {
            const updated = updateAnswer(record, name, answer);
            set(Object.keys(updated).length ? updated : undefined);
          }}
        />
      </fieldset>
    );
  }

  if (field.type === 'union-group') {
    const isLiteral =
      typeof value === 'string' &&
      field.literals.some((lit) => lit === value);
    const isObj = isRecord(value);
    const mode = isLiteral ? (value as string) : isObj ? 'details' : '';
    const record = (isObj ? value : {}) as Record<string, unknown>;
    if (
      field.name === 'test' &&
      Array.isArray(record.components) &&
      record.components.length === 4
    ) {
      const [l, r, w, s] = record.components as number[];
      record.listening ??= l;
      record.reading ??= r;
      record.writing ??= w;
      record.speaking ??= s;
    }
    return (
      <fieldset className={form.entry}>
        <legend>{label}</legend>
        <Field id={id} label={marked} hint={hint} error={errors[id]}>
          <select
            {...props}
            value={mode}
            onChange={(e) => {
              const chosen = e.target.value;
              if (chosen === '') set(undefined);
              else if (chosen === 'details') set({});
              else set(chosen);
            }}
          >
            <option value="">{t('au.form.unknown')}</option>
            {field.literals.map((lit) => (
              <option key={lit} value={lit}>
                {t(`au.option.${lit}` as TranslationKey)}
              </option>
            ))}
            <option value="details">{t('au.option.details')}</option>
          </select>
        </Field>
        {isObj && (
          <EvidenceFields
            fields={field.fields}
            values={record}
            prefix={id}
            errors={errors}
            change={(name, answer) => {
              const updated = updateAnswer(record, name, answer);
              if (field.name === 'test') {
                const parts = [
                  updated.listening,
                  updated.reading,
                  updated.writing,
                  updated.speaking,
                ];
                if (
                  parts.every(
                    (n) => typeof n === 'number' && Number.isFinite(n),
                  )
                ) {
                  updated.components = parts;
                } else {
                  delete updated.components;
                }
              }
              set(updated);
            }}
          />
        )}
      </fieldset>
    );
  }

  if (field.type === 'list') {
    const rows = (Array.isArray(value) ? value : []) as object[];
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        {hint && <p className={form.hint}>{hint}</p>}
        {rows.map((row, i) => (
          <fieldset key={i} className={form.entry}>
            <legend>
              {label} {i + 1}
            </legend>
            <EvidenceFields
              fields={field.fields}
              values={row}
              prefix={`${id}-${i}`}
              errors={errors}
              change={(name, answer) => {
                const nextRow = updateAnswer(row, name, answer);
                set(rows.map((old, idx) => (idx === i ? nextRow : old)));
              }}
            />
            <button
              type="button"
              className={form.remove}
              onClick={() => set(rows.filter((_, idx) => idx !== i))}
            >
              {t('au.form.remove')}
            </button>
          </fieldset>
        ))}
        {Array.isArray(value) && !rows.length && (
          <p>{t('au.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() =>
              set([
                ...rows,
                field.name === 'visas' ? { subclass: '482' } : {},
              ])
            }
          >
            {t('au.form.add')} · {label}
          </button>
          {!rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'au.form.noRecords'
                  : 'au.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'year-list') {
    const years = Array.isArray(value) ? (value as number[]) : [];
    return (
      <fieldset className={form.fieldset}>
        <legend className={form.legend}>{label}</legend>
        {years.map((year, i) => (
          <div key={i} className={form.entry}>
            <Field
              id={i === 0 ? id : `${id}-${i}`}
              label={`${label} ${i + 1}`}
              error={i === 0 ? errors[id] : undefined}
            >
              <input
                id={i === 0 ? id : `${id}-${i}`}
                type="number"
                min={1900}
                max={2100}
                step={1}
                value={Number.isFinite(year) ? String(year) : ''}
                onChange={(e) => {
                  const num =
                    e.target.value === '' ? 0 : Number(e.target.value);
                  set(years.map((old, idx) => (idx === i ? num : old)));
                }}
              />
            </Field>
            <button
              type="button"
              className={form.remove}
              onClick={() => set(years.filter((_, idx) => idx !== i))}
            >
              {t('au.form.remove')}
            </button>
          </div>
        ))}
        {Array.isArray(value) && !years.length && (
          <p>{t('au.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() =>
              set([
                ...years,
                years.length ? (years.at(-1) ?? 2025) + 1 : 2024,
              ])
            }
          >
            {t('au.form.add')} · {label}
          </button>
          {!years.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'au.form.noRecords'
                  : 'au.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }

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
          onChange={(e) => {
            const answer = e.target.value;
            set(answer === '' ? undefined : isBool ? answer === 'yes' : answer);
          }}
        >
          <option value="">
            {t(required ? 'au.form.choose' : 'au.form.unknown')}
          </option>
          {field.type !== 'choice' ? (
            <>
              <option value="yes">{t('au.form.yes')}</option>
              <option value="no">{t('au.form.no')}</option>
            </>
          ) : (
            field.options.map((option) => (
              <option key={option} value={option}>
                {t(`au.option.${option}`)}
              </option>
            ))
          )}
        </select>
      </Field>
    );
  }

  if (field.type === 'null-date') {
    const isNull = value === null;
    return (
      <>
        <Field id={id} label={marked} hint={hint} error={errors[id]}>
          <input
            {...props}
            type="date"
            disabled={isNull}
            value={isNull ? '' : String(value ?? '')}
            onChange={(e) => set(e.target.value || undefined)}
          />
        </Field>
        <div className={form.checkboxes}>
          <label>
            <input
              type="checkbox"
              checked={isNull}
              onChange={(e) => set(e.target.checked ? null : undefined)}
            />
            {t('au.form.nullDateConfirmed')}
          </label>
        </div>
      </>
    );
  }

  if (field.type === 'status-date') {
    const literalValue = field.literals.find((lit) => lit === value);
    const literalLabel = (lit: 'none' | 'never' | 'ongoing'): TranslationKey =>
      lit === 'never'
        ? 'au.form.neverOption'
        : lit === 'ongoing'
          ? 'au.form.ongoingOption'
          : 'au.form.noneOption';
    return (
      <>
        <Field id={id} label={marked} hint={hint} error={errors[id]}>
          <input
            {...props}
            type="date"
            disabled={!!literalValue}
            value={literalValue ? '' : String(value ?? '')}
            onChange={(e) => set(e.target.value || undefined)}
          />
        </Field>
        <div className={form.checkboxes}>
          {field.literals.map((lit) => (
            <label key={lit}>
              <input
                type="checkbox"
                checked={value === lit}
                onChange={(e) => set(e.target.checked ? lit : undefined)}
              />
              {t(literalLabel(lit))}
            </label>
          ))}
        </div>
      </>
    );
  }

  const isNumber = field.type === 'number' || field.type === 'integer';
  return (
    <Field id={id} label={marked} hint={hint} error={errors[id]}>
      <input
        {...props}
        type={isNumber ? 'number' : 'date'}
        min={isNumber ? 0 : undefined}
        step={isNumber ? (field.type === 'number' ? 'any' : 1) : undefined}
        required={required}
        value={value === undefined ? '' : String(value)}
        onChange={(e) => {
          const text = e.target.value;
          set(text === '' ? undefined : isNumber ? Number(text) : text);
        }}
      />
    </Field>
  );
}
