'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { malaysiaModule } from '../../../lib/malaysia-module';

export default function Page() {
  return <WhatIfPageContent country={malaysiaModule} />;
}
