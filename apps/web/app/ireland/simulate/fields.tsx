'use client';

import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import { shownField, type IrelandDraft } from '../../../lib/ireland-draft';
import type { IrelandField, IrelandFields } from '../../../lib/ireland-fields';
import { Field } from '../../simulate/field';
import form from '../../simulate/form.module.css';
import site from '../../site.module.css';

type Answers = Record<string, unknown>;
interface FieldsProps {
  fields: IrelandFields;
  values: Answers;
  prefix: string;
  errors: Record<string, TranslationKey>;
  draft: IrelandDraft;
  change: (name: string, value: unknown) => void;
}

export function setAnswer(
  record: Answers | undefined,
  name: string,
  value: unknown,
) {
  const next = { ...record, [name]: value };
  if (value === undefined) delete next[name];
  return next;
}

export function IrelandFieldsView(props: FieldsProps) {
  return Object.entries(props.fields).map(([name, field]) =>
    shownField(field, props.draft) ? (
      <Question key={name} {...props} name={name} field={field} />
    ) : null,
  );
}

const key = (kind: string, name: string) =>
  `ie.${kind}.${name}` as TranslationKey;

// Lists and multiple choices start unanswered; an empty list confirms "none".
function ListActions({
  value,
  label,
  set,
  add,
}: {
  value: unknown[] | undefined;
  label: string;
  set: (value: unknown[] | undefined) => void;
  add?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      {value?.length === 0 && <p>{t('ie.form.noneConfirmed')}</p>}
      <div className={site.actions}>
        {add && (
          <button type="button" className={site.secondary} onClick={add}>
            {t('ie.form.add')} · {label}
          </button>
        )}
        {!value?.length && (
          <button
            type="button"
            className={form.copyRow}
            onClick={() => set(value ? undefined : [])}
          >
            {t(value ? 'ie.form.resetNone' : 'ie.form.confirmNone')}
          </button>
        )}
      </div>
    </>
  );
}

