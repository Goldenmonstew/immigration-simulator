'use client';

import type { Locale } from '@uk-immigration/engine';
import { ResultPage } from '../../../components/result-page';
import { ukModule, ukResult } from '../../../lib/uk-module';
import { mockResults } from '../../../lib/mock-results';

function preview(id: string, locale: Locale) {
  if (id === '1' || id === '2')
    return ukResult(mockResults(locale)[id], locale);
}

export default function ResultContent() {
  return <ResultPage country={ukModule} preview={preview} />;
}
