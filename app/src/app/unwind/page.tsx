import { UNWIND_LINKS } from "@/lib/unwindLinks";

// Standalone version of the post-rant "unwind links" prompt, added
// 2026-08-19 so these are reachable from the sidebar directly instead of
// only appearing after submitting a rant. Server component - nothing here
// needs client state.

export default function Unwind() {
  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 28px 64px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>
        🦖 Rex-commended Unwind Spots
      </h1>
      <p style={{ marginTop: 10, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
        A tiny curated exit ramp for whenever the browser tab needs to look like something other than
        a rant. No login, no algorithm trying to keep you here longer than five minutes.
      </p>
      <p style={{ marginTop: 12, fontSize: 13, color: "var(--color-text-faint)", fontStyle: "italic" }}>
        Fair warning: you're leaving T-Rant territory. Everything past this point is somebody else's
        swamp - we don't control it, vouch for it, or get a cut of your afternoon. Wander at your own
        risk.
      </p>

      <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
        {UNWIND_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "14px 16px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              color: "var(--color-text)",
              background: "var(--color-surface)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {link.emoji} {link.label}
            </div>
            <div style={{ color: "var(--color-text-faint)", fontSize: 13, marginTop: 2 }}>{link.tag}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
