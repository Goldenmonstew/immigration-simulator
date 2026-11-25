'use client';

import { Field } from '../../simulate/field';
import type { TranslationKey } from '../../../i18n';
import { useTranslation } from '../../../i18n/locale';
import type { UsAnswers, UsField } from '../../../lib/united-states-fields';
import { isRequired } from '../../../lib/united-states-draft';
import form from '../../simulate/form.module.css';
import site from '../../site.module.css';

type Answers = Record<string, unknown>;

export function updateAnswer(record: Answers, name: string, value: unknown) {
  const next = { ...record, [name]: value };
  if (value === undefined) delete next[name];
  return next;
}

interface FieldsProps {
  fields: UsField[];
  values: Answers;
  prefix: string;
  draft: UsAnswers;
  errors: Record<string, TranslationKey>;
  change: (name: string, value: unknown) => void;
}

export function UsFields(props: FieldsProps) {
  return props.fields
    .filter(
      (field) =>
        !field.when || field.when({ draft: props.draft, record: props.values }),
    )
    .map((field) => <Question key={field.name} {...props} field={field} />);
}

const isRecord = (value: unknown): value is Answers =>
  !!value && typeof value === 'object' && !Array.isArray(value);

function Question({
  field,
  values,
  prefix,
  draft,
  errors,
  change,
}: FieldsProps & { field: UsField }) {
  const { t } = useTranslation();
  const id = prefix + '-' + field.name;
  const value = values[field.name];
  const set = (next: unknown) => change(field.name, next);
  const required = isRequired(field, draft);
  const label = t(`us.field.${field.label}`) + (required ? ' *' : '');
  const hint = field.hint && t(`us.hint.${field.hint}`);
  const option = (name: string) => t(`us.option.${name}` as TranslationKey);
  const describedBy =
    [hint && id + '-hint', errors[id] && id + '-error']
      .filter(Boolean)
      .join(' ') || undefined;
  const control = {
    id,
    'aria-invalid': errors[id] ? (true as const) : undefined,
    'aria-describedby': describedBy,
  };
  const alternative =
    typeof value === 'string' && field.alternatives?.includes(value as never)
      ? value
      : undefined;

  if (field.type === 'group' || field.type === 'list' || field.type === 'dates')
    return (
      <fieldset
        id={id}
        tabIndex={-1}
        className={field.type === 'group' ? form.entry : form.fieldset}
        aria-describedby={describedBy}
      >
        <legend className={field.type === 'group' ? undefined : form.legend}>
          {label}
        </legend>
        {hint && (
          <p id={id + '-hint'} className={form.hint}>
            {hint}
          </p>
        )}
        {errors[id] && (
          <p id={id + '-error'} className={form.error}>
            {t(errors[id])}
          </p>
        )}
        {field.type === 'group' ? (
          <GroupAnswers
            field={field}
            value={value}
            alternative={alternative}
            id={id}
            draft={draft}
            errors={errors}
            set={set}
          />
        ) : (
          <Rows
            field={field}
            value={value}
            id={id}
            draft={draft}
            errors={errors}
            set={set}
          />
        )}
      </fieldset>
    );

  if (field.type === 'choice' && field.radio)
    return (
      <fieldset
        id={id}
        tabIndex={-1}
        className={`${form.fieldset} ${errors[id] ? form.invalid : ''}`}
        aria-invalid={errors[id] ? true : undefined}
        aria-describedby={describedBy}
      >
        <legend className={form.legend}>{label}</legend>
        {hint && (
          <p id={id + '-hint'} className={form.hint}>
            {hint}
          </p>
        )}
        {errors[id] && (
          <p id={id + '-error'} className={form.error}>
            {t(errors[id])}
          </p>
        )}
        <div className={form.checkboxes}>
          {field.options.map((name) => (
            <label key={name}>
              <input
                type="radio"
                id={id + '-' + name}
                name={id}
                checked={value === name}
                onChange={() => set(name)}
              />
              <span>
                {option(name)}
                <span className={site.muted}>
                  {' '}
                  {t(`us.option.${name}.desc` as TranslationKey)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );

  if (
    field.type === 'boolean' ||
    field.type === 'choice' ||
    field.type === 'review'
  ) {
    const options: [string, string][] =
      field.type === 'choice'
        ? field.options.map((name) => [
            name,
            option(field.labels?.[name] ?? name),
          ])
        : field.type === 'review'
          ? [
              ...(['cleared', 'barred', 'pending'] as const).map(
                (name) => [name, t(`us.review.${name}`)] as [string, string],
              ),
              ...(field.alternatives ?? []).map(
                (name) => [name, option(name)] as [string, string],
              ),
            ]
          : [
              ['yes', t('form.yes')],
              ['no', t('form.no')],
            ];
    const selected =
      value === true ? 'yes' : value === false ? 'no' : String(value ?? '');
    return (
      <Field id={id} label={label} hint={hint} error={errors[id]}>
        <select
          {...control}
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
            {t(required ? 'us.form.choose' : 'us.form.unknown')}
          </option>
          {options.map(([name, text]) => (
            <option key={name} value={name}>
              {text}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  const isNumber = field.type === 'number' || field.type === 'integer';
  const input = (
    <input
      {...control}
      type={
        isNumber
          ? 'number'
          : field.type === 'month'
            ? 'month'
            : field.type === 'text'
              ? 'text'
              : 'date'
      }
      min={isNumber && !field.signed ? 0 : undefined}
      step={isNumber ? (field.type === 'number' ? 'any' : 1) : undefined}
      value={alternative ? '' : String(value ?? '')}
      onChange={(event) => {
        const text = event.target.value;
        if (field.alternatives)
          set(isNumber && text !== '' ? Number(text) : text);
        else set(text === '' ? undefined : isNumber ? Number(text) : text);
      }}
    />
  );
  if (!field.alternatives)
    return (
      <Field id={id} label={label} hint={hint} error={errors[id]}>
        {input}
      </Field>
    );
  // A date or amount can be replaced by a stated alternative, such as none.
  // The label names the entered value, or the choice until one is entered.
  const mode = value === undefined ? '' : (alternative ?? 'entered');
  const entered = mode === 'entered';
  return (
    <Field id={id} label={label} hint={hint} error={errors[id]}>
      <select
        id={entered ? id + '-mode' : id}
        aria-label={entered ? label : undefined}
        aria-invalid={!entered && errors[id] ? true : undefined}
        aria-describedby={describedBy}
        value={mode}
        onChange={(event) => {
          const answer = event.target.value;
          set(answer === '' ? undefined : answer === 'entered' ? '' : answer);
        }}
      >
        <option value="">{t('us.form.unknown')}</option>
        <option value="entered">
          {t(isNumber ? 'us.form.enterNumber' : 'us.form.enterDate')}
        </option>
        {field.alternatives.map((name) => (
          <option key={name} value={name}>
            {option(name)}
          </option>
        ))}
      </select>
      {entered && input}
    </Field>
  );
}

function GroupAnswers({
  field,
  value,
  alternative,
  id,
  draft,
  errors,
  set,
}: {
  field: Extract<UsField, { type: 'group' | 'list' }>;
  value: unknown;
  alternative?: string;
  id: string;
  draft: UsAnswers;
  errors: Record<string, TranslationKey>;
  set: (value: unknown) => void;
}) {
  const { t } = useTranslation();
  const record = isRecord(value) ? value : {};
  const nested = (
    <UsFields
      fields={field.fields}
      values={record}
      prefix={id}
      draft={draft}
      errors={errors}
      change={(name, answer) => {
        const next = updateAnswer(record, name, answer);
        set(Object.keys(next).length ? next : undefined);
      }}
    />
  );
  if (!field.alternatives) return nested;
  const mode = value === undefined ? '' : (alternative ?? 'details');
  return (
    <>
      <div className={form.field}>
        <select
          id={id + '-mode'}
          aria-label={t(`us.field.${field.label}`)}
          value={mode}
          onChange={(event) => {
            const answer = event.target.value;
            set(answer === '' ? undefined : answer === 'details' ? {} : answer);
          }}
        >
          <option value="">{t('us.form.unknown')}</option>
          {field.alternatives.map((name) => (
            <option key={name} value={name}>
              {t(`us.option.${name}` as TranslationKey)}
            </option>
          ))}
          <option value="details">{t('us.form.enterDetails')}</option>
        </select>
      </div>
      {mode === 'details' && nested}
    </>
  );
}

function Rows({
  field,
  value,
  id,
  draft,
  errors,
  set,
}: {
  field: UsField;
  value: unknown;
  id: string;
  draft: UsAnswers;
  errors: Record<string, TranslationKey>;
  set: (value: unknown) => void;
}) {
  const { t } = useTranslation();
  const rows = Array.isArray(value) ? (value as unknown[]) : [];
  const label = t(`us.field.${field.label}`);
  const replace = (index: number, row: unknown) =>
    set(rows.map((old, i) => (i === index ? row : old)));
  // Removing the last row returns to an unanswered list, not "none".
  const remove = (index: number) =>
    set(rows.length === 1 ? undefined : rows.filter((_, i) => i !== index));
  const removeButton = (index: number) => (
    <button
      type="button"
      className={form.remove}
      aria-label={`${t('us.form.remove')} ${label} ${index + 1}`}
      onClick={() => remove(index)}
    >
      {t('us.form.remove')}
    </button>
  );
  return (
    <>
      {rows.map((row, index) =>
        field.type === 'list' ? (
          <fieldset key={index} className={form.entry}>
            <legend>
              {label} {index + 1}
            </legend>
            <UsFields
              fields={field.fields}
              values={isRecord(row) ? row : {}}
              prefix={id + '-' + index}
              draft={draft}
              errors={errors}
              change={(name, answer) =>
                replace(
                  index,
                  updateAnswer(isRecord(row) ? row : {}, name, answer),
                )
              }
            />
            {removeButton(index)}
          </fieldset>
        ) : (
          <Field
            key={index}
            id={id + '-' + index}
            label={`${label} ${index + 1}`}
            error={errors[id + '-' + index]}
          >
            <input
              id={id + '-' + index}
              type="date"
              aria-invalid={errors[id + '-' + index] ? true : undefined}
              aria-describedby={
                errors[id + '-' + index] ? `${id}-${index}-error` : undefined
              }
              value={String(row ?? '')}
              onChange={(event) => replace(index, event.target.value)}
            />
            {removeButton(index)}
          </Field>
        ),
      )}
      {Array.isArray(value) && !rows.length && (
        <p>{t('us.form.noneConfirmed')}</p>
      )}
      <div className={site.actions}>
        <button
          type="button"
          className={site.secondary}
          onClick={() => set([...rows, field.type === 'list' ? {} : ''])}
        >
          {t('us.form.add')} · {label}
        </button>
        {!rows.length && (
          <button
            type="button"
            className={form.copyRow}
            onClick={() => set(value === undefined ? [] : undefined)}
          >
            {t(value === undefined ? 'us.form.noRecords' : 'us.form.reset')}
          </button>
        )}
      </div>
    </>
  );
}
