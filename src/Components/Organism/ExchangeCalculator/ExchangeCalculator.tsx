import { useMemo, useState } from "react";
import { Result, StyledBox } from "./ExchangeCalculatorStyles";

import { CurrencyCode } from "../../../Types/Types/exhange_rates.type";
import { ExchangeRateResponse } from "../../../Types/Interfaces/exchangeRateResponse.interface";
import {
  Input,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";

export interface ExchangeCalculatorProps {
  exchangeRates?: ExchangeRateResponse["exchangeRates"];
}

export const ExchangeCalculator = ({
  exchangeRates,
}: ExchangeCalculatorProps) => {
  const [from, setFrom] = useState<CurrencyCode>("GLD");
  const [to, setTo] = useState<CurrencyCode>("GLD");
  const [amount, setAmount] = useState(1);

  const currencyCodes = exchangeRates?.currencyInformation
    ? (Object.keys(exchangeRates?.currencyInformation) as CurrencyCode[])
    : ([
        "GLD",
        "CIR",
        "FRT",
        "PRA",
        "KRA",
        "SHA",
        "FRE",
        "MAM",
        "MON",
        "VIL",
      ] as CurrencyCode[]);

  const result = useMemo(
    () => (exchangeRates?.exchangeRates[from][to] || 0) * amount,
    [exchangeRates, from, to, amount]
  );

  if (!exchangeRates) {
    return <Typography>Loading...</Typography>;
  }

  const handleFromChange = (e: SelectChangeEvent<CurrencyCode>) => {
    setFrom(e.target.value as CurrencyCode);
  };
  const handleToChange = (e: SelectChangeEvent<CurrencyCode>) => {
    setTo(e.target.value as CurrencyCode);
  };

  return (
    <Stack justifyContent="center" alignItems="center">
      <StyledBox>
        <Input
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <Select
          labelId="from-select-label"
          inputProps={{ "aria-label": "From Currency" }}
          value={from}
          onChange={handleFromChange}
        >
          {currencyCodes.map((code) => (
            <MenuItem key={code} value={code}>
              {exchangeRates.currencyInformation[code].symbol} —{" "}
              {exchangeRates.currencyInformation[code].name}
            </MenuItem>
          ))}
        </Select>
        <span>→</span>
        <Select
          labelId="to-select-label"
          inputProps={{ "aria-label": "To Currency" }}
          value={to}
          onChange={handleToChange}
        >
          {currencyCodes.map((code) => (
            <MenuItem key={code} value={code}>
              {exchangeRates.currencyInformation[code].symbol} —{" "}
              {exchangeRates.currencyInformation[code].name}
            </MenuItem>
          ))}
        </Select>
      </StyledBox>
      <Result>
        {result.toFixed(2)} {to}
      </Result>
    </Stack>
  );
};
