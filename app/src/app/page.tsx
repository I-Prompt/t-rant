"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EMERGENCY_NUMBERS } from "@/lib/emergencyNumbers";
import { SELF_HARM_CONTENT, SERIOUS_RESOURCE_URL } from "@/lib/selfHarmContent";
import { playHardStopTone, playStomp, playToneBlip, playWittyWomp, ToneKey } from "@/lib/sounds";
import { getRexCells, REX_GRID_H, REX_GRID_W, RexPose } from "@/lib/rexSprite";
import {
  ApiRantResponse,
  CONTEXT_MAX_CHARS,
  FlaggedInfo,
  HelpfulThing,
  Persona,
  PERSONA_LABELS,
  PERSONAS,
  PersonaApiResponse,
  RantResponse,
  RateLimitInfo,
  SupportedLanguage,
  ToneVersions,
} from "@/lib/types";

const MAX_CHARS = 2000;

const ANTHROPIC_TRAINING_POLICY_URL =
  "https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training";
const GITHUB_LOGGING_CODE_URL = "https://github.com/I-Prompt/t-rant/tree/main/app/src/lib";

// The "get help now" buttons bypass classification entirely — by design,
// they work with an empty textarea, so there's often no text to detect a
// language from. navigator.language (the browser/OS locale) turned out to be
// an unreliable signal for this: it reflects OS/browser configuration, not
// what the person is actually reading in, and produced non-English crisis
// text for people typing and reading in English. So it's not used at all
// here anymore. When there's typed text, use it as a signal (crude
// script/keyword heuristic, not real language detection); otherwise default
// to English, which matches the rest of the site's untranslated chrome.
const NON_ENGLISH_HINTS: [Exclude<SupportedLanguage, "en">, RegExp][] = [
  ["sv", /[åÅ]/g],
  ["sv", /\b(jag|inte|är|och|men|kan|aldrig|varför|hjälp)\b/gi],
  ["de", /[ßÄÖÜäöü]/g],
  ["de", /\b(ich|nicht|und|ist|mich|mir|warum|aber|sehr|kann|nie|hilfe)\b/gi],
  ["es", /[¿¡ñÑ]/g],
  ["es", /\b(yo|no|soy|pero|nunca|porque|está|ayuda|socorro)\b/gi],
  ["fr", /[çœÇŒ]/g],
  ["fr", /\b(je|ne|pas|suis|mais|jamais|pourquoi|aide|au secours)\b/gi],
  ["it", /\b(io|non|sono|ma|mai|perché|aiuto|soccorso)\b/gi],
];

function guessTextLanguage(text: string): SupportedLanguage {
  if (/[а-яёА-ЯЁ]/.test(text)) return "ru";

  const scores = new Map<SupportedLanguage, number>();
  for (const [lang, pattern] of NON_ENGLISH_HINTS) {
    const matches = text.match(pattern);
    if (matches) scores.set(lang, (scores.get(lang) ?? 0) + matches.length);
  }

  let best: SupportedLanguage = "en";
  let bestScore = 0;
  for (const [lang, score] of scores) {
    if (score > bestScore) {
      best = lang;
      bestScore = score;
    }
  }
  return best;
}

// Prefer the typed draft's language; default to English (never the browser
// locale, see above) when there's no text to go on at all.
function resolveHelpLanguage(text: string): SupportedLanguage {
  const trimmed = text.trim();
  return trimmed ? guessTextLanguage(trimmed) : "en";
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

// --- Pixel T-Rex sprite -----------------------------------------------
// Code-generated pixel art, no external image assets — geometry lives in
// lib/rexSprite.ts (shared with the favicon, see app/icon.tsx, so the two
// can't drift apart) and gets rendered here as SVG rects. See
// t-rant-technical-spec.md "Visual design" for the pose list - deliberately
// no sprite at all for hard_no or the serious (self-harm/in-danger)
// pathway, so those states stay unbranded on purpose.
const REX_CELL = 8;

function PixelRex({ pose, size = 48, animate = false }: { pose: RexPose; size?: number; animate?: boolean }) {
  const cells = getRexCells(pose);
  const w = REX_GRID_W * REX_CELL;
  const h = REX_GRID_H * REX_CELL;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={size}
      height={(size * REX_GRID_H) / REX_GRID_W}
      shapeRendering="crispEdges"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <g>
        {animate && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -3; 0 0"
            dur="0.5s"
            repeatCount="indefinite"
          />
        )}
        {cells.map((cell, i) => (
          <rect key={i} x={cell.x * REX_CELL} y={cell.y * REX_CELL} width={REX_CELL} height={REX_CELL} fill={cell.color} />
        ))}
      </g>
    </svg>
  );
}

