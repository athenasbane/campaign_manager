import type { Meta } from "@storybook/react";

import { ExchangeRates } from "../ExchangeRates";
import { Provider } from "react-redux";
import store from "../../../Store/store";

const meta: Meta<typeof ExchangeRates> = {
  component: ExchangeRates,
  render: (arg) => (
    <Provider store={store}>
      <ExchangeRates />
    </Provider>
  ),
};

export const Default = {};

export default meta;
