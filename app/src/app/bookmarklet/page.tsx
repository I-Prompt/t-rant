"use client";

import { useEffect, useRef } from "react";

// Mechanics per t-rant-safety-legal-update.md section 6. The bookmarklet
// grabs whatever text is selected on the current page and opens T-Rant with
// it pre-filled — a browser-level API, not site-specific scraping, so it
// works the same on Gmail, Slack, or anywhere else.
//
// 2026-08-19: copy rewritten from one dense paragraph into scannable
// sections for a non-technical reader, and the privacy claim was corrected
// — the highlighted text does NOT just "briefly" appear in local browser
// history, it persists there the same as any URL visited, until cleared.
// Added an explicit note on corporate-managed devices, since a meaningful
// share of this tool's audience will be using it on a work laptop. The same
// note is mirrored in House Rules.
//
// 2026-08-21 fix: React (19+) sanitizes any `href` it renders through JSX
// and replaces `javascript:` URLs with a stub that just throws - a genuine
// XSS-prevention feature, but it silently broke this link's only reason to
// exist, since the whole point of a bookmarklet IS a javascript: href. The
// fix is to skip JSX's `href` prop entirely and set the attribute
// imperatively after mount (see the ref + effect below), which never goes
// through React's interceptor.

const BOOKMARKLET_CODE = `javascript:(function(){var text=window.getSelection().toString();window.open('${
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://t-rant.vercel.app"
}/?rant='+encodeURIComponent(text),'_blank');})();`;

export default function Bookmarklet() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Sets the real javascript: URL after mount, bypassing React's href
  // sanitizer (see the comment above BOOKMARKLET_CODE) - imperative
  // setAttribute on the DOM node never goes through React's own
  // prop-setting path, so it isn't intercepted the way a JSX href prop is.
  useEffect(() => {
    linkRef.current?.setAttribute("href", BOOKMARKLET_CODE);
  }, []);

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "48px 28px 64px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>The Bookmarklet</h1>
      <p style={{ marginTop: 10, color: "var(--color-text-soft)", lineHeight: 1.6 }}>
        A shortcut for getting text into T-Rant without copy-pasting it yourself.
      </p>

      <Section heading="What is it?">
        <p>
          A bookmarklet is a tiny saved link that lives in your browser&apos;s bookmarks bar - not a
          browser extension, nothing to install or grant permissions to. Click it while some text is
          highlighted anywhere in your browser, and it opens T-Rant in a new tab with that text already
          pasted into the box.
        </p>
      </Section>

      <Section heading="Does using it change anything about privacy or storage?">
        <p>
          No. T-Rant&apos;s own promise - no accounts, no stored rants, no tracking, and nothing ever
          logged beyond a request&apos;s category and a timestamp, never the text itself (see{" "}
          <a href="/house-rules" style={{ color: "var(--color-link)", textDecoration: "underline" }}>House Rules</a>)
          - is exactly the same whether you type into the box by hand or arrive here via the bookmarklet.
        </p>
        <p>
          What <em>is</em> different: using the bookmarklet turns your highlighted text into part of the
          web address you open (<code style={{ fontSize: 12.5 }}>t-rant.vercel.app/?rant=...</code>), so it
          ends up in your own browser&apos;s local history the same way any page you visit does - it stays
          there until you clear it, not just briefly. That&apos;s ordinary browser behavior, not something
          T-Rant adds, and it&apos;s true of this style of &quot;pass text through the address bar&quot;
          bookmarklet in general.
        </p>
      </Section>

      <Section heading="Using this on a work computer?" tone="notice">
        <p>
          If you&apos;re on a company-managed laptop or network, your employer&apos;s IT/security tools -
          a managed browser profile, network monitoring, an SSL-inspecting proxy, endpoint software - may
          be able to see your browsing activity, including full web addresses. That&apos;s true of{" "}
          <em>any</em> site visited on a monitored device or network, entirely independent of what T-Rant
          itself logs (which, per the privacy notice above, is nothing beyond a category and a timestamp).
        </p>
        <p style={{ marginBottom: 0 }}>
          If that&apos;s a concern: type your text in manually instead of using the bookmarklet, do it on
          a personal device, or clear your browser history afterward on a shared or monitored machine.
        </p>
      </Section>

      <Section heading="How to use it">
        <ol style={{ paddingLeft: 20, display: "grid", gap: 8, color: "var(--color-text)" }}>
          <li>Drag the button below to your bookmarks bar.</li>
          <li>Highlight the heated text anywhere - a draft in Gmail, a message in Slack, anywhere in your browser.</li>
          <li>Click the bookmark. T-Rant opens in a new tab with that text already in the box.</li>
        </ol>

        <p style={{ margin: "20px 0" }}>
          {/* No href prop here on purpose - see the effect above. If React
              ever set this prop via JSX (even to a harmless placeholder),
              a later re-render would re-assert it and wipe out the real
              javascript: URL the effect wrote in imperatively. */}
          <a
            ref={linkRef}
            onClick={(e) => e.preventDefault()}
            draggable
            className="trant-btn trant-btn-secondary"
            style={{ cursor: "grab" }}
          >
            🦖 Rant This
          </a>
          <span style={{ marginLeft: 12, fontSize: 13, color: "var(--color-text-faint)" }}>
            &larr; drag this to your bookmarks bar
          </span>
        </p>

        <p style={{ fontSize: 13, color: "var(--color-text-faint)", lineHeight: 1.6 }}>
          It only ever grabs text when you actually click it - nothing happens automatically just from
          selecting text. Totally optional either way; pasting manually works identically. Known
          limitation: this is primarily a desktop-browser feature and is unreliable inside mobile in-app
          browsers, like Slack&apos;s built-in browser.
        </p>
      </Section>
    </main>
  );
}

function Section({
  heading,
  children,
  tone = "default",
}: {
  heading: string;
  children: React.ReactNode;
  tone?: "default" | "notice";
}) {
  return (
    <section
      style={{
        marginTop: 24,
        padding: "18px 20px",
        borderRadius: "var(--radius-md)",
        background: tone === "notice" ? "var(--color-accent-soft)" : "var(--color-surface-muted)",
        border: `1px solid ${tone === "notice" ? "var(--color-border-strong)" : "var(--color-border)"}`,
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "var(--color-text)" }}>{heading}</h2>
      <div style={{ display: "grid", gap: 10, fontSize: 14.5, lineHeight: 1.65, color: "var(--color-text-soft)" }}>
        {children}
      </div>
    </section>
  );
}
