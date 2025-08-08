import { Stack } from "@mui/material";
import { StyledTypography } from "./ExchangeRatesStyles";
import { ExchangeCalculator } from "../../Components/Organism/ExchangeCalculator/ExchangeCalculator";
import { ExchangeTable } from "../../Components/Molecule/ExchangeTable/ExchangeTable";
import { useGetExhangeRatesPageQuery } from "../../Store/slices/backend";

export const ExchangeRates = () => {
  const { data, isLoading } = useGetExhangeRatesPageQuery({});

  if (isLoading) {
    return <StyledTypography>Loading...</StyledTypography>;
  }
  return (
    <Stack direction="column" gap={4}>
      <StyledTypography variant="h3" textAlign="center">
        {data?.pageTitle || "Exchange Rates"}
      </StyledTypography>
      <ExchangeCalculator exchangeRates={data?.exchangeRates} />
      <ExchangeTable exchangeRates={data?.exchangeRates} />
    </Stack>
  );
};
