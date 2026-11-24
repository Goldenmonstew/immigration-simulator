'use client';

import type { TranslationKey } from '../../../i18n';
import { nzFormZh } from '../../../i18n/countries/new-zealand-form';
import { useTranslation } from '../../../i18n/locale';
import { withoutHidden } from '../../../lib/new-zealand-draft';
import type { NzField, NzOption } from '../../../lib/new-zealand-fields';
import { Field } from '../../simulate/field';
import form from '../../simulate/form.module.css';
import site from '../../site.module.css';

type Answers = Record<string, unknown>;
interface FieldsProps {
  fields: NzField[];
  values: Answers;
  prefix: string;
  errors: Record<string, TranslationKey>;
  change: (record: Answers) => void;
}

const key = (text: string) => text as TranslationKey;
const hintFor = (label: string) =>
  Object.hasOwn(nzFormZh, `nz.h.${label}`) ? key(`nz.h.${label}`) : undefined;
const optionKey = (field: { set?: string }, option: NzOption) =>
  key(`nz.o.${field.set ? field.set + '.' : ''}${option}`);

export function NzFields(props: FieldsProps) {
  const change = (record: Answers) =>
    props.change(withoutHidden(props.fields, record));
  return props.fields.map((field) =>
    !field.when || field.when(props.values) ? (
      <Question key={field.name} {...props} change={change} field={field} />
    ) : null,
  );
}

