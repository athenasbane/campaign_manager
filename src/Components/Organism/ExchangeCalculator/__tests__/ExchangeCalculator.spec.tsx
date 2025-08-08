import { render, screen, fireEvent } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { ExchangeRateResponse } from "../../../../Types/Interfaces/exchangeRateResponse.interface";
import { ExchangeCalculator } from "../ExchangeCalculator";

// Mock exchange rate data
const mockExchangeRates: ExchangeRateResponse["exchangeRates"] = {
  currencyInformation: {
    GLD: { name: "Gold", symbol: "🪙", region: "Universal" },
    CIR: { name: "Cirran Mark", symbol: "ɱ", region: "Cirrane Republic" },
  },
  exchangeRates: {
    GLD: { GLD: 1, CIR: 1.1 },
    CIR: { GLD: 0.9, CIR: 1 },
  },
};

describe("ExchangeCalculator", () => {
  it("renders loading state without exchangeRates", () => {
    render(<ExchangeCalculator />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("updates result when amount changes", () => {
    render(<ExchangeCalculator exchangeRates={mockExchangeRates} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "3" } });
    expect(screen.getByText("3.00 GLD")).toBeInTheDocument();
  });

  it("updates result when 'to' currency changes", async () => {
    render(<ExchangeCalculator exchangeRates={mockExchangeRates} />);
    const user = userEvent.setup();

    const toSelect = screen.getByLabelText("To Currency");

    await user.click(toSelect);

    const toOption = await screen.findByText(/ɱ — Cirran Mark/i);
    await user.click(toOption);

    expect(screen.getByText("1.10 CIR")).toBeInTheDocument(); // 1 * 1.1
  });

  it("converts correctly from CIR to GLD with amount", async () => {
    render(<ExchangeCalculator exchangeRates={mockExchangeRates} />);
    const user = userEvent.setup();

    const fromSelect = screen.getByLabelText("From Currency");
    const toSelect = screen.getByLabelText("To Currency");

    const input = screen.getByRole("textbox");

    // Change from to CIR
    await user.click(fromSelect);
    await user.click(screen.getByText(/ɱ — Cirran Mark/i));

    // Change to to GLD
    await user.click(toSelect);
    await user.click(screen.getAllByText(/🪙 — Gold/i)[1]);

    // Change input to 2
    await user.clear(input);
    await user.type(input, "2");

    expect(await screen.findByText("1.80 GLD")).toBeInTheDocument(); // 2 * 0.9
  });
});