// Sprite + heading, one per tone tier. Clicking a heading plays that tier's
// distinct square-wave blip (see lib/sounds.ts) - a small, silly,
// click-triggered delight, matching t-rant-phase2-brief.md section 6.
function ToneHeading({ pose, label, tone, onClick }: { pose: RexPose; label: string; tone: ToneKey; onClick: (tone: ToneKey) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(tone)}
      style={{
        all: "unset",
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        marginTop: 20,
      }}
    >
      <PixelRex pose={pose} size={32} />
      <h2 style={{ margin: 0, fontFamily: "var(--font-pixel)", fontSize: 15, lineHeight: 1.5 }}>{label}</h2>
    </button>
  );
}

// Pixelated prehistoric backdrop: a repeating fern band along the bottom
// edge and one volcano, all code-generated (no image asset), kept faint so
// it never fights foreground text for contrast. Deliberately not rendered
// during the "serious" pathway — that state steps out of the pixel theme
// entirely, per t-rant-technical-spec.md.
function PrehistoricBackground() {
  const fernColor = "#8fa88f";
  const volcanoColor = "#a89a80";

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        opacity: 0.3,
        pointerEvents: "none",
      }}
    >
      <defs>
        <pattern id="rex-ferns" width="34" height="40" patternUnits="userSpaceOnUse">
          <rect x="15" y="24" width="4" height="16" fill={fernColor} />
          <rect x="11" y="20" width="4" height="4" fill={fernColor} />
          <rect x="7" y="16" width="4" height="4" fill={fernColor} />
          <rect x="19" y="20" width="4" height="4" fill={fernColor} />
          <rect x="23" y="16" width="4" height="4" fill={fernColor} />
          <rect x="11" y="28" width="4" height="4" fill={fernColor} />
          <rect x="19" y="28" width="4" height="4" fill={fernColor} />
        </pattern>
      </defs>
      <rect x="0" y="230" width="400" height="70" fill="url(#rex-ferns)" />
      {/* Volcano: stepped pixel triangle with a lava-orange peak. */}
      <rect x="330" y="150" width="10" height="10" fill="#c0392b" />
      <rect x="320" y="160" width="30" height="10" fill={volcanoColor} />
      <rect x="310" y="170" width="50" height="10" fill={volcanoColor} />
      <rect x="300" y="180" width="70" height="10" fill={volcanoColor} />
      <rect x="290" y="190" width="90" height="10" fill={volcanoColor} />
    </svg>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [context, setContext] = useState("");
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

  // Thin wrapper around the lib/sounds.ts oscillator functions: audio is a
  // nice-to-have, so a failure here should never break the actual response.
  function playSound(fn: (ctx: AudioContext) => void) {
    try {
      const ctx = audioCtxRef.current;
      if (ctx) fn(ctx);
    } catch {
      // ignore
    }
  }

  function playTone(tone: ToneKey) {
    playSound((ctx) => playToneBlip(ctx, tone));
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
    playSound(playStomp);

    setLoading(true);
    setError(null);
    setResult(null);
    setSharedData(null);

    try {
      const res = await fetch("/api/rant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, context: context.trim() || undefined }),
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
        // Deliberately quiet for "serious" (self-harm/in-danger) and
        // "hard_no" — no mascot, no theatrics there, per
        // t-rant-technical-spec.md's visual design section. A hard-stop tone
        // for "firm" (violent_threat), a "womp womp" for "witty" blocks.
        if (rest.pathway === "firm") playSound(playHardStopTone);
        if (rest.pathway === "witty") playSound(playWittyWomp);
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
    const content = SELF_HARM_CONTENT[resolveHelpLanguage(text)];
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
      {result?.pathway !== "serious" && <PrehistoricBackground />}
      <h1 style={{ fontFamily: "var(--font-pixel)", fontSize: 28, lineHeight: 1.4 }}>T-Rant</h1>
      <p>Paste your heated draft below.</p>
      <p style={{ fontSize: 14 }}>
        <Link href="/house-rules">House Rules</Link>: how tones, flagging, and privacy work, plus a
        live classifier demo.
      </p>

      {easterEgg && (
        <p style={{ padding: 8, background: "#fff3cd", borderRadius: 6, fontSize: 14 }}>
          🦖 Roar. Small arms, big feelings, you found the secret handshake.
        </p>
      )}

      <BrandCard>
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
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 13, color: "#666", display: "block", marginBottom: 4 }}>
              What did they say or do? <span style={{ color: "#999" }}>(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              maxLength={CONTEXT_MAX_CHARS}
              rows={2}
              style={{ width: "100%", fontSize: 14, padding: 8 }}
              placeholder="Give the rewrite something to respond to, in their words - not required."
            />
            <span style={{ fontSize: 12, color: "#999" }}>
              {context.length} / {CONTEXT_MAX_CHARS}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span>{text.length} / {MAX_CHARS}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {loading && <PixelRex pose="idle" size={32} animate />}
              <button type="submit" disabled={loading || !text.trim()}>
                {loading ? "T-Rex is thinking..." : "Translate"}
              </button>
            </div>
          </div>
        </form>
      </BrandCard>

      <HelpNowBar onHelp={showHelpNow} />

      {rateLimit && (
        <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
          {rateLimit.remaining} of {rateLimit.limit} rants left this hour
        </p>
      )}

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {result &&
        (result.pathway === "serious" ? (
          <ResultView result={result} originalText={submittedText} onToneClick={playTone} />
        ) : (
          <BrandCard>
            <ResultView result={result} originalText={submittedText} onToneClick={playTone} />
          </BrandCard>
        ))}
      {result && result.pathway !== "serious" && <UnwindLinks />}

      <PrivacyNotice />
    </main>
  );
}

