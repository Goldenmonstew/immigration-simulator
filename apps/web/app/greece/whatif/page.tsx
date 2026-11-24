'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { greeceModule } from '../../../lib/greece-module';

export default function Page() {
  return <WhatIfPageContent country={greeceModule} />;
}
