"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "trant-theme";

// Small sidebar toggle for light/dark. No API involved anywhere in this -
// it's a CSS variable swap plus a localStorage read/write, same mechanism
// as any static site's theme switch, so it costs nothing to run and nothing
// per-use (unlike the actual rant pipeline, which calls the Anthropic API).
// The inline script in layout.tsx's <head> sets the attribute before first
// paint so there's no flash of the wrong theme; this component just keeps
// the icon in sync and handles clicks.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as Theme | null;
    if (current === "light" || current === "dark") {
      setTheme(current);
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private browsing, storage disabled, etc.)
    }
  }

  // Render nothing until mounted, rather than guessing light/dark - avoids
  // a flash-of-wrong-icon on the very first paint.
  if (theme === null) return <span className="trant-icon-btn" aria-hidden="true" style={{ visibility: "hidden" }} />;

  return (
    <button
      type="button"
      onClick={toggle}
      className="trant-icon-btn"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
