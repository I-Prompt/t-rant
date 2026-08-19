"use client";

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

// 2026-08-19: redesigned for scannability - collapsed-by-default accordion
// sections (via native <details>, so it's keyboard/screen-reader accessible
// for free) instead of one long flat scroll, so the list of questions
// itself is the at-a-glance overview. Two new entries added: an explicit,
// prominent statement that this classifier - mock locally, a real model in
// production - cannot catch every possible threat and this isn't a safety
// product, and a note on what using this on a company-managed device does
// and doesn't change about privacy.

export default function HouseRules() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 28px 64px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em" }}>House Rules</h1>
      <p style={{ marginTop: 8, marginBottom: 32, fontSize: 16, color: "var(--color-text-soft)" }}>
        How T-Rant works, in plain language. Written once, by a person - tap a question to open it.
      </p>

      <TopicGroup label="Using T-Rant" />

      <QA question="What do the three tones actually do differently?">
        <p>
          Every clean message gets rewritten three ways. All three keep your actual points: they only
          change how directly those points land - and all three are things you could actually send to
          a colleague, not a diary entry describing how you feel. The difference between tiers is how
          much cushioning goes around the same underlying point.
        </p>
        <ToneExample
          heading="Still You, Just Cooler"
          description="Firm and direct, still clearly the least-hedged tier, but corporate-safe: no profanity, no accusations phrased as “you never...”, nothing that reads as unhinged."
          example="This is the third time this week I've flagged this, and it still isn't being addressed. I need that to change."
        />
        <ToneExample
          heading="Professional & Clear"
          description="Standard workplace-diplomatic tone. Direct, but fully fine for a manager or client to read."
          example="This is the third time this week I've raised this - I'd like us to find a way to actually resolve it."
        />
        <ToneExample
          heading="Maximum Diplomacy"
          description="Heavily softened, hedge-heavy, prioritizes the relationship even at some cost to directness."
          example="I wanted to gently flag that this is the third time this week this has come up - I'd really appreciate your help finding a way through it together."
        />
        <p style={{ fontSize: 13, color: "var(--color-text-faint)" }}>
          (Original for all three: &quot;You never listen to me and it&apos;s driving me insane, this is
          the third time this week!&quot;)
        </p>
      </QA>

      <QA question="What actually gets blocked, and why?">
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
        <p style={{ marginBottom: 0 }}>
          See the next question for the honest limits of this system - it is not a safety net.
        </p>
      </QA>

      <QA question="Can this actually catch every threat, or stop someone dangerous?" tone="notice">
        <p>
          <strong>No, and it isn&apos;t designed to.</strong> T-Rant is a portfolio/demo project, not a
          content-moderation or safety product. Its classifier - a real AI model in the live version, a
          much cruder keyword-matching stand-in when running locally in mock mode for development - is
          judging short pieces of text with no other context. It will miss things, including things that
          seem obvious in hindsight. Bias is toward over-flagging borderline cases, but nothing here is
          a guarantee.
        </p>
        <p style={{ marginBottom: 0 }}>
          If you or someone else needs real help right now, don&apos;t wait on this tool to recognize
          that: the main page has two buttons above the textarea (&quot;I&apos;m thinking about hurting
          myself&quot; and &quot;Someone is hurting me&quot;) that skip classification entirely and go
          straight to real resources, including local emergency numbers. If you believe someone is in
          immediate danger, contact emergency services directly rather than typing anything into any
          website first.
        </p>
      </QA>

      <QA question="Can I see what the classifier does with my own words before I trust it?">
        <p>
          Type anything below and see exactly what category it gets and why - no rewrite is ever
          generated here, this only shows what the first-stage classifier sees. Note this demo runs the
          same classifier as the main tool, so it's a real test of what does and doesn't get flagged -
          not a guaranteed catch-all (see the question above).
        </p>
        <ClassifierDemo />
      </QA>

      <TopicGroup label="Privacy & safety" />

      <QA question="Is my rant actually private, or is it going somewhere?">
        <p>
          No accounts, no stored rants, no tracking. Your IP address is read only to enforce the rate
          limits below (see &quot;Is there a limit on how much I can use this?&quot;): it&apos;s kept in
          memory for that check and isn&apos;t logged or saved anywhere.
        </p>
        <p>
          All responses are generated using Anthropic&apos;s API, which (at the time this site launched)
          does not use API inputs to train their models. Policies can change; for the most current
          information, see{" "}
          <a href={ANTHROPIC_TRAINING_POLICY_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-link)", textDecoration: "underline" }}>
            Anthropic&apos;s data usage policy
          </a>
          .
        </p>
        <p style={{ marginBottom: 0 }}>
          Don&apos;t take our word for it: the code that decides what gets logged is public. Open the{" "}
          <a href={GITHUB_LOGGING_CODE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-link)", textDecoration: "underline" }}>
            <code>src/lib</code> folder
          </a>{" "}
          on GitHub and look at the logging code yourself. What you see there is everything: there's no
          hidden file, database, or service where your rant text goes.
        </p>
      </QA>

      <QA question="Is it safe to use this on a work computer?">
        <p>
          T-Rant&apos;s own side of this is unchanged either way: it never stores your rant text and
          never logs anything beyond a category and a timestamp, as covered above. But T-Rant only
          controls its own server - it has no control over your device or your employer&apos;s network.
        </p>
        <p>
          If you&apos;re on a company-managed laptop or network, your employer&apos;s IT/security tools -
          a managed browser profile, network monitoring, an SSL-inspecting proxy, endpoint software - may
          be able to see your browsing activity, including the text you type into forms on any website.
          That&apos;s true everywhere on a monitored device, not specific to T-Rant.
        </p>
        <p style={{ marginBottom: 0 }}>
          If that&apos;s a concern, use a personal device on a personal network for anything you&apos;d
          rather your employer not see. The{" "}
          <a href="/bookmarklet" style={{ color: "var(--color-link)", textDecoration: "underline" }}>bookmarklet</a>{" "}
          has one extra wrinkle worth knowing about (it turns your highlighted text into part of a web
          address, which then sits in your browser&apos;s own local history) - see its own page for
          detail.
        </p>
      </QA>

      <TopicGroup label="The fine print" />

      <QA question="Are you eventually going to slap ads or a paywall on this?">
        <ul style={{ paddingLeft: 20, display: "grid", gap: 4 }}>
          <li>Ads</li>
          <li>Reselling or sharing your text with anyone</li>
          <li>Training any model on what you submit</li>
          <li>Fake urgency or scarcity (&quot;only 2 rewrites left today!&quot;)</li>
          <li>Paywalling a feature that already works for free</li>
        </ul>
      </QA>

      <QA question="Is there a limit on how much I can use this?">
        <p style={{ marginBottom: 0 }}>
          Roughly 10 rewrite requests per IP address per hour, to keep the tool sustainable and
          resistant to abuse. The classifier demo above has its own, separate allowance, so trying it
          out doesn&apos;t eat into your real rewrite budget.
        </p>
      </QA>

      <QA question="Can I just trust a rewrite and hit send?">
        <p>
          This is a portfolio/demo project, not professional communications software. Treat every
          rewrite as a suggestion: use your own judgment before sending anything.
        </p>
        <p style={{ marginBottom: 0 }}>
          It&apos;s not a substitute for professional advice: legal, HR, or mental health. The
          self-harm pathway points to real crisis resources, but T-Rant itself is not a crisis service
          and has no ability to intervene.
        </p>
      </QA>
    </main>
  );
}

