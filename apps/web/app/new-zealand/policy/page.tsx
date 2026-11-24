'use client';

import { PolicyPage } from '../../../components/policy-page';
import { newZealandModule } from '../../../lib/new-zealand-module';

export default function Page() {
  return <PolicyPage country={newZealandModule} />;
}
