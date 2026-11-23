import type {
  BenefitEpisode,
  CriminalEvent,
  EnglishEvidence,
  ImmigrationBreach,
  ImmigrationEpisode,
  PersonTimeline,
  Relationship,
} from '@uk-immigration/engine';

export type UkEffect =
  | { type: 'absence'; startOffsetDays: number; days: number }
  | {
      type: 'income';
      taxYear: 'current' | 'next';
      earnings?: number;
      partnerEarnings?: number;
    }
  | { type: 'episode'; patch: Partial<Omit<ImmigrationEpisode, 'validFrom'>> }
  | {
      type: 'newEpisode';
      episode: Omit<ImmigrationEpisode, 'validFrom' | 'validTo'>;
      durationMonths: number;
      gapDays?: number;
      /** Renewal appends at expiry; default replaces permission from today. */
      start?: 'afterCurrent';
    }
  | {
      type: 'benefit';
      benefit: Omit<BenefitEpisode, 'from' | 'to'>;
      startOffsetDays: number;
      months?: number;
    }
  | { type: 'relationship'; add?: Relationship; remove?: Relationship['type'] }
  | {
      type: 'english';
      cefrLevel: Extract<EnglishEvidence, { cefrLevel: unknown }>['cefrLevel'];
    }
  | { type: 'lifeInTheUk' }
  | {
      type: 'breach';
      breach: Omit<ImmigrationBreach, 'date'>;
      offsetDays?: number;
    }
  | {
      type: 'criminal';
      event: Omit<CriminalEvent, 'date'>;
      offsetDays?: number;
    }
  | {
      type: 'timeline';
      patch: Pick<
        PersonTimeline,
        'cashSavings' | 'partnerSpecifiedBenefit' | 'governmentDebt'
      >;
    };
