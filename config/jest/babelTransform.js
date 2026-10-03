"use strict";

const babelJest = require("babel-jest").default;

module.exports = babelJest.createTransformer({
  presets: [
    [require.resolve("@babel/preset-env"), { targets: { node: "current" } }],
    [require.resolve("@babel/preset-react"), { runtime: "automatic" }],
    require.resolve("@babel/preset-typescript"),
  ],
  plugins: [
    ({ types: t }) => ({
      visitor: {
        MemberExpression(path) {
          if (
            t.isMetaProperty(path.node.object) &&
            path.node.object.meta.name === "import" &&
            path.node.object.property.name === "meta" &&
            t.isIdentifier(path.node.property, { name: "env" })
          ) {
            path.replaceWith(
              t.memberExpression(t.identifier("process"), t.identifier("env")),
            );
          }
        },
      },
    }),
  ],
  babelrc: false,
  configFile: false,
});
