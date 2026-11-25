'use client';

import { PolicyPage } from '../../../components/policy-page';
import { unitedStatesModule } from '../../../lib/united-states-module';

export default function Page() {
  return <PolicyPage country={unitedStatesModule} />;
}
