import type { Meta, StoryObj } from "@storybook/react";

import TextBlock from "../TextBlock";
import { EContentType } from "../../../../Types/Enum/content.enum";

const meta: Meta<typeof TextBlock> = {
  component: TextBlock,
  title: "Components/Atom/TextBlock",
  argTypes: {
    contentType: {
      options: Object.values(EContentType),
      control: {
        type: "select",
        labels: Object.keys(EContentType),
      },
    },
  },
};

type Story = StoryObj<typeof TextBlock>;

export const Default: Story = {
  args: {
    displayText: "Test",
  },
};

export default meta;
