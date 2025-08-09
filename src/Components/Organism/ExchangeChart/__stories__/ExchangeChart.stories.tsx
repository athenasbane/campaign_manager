import type { Meta, StoryObj } from "@storybook/react";

import { ExchangeChart } from "../ExchangeChart";

const meta: Meta<typeof ExchangeChart> = {
  component: ExchangeChart,
  title: "Components/Organism/Exchange Chart",
};

type Story = StoryObj<typeof ExchangeChart>;

export const Default: Story = {};

export default meta;
