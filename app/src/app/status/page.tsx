import Link from "next/link";
import { MAX_REQUESTS_PER_WINDOW } from "@/lib/rateLimit";

// Plain operational status page — reads config at request time, nothing to
// set up separately. Server component (no "use client"), so this reflects
// the actual server env, not whatever the visitor's browser thinks.

export default function Status() {
  const mockMode = process.env.MOCK_MODE === "true";
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <p>
        <Link href="/">&larr; Back to T-Rant</Link>
      </p>
      <h1>Status</h1>
      <StatusRow label="Mode" value={mockMode ? "Mock (no real API calls)" : "Live (Anthropic API)"} />
      <StatusRow label="Anthropic API key configured" value={hasApiKey ? "Yes" : "No"} />
      <StatusRow label="Rewrite rate limit" value={`${MAX_REQUESTS_PER_WINDOW} requests / IP / hour`} />
      <StatusRow label="Model" value="Claude Haiku (both pipeline stages)" />
      <p style={{ marginTop: 24, fontSize: 13, color: "#777" }}>
        This page reads live server configuration on each request — there's nothing separate to check
        or configure elsewhere.
      </p>
    </main>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
      <span style={{ color: "#555" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
