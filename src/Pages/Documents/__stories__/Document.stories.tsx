import type { Meta } from "@storybook/react";

import Documents from "../Documents";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Document> = {
  component: Documents,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <Documents />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
