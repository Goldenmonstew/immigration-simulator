import { defaultBalance } from '../../default-balance';

// 游戏设定，不是政策数字。All values here are fictional game balancing in euros.
// Policy figures (fees, test marks, periods) come from policy-data or the engine.
export const deBalance = {
  ...defaultBalance,
  // A Central European calendar: cold, grey winters with some snow; showery
  // springs and autumns; warm summers with thunderstorms.
  weatherWeights: {
    1: [15, 40, 30, 15],
    2: [35, 30, 35, 0],
    3: [50, 25, 25, 0],
    4: [25, 35, 40, 0],
  } as Record<1 | 2 | 3 | 4, number[]>,
  // Rent, food, tax and social contributions per quarter.
  livingCosts: 13_000,
  // Lena pays her share of the flat and the shopping.
  householdCostContribution: { spouse: 7_800 } as Record<string, number>,
  livingCostAnnualIncrease: 250,
  rentRisePerQuarter: 150,
  cheapHousingSaving: 1_200,
  /** Fictional annual pay where the timeline holds no salary. */
  salary: { spouse: 22_000 } as Record<string, number>,
  plotAnnualRent: 60,
  lifestyleReserve: { bluecard: 6_000, spouse: 3_000 } as Record<
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
    drink: 2,
    brezel: 2,
    flowers: 6,
    kuchen: 9,
    festival: 5,
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
  workMoney: 140,
  workCareer: 3,
  overtimeMoney: 110,
  overtimeCareer: 3,
  overtimeMood: -4,
  overtimeHealth: -3,
  classCost: 4,
  classGerman: 3,
  studyGerman: 1,
  germanDecay: 1,
  /** In-game readiness for the B1 exam, not a CEFR score. */
  germanExamScore: 60,
  /**
   * In-game German points per correct answer in the Leben in Deutschland
   * test, capped at the number of questions (game setting).
   */
  germanPerTestAnswer: 3,
  restMood: 3,
  restHealth: 4,
  napMood: 2,
  napHealth: 2,
  gpCost: 10,
  gpHealth: 6,
  relaxCost: 9,
  relaxMood: 3,
  coffeeCost: 4,
  coffeeMood: 2,
  benchMood: 2,
  marketMood: 2,
  boardMood: 1,
  clubFee: 60,
  festivalMood: 3,
  festivalStart: 600,
  lanternStart: 1020,
  travelMood: 14,
  travelCostPerMonth: 900,
  fishingJunkChance: 0.15,
  routineMoodTarget: 72,
  routineHealthTarget: 68,
  /** Months before expiry when the game reminds you of the permit date. */
  reminderMonths: 12,
  routineEventMoneyLimit: 600,
};
