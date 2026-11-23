import type { IsoDate } from './model';

export const dayMs = 86_400_000;
export const addDays = (date: IsoDate, days: number): IsoDate =>
  new Date(Date.parse(date) + days * dayMs).toISOString().slice(0, 10);

export function addMonths(date: IsoDate, months: number): IsoDate {
  const [year, month, day] = date.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return target.toISOString().slice(0, 10);
}

export function firstWeekday(date: IsoDate, weekday: number): IsoDate {
  const delta = (weekday - new Date(date).getUTCDay() + 7) % 7;
  return addDays(date, delta || 7);
}
