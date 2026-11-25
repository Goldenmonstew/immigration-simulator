'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { spainModule } from '../../../lib/spain-module';

export default function Page() {
  return <WhatIfPageContent country={spainModule} />;
}
