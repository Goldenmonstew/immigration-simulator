import type {
  SimulationResult,
  SettlementAssessment,
} from '@uk-immigration/engine';
import {
  ResultView as CountryView,
  PrincipalAssessment as CountryPrincipal,
  CountryAssessmentColumns,
} from '../components/result-view';
import { PolicyStatus as CountryStatus } from '../components/policy-status';
import { GapSummary as CountryGap } from '../components/gap-summary';
import { useTranslation } from '../i18n/locale';
import { gapRules as countryGapRules } from '../lib/gap-summary';
import type { Draft } from '../lib/questionnaire';
import { ukModule, ukResult } from '../lib/uk-module';
import { adaptUkResult } from '@uk-immigration/engine';

export function ResultView({
  result,
  draft,
  mock,
}: {
  result: SimulationResult;
  draft?: Draft;
  mock?: boolean;
}) {
  const { locale } = useTranslation();
  // The navigation probe inspects the buttons returned by this view directly.
  return CountryView({
    country: ukModule,
    result: ukResult(result, locale),
    draft,
    mock,
  });
}

export function PrincipalAssessment({ result }: { result: SimulationResult }) {
  const { locale } = useTranslation();
  return (
    <CountryPrincipal country={ukModule} result={ukResult(result, locale)} />
  );
}

function pathway(assessment: SettlementAssessment) {
  return adaptUkResult({
    policyAsOf: '',
    byRuleSet: { 'current-law-2026-11': assessment },
  }).columns[0].pathways[0];
}

export function GapSummary({
  assessment,
  ...props
}: {
  assessment: SettlementAssessment;
  simulationDate?: string;
  canWhatIf?: boolean;
}) {
  return (
    <CountryGap
      country={ukModule}
      assessment={pathway(assessment)}
      {...props}
    />
  );
}

export function gapRules(assessment: SettlementAssessment) {
  const gaps = countryGapRules(pathway(assessment));
  return assessment.rules.filter((rule) =>
    gaps.some((gap) => gap.id === rule.id),
  );
}

export function AssessmentColumns({
  result,
  idPrefix,
}: {
  result: SimulationResult;
  idPrefix?: string;
}) {
  const { locale } = useTranslation();
  return CountryAssessmentColumns({
    country: ukModule,
    result: ukResult(result, locale),
    idPrefix,
  });
}

export function PolicyStatus({ asOf }: { asOf: string }) {
  return <CountryStatus country={ukModule} asOf={asOf} />;
}
