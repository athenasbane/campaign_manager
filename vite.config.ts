import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const clientEnvKeys = [
  "NODE_ENV",
  "PUBLIC_URL",
  "REACT_APP_CONTENTFUL_ACCESS_TOKEN",
  "REACT_APP_CONTENTFUL_SPACE_ID",
  "REACT_APP_PLAYER_API_URL",
  "REACT_APP_COGNITO_USER_POOL_ID",
  "REACT_APP_COGNITO_CLIENT_ID",
];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const nodeEnv = mode === "production" ? "production" : "development";
  const clientEnv = clientEnvKeys.reduce<Record<string, string | undefined>>(
    (acc, key) => {
      acc[key] = key === "NODE_ENV" ? nodeEnv : env[key] ?? process.env[key];
      return acc;
    },
    {}
  );

  return {
    plugins: [react()],
    envPrefix: ["VITE_", "REACT_APP_"],
    define: {
      global: "globalThis",
      "process.env": JSON.stringify(clientEnv),
    },
    build: {
      outDir: "build",
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.PORT || process.env.PORT) || 3000,
    },
  };
});
