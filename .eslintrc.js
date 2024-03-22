// import eslint from "@eslint/js"
// import tseslint from "typescript-eslint"
// eslint-disable-next-line no-undef
const stylistic = require("@stylistic/eslint-plugin")
const customized = stylistic.configs.customize({
  quotes: "double",
  semi: false,
  blockSpacing: true,
  braceStyle: "1tbs",
})
// eslint-disable-next-line no-undef
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@stylistic"],
  rules: {
    ...customized.rules,
    "@typescript-eslint/no-var-requires": "off", // or "warn" to turn it into a warning
    "@typescript-eslint/no-unused-vars": "off",
    "@stylistic/quotes": [1, "double"],
  },
}
