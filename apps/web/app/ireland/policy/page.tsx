'use client';

import { PolicyPage } from '../../../components/policy-page';
import { irelandModule } from '../../../lib/ireland-module';

export default function Page() {
  return <PolicyPage country={irelandModule} />;
}
