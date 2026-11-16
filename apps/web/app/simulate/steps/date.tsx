'use client';

import { needsPrincipal, visibleIncomeYears } from '../../../lib/questionnaire';
import site from '../../site.module.css';
import type { FormKit } from '../form-kit';

export function DateStep({ form }: { form: FormKit }) {
  const { t, p, draft, dispatch, active, goTo, dateField } = form;
  return (
    <>
      <p>{t('date.hint')}</p>
      {dateField(
        'simulationDate',
        t('date.label'),
        draft.simulationDate,
        (date) => dispatch({ type: 'date', date }),
      )}
      <p>
        {t('date.incomeWindow')}
        {p.colon}
        {visibleIncomeYears(active)
          .map((row) => row.taxYear)
          .join(p.list)}
      </p>
      <button type="button" className={site.secondary} onClick={() => goTo(4)}>
        {t('date.reviewIncome')}
      </button>
      {needsPrincipal(draft) && draft.principal && (
        <button
          type="button"
          className={site.secondary}
          onClick={() => goTo(9)}
        >
          {t('principal.edit')}
        </button>
      )}
      <p className={site.notice}>{t('home.disclaimer')}</p>
    </>
  );
}
