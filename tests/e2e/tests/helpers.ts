import { expect, type Page } from "@playwright/test";

export async function addCard(page: Page, title: string, url: string): Promise<void> {
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("URL").fill(url);
  await page.getByRole("button", { name: "Add card" }).click();
  await expect(page.locator(".status.success")).toContainText("Card created.");
}

export async function clearAllCards(page: Page): Promise<void> {
  for (let i = 0; i < 50; i++) {
    const deleteButtons = page.locator(".delete-button");
    if (await deleteButtons.count() === 0) {
      break;
    }

    await deleteButtons.first().click();
    await expect(page.locator(".status")).toBeVisible();
  }
}

export async function getCardTitles(page: Page): Promise<string[]> {
  return page.locator(".card__title").allTextContents();
}
