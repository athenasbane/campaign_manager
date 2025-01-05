import type { Meta } from "@storybook/react";

import Content from "../Content";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Content> = {
  component: Content,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <Content />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
