'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { CanadaDraft } from '../../../lib/canada-draft';
import {
  initialPrGoals,
  taxYearRange,
  type CanadaField,
} from '../../../lib/canada-fields';
import { Field } from '../../simulate/field';
import form from '../../simulate/form.module.css';
import site from '../../site.module.css';

type Answers = Record<string, unknown>;
type Errors = Record<string, TranslationKey>;

interface FieldsProps {
  fields: CanadaField[];
  values: Answers | undefined;
  id: string;
  errors: Errors;
  draft: CanadaDraft;
  change: (next: Answers | undefined) => void;
}

// Blank answers are removed so the engine reads them as unanswered.
function withAnswer(record: Answers, name: string, value: unknown) {
  const next = { ...record, [name]: value };
  if (value === undefined) delete next[name];
  return Object.keys(next).length ? next : undefined;
}

export function CanadaFields(props: FieldsProps) {
  const record = props.values ?? {};
  return props.fields.map((field) => (
    <Question
      key={field.name}
      field={field}
      value={record[field.name]}
      id={`${props.id}-${field.name}`}
      errors={props.errors}
      draft={props.draft}
      set={(value) => props.change(withAnswer(record, field.name, value))}
    />
  ));
}

interface QuestionProps {
  field: CanadaField;
  value: unknown;
  id: string;
  errors: Errors;
  draft: CanadaDraft;
  set: (value: unknown) => void;
  label?: string;
}

function inputProps(id: string, errors: Errors, hint?: boolean) {
  return {
    id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby':
      [hint && `${id}-hint`, errors[id] && `${id}-error`]
        .filter(Boolean)
        .join(' ') || undefined,
  };
}

