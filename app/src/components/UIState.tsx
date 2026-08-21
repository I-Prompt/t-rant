"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Density = "comfortable" | "compact";

interface UIStateValue {
  stealth: boolean;
  toggleStealth: () => void;
  density: Density;
  toggleDensity: () => void;
}

const UIStateContext = createContext<UIStateValue | null>(null);
const DENSITY_KEY = "trant-density";

// Shared between the sidebar and the page content, since both need to
// react to the same two settings: stealth mode (instant "this isn't T-Rant"
// disguise - see Sidebar.tsx and page.tsx) and layout density (Gmail-style
// compact/comfortable). Stealth is deliberately NOT persisted anywhere -
// nothing on disk should say "this person uses a rant-disguising app",
// which would undercut the whole point of the feature. Density is a plain
// layout preference, so that one's remembered.
export function UIStateProvider({ children }: { children: React.ReactNode }) {
  const [stealth, setStealth] = useState(false);
  const [density, setDensity] = useState<Density>("comfortable");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DENSITY_KEY);
      if (stored === "compact" || stored === "comfortable") setDensity(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-stealth", stealth ? "true" : "false");
    document.title = stealth ? "Notes" : "T-Rant";
  }, [stealth]);

  function toggleStealth() {
    setStealth((s) => !s);
  }

  function toggleDensity() {
    setDensity((d) => {
      const next = d === "compact" ? "comfortable" : "compact";
      try {
        localStorage.setItem(DENSITY_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <UIStateContext.Provider value={{ stealth, toggleStealth, density, toggleDensity }}>
      {children}
    </UIStateContext.Provider>
  );
}

export function useUIState(): UIStateValue {
  const ctx = useContext(UIStateContext);
  if (!ctx) throw new Error("useUIState must be used within UIStateProvider");
  return ctx;
}
