'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { unitedStatesModule } from '../../../lib/united-states-module';

export default function Page() {
  return <WhatIfPageContent country={unitedStatesModule} />;
}
