'use client';

import { PolicyPage } from '../../../components/policy-page';
import { germanyModule } from '../../../lib/germany-module';

export default function Page() {
  return <PolicyPage country={germanyModule} />;
}
