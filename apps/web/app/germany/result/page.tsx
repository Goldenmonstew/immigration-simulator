'use client';

import { ResultPage } from '../../../components/result-page';
import { germanyModule } from '../../../lib/germany-module';

export default function Page() {
  return <ResultPage country={germanyModule} />;
}
