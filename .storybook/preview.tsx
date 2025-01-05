import type { Preview } from "@storybook/react";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../src/theme";

export const withMuiTheme = (Story) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Story />
  </ThemeProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export const decorators = [withMuiTheme];
export default preview;
