"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SELF_HARM_CONTENT, SERIOUS_RESOURCE_URL } from "@/lib/selfHarmContent";
import {
  ApiRantResponse,
  FlaggedInfo,
  HelpfulThing,
  Persona,
  PERSONA_LABELS,
  PERSONAS,
  PersonaApiResponse,
  RantResponse,
  RateLimitInfo,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  ToneVersions,
} from "@/lib/types";

const MAX_CHARS = 2000;

const ANTHROPIC_TRAINING_POLICY_URL =
  "https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training";
const GITHUB_LOGGING_CODE_URL = "https://github.com/I-Prompt/t-rant/tree/main/app/src/lib";

function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language?.slice(0, 2).toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang) ? (lang as SupportedLanguage) : "en";
}

const EMPTY_FLAGGED: FlaggedInfo = { originalText: "", flaggedPhrases: [], reason: "" };

// Unicode-safe base64 so shared output can contain any supported language.
function encodeShareData(data: unknown): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}
function decodeShareData<T>(encoded: string): T | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded)))) as T;
  } catch {
    return null;
  }
}

interface SharedPayload {
  versions: ToneVersions;
  intensity: number;
}

// Konami code easter egg. Small, on-brand, doesn't need any art assets.
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

export default function Home() {
  const [text, setText] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RantResponse | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [sharedData, setSharedData] = useState<SharedPayload | null>(null);
  const [easterEgg, setEasterEgg] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const konamiProgress = useRef(0);

  // Bookmarklet prefill (?rant=...) and output-only share links (?shared=...).
  // See t-rant-safety-legal-update.md section 6 and t-rant-phase2-brief.md
  // section 7.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared");
    const rant = params.get("rant");
    if (shared) {
      const decoded = decodeShareData<SharedPayload>(shared);
      if (decoded) setSharedData(decoded);
    } else if (rant) {
      setText(rant);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const expected = KONAMI[konamiProgress.current];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        konamiProgress.current += 1;
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0;
          setEasterEgg(true);
          setTimeout(() => setEasterEgg(false), 4000);
        }
      } else {
        konamiProgress.current = e.key === KONAMI[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function playHardStopTone() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 140;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio is a nice-to-have; never let it break the actual response.
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > MAX_CHARS) return;

    // Create the AudioContext inside the click gesture, not after the
    // fetch resolves — browsers block audio that isn't tied to a direct
    // user interaction.
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSharedData(null);

    try {
      const res = await fetch("/api/rant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.rateLimit) {
        setRateLimit(data.rateLimit as RateLimitInfo);
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        const { rateLimit: _rl, ...rest } = data as ApiRantResponse;
        setResult(rest as RantResponse);
        setSubmittedText(text);
        // Deliberately quiet for "serious" (self-harm/in-danger) — no
        // theatrics there. A distinct hard-stop tone for "firm"
        // (violent_threat) only. Everything else stays silent for now.
        if (rest.pathway === "firm") playHardStopTone();
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  // Bypasses classification entirely — for someone who needs the resource
  // right now, regardless of whether the classifier (real or mock) would
  // have caught their exact phrasing. No network call, no rate limit spent.
  function showHelpNow(kind: "self_harm" | "in_danger") {
    setError(null);
    setSharedData(null);
    const content = SELF_HARM_CONTENT[detectBrowserLanguage()];
    setResult({
      pathway: "serious",
      message: kind === "self_harm" ? content.selfHarmMessage : content.inDangerMessage,
      resourceUrl: SERIOUS_RESOURCE_URL,
      emergencyNote: content.emergencyNote,
      helpfulThings: kind === "self_harm" ? content.helpfulThings : undefined,
      flagged: EMPTY_FLAGGED,
    });
  }

  if (sharedData) {
    return <SharedView data={sharedData} onDismiss={() => { setSharedData(null); window.history.replaceState({}, "", "/"); }} />;
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>T-Rant (core pipeline preview)</h1>
      <p>Paste your heated draft below. Plain functional UI for now: visual design comes later.</p>
      <p style={{ fontSize: 14 }}>
        <Link href="/house-rules">House Rules</Link>: how tones, flagging, and privacy work, plus a
        live classifier demo.
      </p>

      {easterEgg && (
        <p style={{ padding: 8, background: "#fff3cd", borderRadius: 6, fontSize: 14 }}>
          🦖 Roar. Small arms, big feelings, you found the secret handshake.
        </p>
      )}

      <div
        style={{
          margin: "16px 0",
          padding: 12,
          border: "2px solid #6b8f71",
          borderRadius: 6,
          background: "#f4f8f5",
          fontSize: 14,
        }}
      >
        <p style={{ margin: "0 0 8px" }}>
          However you got to this page: if you're thinking about hurting yourself, or someone is
          hurting you, you don't need to write anything or explain first. Tap one of these now:
        </p>
        <button type="button" onClick={() => showHelpNow("self_harm")} style={{ marginRight: 8 }}>
          I'm thinking about hurting myself
        </button>
        <button type="button" onClick={() => showHelpNow("in_danger")}>
          Someone is hurting me
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARS}
          rows={8}
          style={{ width: "100%", fontSize: 16, padding: 8 }}
          placeholder="What's got you fired up?"
        />
        <RageThermometer text={text} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span>{text.length} / {MAX_CHARS}</span>
          <button type="submit" disabled={loading || !text.trim()}>
            {loading ? "Thinking..." : "Translate"}
          </button>
        </div>
      </form>

      {rateLimit && (
        <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
          {rateLimit.remaining} of {rateLimit.limit} rants left this hour
        </p>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result && <ResultView result={result} originalText={submittedText} />}
      {result && result.pathway !== "serious" && <UnwindLinks />}

      <PrivacyNotice />
    </main>
  );
}

// Client-side-only heuristic preview, no API call involved — a rough sense
// of how heated the draft reads before you even submit it. Distinct from
// the server-returned Rant Intensity Score, which judges the real thing.
function RageThermometer({ text }: { text: string }) {
  const level = useMemo(() => {
    if (!text.trim()) return 0;
    const exclamations = (text.match(/!/g) ?? []).length;
    const capsWords = (text.match(/\b[A-Z]{3,}\b/g) ?? []).length;
    const intenseWords = (text.match(/\b(always|never|worst|hate|furious|unacceptable|ridiculous)\b/gi) ?? []).length;
    return Math.min(10, 2 + exclamations * 1.5 + capsWords * 1.5 + intenseWords);
  }, [text]);

  if (!text.trim()) return null;

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(level / 10) * 100}%`,
            background: level > 7 ? "#c0392b" : level > 4 ? "#e67e22" : "#7fa77f",
            transition: "width 150ms ease-out",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: "#888" }}>rage preview: {Math.round(level)}/10</span>
    </div>
  );
}

function ResultView({ result, originalText }: { result: RantResponse; originalText: string }) {
  switch (result.pathway) {
    case "hard_no":
      return (
        <div>
          <p>{result.message}</p>
          <FlaggedBlock flagged={result.flagged} />
        </div>
      );

    case "serious":
      // Calming palette per t-rant-safety-legal-update.md section 1: muted
      // sage/moss green and soft blue, warm beige rather than stark white,
      // nothing bright or saturated, no celebratory elements. There's no
      // pixel mascot built yet, so "no mascot on this screen" is already
      // true by default.
      return (
        <div
          style={{
            margin: "20px 0",
            padding: 24,
            borderRadius: 12,
            background: "#f5f0e6",
          }}
        >
          {result.message.split("\n\n").map((para, i) => (
            <p key={i} style={{ lineHeight: 1.6, marginBottom: 16, color: "#3f473f" }}>
              {para}
            </p>
          ))}
          <div
            style={{
              margin: "20px 0",
              padding: 16,
              border: "2px solid #6b8f71",
              borderRadius: 8,
              background: "#eef3ee",
            }}
          >
            <p style={{ margin: "0 0 8px", fontWeight: 600 }}>
              <a href={result.resourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#4a7a94" }}>
                {result.resourceUrl}
              </a>
            </p>
            <p style={{ margin: 0, color: "#3f473f" }}>{result.emergencyNote}</p>
          </div>
          {result.helpfulThings && result.helpfulThings.length > 0 && (
            <HelpfulThingsList items={result.helpfulThings} />
          )}
          {result.flagged.originalText.trim() !== "" && <FlaggedBlock flagged={result.flagged} />}
        </div>
      );

    case "firm":
      return (
        <div>
          <p>{result.message}</p>
          <FlaggedBlock flagged={result.flagged} />
        </div>
      );

    case "witty":
      return (
        <div>
          <p>{result.message}</p>
          <blockquote>
            <p style={{ fontStyle: "italic" }}>{result.quote.text}</p>
            {result.quote.author && <p>— {result.quote.author}</p>}
          </blockquote>
          <FlaggedBlock flagged={result.flagged} />
        </div>
      );

    case "clean":
      return <CleanResultView result={result} originalText={originalText} />;

    default:
      return null;
  }
}

function CleanResultView({
  result,
  originalText,
}: {
  result: Extract<RantResponse, { pathway: "clean" }>;
  originalText: string;
}) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [personaText, setPersonaText] = useState<string | null>(null);
  const [personaLoading, setPersonaLoading] = useState<Persona | null>(null);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function requestPersona(p: Persona) {
    setPersonaLoading(p);
    setPersonaError(null);
    setPersonaText(null);
    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, persona: p }),
      });
      const data = (await res.json()) as PersonaApiResponse;
      if (data.ok) {
        setPersona(p);
        setPersonaText(data.text);
      } else {
        setPersonaError(data.error);
      }
    } catch {
      setPersonaError("Request failed");
    } finally {
      setPersonaLoading(null);
    }
  }

  function shareOnX() {
    const tweetText = `T-Rant translated my rant: "${result.versions.stillYouJustCooler}"`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function copyShareLink() {
    const encoded = encodeShareData({ versions: result.versions, intensity: result.intensity });
    const url = `${window.location.origin}/?shared=${encoded}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <IntensityGauge intensity={result.intensity} />

      <h2>Still You, Just Cooler</h2>
      <p>{result.versions.stillYouJustCooler}</p>
      <h2>Professional & Clear</h2>
      <p>{result.versions.professionalClear}</p>
      <h2>Maximum Diplomacy</h2>
      <p>{result.versions.maximumDiplomacy}</p>

      <div style={{ marginTop: 20, fontSize: 14 }}>
        <p style={{ marginBottom: 6, color: "#555" }}>Try a persona (just for fun):</p>
        {PERSONAS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => requestPersona(p)}
            disabled={personaLoading !== null}
            style={{ marginRight: 6, marginBottom: 6 }}
          >
            {personaLoading === p ? "..." : PERSONA_LABELS[p]}
          </button>
        ))}
        {personaError && <p style={{ color: "crimson" }}>{personaError}</p>}
        {personaText && persona && (
          <div style={{ marginTop: 8, padding: 12, border: "1px solid #ddd", borderRadius: 6, background: "#fafafa" }}>
            <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{PERSONA_LABELS[persona]}</p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{personaText}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20, fontSize: 14 }}>
        <button type="button" onClick={shareOnX} style={{ marginRight: 8 }}>
          Share on X
        </button>
        <button type="button" onClick={copyShareLink}>
          {copied ? "Link copied!" : "Copy shareable link"}
        </button>
        <p style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
          Only the rewritten output goes in the link, never your original draft.
        </p>
      </div>
    </div>
  );
}