// Branded header + footer around the input and (non-serious) results, so a
// screenshot of either one carries the T-Rant mark no matter where someone
// crops it — top, bottom, or wherever they stop scrolling. Deliberately a
// different color scheme from the calming palette (serious pathway) so
// that state stays visually distinct and un-branded, per
// t-rant-safety-legal-update.md section 1.
function BrandCard({ children }: { children: React.ReactNode }) {
  const bandStyle: React.CSSProperties = {
    padding: "6px 14px",
    background: "#2d2a24",
    color: "#f5f0e6",
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: "var(--font-pixel)",
  };
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", margin: "16px 0" }}>
      <div style={bandStyle}>🦖 T-Rant</div>
      <div style={{ padding: 16 }}>{children}</div>
      <div style={{ ...bandStyle, fontSize: 9 }}>🦖 T-Rant · small arms, big feelings</div>
    </div>
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

// Deliberately quiet, not hidden: always visible below the input so it's
// findable without hunting, but styled as a small text line rather than a
// bordered callout, since it isn't the main point of the page. Kept below
// the form (not above it) so it doesn't compete with the actual product for
// first-glance attention.
function HelpNowBar({ onHelp }: { onHelp: (kind: "self_harm" | "in_danger") => void }) {
  const linkButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    padding: 0,
    font: "inherit",
    color: "#7a8a7a",
    textDecoration: "underline",
    cursor: "pointer",
  };
  return (
    <p style={{ fontSize: 12.5, color: "#999", margin: "8px 0 0" }}>
      No need to type anything first if you're thinking about hurting yourself, or someone is
      hurting you:{" "}
      <button type="button" onClick={() => onHelp("self_harm")} style={linkButtonStyle}>
        I'm thinking about hurting myself
      </button>
      {" · "}
      <button type="button" onClick={() => onHelp("in_danger")} style={linkButtonStyle}>
        Someone is hurting me
      </button>
    </p>
  );
}

