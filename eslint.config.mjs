import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import pluginUnusedImports from "eslint-plugin-unused-imports";

// eslint-config-next 16 ships flat configs and already registers the
// `import` plugin, so only `unused-imports` is added here.
const eslintConfig = defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    plugins: {
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "warn",
      // New in the Next 16 / typescript-eslint / react-hooks 7 rule sets; the
      // existing code predates them. Kept as warnings so the upgrade does not
      // bundle a refactor (see ADR 0008).
      "@typescript-eslint/no-this-alias": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external", "internal"], ["parent", "sibling", "index"]],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  globalIgnores([".next/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts", "public/**"]),
]);

export default eslintConfig;
