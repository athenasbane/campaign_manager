import type { Meta, StoryObj } from "@storybook/react";

import InteractiveMap from "../InteractiveMap";
import { Provider } from "react-redux";
import store from "../../../../Store/store";

const meta: Meta<typeof InteractiveMap> = {
  component: InteractiveMap,
  title: "Components/Molecule/InteractiveMap",
  render: (args) => (
    <Provider store={store}>
      <InteractiveMap {...args} />
    </Provider>
  ),
  args: {
    imageSrc: "https://storage.googleapis.com/pod_public/1300/159298.jpg",
  },
};

type Story = StoryObj<typeof InteractiveMap>;

export const Default: Story = {
  args: {},
};

export default meta;
