import Link from "next/link";

// A satire page mocking how a typical app would monetize this exact tool.
// Everything below is a mockup, clearly labeled, and none of it is
// implemented anywhere in T-Rant. See t-rant-phase2-brief.md section 6 and
// the "What we'll never add" list on the House Rules page.

const FAKE_FEATURES = [
  {
    title: "T-Rant Plus",
    price: "$9.99/mo",
    body: "Unlock 'Maximum Diplomacy Pro' — now 12% more diplomatic. Free users capped at 3 rants/day, timer resets at midnight UTC for no reason anyone can explain.",
  },
  {
    title: "Rant Streak",
    price: "free, but",
    body: "Don't lose your 47-day calming streak! Rant today to keep your flame alive. (Notification sent at 11:47pm.)",
  },
  {
    title: "Boost Your Rewrite",
    price: "$2.99",
    body: "Skip the queue and get your rewrite in 1.8 seconds instead of 2.1. Watch a 15-second ad instead, if you'd rather.",
  },
  {
    title: "T-Rant for Teams",
    price: "Contact Sales",
    body: "Give your whole HR department visibility into everyone's rants, searchable by employee name. (We would never actually build this. We're listing it because someone, somewhere, would.)",
  },
  {
    title: "Data Insights Add-On",
    price: "$4.99/mo",
    body: "See a personalized 'Anger Trends' dashboard. Powered by analyzing every rant you've ever submitted, which we definitely stored just for this.",
  },
];

export default function DarkPatterns() {
  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <p>
        <Link href="/">&larr; Back to T-Rant</Link>
      </p>
      <h1>The Dark Pattern Audit</h1>
      <p>
        A mockup of how a typical app would monetize a tool exactly like this one. Nothing on this page
        is real, implemented, or planned. It exists as a receipt: if any of this ever shows up on the
        actual site, something has gone wrong and you should say so.
      </p>

      {FAKE_FEATURES.map((f) => (
        <div
          key={f.title}
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px dashed #bbb",
            borderRadius: 8,
            background: "#fafafa",
            opacity: 0.85,
          }}
        >
          <p style={{ margin: "0 0 4px", fontWeight: 600 }}>
            {f.title} <span style={{ fontWeight: 400, color: "#888" }}>({f.price})</span>
          </p>
          <p style={{ margin: 0, color: "#555" }}>{f.body}</p>
        </div>
      ))}

      <p style={{ marginTop: 32, fontSize: 14, color: "#555" }}>
        The real, current promise is on the{" "}
        <Link href="/house-rules">House Rules</Link> page, under "What we'll never add."
      </p>
    </main>
  );
}
