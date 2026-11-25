'use client';

import { Field } from '../../simulate/field';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { GreeceField } from '../../../lib/greece-fields';
import form from '../../simulate/form.module.css';
import site from '../../site.module.css';

type Answers = Record<string, unknown>;

function updateAnswer<T extends object>(
  record: T,
  name: string,
  value: unknown,
): T {
  const next = { ...record, [name]: value };
  if (value === undefined) delete (next as Answers)[name];
  return next;
}

interface FieldsProps {
  fields: GreeceField[];
  values: object | undefined;
  prefix: string;
  errors: Record<string, TranslationKey>;
  change: (name: string, value: unknown) => void;
}

export function EvidenceFields(props: FieldsProps) {
  return props.fields.map((field) => (
    <Question key={field.name} {...props} field={field} />
  ));
}

// Changing an answer clears the questions it hides.
export function nestedChange(
  fields: GreeceField[],
  record: object,
  name: string,
  value: unknown,
) {
  const next = updateAnswer(record, name, value) as Answers;
  for (const field of fields)
    if (field.when && !field.when(next)) delete next[field.name];
  return next;
}

function Question({
  field,
  values,
  prefix,
  errors,
  change,
}: FieldsProps & { field: GreeceField }) {
  const { t } = useTranslation();
  const answers = (values ?? {}) as Answers;
  if (field.when && !field.when(answers)) return null;
  const id = `${prefix}-${field.name}`;
  const value = answers[field.name];
  const set = (next: unknown) => change(field.name, next);
  const label = t(`gr.field.${field.label}` as TranslationKey);
  // The engine counts residence years from the start of residence, or else
  // from arrival (EU family) or the first card (Greek family).
  const from = [
    answers.residenceFrom,
    answers.arrivedOn,
    answers.initialCardGrantedOn,
  ].find((date) => typeof date === 'string' && date);
  const hint =
    field.hint &&
    t(`gr.hint.${field.hint}`).replace(
      '{from}',
      (from as string | undefined) ?? t('gr.form.residenceStartMissing'),
    );
  const error = errors[id];
  const marked = label + (field.required ? ' *' : '');
  const optionLabel = (option: string) =>
    t(
      `gr.option.${(field.type === 'choice' && field.labels?.[option as never]) || option}` as TranslationKey,
    );

  if (field.type === 'group') {
    const record = (value ?? {}) as object;
    return (
      <fieldset className={form.entry} id={id} tabIndex={-1}>
        <legend>{label}</legend>
        {field.fields.some((child) => child.required) && (
          <p className={form.hint}>{t('gr.form.optionalGroup')}</p>
        )}
        <EvidenceFields
          fields={field.fields}
          values={record}
          prefix={id}
          errors={errors}
          change={(name, answer) => {
            const next = nestedChange(field.fields, record, name, answer);
            set(Object.keys(next).length ? next : undefined);
          }}
        />
      </fieldset>
    );
  }

  if (field.type === 'list') {
    const rows = (Array.isArray(value) ? value : []) as object[];
    const complete = field.complete;
    const completeId = `${prefix}-${complete}`;
    const completeError = errors[completeId];
    return (
      <fieldset
        className={form.fieldset}
        id={id}
        tabIndex={-1}
        aria-describedby={
          [hint && `${id}-hint`, error && `${id}-error`]
            .filter(Boolean)
            .join(' ') || undefined
        }
      >
        <legend className={form.legend}>{marked}</legend>
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
              errors={errors}
              change={(name, answer) =>
                set(
                  rows.map((old, index) =>
                    index === i
                      ? nestedChange(field.fields, row, name, answer)
                      : old,
                  ),
                )
              }
            />
            <button
              type="button"
              className={form.remove}
              aria-label={`${t('gr.form.remove')} · ${label} ${i + 1}`}
              onClick={() =>
                set(
                  rows.length === 1
                    ? undefined
                    : rows.filter((_, index) => index !== i),
                )
              }
            >
              {t('gr.form.remove')}
            </button>
          </fieldset>
        ))}
        {Array.isArray(value) && !rows.length && (
          <p>{t('gr.form.emptyConfirmed')}</p>
        )}
        {complete && rows.length > 0 && (
          <div
            className={`${form.checkboxes} ${completeError ? form.invalid : ''}`}
          >
            {completeError && (
              <p id={`${completeId}-error`} className={form.error}>
                {t(completeError)}
              </p>
            )}
            <label>
              <input
                type="checkbox"
                id={completeId}
                checked={answers[complete] === true}
                aria-invalid={completeError ? true : undefined}
                aria-describedby={
                  completeError ? `${completeId}-error` : undefined
                }
                onChange={(event) =>
                  change(complete, event.target.checked || undefined)
                }
              />
              {t(`gr.form.${complete}`)}
            </label>
          </div>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...rows, {}])}
          >
            {t('gr.form.add')} · {label}
          </button>
          {!rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'gr.form.noRecords'
                  : 'gr.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }

  if (field.type === 'choice-set') {
    const selected = (Array.isArray(value) ? value : []) as string[];
    return (
      <fieldset className={form.fieldset} id={id} tabIndex={-1}>
        <legend className={form.legend}>{label}</legend>
        <div className={form.checkboxes}>
          {field.options.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                id={`${id}-${option}`}
                checked={selected.includes(option)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option);
                  set(next.length ? next : undefined);
                }}
              />
              {optionLabel(option)}
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

  if (field.type === 'boolean' || field.type === 'choice') {
    const selected =
      value === true ? 'yes' : value === false ? 'no' : String(value ?? '');
    const options =
      field.type === 'boolean' ? (field.extra ?? []) : field.options;
    return (
      <Field id={id} label={marked} hint={hint} error={error}>
        <select
          {...props}
          required={field.required}
          value={selected}
          onChange={(event) => {
            const answer = event.target.value;
            set(
              answer === ''
                ? undefined
                : field.type === 'boolean' &&
                    (answer === 'yes' || answer === 'no')
                  ? answer === 'yes'
                  : answer,
            );
          }}
        >
          <option value="">
            {t(field.required ? 'gr.form.choose' : 'gr.form.unknown')}
          </option>
          {field.type === 'boolean' && (
            <>
              <option value="yes">{t('gr.form.yes')}</option>
              <option value="no">{t('gr.form.no')}</option>
            </>
          )}
          {options.map((option) => (
            <option key={option} value={option}>
              {optionLabel(option)}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  const isNumber = field.type === 'number' || field.type === 'integer';
  const alternative = field.type === 'date-or' ? field.alternative : undefined;
  const usesAlternative = alternative !== undefined && value === alternative;
  return (
    <>
      <Field id={id} label={marked} hint={hint} error={error}>
        <input
          {...props}
          type={isNumber ? 'number' : 'date'}
          min={isNumber ? 0 : undefined}
          step={isNumber ? (field.type === 'integer' ? 1 : 'any') : undefined}
          required={field.required && !usesAlternative}
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
              id={`${id}-alternative`}
              aria-label={`${t(`gr.option.${alternative}`)} · ${label}`}
              checked={usesAlternative}
              onChange={(event) =>
                set(event.target.checked ? alternative : undefined)
              }
            />
            {t(`gr.option.${alternative}`)}
          </label>
        </div>
      )}
    </>
  );
}
