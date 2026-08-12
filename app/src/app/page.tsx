"use client";

import { useState } from "react";
import { RantResponse } from "@/lib/types";

const MAX_CHARS = 2000;

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RantResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > MAX_CHARS) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/rant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setResult(data as RantResponse);
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>T-Rant (core pipeline preview)</h1>
      <p>Paste your heated draft below. Plain functional UI for now — visual design comes later.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARS}
          rows={8}
          style={{ width: "100%", fontSize: 16, padding: 8 }}
          placeholder="What's got you fired up?"
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span>{text.length} / {MAX_CHARS}</span>
          <button type="submit" disabled={loading || !text.trim()}>
            {loading ? "Thinking..." : "Translate"}
          </button>
        </div>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && <ResultView result={result} />}
    </main>
  );
}

function ResultView({ result }: { result: RantResponse }) {
  switch (result.pathway) {
    case "hard_no":
      return <p>{result.message}</p>;

    case "serious":
      return (
        <div>
          <p>{result.message}</p>
          <p>
            <a href={result.resourceUrl} target="_blank" rel="noopener noreferrer">
              {result.resourceUrl}
            </a>
          </p>
        </div>
      );

    case "firm":
      return <p>{result.message}</p>;

    case "witty":
      return (
        <div>
          <p>{result.message}</p>
          <blockquote>
            <p style={{ fontStyle: "italic" }}>{result.quote.text}</p>
            {result.quote.author && <p>— {result.quote.author}</p>}
          </blockquote>
        </div>
      );

    case "clean":
      return (
        <div>
          <h2>Still You, Just Cooler</h2>
          <p>{result.versions.stillYouJustCooler}</p>
          <h2>Professional & Clear</h2>
          <p>{result.versions.professionalClear}</p>
          <h2>Maximum Diplomacy</h2>
          <p>{result.versions.maximumDiplomacy}</p>
        </div>
      );

    default:
      return null;
  }
}
