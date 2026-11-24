import { defaultBalance } from '../../default-balance';

// 游戏设定，不是政策数字。All values here are fictional game balancing in
// Canadian dollars. Policy figures (fees, day counts, test format, language
// levels) come from policy-data or the rules engine.
export const caBalance = {
  ...defaultBalance,
  // Halifax: snowy winters, wet springs, foggy summers, stormy autumns.
  weatherWeights: {
    1: [20, 30, 20, 30],
    2: [30, 30, 40, 0],
    3: [45, 30, 25, 0],
    4: [30, 30, 40, 0],
  } as Record<1 | 2 | 3 | 4, number[]>,
  livingCosts: 15_000,
  /** The graduate shares a flat with a roommate. */
  householdCostContribution: { graduate: 4_500 } as Record<string, number>,
  livingCostAnnualIncrease: 300,
  rentRisePerQuarter: 150,
  cheapHousingSaving: 1_200,
  plotAnnualRent: 40,
  housingDeposit: 2_200,
  housingMoveCost: 600,
  housingRent: 900,
  lifestyleReserve: { citizen: 6_000, graduate: 8_000 } as Record<
    string,
    number
  >,
  furnishings: {
    'reading-chair': { price: 240, mood: 1, health: 1 },
    'warm-curtains': { price: 60, mood: 1, health: 0 },
    'desk-lamp': { price: 30, mood: 0, health: 1 },
  } as Record<string, { price: number; mood: number; health: number }>,
  prices: {
    seed: 4,
    coffee: 3,
    doughnut: 2,
    flowers: 12,
    mapleSyrup: 15,
    oatcakes: 6,
    blueberries: 5,
    festival: 8,
  },
  food: {
    cropMood: 1,
    cropHealth: 1,
    fishHealth: 2,
    drinkMood: 2,
    sweetMood: 3,
    mealMood: 4,
    mealHealth: 4,
  },
  cropDays: 3,
  recipeMinutes: 40,
  workMoney: 160,
  workCareer: 3,
  overtimeMoney: 140,
  overtimeCareer: 3,
  overtimeMood: -4,
  overtimeHealth: -3,
  classCost: 15,
  classEnglish: 3,
  studyEnglish: 1,
  englishDecay: 1,
  /** In-game readiness for the language test, not a CLB level. */
  englishTestScore: 60,
  testCost: 280,
  civicsStudy: 3,
  civicsClass: 5,
  /** In-game readiness for the citizenship test, not a test score. */
  civicsTestScore: 60,
  /** Career the hospital asks for before offering a permanent post. */
  offerCareer: 40,
  /**
   * The expiry printed on the story's endorsement certificate, counted from
   * its issue. A fictional document date, not the province's validity rule.
   */
  endorsementMonths: 6,
  restMood: 3,
  restHealth: 4,
  napMood: 2,
  napHealth: 2,
  gpHealth: 6,
  relaxCost: 28,
  relaxMood: 3,
  coffeeCost: 3,
  coffeeMood: 2,
  benchMood: 2,
  buskerTip: 2,
  boardMood: 1,
  circleMood: 2,
  clubFee: 60,
  festivalMood: 3,
  festivalStart: 600,
  fireworksStart: 1260,
  travelMood: 14,
  travelCostPerMonth: 1_800,
  fishingJunkChance: 0.12,
  routineMoodTarget: 72,
  routineHealthTarget: 68,
  routineEventMoneyLimit: 600,
};
