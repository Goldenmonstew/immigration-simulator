'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { canadaModule } from '../../../lib/canada-module';

export default function Page() {
  return <WhatIfPageContent country={canadaModule} />;
}
