'use client';

import { ResultPage } from '../../../components/result-page';
import { canadaModule } from '../../../lib/canada-module';

export default function Page() {
  return <ResultPage country={canadaModule} />;
}