// Region -> country -> general emergency number picker, embedded directly in
// the self-harm/in-danger result. findahelpline.com (above) stays the
// primary, actively-maintained pointer; this is a secondary option for
// someone who needs a local emergency line right now. Numbers are drafted
// from general knowledge, not independently verified (see
// src/lib/emergencyNumbers.ts), so that caveat stays visible here too rather
// than implying more authority than the data actually has.
function EmergencyNumbersPicker() {
  const [regionIndex, setRegionIndex] = useState<number | null>(null);
  const [countryIndex, setCountryIndex] = useState<number | null>(null);

  const region = regionIndex !== null ? EMERGENCY_NUMBERS[regionIndex] : null;
  const entry = region && countryIndex !== null ? region.countries[countryIndex] : null;

  return (
    <div
      style={{
        margin: "20px 0",
        padding: 16,
        border: "1px solid #c9c2a6",
        borderRadius: 8,
        background: "#f0ece0",
      }}
    >
      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#3f473f" }}>Local emergency number</p>
      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#7a7259" }}>
        Drafted from general knowledge, not independently verified: if you're unsure, the link above
        is the actively maintained option.
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          value={regionIndex ?? ""}
          onChange={(e) => {
            setRegionIndex(e.target.value === "" ? null : Number(e.target.value));
            setCountryIndex(null);
          }}
          style={{ padding: 6, fontSize: 14 }}
        >
          <option value="">Region</option>
          {EMERGENCY_NUMBERS.map((r, i) => (
            <option key={r.region} value={i}>
              {r.region}
            </option>
          ))}
        </select>
        {region && (
          <select
            value={countryIndex ?? ""}
            onChange={(e) => setCountryIndex(e.target.value === "" ? null : Number(e.target.value))}
            style={{ padding: 6, fontSize: 14 }}
          >
            <option value="">Country</option>
            {region.countries.map((c, i) => (
              <option key={c.country} value={i}>
                {c.country}
              </option>
            ))}
          </select>
        )}
      </div>
      {entry && (
        <div style={{ marginTop: 10 }}>
          <p style={{ margin: 0 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: "#3f473f" }}>{entry.number}</span>
            {entry.note && <span style={{ marginLeft: 8, fontSize: 13, color: "#7a7259" }}>{entry.note}</span>}
          </p>
          {entry.helplines && entry.helplines.length > 0 && (
            <ul style={{ margin: "6px 0 0", padding: 0, listStyle: "none", fontSize: 12, color: "#8a8265" }}>
              {entry.helplines.map((h) => (
                <li key={h.label}>
                  {h.label}: {h.number}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ResultView({
  result,
  originalText,
  onToneClick,
}: {
  result: RantResponse;
  originalText: string;
  onToneClick: (tone: ToneKey) => void;
}) {
  switch (result.pathway) {
    // No sprite, no sound: hard_no gets a flat, minimal refusal with no
    // mascot theatrics of any kind, per t-rant-technical-spec.md.
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
          <EmergencyNumbersPicker />
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PixelRex pose="stop_sign" size={48} />
            <p style={{ margin: 0 }}>{result.message}</p>
          </div>
          <blockquote>
            <p style={{ fontStyle: "italic" }}>{result.quote.text}</p>
            {result.quote.author && <p>— {result.quote.author}</p>}
          </blockquote>
          <FlaggedBlock flagged={result.flagged} />
        </div>
      );

    case "clean":
      return <CleanResultView result={result} originalText={originalText} onToneClick={onToneClick} />;

    default:
      return null;
  }
}

function CleanResultView({
  result,
  originalText,
  onToneClick,
}: {
  result: Extract<RantResponse, { pathway: "clean" }>;
  originalText: string;
  onToneClick: (tone: ToneKey) => void;
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

      <ToneHeading pose="raised_eyebrow" tone="still_you_just_cooler" label="Still You, Just Cooler" onClick={onToneClick} />
      <p>{result.versions.stillYouJustCooler}</p>
      <ToneHeading pose="necktie" tone="professional_clear" label="Professional & Clear" onClick={onToneClick} />
      <p>{result.versions.professionalClear}</p>
      <ToneHeading pose="olive_branch" tone="maximum_diplomacy" label="Maximum Diplomacy" onClick={onToneClick} />
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
