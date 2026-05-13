import js from "@eslint/js";

import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],

    languageOptions: {
      parser: tseslint.parser,
    },

    rules: {
      "no-console": "off",

      "@typescript-eslint/no-explicit-any": "off",

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
];
