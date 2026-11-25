'use client';

import { ResultPage } from '../../../components/result-page';
import { irelandModule } from '../../../lib/ireland-module';

export default function Page() {
  return <ResultPage country={irelandModule} />;
}
