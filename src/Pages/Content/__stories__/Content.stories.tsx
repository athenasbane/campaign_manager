import type { Meta } from "@storybook/react";

import Content from "../Content";
import { Provider } from "react-redux";
import store from "../../../Store/store";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const meta: Meta<typeof Content> = {
  component: Content,
  render: (arg) => (
    <Provider store={store}>
      <MemoryRouter
        initialEntries={["/content/4D3rCIoLt4hV1OuVUrRwce"]}
        initialIndex={0}
      >
        <Routes>
          <Route path="content/:slug" element={<Content />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  ),
};

export const Default = {};

export default meta;
