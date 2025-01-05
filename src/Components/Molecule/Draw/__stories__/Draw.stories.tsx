import type { Meta, StoryObj } from "@storybook/react";

import Draw from "../Draw";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Draw> = {
  component: Draw,
  title: "Components/Molecule/Draw",
  render: (args) => (
    <MemoryRouter>
      <Draw {...args} />
    </MemoryRouter>
  ),
};

type Story = StoryObj<typeof Draw>;

export const Default: Story = {
  args: {
    open: true,
    closeModal: () => {},
    openSingleModal: () => {},
  },
};

export default meta;
