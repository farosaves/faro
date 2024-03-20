// import eslint from "@eslint/js"
// import tseslint from "typescript-eslint"

const stylistic = require("@stylistic/eslint-plugin")
const customized = stylistic.configs.customize({
  quotes: "double",
  semi: false,
  //   arrowParens: true,
  blockSpacing: true,
  braceStyle: "1tbs",
})

module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@stylistic"],
  rules: {
    ...customized.rules,
    // ...your other rules
  },
}
