"use client";

import Link from "next/link";
import { useState } from "react";
import { ClassifyDemoResponse } from "@/lib/types";

const MAX_CHARS = 2000;

const ANTHROPIC_TRAINING_POLICY_URL =
  "https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training";
const GITHUB_LOGGING_CODE_URL = "https://github.com/I-Prompt/t-rant/tree/main/app/src/lib";

const CATEGORY_LABELS: Record<string, string> = {
  clean: "Clean - nothing flagged",
  hard_no: "Hard NO",
  self_harm: "Self-harm / eating disorder content",
  in_danger: "Disclosure of being harmed by someone else",
  violent_threat: "Specific violent threat",
  injection_attempt: "Prompt injection attempt",
  hate_speech: "Hate speech",
  sexual_content: "Sexual content",
  other_disallowed: "Other off-purpose content",
};

export default function HouseRules() {
  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <p>
        <Link href="/">&larr; Back to T-Rant</Link>
      </p>
      <h1>House Rules</h1>
      <p>
        The plain-language version of how this tool works, what it does with your text, and where it
        draws the line. Written once, by a person, not generated fresh per visitor.
      </p>

      <Section title="What the three tones mean">
        <p>
          Every clean message gets rewritten three ways. All three keep your actual points: they only
          change how directly those points land.
        </p>
        <ToneExample
          heading="Still You, Just Cooler"
          description="Same directness, same points, edges sanded off. No fake pleasantries bolted on: it should still sound like you."
          example="You're not listening to me, and this is the third time this week - it's frustrating."
        />
        <ToneExample
          heading="Professional & Clear"
          description="Standard workplace-diplomatic tone. Direct, but fully fine for a manager or client to read."
          example="This is the third time this week I've raised this - I need us to find a way to actually address it."
        />
        <ToneExample
          heading="Maximum Diplomacy"
          description="Heavily softened, hedge-heavy, prioritizes the relationship even at some cost to directness."
          example="I wanted to gently flag that this is the third time this week this has come up - I'd really appreciate your help finding a way through it together."
        />
        <p style={{ fontSize: 13, color: "#555" }}>
          (Original for all three: &quot;You never listen to me and it&apos;s driving me insane, this is
          the third time this week!&quot;)
        </p>
      </Section>

      <Section title="How flagging works">
        <p>
          Every message is classified before anything else happens. Nothing gets rewritten until it's
          confirmed clean. Here&apos;s roughly what routes where:
        </p>
        <FlagCategory
          name="Hard NO: flat decline, no engagement"
          examples={[
            "Anything sexualizing a minor",
            "Requests for weapon-building or other dangerous instructions",
            "Sharing someone's private address or details to target them",
            "Fraud or scam message content",
          ]}
        />
        <FlagCategory
          name="Support pathway: resources, not a rewrite"
          examples={[
            "Language indicating intent to hurt yourself",
            "Eating-disorder-related content",
            "Disclosing that someone is currently hurting you (including indirect phrasing like being held captive or not allowed to leave)",
          ]}
        />
        <FlagCategory
          name="Firm pathway: polite decline"
          examples={[
            "A specific, credible threat naming a real person and describing violence against them (including indirect phrasing, not just literal words like \"kill\")",
          ]}
        />
        <FlagCategory
          name="Witty pathway: a quote instead of a rewrite"
          examples={[
            "Trying to get the tool to ignore its instructions or reveal its system prompt",
            "Slurs or hate speech directed at a group",
            "Sexual content unrelated to rewriting a message",
          ]}
        />
        <p>
          Whenever a message gets blocked, the response shows you the exact words that triggered it,
          highlighted in your own text: not a vague category label. That happens right there in the
          response, not hidden in a page like this one.
        </p>
        <p>
          None of this is a perfect filter - no classifier is. If you (or someone you know) needs
          real help right now, the main page has two buttons above the textarea that skip
          classification entirely and go straight to the resource.
        </p>
      </Section>

      <Section title="Try the classifier yourself">
        <p>
          Type anything below and see exactly what category it gets and why - no rewrite is ever
          generated here, this only shows what the first-stage classifier sees. Note this demo runs the
          same classifier as the main tool, so it's a real test of what does and doesn't get flagged -
          not a guaranteed catch-all.
        </p>
        <ClassifierDemo />
      </Section>

      <Section title="Privacy & data">
        <p>
          No accounts, no stored rants, no tracking. Your IP address is read only to enforce the rate
          limits below (see "Usage limits"): it's kept in memory for that check and isn't logged or
          saved anywhere.
        </p>
        <p>
          All responses are generated using Anthropic&apos;s API, which (at the time this site launched)
          does not use API inputs to train their models. Policies can change; for the most current
          information, see{" "}
          <a href={ANTHROPIC_TRAINING_POLICY_URL} target="_blank" rel="noopener noreferrer">
            Anthropic&apos;s data usage policy
          </a>
          .
        </p>
        <p>
          Don&apos;t take our word for it: the code that decides what gets logged is public. Open the{" "}
          <a href={GITHUB_LOGGING_CODE_URL} target="_blank" rel="noopener noreferrer">
            <code>src/lib</code> folder
          </a>{" "}
          on GitHub and look at the logging code yourself. What you see there is everything: there's no
          hidden file, database, or service where your rant text goes.
        </p>
      </Section>

      <Section title="What we'll never add">
        <ul>
          <li>Ads</li>
          <li>Reselling or sharing your text with anyone</li>
          <li>Training any model on what you submit</li>
          <li>Fake urgency or scarcity ("only 2 rewrites left today!")</li>
          <li>Paywalling a feature that already works for free</li>
        </ul>
      </Section>

      <Section title="Usage limits">
        <p>
          Roughly 10 rewrite requests per IP address per hour, to keep the tool sustainable and
          resistant to abuse. The classifier demo above has its own, separate allowance, so trying it
          out doesn&apos;t eat into your real rewrite budget.
        </p>
      </Section>

      <Section title="The legal part">
        <p>
          This is a portfolio/demo project, not professional communications software. Treat every
          rewrite as a suggestion: use your own judgment before sending anything.
        </p>
        <p>
          It&apos;s not a substitute for professional advice: legal, HR, or mental health. The
          self-harm pathway points to real crisis resources, but T-Rant itself is not a crisis service
          and has no ability to intervene.
        </p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function ToneExample({
  heading,
  description,
  example,
}: {
  heading: string;
  description: string;
  example: string;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <h3 style={{ marginBottom: 2 }}>{heading}</h3>
      <p style={{ margin: "0 0 4px", color: "#555" }}>{description}</p>
      <p style={{ margin: 0, fontStyle: "italic", padding: 8, background: "#fafafa", borderRadius: 4 }}>
        &quot;{example}&quot;
      </p>
    </div>
  );
}

function FlagCategory({ name, examples }: { name: string; examples: string[] }) {
  return (
    <div style={{ marginTop: 12 }}>
      <strong>{name}</strong>
      <ul style={{ marginTop: 4 }}>
        {examples.map((ex) => (
          <li key={ex}>{ex}</li>
        ))}
      </ul>
    </div>
  );
}

function ClassifierDemo() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifyDemoResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > MAX_CHARS) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/classify-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setResult(data as ClassifyDemoResponse);
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARS}
          rows={4}
          style={{ width: "100%", fontSize: 15, padding: 8 }}
          placeholder="Try anything - this never leaves the classifier."
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 13, color: "#555" }}>
            {text.length} / {MAX_CHARS}
          </span>
          <button type="submit" disabled={loading || !text.trim()}>
            {loading ? "Classifying..." : "Classify"}
          </button>
        </div>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 6, background: "#fafafa" }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Category:</strong> {CATEGORY_LABELS[result.label] ?? result.label}
          </p>
          {result.flaggedPhrases.length > 0 && (
            <p style={{ margin: "0 0 4px" }}>
              <strong>Flagged:</strong> {result.flaggedPhrases.map((p) => `"${p}"`).join(", ")}
            </p>
          )}
          {result.reason && <p style={{ margin: 0, color: "#555" }}>{result.reason}</p>}
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#777" }}>
            {result.rateLimit.remaining} of {result.rateLimit.limit} demo checks left this hour
          </p>
        </div>
      )}
    </div>
  );
}
