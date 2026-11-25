'use client';

import { PolicyPage } from '../../../components/policy-page';
import { australiaModule } from '../../../lib/australia-module';

export default function Page() {
  return <PolicyPage country={australiaModule} />;
}
