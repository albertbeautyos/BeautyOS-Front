// eslint.config.js

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize FlatCompat
const compat = new FlatCompat({
  baseDirectory: __dirname,
  // resolvePluginsRelativeTo: __dirname, // Optional: May be needed depending on dependencies
});

// Combine configurations into a single array
const eslintConfig = [
  // 1. Configurations from legacy extends using FlatCompat
  // These likely include parsers, plugins (like @typescript-eslint),
  // and base rules from Next.js for TS and Core Web Vitals.
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2. Add your custom configuration object
  // This object can override or add rules to the configurations above.
  {
    rules: {
      // Disable the base ESLint rule, as recommended by typescript-eslint
      "no-unused-vars": "warn",
      // Enable the TypeScript-aware rule
      "@typescript-eslint/no-unused-vars": "warn", // Or "error" if you prefer build failure
      // Add any other custom rules here
      // "some-other-rule": "warn",
    },
    // Optional: If the extends didn't properly set the TS parser/plugin,
    // you might need to specify them explicitly here or in a separate object.
    // However, `next/typescript` likely handles this via FlatCompat.
    // files: ["**/*.ts", "**/*.tsx"], // Example: Apply rules only to TS files
    // languageOptions: {
    //   parser: tseslint.parser,
    // },
    // plugins: {
    //   '@typescript-eslint': tseslint.plugin,
    // },
  }
];

// Export the final combined configuration array
export default eslintConfig;

// Note: The `tseslint.config(...)` helper you had originally is a convenience
// function that itself returns an array of config objects, typically setting up
// the parser, plugin, and rules. By manually adding the rules object like above,
// you achieve a similar result integrated with your FlatCompat setup.
// If you *only* wanted the TS rules without the Next.js extends, you might use:
// export default tseslint.config({ rules: { ... } });
// But here, we need to merge with the compat layer output.