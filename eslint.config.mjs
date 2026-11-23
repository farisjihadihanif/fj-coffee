import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["node_modules/", "CLAUDE-SECURITY-*/", "_backup-original/", ".playwright-mcp/"] },

  js.configs.recommended,

  // Server, tes, dan skrip: Node.js dengan CommonJS.
  {
    files: ["server.js", "api/**/*.js", "lib/**/*.js", "test/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
  },

  // Browser: skrip biasa (bukan module) yang dimuat lewat <script>.
  {
    files: ["public/**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        Alpine: "readonly",
        feather: "readonly",
      },
    },
  },
  {
    // rupiah() didefinisikan di public/src/app.js lalu dipakai di sini.
    files: ["public/js/**/*.js"],
    languageOptions: { globals: { rupiah: "readonly" } },
  },

  {
    rules: {
      "no-unused-vars": ["error", { caughtErrors: "none" }],
    },
  },
]);
