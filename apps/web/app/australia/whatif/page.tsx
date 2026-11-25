'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { australiaModule } from '../../../lib/australia-module';

export default function Page() {
  return <WhatIfPageContent country={australiaModule} />;
}
