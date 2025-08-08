import { CurrencyCode } from "../Types/exhange_rates.type";

export interface ExchangeRateResponse {
  pageTitle: string;
  exchangeRates: {
    currencyInformation: Record<
      CurrencyCode,
      { name: string; symbol: string; region: string }
    >;
    exchangeRates: Record<CurrencyCode, Record<CurrencyCode, number>>;
  };
}
