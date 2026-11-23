'use client';

import { PolicyPage } from '../../../components/policy-page';
import { ukModule } from '../../../lib/uk-module';

export default function Page() {
  return <PolicyPage country={ukModule} />;
}
