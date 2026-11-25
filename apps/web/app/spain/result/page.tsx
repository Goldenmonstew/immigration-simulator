'use client';

import { ResultPage } from '../../../components/result-page';
import { spainModule } from '../../../lib/spain-module';

export default function Page() {
  return <ResultPage country={spainModule} />;
}
