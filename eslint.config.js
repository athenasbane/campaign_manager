export default [
  {
    extends: ["react-app", "react-app/jest", "plugin:storybook/recommended"],
    overrides: [
      {
        files: ["**/*.ts?(x)"],
        rules: {
          "max-lines": ["off", 100],
        },
      },
    ],
  },
];