function IntensityGauge({ intensity }: { intensity: number }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, color: "#555" }}>
        Rant Intensity: {intensity}/10
      </p>
      <div style={{ height: 10, background: "#eee", borderRadius: 5, overflow: "hidden", maxWidth: 240 }}>
        <div
          style={{
            height: "100%",
            width: `${(intensity / 10) * 100}%`,
            background: intensity > 7 ? "#c0392b" : intensity > 4 ? "#e67e22" : "#7fa77f",
          }}
        />
      </div>
    </div>
  );
}

function SharedView({ data, onDismiss }: { data: SharedPayload; onDismiss: () => void }) {
  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <p style={{ fontSize: 14, color: "#555" }}>Someone shared a T-Rant result with you.</p>
      <IntensityGauge intensity={data.intensity} />
      <h2>Still You, Just Cooler</h2>
      <p>{data.versions.stillYouJustCooler}</p>
      <h2>Professional & Clear</h2>
      <p>{data.versions.professionalClear}</p>
      <h2>Maximum Diplomacy</h2>
      <p>{data.versions.maximumDiplomacy}</p>
      <button type="button" onClick={onDismiss} style={{ marginTop: 16 }}>
        Try it yourself
      </button>
    </main>
  );
}

// Deliberately de-emphasized relative to the resource callout above it —
// this is optional personal context, not the point of the page. The
// vertical rule visually sets it apart as a distinct, secondary block. The
// first letters of the non-optional items spell T-R-A-N-T; see
// t-rant-phase2-brief.md section 3.
function HelpfulThingsList({ items }: { items: HelpfulThing[] }) {
  return (
    <div
      style={{
        marginTop: 16,
        paddingLeft: 16,
        borderLeft: "3px solid #b9c9b0",
        fontSize: 14,
        color: "#5c6355",
      }}
    >
      <p style={{ marginBottom: 8 }}>A few things that helped me:</p>
      <ul style={{ paddingLeft: 20, listStyle: "none", marginLeft: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 8, fontStyle: item.optional ? "italic" : "normal" }}>
            {item.optional && <strong>- </strong>}
            {item.title && (
              <>
                {item.emphasizeFirstLetter ? (
                  <>
                    <strong style={{ color: "#4a5544" }}>{item.title[0]}</strong>
                    <strong>{item.title.slice(1)}</strong>
                  </>
                ) : (
                  <strong>{item.title}</strong>
                )}{" "}
              </>
            )}
            {item.body}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Shows the user's own text back to them with the triggering phrases
// highlighted, plus the one-line reason — proof a block isn't a silent
// guess. See t-rant-phase2-brief.md section 1 ("type it anyway").
function FlaggedBlock({ flagged }: { flagged: FlaggedInfo }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 6,
        background: "#fafafa",
      }}
    >
      <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
        {highlightFlagged(flagged.originalText, flagged.flaggedPhrases)}
      </p>
      {flagged.reason && (
        <p style={{ margin: 0, fontSize: 14, color: "#555" }}>{flagged.reason}</p>
      )}
    </div>
  );
}

