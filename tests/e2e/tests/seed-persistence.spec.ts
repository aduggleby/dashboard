import { test, expect } from "@playwright/test";
import { addCard, clearAllCards } from "./helpers";

test("create a card that should persist across container restart", async ({ page }) => {
  await page.goto("/");
  await clearAllCards(page);
  await addCard(page, "Persistent Card", "https://example.com/persistent");
  await expect(page.getByRole("heading", { name: "Persistent Card" })).toBeVisible();
});
