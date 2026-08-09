import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // e2e/ holds Playwright specs (a different `test` global entirely) —
    // keep them out of Vitest's discovery.
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
