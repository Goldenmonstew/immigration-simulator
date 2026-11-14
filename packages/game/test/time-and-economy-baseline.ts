// Measured before task 11.2 on commit 8561cbe, seeds 1–20.
// Same active routine; new purchases are used only when the menu offers them.
export const beforeTimeEconomy: Record<
  string,
  {
    eventCards: number[];
    debtEvents: number;
    negativeQuarters: number;
    overstayed: number;
    tenthMoney: number[];
  }
> = {
  'skilled-worker': {
    eventCards: [
      46, 48, 40, 44, 44, 35, 41, 42, 41, 44, 46, 40, 46, 46, 37, 46, 41, 46,
      37, 43,
    ],
    debtEvents: 3,
    negativeQuarters: 15,
    overstayed: 0,
    tenthMoney: [
      696.5, 86339.25, -1872, 1516.5, 72998, -979.75, 26109.75, -1469, 73277.25,
      -1380.75, 6293.25, 2510.75, 33406.5, 88307.5, 789.25, -2306.5, -2568.25,
      26833, -1961.5, 15487,
    ],
  },
  'hong-kong-bno': {
    eventCards: [
      31, 38, 48, 35, 45, 45, 47, 46, 43, 38, 40, 39, 44, 52, 39, 34, 39, 41,
      39, 43,
    ],
    debtEvents: 17,
    negativeQuarters: 36,
    overstayed: 3,
    tenthMoney: [
      2898.25, -1130.5, -1027.5, -2997.5, -3012.75, -13, -1634.5, 223.25, -1370,
      2051.5, 2361.5, 3096.5, -2310.5, 1160.5, -584.5, 396, 35183.5,
    ],
  },
  'family-partner': {
    eventCards: [
      47, 47, 41, 44, 41, 29, 45, 44, 44, 36, 29, 43, 43, 49, 38, 29, 45, 35,
      45, 41,
    ],
    debtEvents: 72,
    negativeQuarters: 103,
    overstayed: 12,
    tenthMoney: [
      72894, -4628.5, -144.75, -3226.25, -1890.5, -12240.5, 91342, 16481,
    ],
  },
};
