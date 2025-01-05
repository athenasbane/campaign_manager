import type { Meta, StoryObj } from "@storybook/react";

import DistanceTool from "../DistanceTool";

const meta: Meta<typeof DistanceTool> = {
  component: DistanceTool,
  title: "Components/Molecule/DistanceTool",
  argTypes: {
    distance: {
      type: "number",
      control: {
        type: "range",
      },
    },
  },
};

type Story = StoryObj<typeof DistanceTool>;

export const Default: Story = {
  args: {
    pinOneActive: true,
    isPinOneVisable: true,
    isPinTwoVisable: true,
    detail: 100,
    unitOfDistance: "km",
  },
};

export default meta;
