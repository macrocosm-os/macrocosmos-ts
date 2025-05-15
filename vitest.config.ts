import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    setupFiles: ["src/__tests__/setup.ts"],
    environment: "node",
    globals: true,
    include: [
      "./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "./src/__tests__/**/*{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
  },
  resolve: {
    alias: {
      macrocosmos: path.resolve(__dirname, "src"), // or wherever your entry point is
    },
  },
});
