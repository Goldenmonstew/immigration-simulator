import { defaultBalance } from '../../default-balance';

// 游戏设定，不是政策数字。All values here are fictional game balancing in euros.
// Policy figures (fees, card periods, deadlines) come from policy-data.
export const grBalance = {
  ...defaultBalance,
  // Mild, rainy winters and long dry summers on the Attic coast.
  weatherWeights: {
    1: [35, 35, 30, 0],
    2: [55, 30, 15, 0],
    3: [85, 12, 3, 0],
    4: [55, 30, 15, 0],
  } as Record<1 | 2 | 3 | 4, number[]>,
  livingCosts: 6_600,
  householdCostContribution: { spouse: -1_800 } as Record<string, number>,
  /** Net annual pay of the spouse's Greek husband, shared with the household. */
  householdIncome: { spouse: 20_000 } as Record<string, number>,
  /** Gross taxable pay before promotions, declared at the yearly tax return. */
  grossSalary: { bluecard: 56_000, spouse: 19_000 } as Record<string, number>,
  livingCostAnnualIncrease: 120,
  rentRisePerQuarter: 150,
  cheapHousingSaving: 450,
  plotAnnualRent: 40,
  housingDeposit: 1_800,
  housingMoveCost: 400,
  housingRent: 750,
  /**
   * Game minutes to walk from home to the migration office in the browser:
   * 38 tiles on the town map, about 4 s when walking to a place (145 px/s) or
   * 7 s with the keys (85 px/s), and the outdoor clock moves 10 minutes every
   * 2 s, so up to four ticks.
   */
  walkToVisaMinutes: 40,
  lifestyleReserve: { bluecard: 4_000, spouse: 5_000 } as Record<
    string,
    number
  >,
  furnishings: {
    'reading-chair': { price: 180, mood: 1, health: 1 },
    'warm-curtains': { price: 60, mood: 1, health: 0 },
    'desk-lamp': { price: 25, mood: 0, health: 1 },
  } as Record<string, { price: number; mood: number; health: number }>,
  prices: {
    seed: 2,
    produce: 1,
    tea: 3,
    koulouri: 1,
    baklava: 8,
    flowers: 6,
    oil: 12,
    festival: 4,
  },
  food: {
    cropMood: 1,
    cropHealth: 1,
    fishHealth: 2,
    teaMood: 2,
    sweetMood: 3,
    mealMood: 4,
    mealHealth: 4,
  },
  cropDays: 3,
  recipeMinutes: 40,
  workMoney: 120,
  workCareer: 3,
  overtimeMoney: 90,
  overtimeCareer: 3,
  overtimeMood: -4,
  overtimeHealth: -3,
  classCost: 10,
  classGreek: 3,
  studyGreek: 1,
  greekDecay: 1,
  /** In-game readiness for the A2 language and history exam, not an exam score. */
  greekA2Score: 45,
  /** In-game readiness for the Π.Ε.Γ.Π. naturalisation exam. */
  greekPegpScore: 70,
  restMood: 3,
  restHealth: 4,
  napMood: 2,
  napHealth: 2,
  gpCost: 10,
  gpHealth: 6,
  relaxCost: 18,
  relaxMood: 3,
  coffeeCost: 3,
  coffeeMood: 2,
  tavliMood: 2,
  benchMood: 2,
  candleCost: 1,
  boardMood: 1,
  clubFee: 60,
  festivalMood: 3,
  festivalStart: 600,
  panigyriStart: 1140,
  travelMood: 14,
  travelCostPerMonth: 900,
  fishingJunkChance: 0.12,
  routineMoodTarget: 72,
  routineHealthTarget: 68,
  routineEventMoneyLimit: 400,
};
