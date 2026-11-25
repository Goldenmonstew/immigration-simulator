'use client';

import { ResultPage } from '../../../components/result-page';
import { australiaModule } from '../../../lib/australia-module';

export default function Page() {
  return <ResultPage country={australiaModule} />;
}
