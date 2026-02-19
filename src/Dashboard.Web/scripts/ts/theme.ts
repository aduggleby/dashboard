const THEME_KEY = "dashboard-theme";
const LIGHT = "origami-light";
const DARK = "origami-dark";
const SUN_PATH = "M12 3a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 15a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm9-7a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM5 11a1 1 0 1 1 0 2H4a1 1 0 1 1 0-2h1Zm11.95-5.536a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707Zm-9.9 9.9a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707Zm11.314 2.121a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 1 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414Zm-9.9-9.9a1 1 0 0 1-1.414 0l-.707-.707A1 1 0 1 1 7.757 5.46l.707.707a1 1 0 0 1 0 1.414ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z";
const MOON_PATH = "M21 12.79A9 9 0 1 1 11.21 3a1 1 0 0 1 1.03 1.35 7 7 0 0 0 7.41 9.41A1 1 0 0 1 21 12.79Z";

export function initializeTheme(): void {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const iconPath = document.querySelector<SVGPathElement>("[data-theme-icon-path]");
  const query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  const getStoredTheme = (): string | null => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  };

  const getSystemTheme = (): string => (query?.matches ? DARK : LIGHT);

  const setIconState = (theme: string): void => {
    if (iconPath) {
      iconPath.setAttribute("d", theme === DARK ? MOON_PATH : SUN_PATH);
    }
    if (toggle) {
      const nextTheme = theme === DARK ? "light" : "dark";
      toggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
      toggle.setAttribute("title", `Switch to ${nextTheme} theme`);
    }
  };

  const getTheme = (): string => root.getAttribute("data-theme") || getSystemTheme();

  const setTheme = (theme: string): void => {
    root.setAttribute("data-theme", theme);
    setIconState(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // localStorage can be unavailable in locked-down browsers.
    }
  };

  setIconState(getTheme());

  if (query) {
    query.addEventListener("change", () => {
      if (!getStoredTheme()) {
        const systemTheme = getSystemTheme();
        root.setAttribute("data-theme", systemTheme);
        setIconState(systemTheme);
      }
    });
  }

  toggle?.addEventListener("click", () => {
    setTheme(getTheme() === DARK ? LIGHT : DARK);
  });
}
