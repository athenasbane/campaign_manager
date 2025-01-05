import type { Meta, StoryObj } from "@storybook/react";

import Link from "../Link";
import { MemoryRouter } from "react-router-dom";

const meta: Meta<typeof Link> = {
  component: Link,
  title: "Components/Atom/Link",
  render: (args) => (
    <MemoryRouter>
      <Link {...args} />
    </MemoryRouter>
  ),
};

type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    typographyVariant: "h1",
    path: "/",
    linkDisplayLabel: "Test",
    display: "Test",
  },
};

export default meta;