function highlightFlagged(text: string, phrases: string[]) {
  const clean = phrases.filter(Boolean);
  if (clean.length === 0) return text;

  const escaped = clean.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");
  const parts = text.split(pattern);

  return parts.map((part, i) =>
    clean.includes(part) ? (
      <mark key={i} style={{ background: "#ffe9a8" }}>
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// A curated set of links to step away with, per
// t-rant-safety-legal-update.md section 5. Not shown after the "serious"
// pathway — that state stays deliberately sparse, no distractions.
const UNWIND_LINKS = [
  { emoji: "🕹️", label: "Tetris", tag: "Stack blocks, not grudges.", href: "https://tetris.com" },
  { emoji: "🦦", label: "explore.org", tag: "Live animal cams. Zero drama, all whiskers.", href: "https://explore.org" },
  { emoji: "😻", label: "r/aww", tag: "Scroll until your blood pressure forgives you.", href: "https://reddit.com/r/aww" },
  { emoji: "🎲", label: "The Useless Web", tag: "One button, zero purpose, somehow it helps.", href: "https://theuselessweb.com" },
  { emoji: "🧩", label: "2048", tag: "Swap one puzzle for a smaller, friendlier one.", href: "https://play2048.co" },
];

function UnwindLinks() {
  return (
    <section style={{ marginTop: 32 }}>
      <p style={{ fontSize: 13, color: "#777", fontStyle: "italic" }}>
        You're leaving T-Rant territory: everything past this point is somebody else's swamp, we
        don't control it, vouch for it, or get a cut of your afternoon. Wander at your own risk.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
        {UNWIND_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: 6,
              textDecoration: "none",
              color: "#333",
              fontSize: 13,
            }}
          >
            <div>{link.emoji} {link.label}</div>
            <div style={{ color: "#888", fontSize: 12 }}>{link.tag}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

function PrivacyNotice() {
  return (
    <section style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #eee", fontSize: 13, color: "#555" }}>
      <p>
        No accounts, no stored rants, no tracking. All responses are generated using Anthropic&apos;s API,
        which (at the time this site launched) does not use API inputs to train their models. Policies
        can change; for the most current information, see{" "}
        <a href={ANTHROPIC_TRAINING_POLICY_URL} target="_blank" rel="noopener noreferrer">
          Anthropic&apos;s data usage policy
        </a>
        .
      </p>
      <p>
        Don&apos;t take our word for it: the code that decides what gets saved is public. Open the{" "}
        <a href={GITHUB_LOGGING_CODE_URL} target="_blank" rel="noopener noreferrer">
          <code>src/lib</code> folder
        </a>{" "}
        on GitHub and look at the logging code yourself. You don&apos;t need to read code to get the
        point: there&apos;s no hidden file, database, or service where your rant text goes. What you see
        in that folder is everything.
      </p>
      <p>
        Full breakdown of tones, flagging categories, and usage limits: <Link href="/house-rules">House Rules</Link>.
      </p>
    </section>
  );
}
