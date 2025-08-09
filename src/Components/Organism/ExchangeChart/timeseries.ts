import { toOrdinal } from "../../../helpers/TordenhelmCalendar";

export type Snapshot = {
  ordinal: number;
  GLD: number;
  CIR: number;
  FRT: number;
  PRA: number;
  KRA: number;
  SHA: number;
  FRE: number;
  MAM: number;
  MON: number;
  VIL: number;
};

export const snapshots: Snapshot[] = [
  {
    ordinal: toOrdinal({ year: 1023, month: 1, day: 1 }),
    GLD: 1,
    CIR: 1.1,
    FRT: 0.22,
    PRA: 1.35,
    KRA: 1.15,
    SHA: 1.25,
    FRE: 0.95,
    MAM: 0.75,
    MON: 1.45,
    VIL: 1.05,
  },
  {
    ordinal: toOrdinal({ year: 1023, month: 1, day: 2 }),
    GLD: 1,
    CIR: 1.11,
    FRT: 0.21,
    PRA: 1.33,
    KRA: 1.16,
    SHA: 1.24,
    FRE: 0.96,
    MAM: 0.74,
    MON: 1.46,
    VIL: 1.06,
  },
  {
    ordinal: toOrdinal({ year: 1023, month: 1, day: 3 }),
    GLD: 1,
    CIR: 1.09,
    FRT: 0.23,
    PRA: 1.36,
    KRA: 1.14,
    SHA: 1.27,
    FRE: 0.94,
    MAM: 0.76,
    MON: 1.44,
    VIL: 1.04,
  },
  // ...
];
