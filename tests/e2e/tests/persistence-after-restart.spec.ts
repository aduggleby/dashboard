import { test, expect } from "@playwright/test";

test("card remains after dashboard container restart", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Persistent Card" })).toBeVisible();
});
