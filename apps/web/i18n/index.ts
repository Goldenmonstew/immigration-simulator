import { en } from './en';
import { zhCN } from './zh-CN';

export type TranslationKey = keyof typeof zhCN;
export function t(
  key: TranslationKey,
  locale: 'zh-CN' | 'en' = 'zh-CN',
): string {
  return locale === 'en' ? en[key] : zhCN[key];
}

/** Fills `{key}` with `n` and `{key:s}` with the English plural ending. */
export function withCount(text: string, key: string, n: number): string {
  return text
    .replaceAll(`{${key}}`, String(n))
    .replaceAll(`{${key}:s}`, n === 1 ? '' : 's');
}
