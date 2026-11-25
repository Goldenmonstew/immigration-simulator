'use client';

import { PolicyPage } from '../../../components/policy-page';
import { greeceModule } from '../../../lib/greece-module';

export default function Page() {
  return <PolicyPage country={greeceModule} />;
}
