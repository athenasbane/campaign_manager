import type { Meta } from "@storybook/react";

import Missions from "../Missions";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Missions> = {
  component: Missions,
  render: (arg) => (
    <MemoryRouter>
      <Provider store={store}>
        <Missions />
      </Provider>
    </MemoryRouter>
  ),
};

export const Default = {};

export default meta;
