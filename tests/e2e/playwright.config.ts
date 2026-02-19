import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 1,
  reporter: [["list"], ["html", { outputFolder: "results/html-report", open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://dashboard:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }
});
