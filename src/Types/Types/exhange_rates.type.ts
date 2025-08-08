// All supported currency codes
export type CurrencyCode =
  | "GLD"
  | "CIR"
  | "FRT"
  | "PRA"
  | "KRA"
  | "SHA"
  | "FRE"
  | "MAM"
  | "MON"
  | "VIL";

// Metadata for each currency
export interface CurrencyInfo {
  name: string;
  symbol: string;
  region: string;
}

// Map of all currency metadata
export type CurrencyMap = {
  [code in CurrencyCode]: CurrencyInfo;
};

// Exchange rate mapping: from one currency to many others
export type ExchangeRates = {
  [from in CurrencyCode]: {
    [to in CurrencyCode]?: number;
  };
};
