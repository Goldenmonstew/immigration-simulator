'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { ukModule } from '../../../lib/uk-module';

export default function WhatIfPage() {
  return <WhatIfPageContent country={ukModule} />;
}
