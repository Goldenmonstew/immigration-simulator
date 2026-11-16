'use client';

import type { ReactNode } from 'react';
import type { TranslationKey } from '../../i18n';
import { useTranslation } from '../../i18n/locale';
import styles from './form.module.css';

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: TranslationKey;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.field} ${error ? styles.invalid : ''}`}>
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          {t(error)}
        </p>
      )}
      {children}
    </div>
  );
}
