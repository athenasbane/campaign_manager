export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR; // 360
export const WEEK_DAYS = [
  "Firstday",
  "Forge’s Day",
  "Spireday",
  "Midday",
  "Coal’s Day",
  "Ledger’s Day",
  "Restday",
] as const;

export const MONTHS = [
  { idx: 1, imperial: "Frostwane", slang: "Coalmonth" },
  { idx: 2, imperial: "Emberrest", slang: "Smogveil" },
  { idx: 3, imperial: "Rainmelt", slang: "Rustflow" },
  { idx: 4, imperial: "Blossomreach", slang: "Emberbloom" },
  { idx: 5, imperial: "Sunhold", slang: "The Bright Weeks" },
  { idx: 6, imperial: "Midsummer", slang: "Heatforge" },
  { idx: 7, imperial: "Emberwane", slang: "Smokepeak" },
  { idx: 8, imperial: "Harvestwane", slang: "Grainbind" },
  { idx: 9, imperial: "Ashfall", slang: "Widow’s Month" },
  { idx: 10, imperial: "Frostmourn", slang: "Deadmonth" },
  { idx: 11, imperial: "Blackwane", slang: "Veil’s Edge" },
  { idx: 12, imperial: "Deepfrost", slang: "Icebound" },
] as const;

export type TordenDate = {
  year: number; // e.g., 1023
  month: MonthIndex; // 1..12 (Imperial index above)
  day: number; // 1..30
};

/** Convert Tordenhelm date to a global ordinal day index (0-based). */
export function toOrdinal({ year, month, day }: TordenDate): number {
  if (month < 1 || month > 12) throw new Error("Month out of range");
  if (day < 1 || day > 30) throw new Error("Day out of range");
  // Choose an epoch; 0 = year 0, Frostwane 1
  return year * DAYS_PER_YEAR + (month - 1) * DAYS_PER_MONTH + (day - 1);
}

/** Convert global ordinal back to Tordenhelm date. */
export function fromOrdinal(ordinal: number): TordenDate {
  if (ordinal < 0) throw new Error("Negative ordinal");
  const year = Math.floor(ordinal / DAYS_PER_YEAR);
  const rem = ordinal % DAYS_PER_YEAR;
  const month = (Math.floor(rem / DAYS_PER_MONTH) + 1) as MonthIndex;
  const day = (rem % DAYS_PER_MONTH) + 1;
  return { year, month, day };
}

/** Day-of-week (0..6) for a given ordinal. Firstday for ordinal 0. */
export function weekdayIndex(ordinal: number): number {
  return ((ordinal % 7) + 7) % 7;
}

export function formatTordenDate(d: TordenDate, useSlang = false): string {
  const m = MONTHS[d.month - 1];
  const mName = useSlang ? m.slang : m.imperial;
  return `${mName} ${d.day}, ${d.year}`;
}

export function formatWeekday(ordinal: number): string {
  return WEEK_DAYS[weekdayIndex(ordinal)];
}
