import type { Meta } from "@storybook/react";

import Welcome from "../Welcome";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Welcome> = {
  component: Welcome,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <Welcome />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
