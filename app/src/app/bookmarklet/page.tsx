"use client";

import Link from "next/link";

// Mechanics and copy per t-rant-safety-legal-update.md section 6. The
// bookmarklet grabs whatever text is selected on the current page and opens
// T-Rant with it pre-filled — a browser-level API, not site-specific
// scraping, so it works the same on Gmail, Slack, or anywhere else.

const BOOKMARKLET_CODE = `javascript:(function(){var text=window.getSelection().toString();window.open('${
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://t-rant.vercel.app"
}/?rant='+encodeURIComponent(text),'_blank');})();`;

export default function Bookmarklet() {
  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <p>
        <Link href="/">&larr; Back to T-Rant</Link>
      </p>
      <h1>The Bookmarklet</h1>
      <p>
        This tool is free to use: no payment, no account, no commitment. You can always just come back
        here and paste your rant in manually; that works fine on its own, no setup needed. If you end up
        using T-Rant a lot, drag the button below to your bookmarks bar instead: then anytime you want to
        send something here, highlight the text wherever it is (a draft in Gmail, a message in Slack,
        anywhere in your browser) and click the bookmark. It only ever grabs text when you actually click
        it: nothing happens automatically just from selecting text. Totally optional either way.
      </p>

      <p style={{ margin: "24px 0" }}>
        <a
          href={BOOKMARKLET_CODE}
          onClick={(e) => e.preventDefault()}
          draggable
          style={{
            display: "inline-block",
            padding: "10px 16px",
            border: "2px solid #333",
            borderRadius: 6,
            fontWeight: 600,
            textDecoration: "none",
            color: "#333",
            cursor: "grab",
          }}
        >
          🦖 Rant This
        </a>
        <span style={{ marginLeft: 12, fontSize: 13, color: "#777" }}>
          &larr; drag this to your bookmarks bar
        </span>
      </p>

      <p style={{ fontSize: 13, color: "#777" }}>
        Known limitations: this is primarily a desktop-browser feature (unreliable inside mobile in-app
        browsers, like Slack's built-in browser). The selected text briefly appears in your local browser
        history when the new tab opens: it isn't sent anywhere beyond that.
      </p>
    </main>
  );
}
