import { useMemo, useState } from "react";
import { Result } from "./ExchangeCalculatorStyles";

import { CurrencyCode } from "../../../Types/Types/exhange_rates.type";
import { ExchangeRateResponse } from "../../../Types/Interfaces/exchangeRateResponse.interface";
import {
  FormControl,
  Grid2,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
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
    <Grid2
      container
      justifyContent="center"
      alignItems="center"
      direction="column"
    >
      <Grid2 justifyContent="center" alignItems="center" gap={3} container>
        <Grid2 justifyContent="center" size={{ xs: 12, md: "auto" }}>
          <TextField
            label="Amount"
            id="outlined-start-adornment"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {exchangeRates?.currencyInformation[from].symbol}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid2>
        <Grid2 justifyContent="center" size={{ xs: 12, md: "auto" }}>
          <FormControl fullWidth>
            <InputLabel id="from-select-label">From</InputLabel>
            <Select
              label="From"
              fullWidth
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
          </FormControl>
        </Grid2>
        <Grid2 justifyContent="center" size={{ xs: 12, md: "auto" }}>
          <div>→</div>
        </Grid2>
        <Grid2 size={{ xs: 12, md: "auto" }}>
          <FormControl fullWidth>
            <InputLabel id="to-select-label">To</InputLabel>
            <Select
              label="To"
              fullWidth
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
          </FormControl>
        </Grid2>
      </Grid2>
      <Grid2>
        <Result>
          {result.toFixed(2)} {to}
        </Result>
      </Grid2>
    </Grid2>
  );
};
