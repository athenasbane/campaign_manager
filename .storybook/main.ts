import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: ["@chromatic-com/storybook"],
  staticDirs: ["../public"],
  framework: "@storybook/react-vite",
  core: {
    builder: "@storybook/builder-vite",
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import("vite");

    return mergeConfig(config, {
      // Add dependencies to pre-optimization
      define: {
        global: "globalThis",
        "process.env": JSON.stringify({
          NODE_ENV: process.env.NODE_ENV,
          REACT_APP_CONTENTFUL_ACCESS_TOKEN:
            process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN,
          REACT_APP_CONTENTFUL_SPACE_ID:
            process.env.REACT_APP_CONTENTFUL_SPACE_ID,
          REACT_APP_PLAYER_API_URL: process.env.REACT_APP_PLAYER_API_URL,
          REACT_APP_COGNITO_USER_POOL_ID:
            process.env.REACT_APP_COGNITO_USER_POOL_ID,
          REACT_APP_COGNITO_CLIENT_ID: process.env.REACT_APP_COGNITO_CLIENT_ID,
        }),
      },
    });
  },
};
export default config;
