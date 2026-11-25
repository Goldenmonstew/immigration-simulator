import type { ComponentType } from 'react';
import type { CountryCheck, CountryPathway } from '@uk-immigration/engine';
import type { TranslationKey } from '../i18n';

export interface WhatIfTarget {
  focus: string;
  ruleId?: string;
  assessment?: Pick<CountryPathway, 'earliestDate'>;
}

export interface WhatIfControlsProps<D, K> {
  afterDraft: D;
  knobs: K;
  errors: Record<string, TranslationKey>;
  update: (patch: Partial<K>) => void;
}

export interface CountryWhatIf<D, K> {
  focusControls: Record<string, string>;
  focusForRule: (id: string, pathwayId: string) => string | undefined;
  initial: (draft: D, target?: WhatIfTarget) => K;
  apply: (draft: D, knobs: K) => D;
  validate: (afterDraft: D, knobs: K) => Record<string, TranslationKey>;
  Controls: ComponentType<WhatIfControlsProps<D, K>>;
  // The conditions the comparison groups list; every condition when unset.
  compared?: (check: CountryCheck) => boolean;
}

export function parseWhatIfFocus(
  controls: Record<string, string>,
  value: string | null,
): string | undefined {
  return value && Object.hasOwn(controls, value) ? value : undefined;
}

// Keep the clicked path in its own country and tab, outside the URL.
const pendingTargets = new Map<string, WhatIfTarget>();
export function rememberWhatIfTarget(countryId: string, target: WhatIfTarget) {
  pendingTargets.set(countryId, target);
}
export function takeWhatIfTarget(
  countryId: string,
  focus: string | undefined,
): WhatIfTarget | undefined {
  const target = pendingTargets.get(countryId);
  pendingTargets.delete(countryId);
  return focus ? (target?.focus === focus ? target : { focus }) : undefined;
}

export function diffPathways(
  before?: CountryPathway,
  after?: CountryPathway,
  compared: (check: CountryCheck) => boolean = () => true,
) {
  const becameMet: CountryPathway['checks'] = [];
  const becameUnmet: CountryPathway['checks'] = [];
  const stillUnmet: CountryPathway['checks'] = [];
  const becameInapplicable: CountryPathway['checks'] = [];
  for (const check of after?.checks ?? []) {
    const previous = before?.checks.find((item) => item.id === check.id);
    if (check.applicable === false) {
      if (previous && previous.applicable !== false)
        becameInapplicable.push(check);
      continue;
    }
    if (!compared(check)) continue;
    if (check.status === 'MET') {
      if (previous?.status !== 'MET' || previous.applicable === false)
        becameMet.push(check);
    } else if (
      !previous ||
      previous.status === 'MET' ||
      (previous.status === 'UNKNOWN' && check.status === 'NOT_MET')
    ) {
      becameUnmet.push(check);
    } else {
      stillUnmet.push(check);
    }
  }
  return {
    becameMet,
    becameUnmet,
    stillUnmet,
    becameInapplicable,
    changed: JSON.stringify(before) !== JSON.stringify(after),
  };
}
