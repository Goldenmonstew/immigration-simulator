'use client';

import { ResultPage } from '../../../components/result-page';
import { unitedStatesModule } from '../../../lib/united-states-module';

export default function Page() {
  return <ResultPage country={unitedStatesModule} />;
}
