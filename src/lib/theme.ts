/**
 * Day/night theme store. The source of truth is the `data-theme`
 * attribute on <html> (set before paint by an inline script when the
 * user previously chose night). CSS reacts via [data-theme="night"]
 * token overrides; the 3D scene subscribes and animates its lighting.
 */

const listeners = new Set<() => void>();

export function subscribeTheme(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function isNight(): boolean {
  return document.documentElement.dataset.theme === "night";
}

export function isNightServerSnapshot(): boolean {
  return false;
}

export function toggleTheme(): void {
  const next = !isNight();
  if (next) {
    document.documentElement.dataset.theme = "night";
  } else {
    delete document.documentElement.dataset.theme;
  }
  try {
    localStorage.setItem("theme", next ? "night" : "day");
  } catch {
    // private browsing — theme just won't persist
  }
  listeners.forEach((listener) => listener());
}
