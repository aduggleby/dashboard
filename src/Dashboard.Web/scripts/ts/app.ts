import Alpine from "alpinejs";
import { initializeReorder } from "./reorder";
import { initializeTheme } from "./theme";

const TITLE_KEY = "dashboard-title";
const DEFAULT_TITLE = "Homelab Dashboard";

declare global {
  interface Window {
    Alpine: unknown;
  }
}

Alpine.data("dashboardUi", () => ({
  addCardOpen: false,
  editCardOpen: false,
  settingsOpen: false,
  helpOpen: false,
  dashboardTitle: DEFAULT_TITLE,
  editedTitle: DEFAULT_TITLE,
  editCardId: 0,
  editCardTitle: "",
  editCardUrl: "",

  init(): void {
    const titleNode = document.querySelector<HTMLElement>("[data-dashboard-title]");
    const fallback = titleNode?.textContent?.trim() || DEFAULT_TITLE;
    this.dashboardTitle = fallback;

    try {
      const storedTitle = localStorage.getItem(TITLE_KEY)?.trim();
      if (storedTitle) {
        this.dashboardTitle = storedTitle;
      }
    } catch {
      // localStorage can be unavailable in locked-down browsers.
    }

    this.editedTitle = this.dashboardTitle;

    const isTypingTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
    };

    document.addEventListener("keydown", (event) => {
      if (event.key === "F1") {
        event.preventDefault();
        this.openHelp();
        return;
      }

      if (event.key === "?" && !isTypingTarget(event.target)) {
        event.preventDefault();
        this.openHelp();
      }
    });
  },

  openAddCard(): void {
    this.addCardOpen = true;
  },
  closeAddCard(): void {
    this.addCardOpen = false;
  },
  openEditCardFromElement(element: HTMLElement): void {
    const id = Number.parseInt(element.dataset.cardId ?? "", 10);
    if (!Number.isFinite(id)) {
      return;
    }

    this.editCardId = id;
    this.editCardTitle = element.dataset.cardTitle ?? "";
    this.editCardUrl = element.dataset.cardUrl ?? "";
    this.editCardOpen = true;
  },
  closeEditCard(): void {
    this.editCardOpen = false;
  },
  openSettings(): void {
    this.editedTitle = this.dashboardTitle;
    this.settingsOpen = true;
  },
  closeSettings(): void {
    this.settingsOpen = false;
  },
  saveSettings(): void {
    const nextTitle = this.editedTitle?.trim() || DEFAULT_TITLE;
    this.dashboardTitle = nextTitle;
    this.editedTitle = nextTitle;
    this.settingsOpen = false;

    try {
      localStorage.setItem(TITLE_KEY, nextTitle);
    } catch {
      // localStorage can be unavailable in locked-down browsers.
    }
  },
  resetTitle(): void {
    this.dashboardTitle = DEFAULT_TITLE;
    this.editedTitle = DEFAULT_TITLE;
    this.settingsOpen = false;

    try {
      localStorage.removeItem(TITLE_KEY);
    } catch {
      // localStorage can be unavailable in locked-down browsers.
    }
  },
  openHelp(): void {
    this.helpOpen = true;
  },
  closeHelp(): void {
    this.helpOpen = false;
  }
}));

window.Alpine = Alpine;
Alpine.start();

initializeTheme();
initializeReorder();