function Question({
  name,
  field,
  values,
  prefix,
  errors,
  draft,
  change,
}: FieldsProps & { name: string; field: IrelandField }) {
  const { t } = useTranslation();
  const id = `${prefix}-${name}`;
  const labelName = field.label ?? name;
  const value = values[name];
  const set = (next: unknown) => change(name, next);
  const label = t(key('field', labelName)) + (field.required ? ' *' : '');
  const hint = field.hint ? t(key('hint', field.hint)) : undefined;
  const nested = (
    fields: IrelandFields,
    record: Answers,
    at: string,
    save: (next: Answers) => void,
  ) => (
    <IrelandFieldsView
      fields={fields}
      values={record}
      prefix={at}
      errors={errors}
      draft={draft}
      change={(child, answer) => save(setAnswer(record, child, answer))}
    />
  );
  const legend = (
    <>
      <legend className={form.legend}>{label}</legend>
      {hint && <p className={form.hint}>{hint}</p>}
      {errors[id] && (
        <p id={`${id}-error`} className={form.error}>
          {t(errors[id])}
        </p>
      )}
    </>
  );
  const fieldsetProps = {
    id,
    tabIndex: -1,
    'aria-describedby': errors[id] ? `${id}-error` : undefined,
  };

  if (field.type === 'group') {
    const record = (value ?? {}) as Answers;
    return (
      <fieldset className={form.entry} {...fieldsetProps}>
        {legend}
        {Object.values(field.fields).some((child) => child.required) && (
          <p className={form.hint}>{t('ie.form.optionalGroup')}</p>
        )}
        {nested(field.fields, record, id, (next) =>
          set(Object.keys(next).length ? next : undefined),
        )}
      </fieldset>
    );
  }
  if (field.type === 'list') {
    const rows = value as Answers[] | undefined;
    return (
      <fieldset className={form.fieldset} {...fieldsetProps}>
        {legend}
        {rows?.map((row, i) => (
          <fieldset key={i} className={form.entry}>
            <legend>
              {t(key('field', labelName))} {i + 1}
            </legend>
            {nested(field.fields, row, `${id}-${i}`, (next) =>
              set(rows.map((old, index) => (index === i ? next : old))),
            )}
            <button
              type="button"
              className={form.remove}
              onClick={() =>
                // Removing the last row returns the list to unanswered.
                set(
                  rows.length > 1
                    ? rows.filter((_, index) => index !== i)
                    : undefined,
                )
              }
            >
              {t('ie.form.remove')}
            </button>
          </fieldset>
        ))}
        <ListActions
          value={rows}
          label={t(key('field', labelName))}
          set={set}
          add={() => set([...(rows ?? []), {}])}
        />
      </fieldset>
    );
  }
  if (field.type === 'dates' || field.type === 'numbers') {
    const items = value as (string | number)[] | undefined;
    const isDate = field.type === 'dates';
    return (
      <fieldset className={form.fieldset} {...fieldsetProps}>
        {legend}
        {items?.map((item, i) => (
          <div key={i} className={form.entry}>
            <Field
              id={`${id}-${i}`}
              label={`${t(key('field', labelName))} ${i + 1}`}
              error={errors[`${id}-${i}`]}
            >
              <input
                id={`${id}-${i}`}
                type={isDate ? 'date' : 'number'}
                min={isDate ? undefined : 0}
                step={isDate ? undefined : 'any'}
                value={String(item)}
                aria-invalid={errors[`${id}-${i}`] ? true : undefined}
                onChange={(event) => {
                  const text = event.target.value;
                  // A blank row stays a placeholder until the step is submitted.
                  const next = isDate || text === '' ? text : Number(text);
                  set(items.map((old, index) => (index === i ? next : old)));
                }}
              />
            </Field>
            <button
              type="button"
              className={form.remove}
              onClick={() =>
                set(
                  items.length > 1
                    ? items.filter((_, index) => index !== i)
                    : undefined,
                )
              }
            >
              {t('ie.form.remove')}
            </button>
          </div>
        ))}
        <ListActions
          value={items}
          label={t(key('field', labelName))}
          set={set}
          add={() => set([...(items ?? []), ''])}
        />
      </fieldset>
    );
  }
  if (field.type === 'multi') {
    const chosen = value as string[] | undefined;
    return (
      <fieldset className={form.fieldset} {...fieldsetProps}>
        {legend}
        <div className={form.checkboxes}>
          {field.options.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                id={`${id}-${option}`}
                checked={!!chosen?.includes(option)}
                onChange={(event) =>
                  set(
                    event.target.checked
                      ? [...(chosen ?? []), option]
                      : chosen?.filter((item) => item !== option),
                  )
                }
              />
              {t(key('option', `${labelName}.${option}`))}
            </label>
          ))}
        </div>
        <ListActions value={chosen} label={label} set={set} />
      </fieldset>
    );
  }
  const inputProps = {
    id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby':
      [hint && `${id}-hint`, errors[id] && `${id}-error`]
        .filter(Boolean)
        .join(' ') || undefined,
    required: field.required,
  };
  if (field.type === 'boolean' || field.type === 'choice') {
    const selected =
      value === true ? 'yes' : value === false ? 'no' : String(value ?? '');
    return (
      <Field id={id} label={label} hint={hint} error={errors[id]}>
        <select
          {...inputProps}
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
            {field.blank
              ? t(key('option', `${labelName}.${field.blank}`))
              : t(field.required ? 'ie.form.choose' : 'ie.form.unknown')}
          </option>
          {field.type === 'boolean' ? (
            <>
              <option value="yes">{t('ie.form.yes')}</option>
              <option value="no">{t('ie.form.no')}</option>
            </>
          ) : (
            ('options' in field ? field.options : []).map((option) => (
              <option key={option} value={option}>
                {t(key('option', `${labelName}.${option}`))}
              </option>
            ))
          )}
        </select>
      </Field>
    );
  }
  const isNumber = field.type === 'number' || field.type === 'integer';
  const text =
    value === undefined
      ? ''
      : field.type === 'datetime'
        ? String(value).replace(/Z$/, '')
        : String(value);
  return (
    <Field id={id} label={label} hint={hint} error={errors[id]}>
      <input
        {...inputProps}
        type={
          isNumber
            ? 'number'
            : field.type === 'datetime'
              ? 'datetime-local'
              : 'date'
        }
        min={isNumber ? 0 : undefined}
        step={isNumber ? (field.type === 'integer' ? 1 : 'any') : undefined}
        value={text}
        onChange={(event) => {
          const input = event.target.value;
          set(
            input === ''
              ? undefined
              : isNumber
                ? Number(input)
                : field.type === 'datetime'
                  ? `${input.slice(0, 16)}Z`
                  : input,
          );
        }}
      />
    </Field>
  );
}
