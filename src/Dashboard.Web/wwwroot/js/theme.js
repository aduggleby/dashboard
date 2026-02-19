(() => {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const label = document.querySelector("[data-theme-label]");
  const light = "origami-light";
  const dark = "origami-dark";
  const query = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  const getStoredTheme = () => {
    try {
      return localStorage.getItem("dashboard-theme");
    } catch {
      return null;
    }
  };

  const getSystemTheme = () => (query?.matches ? dark : light);

  const setLabel = (theme) => {
    if (!label) {
      return;
    }

    label.textContent = theme === dark ? "Dark" : "Light";
  };

  const getTheme = () => root.getAttribute("data-theme") || getSystemTheme();

  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    setLabel(theme);
    try {
      localStorage.setItem("dashboard-theme", theme);
    } catch {
      // localStorage can be unavailable in locked-down browsers.
    }
  };

  setLabel(getTheme());

  // If user has not picked a theme, follow OS theme changes.
  if (query) {
    query.addEventListener("change", () => {
      if (!getStoredTheme()) {
        root.setAttribute("data-theme", getSystemTheme());
        setLabel(getSystemTheme());
      }
    });
  }

  toggle?.addEventListener("click", () => {
    setTheme(getTheme() === dark ? light : dark);
  });
})();
