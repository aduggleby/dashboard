import { test, expect } from "@playwright/test";
import { addCard, clearAllCards, getCardTitles } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearAllCards(page);
});

test("shows empty state then supports create + open in same tab", async ({ page }) => {
  await expect(page.getByText("Add your first app")).toBeVisible();

  await addCard(page, "Plex", "https://example.com/plex");
  await expect(page.getByRole("heading", { name: "Plex" })).toBeVisible();

  await page.getByRole("link", { name: "Plex" }).click();
  await expect(page).toHaveURL(/example\.com\/plex/);
});

test("rejects invalid url schemes", async ({ page }) => {
  await page.getByLabel("Title").fill("Bad Link");
  await page.getByLabel("URL").fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Add card" }).click();

  await expect(page.locator(".status.error")).toContainText("absolute http:// or https://");
  await expect(page.getByRole("heading", { name: "Bad Link" })).toHaveCount(0);
});

test("deletes a card", async ({ page }) => {
  await addCard(page, "Grafana", "https://example.com/grafana");
  await expect(page.getByRole("heading", { name: "Grafana" })).toBeVisible();

  await page.locator("article.card", { hasText: "Grafana" }).locator(".delete-button").click();
  await expect(page.locator(".status.success")).toContainText("Card deleted.");
  await expect(page.getByRole("heading", { name: "Grafana" })).toHaveCount(0);
});

test("drag reorder persists after reload", async ({ page }) => {
  await addCard(page, "Alpha", "https://example.com/a");
  await addCard(page, "Bravo", "https://example.com/b");
  await addCard(page, "Charlie", "https://example.com/c");

  const reorderSaved = page.waitForResponse((response) =>
    response.url().includes("/cards/reorder") &&
    response.request().method() === "POST" &&
    response.status() === 200
  );

  await page.evaluate(() => {
    const cards = [...document.querySelectorAll("article.card")];
    const source = cards.find((card) => card.textContent?.includes("Charlie"));
    const target = cards.find((card) => card.textContent?.includes("Alpha"));

    if (!source || !target) {
      throw new Error("Missing drag source/target cards.");
    }

    const dataTransfer = new DataTransfer();
    source.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer }));
    target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer }));
    target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer }));
  });
  await reorderSaved;

  await expect.poll(async () => getCardTitles(page)).toEqual(["Charlie", "Alpha", "Bravo"]);

  await page.reload();
  await expect.poll(async () => getCardTitles(page)).toEqual(["Charlie", "Alpha", "Bravo"]);
});

test("keyboard reorder persists after reload", async ({ page }) => {
  await addCard(page, "First", "https://example.com/first");
  await addCard(page, "Second", "https://example.com/second");
  await addCard(page, "Third", "https://example.com/third");

  const reorderSaved = page.waitForResponse((response) =>
    response.url().includes("/cards/reorder") &&
    response.request().method() === "POST" &&
    response.status() === 200
  );

  const firstCard = page.locator("article.card", { hasText: "First" });
  await firstCard.focus();
  await page.keyboard.press("Alt+ArrowDown");
  await reorderSaved;

  await expect.poll(async () => getCardTitles(page)).toEqual(["Second", "First", "Third"]);

  await page.reload();
  await expect.poll(async () => getCardTitles(page)).toEqual(["Second", "First", "Third"]);
});

test.describe("theme behavior", () => {
  test.use({ colorScheme: "dark" });

  test("defaults from system and persists user toggle", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("dashboard-theme"));
    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "origami-dark");

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "origami-light");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "origami-light");
  });
});
