'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { japanModule } from '../../../lib/japan-module';

export default function Page() {
  return <WhatIfPageContent country={japanModule} />;
}
