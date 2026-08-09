import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  // tsconfig.json sets "jsx": "preserve" (Next's own SWC pipeline handles
  // the actual transform at build time), which Vite/oxc otherwise inherits
  // as its own default — components with real JSX (e.g. InvoicePDF.tsx)
  // fail to parse under Vitest without this override, even when the test
  // file importing them uses React.createElement instead of JSX itself.
  oxc: {
    jsx: { runtime: "automatic" },
  },
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
