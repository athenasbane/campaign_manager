import type { Meta } from "@storybook/react";

import History from "../History";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof History> = {
  component: History,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <History />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
