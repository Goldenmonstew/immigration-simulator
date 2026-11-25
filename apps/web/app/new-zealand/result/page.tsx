'use client';

import { ResultPage } from '../../../components/result-page';
import { newZealandModule } from '../../../lib/new-zealand-module';

export default function Page() {
  return <ResultPage country={newZealandModule} />;
}