function Choice({
  id,
  label,
  value,
  options,
  optionLabel,
  required,
  errors,
  set,
}: {
  id: string;
  label: string;
  value: unknown;
  options: readonly string[];
  optionLabel: (option: string) => string;
  required?: boolean;
  errors: Errors;
  set: (value: string | undefined) => void;
}) {
  const { t } = useTranslation();
  return (
    <Field id={id} label={label} error={errors[id]}>
      <select
        {...inputProps(id, errors)}
        required={required}
        value={String(value ?? '')}
        onChange={(event) => set(event.target.value || undefined)}
      >
        <option value="">{t(required ? 'form.choose' : 'form.unknown')}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Question({
  field,
  value,
  id,
  errors,
  draft,
  set,
  label: shownLabel,
}: QuestionProps) {
  const { t } = useTranslation();
  const label =
    (shownLabel ?? t(`ca.field.${field.label}` as TranslationKey)) +
    (field.required ? ' *' : '');
  // An emptied record falls back to `empty`, e.g. {} keeps "applies".
  const nested = (
    fields: CanadaField[],
    record: unknown,
    key: string,
    empty?: Answers,
  ) => (
    <CanadaFields
      fields={fields}
      values={record as Answers | undefined}
      id={key}
      errors={errors}
      draft={draft}
      change={(next) => set(next ?? empty)}
    />
  );
  switch (field.type) {
    case 'boolean':
      return (
        <Choice
          id={id}
          label={label}
          value={value === true ? 'yes' : value === false ? 'no' : ''}
          options={['yes', 'no']}
          optionLabel={(option) => t(option === 'yes' ? 'form.yes' : 'form.no')}
          required={field.required}
          errors={errors}
          set={(answer) =>
            set(answer === undefined ? undefined : answer === 'yes')
          }
        />
      );
    case 'choice':
    case 'extension': {
      const until = field.type === 'extension' && typeof value === 'object';
      return (
        <>
          <Choice
            id={id}
            label={label}
            value={until ? 'until' : value}
            options={field.options}
            optionLabel={(option) =>
              t(`ca.option.${field.set}.${option}` as TranslationKey)
            }
            required={field.required}
            errors={errors}
            set={(answer) =>
              set(
                field.type === 'extension' && answer === 'until'
                  ? { until: '' }
                  : answer,
              )
            }
          />
          {until && (
            <Field
              id={`${id}-until`}
              label={`${t('ca.field.extensionUntil')} *`}
              error={errors[`${id}-until`]}
            >
              <input
                {...inputProps(`${id}-until`, errors)}
                type="date"
                required
                value={(value as { until: string }).until}
                onChange={(event) => set({ until: event.target.value })}
              />
            </Field>
          )}
        </>
      );
    }
    case 'date':
    case 'text':
    case 'number':
    case 'integer': {
      const numeric = field.type === 'number' || field.type === 'integer';
      return (
        <Field id={id} label={label} error={errors[id]}>
          <input
            {...inputProps(id, errors)}
            type={numeric ? 'number' : field.type}
            min={numeric ? 0 : undefined}
            max={numeric ? field.max : undefined}
            step={numeric ? (field.type === 'integer' ? 1 : 'any') : undefined}
            required={field.required}
            value={String(value ?? '')}
            onChange={(event) => {
              const text = event.target.value;
              // Codes and timestamps are compared exactly.
              set(
                text.trim() === ''
                  ? undefined
                  : numeric
                    ? Number(text)
                    : text.trim(),
              );
            }}
          />
        </Field>
      );
    }
    case 'tuple': {
      const items = (value ?? Array(field.size).fill(null)) as (
        number | null
      )[];
      return (
        <fieldset
          id={id}
          className={form.fieldset}
          tabIndex={-1}
          aria-invalid={errors[id] ? true : undefined}
          aria-describedby={errors[id] ? `${id}-error` : undefined}
        >
          <legend className={form.legend}>{label}</legend>
          <p className={form.hint}>{t('ca.form.tupleHint')}</p>
          {errors[id] && (
            <p id={`${id}-error`} className={form.error}>
              {t(errors[id])}
            </p>
          )}
          {items.map((item, index) => {
            const key = `${id}-${index}`;
            return (
              <Field
                key={index}
                id={key}
                label={t(
                  field.size === 7
                    ? (`ca.form.weekday${index}` as TranslationKey)
                    : 'ca.form.score',
                ).replace('{n}', String(index + 1))}
                error={errors[key]}
              >
                <input
                  {...inputProps(key, errors)}
                  type="number"
                  min={0}
                  max={field.max}
                  step="any"
                  value={item ?? ''}
                  onChange={(event) => {
                    const next = items.map((old, i) =>
                      i === index
                        ? event.target.value
                          ? Number(event.target.value)
                          : null
                        : old,
                    );
                    set(
                      next.every((entry) => entry === null) ? undefined : next,
                    );
                  }}
                />
              </Field>
            );
          })}
        </fieldset>
      );
    }
    case 'taxYears': {
      const answers = (value ?? {}) as Record<string, string>;
      return (
        <fieldset className={form.fieldset}>
          <legend className={form.legend}>{t('ca.section.taxYears')}</legend>
          {taxYearRange(draft).map((year) => (
            <Choice
              key={year}
              id={`${id}-${year}`}
              label={t('ca.field.taxYears').replace('{year}', String(year))}
              value={answers[year]}
              options={['filed', 'not-required', 'not-filed', 'uncertain']}
              optionLabel={(option) =>
                t(`ca.option.taxAnswer.${option}` as TranslationKey)
              }
              errors={errors}
              set={(answer) => set(withAnswer(answers, String(year), answer))}
            />
          ))}
        </fieldset>
      );
    }
    case 'group': {
      const applies = value !== undefined && value !== false;
      return (
        <fieldset className={form.entry}>
          <legend>{label}</legend>
          {field.allowFalse && (
            <Choice
              id={id}
              label={label}
              value={value === false ? 'no' : applies ? 'yes' : ''}
              options={['no', 'yes']}
              optionLabel={(option) =>
                t(
                  option === 'yes'
                    ? 'ca.form.applies'
                    : 'ca.form.notApplicable',
                )
              }
              errors={errors}
              set={(answer) =>
                set(answer === 'no' ? false : answer === 'yes' ? {} : undefined)
              }
            />
          )}
          {(!field.allowFalse || applies) && (
            <>
              {field.fields.some((child) => child.required) && (
                <p className={form.hint}>{t('ca.form.optionalGroup')}</p>
              )}
              {nested(
                field.fields,
                applies ? value : undefined,
                id,
                field.allowFalse ? {} : undefined,
              )}
            </>
          )}
        </fieldset>
      );
    }
    case 'list':
    case 'dates': {
      const rows = (value ?? []) as unknown[];
      const remove = (index: number) =>
        set(
          rows.length === 1
            ? undefined
            : rows.filter((_, other) => other !== index),
        );
      const replace = (index: number, row: unknown) =>
        set(rows.map((old, other) => (other === index ? row : old)));
      return (
        <fieldset className={form.fieldset}>
          <legend className={form.legend}>{label}</legend>
          {rows.map((row, index) => {
            const key = `${id}-${index}`;
            const name = `${label} ${index + 1}`;
            return field.type === 'list' ? (
              <fieldset key={index} className={form.entry}>
                <legend>{name}</legend>
                <CanadaFields
                  fields={field.fields}
                  values={row as Answers}
                  id={key}
                  errors={errors}
                  draft={draft}
                  change={(next) => replace(index, next ?? {})}
                />
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => remove(index)}
                >
                  {t('ca.form.remove')} · {name}
                </button>
              </fieldset>
            ) : (
              <div key={index}>
                <Field id={key} label={name} error={errors[key]}>
                  <input
                    {...inputProps(key, errors)}
                    type="date"
                    value={row as string}
                    onChange={(event) => replace(index, event.target.value)}
                  />
                </Field>
                <button
                  type="button"
                  className={form.remove}
                  onClick={() => remove(index)}
                >
                  {t('ca.form.remove')} · {name}
                </button>
              </div>
            );
          })}
          {Array.isArray(value) && !rows.length && (
            <p>{t('ca.form.emptyConfirmed')}</p>
          )}
          <div className={site.actions}>
            <button
              type="button"
              className={site.secondary}
              onClick={() => set([...rows, field.type === 'list' ? {} : ''])}
            >
              {t('ca.form.add')} · {label}
            </button>
            {!rows.length && !(field.type === 'list' && field.nonEmpty) && (
              <button
                type="button"
                className={form.copyRow}
                onClick={() => set(value === undefined ? [] : undefined)}
              >
                {t(
                  value === undefined
                    ? 'ca.form.noRecords'
                    : 'ca.form.resetRecords',
                )}
              </button>
            )}
          </div>
        </fieldset>
      );
    }
    case 'routes': {
      const answers = (value ?? {}) as Answers;
      const routes = initialPrGoals.filter((goal) =>
        draft.goals.includes(goal),
      );
      return routes.map((route) => {
        const routeLabel = t(`ca.goal.${route}`);
        return (
          <Question
            key={route}
            field={field.field}
            value={answers[route]}
            id={`${id}-${route}`}
            errors={errors}
            draft={draft}
            label={
              field.field.type === 'group'
                ? routeLabel
                : `${t(`ca.field.${field.label}` as TranslationKey)} · ${routeLabel}`
            }
            set={(answer) => set(withAnswer(answers, route, answer))}
          />
        );
      });
    }
  }
}
