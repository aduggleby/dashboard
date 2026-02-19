import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:8080";
const OUTPUT_DIR = "../../../docs/screenshots";

const cards = [
  { title: "Plex", url: "https://plex.example.local" },
  { title: "Grafana", url: "https://grafana.example.local" },
  { title: "Home Assistant", url: "https://ha.example.local" },
  { title: "Immich", url: "https://immich.example.local" },
  { title: "Paperless", url: "https://paperless.example.local" },
  { title: "Proxmox VE", url: "https://proxmox.example.local" }
];

async function openAddModal(page) {
  await page.getByRole("button", { name: "Open add card dialog" }).click();
  await page.locator("section[aria-label='Add app card dialog']").waitFor({ state: "visible" });
}

async function clearAllCards(page) {
  for (let i = 0; i < 50; i += 1) {
    const count = await page.locator("article.card").count();
    if (count === 0) {
      return;
    }

    const card = page.locator("article.card").first();
    await card.click({ button: "right" });
    await page.getByRole("heading", { name: "Edit app card" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Delete card" }).click();
    await page.waitForLoadState("networkidle");
  }

  throw new Error("Could not clear cards after 50 attempts.");
}

async function addCard(page, title, url) {
  await openAddModal(page);
  const modal = page.locator("section[aria-label='Add app card dialog']");
  await modal.getByLabel("Title").fill(title);
  await modal.getByLabel("URL").fill(url);
  await modal.getByRole("button", { name: "Add card", exact: true }).click();
  await page.waitForLoadState("networkidle");
}

async function setTheme(page, theme) {
  await page.evaluate((nextTheme) => {
    localStorage.setItem("dashboard-theme", nextTheme);
  }, theme);
  await page.reload();
  await page.waitForLoadState("networkidle");
}

async function main() {
  await mkdir(new URL(OUTPUT_DIR, import.meta.url), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1720, height: 1080 } });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  await clearAllCards(page);

  for (const card of cards) {
    await addCard(page, card.title, card.url);
  }

  await page.getByRole("heading", { name: "Plex" }).waitFor({ state: "visible" });
  await page.getByRole("heading", { name: "Proxmox VE" }).waitFor({ state: "visible" });

  await setTheme(page, "origami-light");
  await page.screenshot({
    path: fileURLToPath(new URL("../../../docs/screenshots/dashboard-light-playwright.png", import.meta.url)),
    fullPage: true
  });

  await setTheme(page, "origami-dark");
  await page.screenshot({
    path: fileURLToPath(new URL("../../../docs/screenshots/dashboard-dark-playwright.png", import.meta.url)),
    fullPage: true
  });

  await context.close();
  await browser.close();

  console.log("Saved screenshots:");
  console.log("- docs/screenshots/dashboard-light-playwright.png");
  console.log("- docs/screenshots/dashboard-dark-playwright.png");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
