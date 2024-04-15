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
/** @type { import("eslint").Linter.Config } */
// eslint-disable-next-line no-undef
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:svelte/recommended"],

  plugins: ["@stylistic", "@typescript-eslint", "unused-imports"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },

  rules: {
    ...customized.rules,
    "@typescript-eslint/no-var-requires": "off", // or "warn" to turn it into a warning
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
    "@stylistic/quotes": [1, "double"],
    "@stylistic/no-multiple-empty-lines": 1,
    "@stylistic/no-trailing-spaces": 1,
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
  },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  ignorePatterns: ["supabase-sveltekit/static/*", "sextension/public.*"],
}
