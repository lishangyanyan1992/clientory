import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/index.ts", "src/routes/scans/engine.ts"],
    },
    env: {
      EMAIL_TOKEN_SECRET: "test-secret-for-vitest-do-not-use-in-prod",
      NODE_ENV: "test",
      // Prevent AI SDK clients from throwing at import time in tests
      OPENAI_API_KEY: "test-key",
      ANTHROPIC_API_KEY: "test-key",
      GOOGLE_API_KEY: "test-key",
    },
  },
});
