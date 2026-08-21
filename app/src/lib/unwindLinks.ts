// A curated set of links to step away with, per
// t-rant-safety-legal-update.md section 5. Shared between the post-rant
// prompt on the home page and the standalone /unwind page (added
// 2026-08-19 so these are reachable without submitting a rant first).

export interface UnwindLink {
  emoji: string;
  label: string;
  tag: string;
  href: string;
}

export const UNWIND_LINKS: UnwindLink[] = [
  { emoji: "🕹️", label: "Tetris", tag: "Stack blocks, not grudges.", href: "https://tetris.com" },
  { emoji: "🦦", label: "explore.org", tag: "Live animal cams. Zero drama, all whiskers.", href: "https://explore.org" },
  { emoji: "😻", label: "r/aww", tag: "Scroll until your blood pressure forgives you.", href: "https://reddit.com/r/aww" },
  { emoji: "🎲", label: "The Useless Web", tag: "One button, zero purpose, somehow it helps.", href: "https://theuselessweb.com" },
  { emoji: "🧩", label: "2048", tag: "Swap one puzzle for a smaller, friendlier one.", href: "https://play2048.co" },
  { emoji: "🟩", label: "Wordle", tag: "Five letters, one shot, no witnesses.", href: "https://www.nytimes.com/games/wordle/index.html" },
];
