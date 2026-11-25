'use client';

import { PolicyPage } from '../../../components/policy-page';
import { malaysiaModule } from '../../../lib/malaysia-module';

export default function Page() {
  return <PolicyPage country={malaysiaModule} />;
}