function Question({
  field,
  values,
  prefix,
  errors,
  change,
}: FieldsProps & { field: NzField }) {
  const { t } = useTranslation();
  const id = `${prefix}-${field.name}`;
  const value = values[field.name];
  const label = t(key(`nz.f.${field.label}`));
  const hintKey = hintFor(field.label);
  const hint = hintKey && t(hintKey);
  const error = errors[id];
  const set = (next: unknown) => {
    const record = { ...values, [field.name]: next };
    if (next === undefined) delete record[field.name];
    change(record);
  };
  const described =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') ||
    undefined;
  const legend = (
    <>
      <legend className={form.legend}>
        {label}
        {field.required && ' *'}
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
    </>
  );

  if (field.type === 'group') {
    const record = (value ?? {}) as Answers;
    return (
      <fieldset className={form.entry}>
        <legend>{label}</legend>
        {field.fields.some((child) => child.required) && (
          <p className={form.hint}>{t('nz.form.optionalGroup')}</p>
        )}
        <NzFields
          fields={field.fields}
          values={record}
          prefix={id}
          errors={errors}
          change={(next) => set(Object.keys(next).length ? next : undefined)}
        />
      </fieldset>
    );
  }
  if (field.type === 'list') {
    const rows = (value ?? []) as Answers[];
    return (
      <fieldset className={form.fieldset} aria-describedby={described}>
        {legend}
        {rows.map((row, i) => (
          <fieldset key={i} className={form.entry}>
            <legend>
              {label} {i + 1}
            </legend>
            <NzFields
              fields={field.fields}
              values={row}
              prefix={`${id}-${i}`}
              errors={errors}
              change={(next) =>
                set(rows.map((old, index) => (index === i ? next : old)))
              }
            />
            <button
              type="button"
              className={form.remove}
              onClick={() => set(rows.filter((_, index) => index !== i))}
            >
              {t('nz.form.remove')} · {label} {i + 1}
            </button>
          </fieldset>
        ))}
        {Array.isArray(value) && !rows.length && (
          <p>{t('nz.form.emptyConfirmed')}</p>
        )}
        <div className={site.actions}>
          <button
            type="button"
            className={site.secondary}
            onClick={() => set([...rows, {}])}
          >
            {t('nz.form.add')} · {label}
          </button>
          {!rows.length && (
            <button
              type="button"
              className={form.copyRow}
              onClick={() => set(value === undefined ? [] : undefined)}
            >
              {t(
                value === undefined
                  ? 'nz.form.noRecords'
                  : 'nz.form.resetRecords',
              )}
            </button>
          )}
        </div>
      </fieldset>
    );
  }
  if (field.type === 'multi') {
    const selected = (value ?? []) as NzOption[];
    return (
      <fieldset
        id={id}
        tabIndex={-1}
        className={form.fieldset}
        aria-describedby={described}
      >
        {legend}
        <div className={form.checkboxes}>
          {field.options.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                id={`${id}-${option}`}
                checked={selected.includes(option)}
                onChange={(event) => {
                  const next = field.options.filter((item) =>
                    item === option
                      ? event.target.checked
                      : selected.includes(item),
                  );
                  set(next.length ? next : undefined);
                }}
              />
              {t(optionKey(field, option))}
            </label>
          ))}
          <label>
            <input
              type="checkbox"
              id={`${id}-none`}
              checked={Array.isArray(value) && !selected.length}
              onChange={(event) => set(event.target.checked ? [] : undefined)}
            />
            {t('nz.form.noneOfThese')}
          </label>
        </div>
      </fieldset>
    );
  }
  if (field.type === 'tuple' || field.type === 'numbers') {
    const items = (value ?? []) as (NzOption | null)[];
    const slots =
      field.type === 'tuple' ? [0, 1, 2, 3] : items.map((_, i) => i);
    const update = (next: (NzOption | null)[]) =>
      set(
        next.every((item) => item === null) && field.type === 'tuple'
          ? undefined
          : next.length
            ? next
            : undefined,
      );
    const edit = (i: number, item: NzOption | null) =>
      update(slots.map((slot) => (slot === i ? item : (items[slot] ?? null))));
    return (
      <fieldset
        id={id}
        tabIndex={-1}
        className={form.fieldset}
        aria-invalid={error ? true : undefined}
        aria-describedby={described}
      >
        {legend}
        {slots.map((i) => {
          const itemId = `${id}-${i}`;
          const itemLabel =
            field.type === 'tuple'
              ? t(key(`nz.form.skill.${i}`))
              : t('nz.form.value').replace('{n}', String(i + 1));
          const current = items[i] ?? null;
          return (
            <Field key={i} id={itemId} label={itemLabel}>
              {field.type === 'tuple' && field.options ? (
                <select
                  id={itemId}
                  value={String(current ?? '')}
                  onChange={(event) => edit(i, event.target.value || null)}
                >
                  <option value="">{t('nz.form.unknown')}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={itemId}
                  type="number"
                  min={0}
                  step="any"
                  value={current === null ? '' : String(current)}
                  onChange={(event) =>
                    edit(
                      i,
                      event.target.value === ''
                        ? null
                        : Number(event.target.value),
                    )
                  }
                />
              )}
              {field.type === 'numbers' && (
                <button
                  type="button"
                  className={form.remove}
                  onClick={() =>
                    update(items.filter((_, index) => index !== i))
                  }
                >
                  {t('nz.form.remove')} · {itemLabel}
                </button>
              )}
            </Field>
          );
        })}
        {field.type === 'numbers' &&
          field.none &&
          Array.isArray(value) &&
          !items.length && <p>{t('nz.form.emptyConfirmed')}</p>}
        {field.type === 'numbers' && (
          <div className={site.actions}>
            <button
              type="button"
              className={site.secondary}
              onClick={() => update([...items, null])}
            >
              {t('nz.form.addValue')} · {label}
            </button>
            {field.none && !items.length && (
              <button
                type="button"
                className={form.copyRow}
                onClick={() => set(value === undefined ? [] : undefined)}
              >
                {t(
                  value === undefined
                    ? 'nz.form.noRecords'
                    : 'nz.form.resetRecords',
                )}
              </button>
            )}
          </div>
        )}
      </fieldset>
    );
  }

  const props = {
    id,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': described,
  };
  const required = !!field.required;
  const marked = label + (required ? ' *' : '');
  if (field.type === 'boolean' || field.type === 'choice') {
    const options =
      field.type === 'choice'
        ? field.options.map((option) => ({
            value: String(option),
            answer: option as unknown,
            text: t(optionKey(field, option)),
          }))
        : [
            { value: 'yes', answer: true, text: t('nz.form.yes') },
            { value: 'no', answer: false, text: t('nz.form.no') },
          ];
    const selected = options.find((option) => option.answer === value);
    return (
      <Field id={id} label={marked} hint={hint} error={error}>
        <select
          {...props}
          value={selected?.value ?? ''}
          onChange={(event) =>
            set(
              options.find((option) => option.value === event.target.value)
                ?.answer,
            )
          }
        >
          <option value="">
            {t(required ? 'nz.form.choose' : 'nz.form.unknown')}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.text}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  const numeric = field.type === 'number' || field.type === 'number-or';
  const alternative =
    field.type === 'date-or' || field.type === 'number-or'
      ? field.alternative
      : undefined;
  const usesAlternative = alternative !== undefined && value === alternative;
  const wrap = field.type === 'date-or' ? field.wrap : undefined;
  const shown =
    wrap && !usesAlternative ? (value as Answers | undefined)?.[wrap] : value;
  return (
    <>
      <Field id={id} label={marked} hint={hint} error={error}>
        <input
          {...props}
          type={numeric ? 'number' : field.type === 'text' ? 'text' : 'date'}
          min={numeric ? 0 : undefined}
          step={numeric ? 'any' : undefined}
          disabled={usesAlternative}
          value={usesAlternative ? '' : String(shown ?? '')}
          onChange={(event) => {
            // Codes pasted with spaces would not match the occupation tables.
            const text =
              field.type === 'text'
                ? event.target.value.trim()
                : event.target.value;
            set(
              text === ''
                ? undefined
                : numeric
                  ? Number(text)
                  : wrap
                    ? { [wrap]: text }
                    : text,
            );
          }}
        />
      </Field>
      {alternative !== undefined && (
        <div className={form.checkboxes}>
          <label>
            <input
              type="checkbox"
              id={`${id}-alternative`}
              checked={usesAlternative}
              onChange={(event) =>
                set(event.target.checked ? alternative : undefined)
              }
            />
            {t(key(`nz.form.alternative.${field.label}`))}
          </label>
        </div>
      )}
    </>
  );
}
