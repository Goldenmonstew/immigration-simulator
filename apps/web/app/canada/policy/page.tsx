'use client';

import { PolicyPage } from '../../../components/policy-page';
import { canadaModule } from '../../../lib/canada-module';

export default function Page() {
  return <PolicyPage country={canadaModule} />;
}
