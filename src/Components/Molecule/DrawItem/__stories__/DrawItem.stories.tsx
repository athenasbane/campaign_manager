import type { Meta, StoryObj } from "@storybook/react";

import DrawItem from "../DrawItem";

const meta: Meta<typeof DrawItem> = {
  component: DrawItem,
  title: "Components/Molecule/DrawItem",
};

type Story = StoryObj<typeof DrawItem>;

export const Default: Story = {
  args: {
    onClick: () => {},
    item: {
      displayText: "Test",
      path: "/test",
      icon: <div />,
    },
  },
};

export default meta;
