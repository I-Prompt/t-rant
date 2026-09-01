"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { useUIState } from "@/components/UIState";

// Persistent left nav, shared by every page via layout.tsx. Client
// component (needs usePathname() to highlight the current page) - the rest
// of the site stays server-rendered where it can.
//
// Order (2026-08-21): Unwind Links, House Rules up top (the pages someone's
// actually likely to click into from the product itself), then a divider,
// then Emergency Numbers and Bookmarklet below it (reference tools, reached
// for less often day-to-day). The Dark Pattern Audit page/link was removed
// 2026-09-01 - see Sidebar.tsx history and README changelog.

const TOP_LINKS = [
  { href: "/unwind", label: "🕹️ Unwind Links" },
  { href: "/house-rules", label: "📜 House Rules" },
];

const BOTTOM_LINKS = [
  { href: "/emergency-numbers", label: "🚨 Emergency Numbers" },
  { href: "/bookmarklet", label: "🔖 Bookmarklet" },
];

// One picked per browser session (sessionStorage, not localStorage - a
// fresh tab gets a fresh one), shown in the sidebar on the home page only.
// Unrelated to the input on purpose - a bit of found-poetry contrast to
// whatever's about to get typed below it. Lines kept short on purpose so
// each one fits the sidebar's width without wrapping mid-word.
const RANT_HAIKUS = [
  "Steve ate all my chips\nfury blooms like fog\nI say it gently",
  "Reply-all again\njaw a clenched fossil\nbreathe, then walk away",
  "The meeting ran long\na small T-Rex screams\ninto a pillow",
  "Caps lock beckons me\nI decline, mostly, today\nsmall diplomacy",
  "Inbox at zero\nlasted four minutes flat\nrest in peace, calm",
];

function pickSessionHaiku(): string {
  try {
    const stored = sessionStorage.getItem("trant-haiku");
    if (stored) return stored;
    const picked = RANT_HAIKUS[Math.floor(Math.random() * RANT_HAIKUS.length)];
    sessionStorage.setItem("trant-haiku", picked);
    return picked;
  } catch {
    return RANT_HAIKUS[0];
  }
}

function navLinkClass(active: boolean): string {
  return active ? "trant-nav-link trant-nav-link--active" : "trant-nav-link";
}

// Strips a leading emoji off a nav label for stealth mode - "🕹️ Unwind
// Links" -> "Unwind Links". The emoji is always the first
// whitespace-delimited token in these labels, so a plain split is enough;
// no need for a real emoji-aware regex.
function plainLabel(label: string): string {
  const spaceIndex = label.indexOf(" ");
  return spaceIndex === -1 ? label : label.slice(spaceIndex + 1);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { stealth } = useUIState();
  const [haiku, setHaiku] = useState<string | null>(null);
  const [haikuDismissed, setHaikuDismissed] = useState(false);
  const isHome = pathname === "/";

  // Only picked on the home page - the other pages (House Rules, Emergency
  // Numbers, etc.) don't need a poem competing with their own content.
  useEffect(() => {
    if (!isHome) return;
    setHaiku(pickSessionHaiku());
    try {
      setHaikuDismissed(sessionStorage.getItem("trant-haiku-dismissed") === "true");
    } catch {
      // ignore
    }
  }, [isHome]);

  function dismissHaiku() {
    setHaikuDismissed(true);
    try {
      sessionStorage.setItem("trant-haiku-dismissed", "true");
    } catch {
      // ignore
    }
  }

  return (
    <nav className="trant-sidebar" aria-label={stealth ? "Notes" : "T-Rant"}>
      <div className="trant-sidebar-inner">
        <div className="trant-sidebar-brand-row">
          <Link href="/" className="trant-sidebar-brand">
            {!stealth && (
              <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden="true">
                <rect x="10" y="0" width="10" height="4" fill="#6b8f71" />
                <rect x="8" y="4" width="14" height="4" fill="#6b8f71" />
                <rect x="4" y="8" width="16" height="4" fill="#6b8f71" />
                <rect x="0" y="12" width="14" height="4" fill="#6b8f71" />
                <rect x="6" y="16" width="4" height="4" fill="#2d2a24" />
                <rect x="14" y="16" width="4" height="4" fill="#2d2a24" />
              </svg>
            )}
            <span className="trant-sidebar-brand-name">{stealth ? "Notes" : "T-Rant"}</span>
          </Link>
          <div className="trant-sidebar-toggles">
            <ThemeToggle />
          </div>
        </div>

        {isHome && !stealth && haiku && !haikuDismissed && (
          <div className="trant-haiku">
            <div className="trant-haiku-head">
              <span>🦖 Rant haiku of the day</span>
              <button type="button" onClick={dismissHaiku} aria-label="Dismiss" className="trant-haiku-dismiss">
                ×
              </button>
            </div>
            <p className="trant-haiku-text">{haiku}</p>
          </div>
        )}

        <div className="trant-nav">
          {TOP_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(pathname === link.href)}>
              {stealth ? plainLabel(link.label) : link.label}
            </Link>
          ))}

          <div className="trant-nav-divider" role="separator" />

          {BOTTOM_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(pathname === link.href)}>
              {stealth ? plainLabel(link.label) : link.label}
            </Link>
          ))}
        </div>

        <p className="trant-sidebar-foot">
          No accounts.
          <br />
          No stored rants.
          <br />
          No tracking.
        </p>
      </div>
    </nav>
  );
}
