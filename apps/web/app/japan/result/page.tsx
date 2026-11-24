'use client';

import { ResultPage } from '../../../components/result-page';
import { japanModule } from '../../../lib/japan-module';

export default function Page() {
  return <ResultPage country={japanModule} />;
}
