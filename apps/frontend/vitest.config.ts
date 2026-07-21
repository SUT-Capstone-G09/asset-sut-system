import { defineConfig } from "vitest/config";
import path from "path";

// Minimal config: unit tests for plain TS logic (pricing, validation, etc.)
// don't need jsdom or React Testing Library — add those only when the first
// component test actually needs them, so this stays fast and simple.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
