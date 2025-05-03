import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["**/*.{spec,test}.{ts,tsx}", "**/node_modules/**", "**/dist/**"],
    },
    include: ["**/tests/unit/**/*.{test,spec}.{ts,tsx}", "**/src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/tests/e2e/**/*", "**/node_modules/**/*", "./**/.{idea,git,cache,output,temp}/**/*"],
    setupFiles: ["./tests/setup/vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
