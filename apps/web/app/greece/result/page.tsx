'use client';

import { ResultPage } from '../../../components/result-page';
import { greeceModule } from '../../../lib/greece-module';

export default function Page() {
  return <ResultPage country={greeceModule} />;
}
