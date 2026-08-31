import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Two projects: the counting logic is pure and runs in node; the component tests
// need a DOM. Both resolve "@/..." the same way tsconfig does.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["test/unit/**/*.test.ts?(x)"],
        },
      },
      {
        extends: true,
        test: {
          name: "component",
          environment: "jsdom",
          include: ["test/component/**/*.test.ts?(x)"],
          setupFiles: ["./test/component/setup.ts"],
        },
      },
    ],
  },
});
