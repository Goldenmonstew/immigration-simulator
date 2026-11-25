'use client';

import { WhatIfPageContent } from '../../../components/whatif-lab';
import { newZealandModule } from '../../../lib/new-zealand-module';

export default function Page() {
  return <WhatIfPageContent country={newZealandModule} />;
}
