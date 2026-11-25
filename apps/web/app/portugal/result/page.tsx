'use client';

import { ResultPage } from '../../../components/result-page';
import { portugalModule } from '../../../lib/portugal-module';

export default function Page() {
  return <ResultPage country={portugalModule} />;
}
