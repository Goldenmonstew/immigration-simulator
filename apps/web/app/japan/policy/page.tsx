'use client';

import { PolicyPage } from '../../../components/policy-page';
import { japanModule } from '../../../lib/japan-module';

export default function Page() {
  return <PolicyPage country={japanModule} />;
}
