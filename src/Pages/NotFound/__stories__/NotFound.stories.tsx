import type { Meta } from "@storybook/react";

import NotFound from "../NotFound";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof NotFound> = {
  component: NotFound,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <NotFound />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
