// Bind the original UK fixtures to the shared comparison and focus APIs.
import {
  adaptUkResult,
  type SettlementAssessment,
} from '@uk-immigration/engine';
import { WhatIfView as CountryWhatIfView } from '../components/whatif-lab';
import { type Draft } from '../lib/questionnaire';
import { ukModule } from '../lib/uk-module';
import { focusControls } from '../lib/uk-whatif';
import * as whatif from '../lib/whatif';

export {
  applyWhatIf,
  focusForRule,
  initialWhatIf,
  tripDays,
} from '../lib/uk-whatif';

export const WhatIfView = (props: {
  draft?: Draft;
  target?: whatif.WhatIfTarget;
}) => <CountryWhatIfView country={ukModule} {...props} />;
export const parseWhatIfFocus = (value: string | null) =>
  whatif.parseWhatIfFocus(focusControls, value);
export const rememberWhatIfTarget = (target: whatif.WhatIfTarget) =>
  whatif.rememberWhatIfTarget('uk', target);
export const takeWhatIfTarget = (focus: string | undefined) =>
  whatif.takeWhatIfTarget('uk', focus);

function pathway(assessment: SettlementAssessment) {
  return adaptUkResult({
    policyAsOf: '',
    byRuleSet: { 'current-law-2026-11': assessment },
  }).columns[0].pathways[0];
}

export function diffAssessment(
  before: SettlementAssessment,
  after: SettlementAssessment,
) {
  const diff = whatif.diffPathways(pathway(before), pathway(after));
  // Keep the fixture assertions in the UK engine's original rule vocabulary.
  const ukRules = (checks: typeof diff.becameMet) =>
    checks.map((check) => ({
      ...check,
      status: ({ MET: 'PASS', NOT_MET: 'FAIL', UNKNOWN: 'UNKNOWN' } as const)[
        check.status
      ],
    }));
  return {
    becameMet: ukRules(diff.becameMet),
    becameUnmet: ukRules(diff.becameUnmet),
    stillUnmet: ukRules(diff.stillUnmet),
    changed: diff.changed,
  };
}
