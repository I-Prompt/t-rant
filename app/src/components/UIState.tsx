"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface UIStateValue {
  stealth: boolean;
  toggleStealth: () => void;
}

const UIStateContext = createContext<UIStateValue | null>(null);

// Shared between the sidebar and the page content, since both need to react
// to stealth mode (instant "this isn't T-Rant" disguise - see Sidebar.tsx
// and page.tsx). Deliberately NOT persisted anywhere - nothing on disk
// should say "this person uses a rant-disguising app," which would
// undercut the whole point of the feature.
export function UIStateProvider({ children }: { children: React.ReactNode }) {
  const [stealth, setStealth] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-stealth", stealth ? "true" : "false");
    document.title = stealth ? "Notes" : "T-Rant";
  }, [stealth]);

  function toggleStealth() {
    setStealth((s) => !s);
  }

  return <UIStateContext.Provider value={{ stealth, toggleStealth }}>{children}</UIStateContext.Provider>;
}

export function useUIState(): UIStateValue {
  const ctx = useContext(UIStateContext);
  if (!ctx) throw new Error("useUIState must be used within UIStateProvider");
  return ctx;
}