// Groups the flat accordion list into named topics - purely a visual/scan
// aid (a heading + rule), not a nested accordion, so it doesn't add another
// layer of clicking to get to a question.
function TopicGroup({ label }: { label: string }) {
  return (
    <h2
      style={{
        marginTop: 36,
        marginBottom: 10,
        fontSize: 12.5,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--color-text-faint)",
        paddingBottom: 8,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {label}
    </h2>
  );
}

function QA({
  question,
  children,
  tone = "default",
}: {
  question: string;
  children: React.ReactNode;
  tone?: "default" | "notice";
}) {
  return (
    <details
      className="trant-accordion"
      style={{
        marginTop: 12,
        borderRadius: "var(--radius-md)",
        border: `1px solid ${tone === "notice" ? "var(--color-border-strong)" : "var(--color-border)"}`,
        background: tone === "notice" ? "var(--color-accent-soft)" : "var(--color-surface)",
        overflow: "hidden",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          padding: "16px 20px",
          fontSize: 16.5,
          fontWeight: 700,
          color: "var(--color-text)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span>
          {tone === "notice" && <span aria-hidden="true">⚠️ </span>}
          {question}
        </span>
        <span className="trant-qa-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div
        style={{
          padding: "0 20px 20px",
          color: "var(--color-text-soft)",
          fontSize: 14.5,
          lineHeight: 1.65,
          display: "grid",
          gap: 12,
          background: tone === "notice" ? "var(--color-surface)" : "transparent",
          margin: tone === "notice" ? "0 12px 12px" : undefined,
          borderRadius: tone === "notice" ? "var(--radius-sm)" : undefined,
          paddingTop: tone === "notice" ? 16 : undefined,
        }}
      >
        {children}
      </div>
    </details>
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
    <div style={{ marginTop: 4 }}>
      <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--color-text)", marginBottom: 3 }}>{heading}</h3>
      <p style={{ margin: "0 0 6px", color: "var(--color-text-soft)" }}>{description}</p>
      <p
        style={{
          margin: 0,
          fontStyle: "italic",
          padding: "10px 14px",
          background: "var(--color-surface-muted)",
          borderLeft: "3px solid var(--color-sage)",
          borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
          color: "var(--color-text)",
        }}
      >
        &quot;{example}&quot;
      </p>
    </div>
  );
}

function FlagCategory({ name, examples }: { name: string; examples: string[] }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-muted)",
        border: "1px solid var(--color-border)",
      }}
    >
      <strong style={{ color: "var(--color-text)" }}>{name}</strong>
      <ul style={{ marginTop: 6, paddingLeft: 18, display: "grid", gap: 3 }}>
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
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARS}
          rows={4}
          className="trant-field"
          style={{ fontSize: 15 }}
          placeholder="Try anything - this never leaves the classifier."
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-faint)" }}>
            {text.length} / {MAX_CHARS} characters
          </span>
          <button type="submit" disabled={loading || !text.trim()} className="trant-btn trant-btn-primary">
            {loading ? "Classifying..." : "Classify"}
          </button>
        </div>
      </form>

      {error && <p style={{ color: "#b3453a" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 14, padding: 16, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface-muted)" }}>
          <p style={{ margin: "0 0 4px" }}>
            <strong>Category:</strong> {CATEGORY_LABELS[result.label] ?? result.label}
          </p>
          {result.flaggedPhrases.length > 0 && (
            <p style={{ margin: "0 0 4px" }}>
              <strong>Flagged:</strong> {result.flaggedPhrases.map((p) => `"${p}"`).join(", ")}
            </p>
          )}
          {result.reason && <p style={{ margin: 0, color: "var(--color-text-soft)" }}>{result.reason}</p>}
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--color-text-faint)" }}>
            {result.rateLimit.remaining} of {result.rateLimit.limit} demo checks left this hour
          </p>
        </div>
      )}
    </div>
  );
}
