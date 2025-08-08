import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ExchangeRateResponse } from "../../../Types/Interfaces/exchangeRateResponse.interface";

export interface ExchangeCalculatorProps {
  exchangeRates?: ExchangeRateResponse["exchangeRates"];
}

export const ExchangeTable = ({ exchangeRates }: ExchangeCalculatorProps) => {
  if (!exchangeRates) {
    return <div>Loading...</div>;
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell align="center">Currency</TableCell>
          <TableCell align="center">Symbol</TableCell>
          <TableCell align="center">Region</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(exchangeRates.currencyInformation).map(
          ([code, info]) => (
            <TableRow key={code}>
              <TableCell align="center">{info.name}</TableCell>
              <TableCell align="center">{info.symbol}</TableCell>
              <TableCell align="center">{info.region}</TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
};
