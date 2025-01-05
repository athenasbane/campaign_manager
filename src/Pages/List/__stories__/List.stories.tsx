import type { Meta } from "@storybook/react";

import List from "../List";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof List> = {
  component: List,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <List />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
