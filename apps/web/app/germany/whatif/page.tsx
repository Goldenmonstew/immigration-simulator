'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { germanyModule } from '../../../lib/germany-module';

export default function Page() {
  return <WhatIfPageContent country={germanyModule} />;
}
