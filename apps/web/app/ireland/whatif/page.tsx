'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { irelandModule } from '../../../lib/ireland-module';

export default function Page() {
  return <WhatIfPageContent country={irelandModule} />;
}
