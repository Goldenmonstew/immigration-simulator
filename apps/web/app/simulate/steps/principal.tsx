'use client';

import site from '../../site.module.css';
import type { FormKit } from '../form-kit';
import { Field } from '../field';

export function PrincipalStep({ form }: { form: FormKit }) {
  const { t, draft, dispatch, errors, setErrors, fieldProps } = form;
  return (
    <>
      <p>{t('principal.hint')}</p>
      <p>
        {t(
          draft.principalCompleted ? 'principal.saved' : 'principal.incomplete',
        )}
      </p>
      <Field
        id="principal"
        label={t('step.principal')}
        error={errors.principal}
      >
        <button
          {...fieldProps('principal')}
          type="button"
          className={site.secondary}
          onClick={() => {
            setErrors({});
            dispatch({ type: 'principal-start' });
          }}
        >
          {t(draft.principal ? 'principal.edit' : 'principal.start')}
        </button>
      </Field>
    </>
  );
}
