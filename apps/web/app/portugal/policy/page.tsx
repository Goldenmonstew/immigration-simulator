'use client';

import { PolicyPage } from '../../../components/policy-page';
import { portugalModule } from '../../../lib/portugal-module';

export default function Page() {
  return <PolicyPage country={portugalModule} />;
}
