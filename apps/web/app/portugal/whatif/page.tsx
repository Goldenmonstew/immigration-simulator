'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { portugalModule } from '../../../lib/portugal-module';

export default function Page() {
  return <WhatIfPageContent country={portugalModule} />;
}
