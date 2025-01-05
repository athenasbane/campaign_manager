import type { Meta } from "@storybook/react";

import Sessions from "../Sessions";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Sessions> = {
  component: Sessions,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <Sessions />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
