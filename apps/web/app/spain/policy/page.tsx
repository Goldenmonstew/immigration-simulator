'use client';

import { PolicyPage } from '../../../components/policy-page';
import { spainModule } from '../../../lib/spain-module';

export default function Page() {
  return <PolicyPage country={spainModule} />;
}
