import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  optimizeDeps: {
    exclude: ["@node-rs/argon2"],
  },
  test: {
    workspace: [
      {
        extends: "./vite.config.ts",
        plugins: [svelteTesting()],

        test: {
          name: "client",
          environment: "jsdom",
          clearMocks: true,
          include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          exclude: ["src/lib/server/**"],
          setupFiles: ["./vitest-setup-client.ts"],
        },
      },
      {
        extends: "./vite.config.ts",

        test: {
          name: "server",
          globalSetup: "./setup.ts",
          environment: "node",
          include: ["src/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
          testTimeout: 15000,
        },
      },
    ],
  },
});
