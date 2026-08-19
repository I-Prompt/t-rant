"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EMERGENCY_NUMBERS } from "@/lib/emergencyNumbers";
import { SELF_HARM_CONTENT, SERIOUS_RESOURCE_URL } from "@/lib/selfHarmContent";
import { playHardStopTone, playStomp, playToneBlip, playWittyWomp, ToneKey } from "@/lib/sounds";
import { getRexCells, REX_GRID_H, REX_GRID_W, RexPose } from "@/lib/rexSprite";
import { UNWIND_LINKS } from "@/lib/unwindLinks";
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

function PixelRex({
  pose,
  size = 48,
  animate = false,
  animateDuration = "0.5s",
}: {
  pose: RexPose;
  size?: number;
  animate?: boolean;
  animateDuration?: string;
}) {
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
            dur={animateDuration}
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
        gap: 10,
        cursor: "pointer",
        marginTop: 22,
      }}
    >
      <PixelRex pose={pose} size={30} />
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>{label}</h2>
    </button>
  );
}

// Ambient site background: one large soft glow in each far corner plus a
// single smooth horizon silhouette along the bottom edge — a quieter,
// modern take on the previous repeating pixel-fern/volcano pattern (busy at
// this scale, reads as clutter rather than atmosphere). Deliberately not
// rendered during the "serious" pathway, same as before: that state steps
// out of the branded look entirely.
function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: -1, overflow: "hidden", pointerEvents: "none" }}
    >
      <div
        style={{
          position: "absolute",
          top: "-12%",
          right: "-10%",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,44,0.15), rgba(168,85,44,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-18%",
          left: "-12%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,143,113,0.16), rgba(107,143,113,0) 70%)",
        }}
      />
      <svg
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "20vh", opacity: 0.08 }}
      >
        <path
          d="M0,140 C120,95 220,165 340,120 C460,75 560,150 680,110 C740,90 780,100 800,96 L800,200 L0,200 Z"
          fill="#6b8f71"
        />
      </svg>
    </div>
  );
}

// Small "how to use this box" callout, right above the textarea. The tool
// only works if the input reads like the actual message someone would send,
// not a third-person description of the feeling behind it — worth saying
// explicitly rather than assuming it's obvious.
function WritingGuidance() {
  return (
    <div
      style={{
        marginBottom: 14,
        padding: "14px 16px",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-muted)",
        border: "1px solid var(--color-border)",
      }}
    >
      <p
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--color-text-faint)",
          marginBottom: 10,
        }}
      >
        Write it like you&apos;d actually send it
      </p>
      <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
        <p style={{ color: "var(--color-text-faint)" }}>
          <span style={{ color: "#b3453a", fontWeight: 700 }}>✗</span> &quot;I feel really annoyed that Steve keeps
          eating all the snacks in the break room.&quot;{" "}
          <em style={{ fontStyle: "normal", color: "var(--color-text-faint)" }}>— describing the feeling</em>
        </p>
        <p style={{ color: "var(--color-text)" }}>
          <span style={{ color: "var(--color-sage)", fontWeight: 700 }}>✓</span> &quot;STEVE. You absolute
          Brontosaurus, you ate every fern in the break room AGAIN and didn&apos;t save me one!!&quot;{" "}
          <em style={{ fontStyle: "normal", color: "var(--color-text-faint)" }}>— the actual message</em>
        </p>
      </div>
      <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--color-text-faint)" }}>
        Paste (or type) the real thing, typos and all — we handle turning it into something you can send.
      </p>
    </div>
  );
}

function CharCount({ value, max }: { value: number; max: number }) {
  return (
    <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>
      {value.toLocaleString("en-US")} / {max.toLocaleString("en-US")} characters
    </span>
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
  const [mockMode, setMockMode] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const konamiProgress = useRef(0);

  const isSerious = result?.pathway === "serious";

  // Shows a small badge when the server is running with MOCK_MODE=true, so
  // "the rewrite barely changed anything" or "the blocker missed something"
  // reads as expected mock-mode behavior instead of a real pipeline bug -
  // this exact confusion has come up more than once. Failure here (offline,
  // etc.) just means no badge, never a broken page.
  useEffect(() => {
    fetch("/api/mode")
      .then((res) => res.json())
      .then((data) => setMockMode(Boolean(data.mockMode)))
      .catch(() => {});
  }, []);

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

  // While the serious (self-harm/in-danger) pathway is showing, the rest of
  // the page's chrome (hero, form, nav) hides so this is the only thing on
  // screen — see AppShell's sidebar dimming rule in globals.css, keyed off
  // this attribute, plus the conditional rendering below.
  useEffect(() => {
    document.documentElement.setAttribute("data-calm-mode", isSerious ? "true" : "false");
  }, [isSerious]);

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
    if (kind === "self_harm") {
      setResult({
        pathway: "serious",
        kind: "self_harm",
        message: content.selfHarmMessage,
        resourceUrl: SERIOUS_RESOURCE_URL,
        emergencyNote: content.emergencyNote,
        helpfulThings: content.helpfulThings,
        flagged: EMPTY_FLAGGED,
      });
    } else {
      setResult({
        pathway: "serious",
        kind: "in_danger",
        message: content.inDanger.intro,
        resourceUrl: SERIOUS_RESOURCE_URL,
        inDanger: content.inDanger,
        flagged: EMPTY_FLAGGED,
      });
    }
  }

  function resetToStart() {
    setResult(null);
    setError(null);
    setSubmittedText("");
  }

  if (sharedData) {
    return <SharedView data={sharedData} onDismiss={() => { setSharedData(null); window.history.replaceState({}, "", "/"); }} />;
  }

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: "48px 28px 64px" }}>
      {!isSerious && <AmbientBackground />}

      {!isSerious && (
        <>
          {mockMode && (
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-soft)",
                background: "var(--color-surface-muted)",
                border: "1px solid var(--color-border)",
                borderRadius: 999,
                padding: "5px 12px",
                display: "inline-block",
                marginBottom: 14,
              }}
            >
              🧪 Mock mode: rewrites and blocking use crude local patterns, not the real AI
            </p>
          )}
          <header style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <PixelRex pose="idle" size={104} animate animateDuration="2.6s" />
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--color-text)" }}>
                T-Rant
              </h1>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Big feelings. Smart translation.
              </p>
            </div>
          </header>
          <p style={{ marginTop: 16, fontSize: 15.5, color: "var(--color-text-soft)", maxWidth: 540, lineHeight: 1.6 }}>
            Paste your heated draft below — get three versions you can actually send, at your pick of
            diplomacy.
          </p>

          {easterEgg && (
            <p
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "var(--color-accent-soft)",
                borderRadius: "var(--radius-sm)",
                fontSize: 14,
              }}
            >
              🦖 Roar. You found the secret handshake.
            </p>
          )}

          <BrandCard>
            <form onSubmit={handleSubmit}>
              <WritingGuidance />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX_CHARS}
                rows={8}
                className="trant-field"
                style={{ fontSize: 16 }}
                placeholder="What's got you fired up?"
              />
              <RageThermometer text={text} />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <CharCount value={text.length} max={MAX_CHARS} />
              </div>

              <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--color-border)" }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", display: "block", marginBottom: 6 }}>
                  What set this off? <span style={{ fontWeight: 400, color: "var(--color-text-faint)" }}>(optional)</span>
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  maxLength={CONTEXT_MAX_CHARS}
                  rows={2}
                  className="trant-field"
                  style={{ fontSize: 14 }}
                  placeholder="Quote or summarize what they said or did — helps the rewrite address their actual point, not just your tone."
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                  <CharCount value={context.length} max={CONTEXT_MAX_CHARS} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 20 }}>
                {loading && <PixelRex pose="idle" size={30} animate />}
                <button type="submit" className="trant-btn trant-btn-primary" disabled={loading || !text.trim()}>
                  {loading ? "T-Rex is thinking..." : "Translate"}
                </button>
              </div>
            </form>
          </BrandCard>

          <HelpNowBar onHelp={showHelpNow} />

          {rateLimit && (
            <p style={{ fontSize: 13, color: "var(--color-text-faint)", marginTop: 6 }}>
              {rateLimit.remaining} of {rateLimit.limit} rants left this hour
            </p>
          )}

          {error && <p style={{ color: "#b3453a", marginTop: 8 }}>{error}</p>}
        </>
      )}

      {result &&
        (result.pathway === "serious" ? (
          <SeriousCard result={result} onReset={resetToStart} />
        ) : (
          <BrandCard>
            <ResultView result={result} originalText={submittedText} onToneClick={playTone} />
          </BrandCard>
        ))}
      {result && result.pathway !== "serious" && <UnwindLinks />}

      {!isSerious && <PrivacyNotice />}
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
    padding: "7px 16px",
    background: "#2d2a24",
    color: "#f5f0e6",
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: 0.2,
  };
  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        margin: "22px 0",
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={bandStyle}>🦖 T-Rant</div>
      <div style={{ padding: 20 }}>{children}</div>
      <div style={{ ...bandStyle, fontSize: 10.5 }}>🦖 T-Rant · big feelings, smart translation</div>
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
    <div style={{ marginTop: 10 }}>
      <div style={{ height: 6, background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${(level / 10) * 100}%`,
            background: level > 7 ? "#c0392b" : level > 4 ? "#e67e22" : "var(--color-sage)",
            transition: "width 150ms ease-out",
          }}
        />
      </div>
      <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>rage preview: {Math.round(level)}/10</span>
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
    fontWeight: 600,
    color: "var(--color-calm-accent2)",
    textDecoration: "underline",
    cursor: "pointer",
  };
  return (
    <p style={{ fontSize: 13, color: "var(--color-text-faint)", margin: "12px 0 0", lineHeight: 1.6 }}>
      If you&apos;re thinking about hurting yourself, or someone is hurting you, no need to type anything
      first, just click one of the buttons below:{" "}
      <button type="button" onClick={() => onHelp("self_harm")} style={linkButtonStyle}>
        I&apos;m thinking about hurting myself
      </button>
      {" · "}
      <button type="button" onClick={() => onHelp("in_danger")} style={linkButtonStyle}>
        Someone is hurting me
      </button>
    </p>
  );
}

// Region -> country -> general emergency number picker. Used standalone at
// /emergency-numbers and embedded in the serious pathway (self_harm: a
// secondary reference below findahelpline.com; in_danger: the primary,
// lead block, since that pathway's whole point is "you may need this
// number right now" — see SeriousCard). Every entry was cross-checked
// against a stable source as of the date shown (see
// src/lib/emergencyNumbers.ts).
function EmergencyNumbersPicker({ title = "Local emergency number" }: { title?: string }) {
  const [regionIndex, setRegionIndex] = useState<number | null>(null);
  const [countryIndex, setCountryIndex] = useState<number | null>(null);

  const region = regionIndex !== null ? EMERGENCY_NUMBERS[regionIndex] : null;
  const entry = region && countryIndex !== null ? region.countries[countryIndex] : null;

  return (
    <div
      style={{
        margin: "16px 0",
        padding: 18,
        border: "1px solid var(--color-calm-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-calm-surface)",
      }}
    >
      <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--color-calm-accent2)" }}>{title}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          value={regionIndex ?? ""}
          onChange={(e) => {
            setRegionIndex(e.target.value === "" ? null : Number(e.target.value));
            setCountryIndex(null);
          }}
          className="trant-field"
          style={{ width: "auto", flex: "1 1 150px" }}
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
            className="trant-field"
            style={{ width: "auto", flex: "1 1 150px" }}
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
        <div style={{ marginTop: 14 }}>
          <p style={{ margin: 0 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: "var(--color-calm-text)" }}>{entry.number}</span>
            {entry.note && <span style={{ marginLeft: 8, fontSize: 13, color: "var(--color-text-soft)" }}>{entry.note}</span>}
          </p>
          {entry.helplines && entry.helplines.length > 0 && (
            <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", fontSize: 12.5, color: "var(--color-text-soft)", display: "grid", gap: 3 }}>
              {entry.helplines.map((h) => (
                <li key={h.label}>
                  {h.label}: <strong>{h.number}</strong>
                </li>
              ))}
            </ul>
          )}
          <p style={{ margin: "8px 0 0", fontSize: 11.5, color: entry.lastVerified ? "#5c8a5c" : "#b06a00" }}>
            {entry.lastVerified ? `Last verified: ${entry.lastVerified}` : "Not yet independently verified"}
          </p>
        </div>
      )}
    </div>
  );
}

function ResourceLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-block", fontSize: 17, fontWeight: 700, color: "var(--color-calm-accent2)" }}
    >
      {url.replace(/^https?:\/\//, "")} ↗
    </a>
  );
}

// Turns a plain-text mention of "findahelpline.com" into a real clickable
// link wherever it appears inside a body paragraph, instead of leaving it
// as inert text the reader has to copy out themselves.
function linkifyFindAHelpline(text: string): React.ReactNode {
  const parts = text.split(/(findahelpline\.com)/);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part === "findahelpline.com" ? (
      <a
        key={i}
        href={SERIOUS_RESOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--color-calm-accent2)", fontWeight: 700, textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function SeriousSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: "16px 0",
        padding: 18,
        borderRadius: "var(--radius-md)",
        background: "var(--color-calm-surface)",
        border: "1px solid var(--color-calm-border)",
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "var(--color-calm-accent2)" }}>{label}</p>
      {children}
    </div>
  );
}

// The self-harm/in-danger response, redesigned 2026-08-19: a single
// elevated card (soft shadow, generous spacing) rather than a flat block,
// and the rest of the page's chrome disappears while this shows (see
// isSerious in Home()) so it's the only thing competing for attention.
// `kind` branches the layout: self_harm keeps the original
// message -> resource -> local numbers -> "things that helped" order;
// in_danger leads with local emergency numbers (the immediate-danger case)
// and treats findahelpline.com as the second, clearly-separate option for
// emotional harm without immediate danger — see t-rant-phase2-brief.md's
// original design and the 2026-08-19 redesign note in selfHarmContent.ts.
// Full-viewport modal: a solid calm-toned backdrop (deliberately not a
// translucent dim over the site's normal warm palette - this state is
// meant to feel like a different, kinder place entirely, not the same page
// with the lights turned down) that closes on click-outside or Escape, in
// addition to the explicit "Back to T-Rant" button - three ways out, none
// of them hidden.
function SeriousCard({
  result,
  onReset,
}: {
  result: Extract<RantResponse, { pathway: "serious" }>;
  onReset: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onReset();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onReset]);

  return (
    <div
      role="presentation"
      onClick={onReset}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
        padding: "40px 20px",
        background: "radial-gradient(circle at 28% 18%, #f7f2e6, #eef1ea 55%, #e7edec 100%)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={result.kind === "self_harm" ? "You're not alone in this" : "Getting you to real help"}
        onClick={(e) => e.stopPropagation()}
        className="trant-fade-in"
        style={{
          width: "100%",
          maxWidth: 640,
          margin: "auto",
          padding: "36px 32px",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-calm-surface)",
          border: "1px solid var(--color-calm-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-calm-accent)",
          marginBottom: 18,
        }}
      >
        {result.kind === "self_harm" ? "You're not alone in this" : "Getting you to real help"}
      </p>

      {result.message.split("\n\n").map((para, i) => (
        <p key={i} style={{ lineHeight: 1.75, marginBottom: 16, color: "var(--color-calm-text)", fontSize: 15.5 }}>
          {linkifyFindAHelpline(para)}
        </p>
      ))}

      {result.kind === "in_danger" && result.inDanger ? (
        <>
          <p style={{ margin: "0 0 10px", fontWeight: 600, color: "var(--color-calm-text)", fontSize: 14.5, lineHeight: 1.6 }}>
            {result.inDanger.physicalNote}
          </p>
          <EmergencyNumbersPicker title="Local emergency number" />

          <SeriousSection label="Being hurt or controlled, without immediate danger?">
            <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.6, color: "var(--color-calm-text)" }}>
              {linkifyFindAHelpline(result.inDanger.emotionalNote)}
            </p>
            <ResourceLink url={result.resourceUrl} />
          </SeriousSection>
        </>
      ) : (
        <>
          <SeriousSection label="Real help, right now">
            <ResourceLink url={result.resourceUrl} />
            {result.emergencyNote && (
              <p style={{ margin: "12px 0 0", color: "var(--color-calm-text)", fontSize: 14 }}>{result.emergencyNote}</p>
            )}
          </SeriousSection>
          <EmergencyNumbersPicker />
          {result.helpfulThings && result.helpfulThings.length > 0 && <HelpfulThingsList items={result.helpfulThings} />}
        </>
      )}

      {result.flagged.originalText.trim() !== "" && <FlaggedBlock flagged={result.flagged} />}

      <button type="button" onClick={onReset} className="trant-btn trant-btn-ghost" style={{ marginTop: 26, padding: "8px 4px" }}>
        ← Back to T-Rant
      </button>
      </div>
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
      <ExplanationCaption text={result.explanations.stillYouJustCooler} />
      <ToneHeading pose="necktie" tone="professional_clear" label="Professional & Clear" onClick={onToneClick} />
      <p>{result.versions.professionalClear}</p>
      <ExplanationCaption text={result.explanations.professionalClear} />
      <ToneHeading pose="olive_branch" tone="maximum_diplomacy" label="Maximum Diplomacy" onClick={onToneClick} />
      <p>{result.versions.maximumDiplomacy}</p>
      <ExplanationCaption text={result.explanations.maximumDiplomacy} />

      <DirectorsCut text={result.directorsCut} />

      <div style={{ marginTop: 24, fontSize: 14 }}>
        <p style={{ marginBottom: 8, color: "var(--color-text-soft)" }}>Try a persona (just for fun):</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PERSONAS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => requestPersona(p)}
              disabled={personaLoading !== null}
              className="trant-btn trant-btn-secondary"
            >
              {personaLoading === p ? "..." : PERSONA_LABELS[p]}
            </button>
          ))}
        </div>
        {personaError && <p style={{ color: "#b3453a", marginTop: 8 }}>{personaError}</p>}
        {personaText && persona && (
          <div
            style={{
              marginTop: 10,
              padding: 14,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-surface-muted)",
            }}
          >
            <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{PERSONA_LABELS[persona]}</p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{personaText}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button type="button" onClick={shareOnX} className="trant-btn trant-btn-secondary">
            Share on X
          </button>
          <button type="button" onClick={copyShareLink} className="trant-btn trant-btn-secondary">
            {copied ? "Link copied!" : "Copy shareable link"}
          </button>
        </div>
        <p style={{ fontSize: 12, color: "var(--color-text-faint)", marginTop: 8 }}>
          Only the rewritten output goes in the link, never your original draft.
        </p>
      </div>
    </div>
  );
}

// "What changed and why" per tone tier - diff-style-explanations bonus
// feature, see t-rant-phase2-brief.md section 8.
function ExplanationCaption({ text }: { text: string }) {
  if (!text) return null;
  return <p style={{ margin: "-6px 0 12px", fontSize: 12.5, color: "var(--color-text-faint)", fontStyle: "italic" }}>{text}</p>;
}

// Director's Cut - a fourth, maximally-unfiltered version, explicitly for
// the sender's own eyes only. Deliberately hidden behind a click (not shown
// alongside the other three) and carries no share/persona/copy actions of
// its own, so nothing here can end up sent anywhere by accident. See
// t-rant-phase2-brief.md section 8.
function DirectorsCut({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);

  if (!text) return null;

  return (
    <div style={{ marginTop: 26, padding: 14, border: "1px dashed var(--color-border-strong)", borderRadius: "var(--radius-sm)" }}>
      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          style={{ all: "unset", cursor: "pointer", fontSize: 13, color: "var(--color-text-faint)", textDecoration: "underline" }}
        >
          🔒 Show Director&apos;s Cut - for your eyes only, don&apos;t send this
        </button>
      ) : (
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#b06a00" }}>
            Director&apos;s Cut - maximally unfiltered. For your eyes only. Do not send.
          </p>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>
        </div>
      )}
    </div>
  );
}

function IntensityGauge({ intensity }: { intensity: number }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ margin: "0 0 4px", fontSize: 13, color: "var(--color-text-soft)" }}>
        Rant Intensity: {intensity}/10
      </p>
      <div style={{ height: 10, background: "var(--color-border)", borderRadius: 5, overflow: "hidden", maxWidth: 240 }}>
        <div
          style={{
            height: "100%",
            width: `${(intensity / 10) * 100}%`,
            background: intensity > 7 ? "#c0392b" : intensity > 4 ? "#e67e22" : "var(--color-sage)",
          }}
        />
      </div>
    </div>
  );
}

function SharedView({ data, onDismiss }: { data: SharedPayload; onDismiss: () => void }) {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 28px" }}>
      <p style={{ fontSize: 14, color: "var(--color-text-soft)" }}>Someone shared a T-Rant result with you.</p>
      <IntensityGauge intensity={data.intensity} />
      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 18 }}>Still You, Just Cooler</h2>
      <p>{data.versions.stillYouJustCooler}</p>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 18 }}>Professional & Clear</h2>
      <p>{data.versions.professionalClear}</p>
      <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 18 }}>Maximum Diplomacy</h2>
      <p>{data.versions.maximumDiplomacy}</p>
      <button type="button" onClick={onDismiss} className="trant-btn trant-btn-primary" style={{ marginTop: 20 }}>
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
        borderLeft: "3px solid var(--color-calm-border)",
        fontSize: 14,
        color: "var(--color-calm-text)",
      }}
    >
      <p style={{ marginBottom: 8 }}>A few things that helped me:</p>
      <ul style={{ paddingLeft: 20, listStyle: "none", marginLeft: 0 }}>
        {items.map((item, i) => (
          <li key={i} style={{ marginBottom: 8, fontStyle: item.optional ? "italic" : "normal" }}>
            {item.optional && <strong style={{ color: "var(--color-calm-accent)" }}>- </strong>}
            {item.title && (
              <>
                {item.emphasizeFirstLetter ? (
                  <>
                    <strong style={{ color: "var(--color-calm-accent)" }}>{item.title[0]}</strong>
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
        marginTop: 14,
        padding: 14,
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        background: "var(--color-surface-muted)",
      }}
    >
      <p style={{ margin: "0 0 8px", whiteSpace: "pre-wrap" }}>
        {highlightFlagged(flagged.originalText, flagged.flaggedPhrases)}
      </p>
      {flagged.reason && (
        <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-soft)" }}>{flagged.reason}</p>
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

function UnwindLinks() {
  return (
    <section style={{ marginTop: 36 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>
        🦖 Rex-commended: a few minutes of doing absolutely nothing productive
      </h2>
      <p style={{ marginTop: 6, fontSize: 13, color: "var(--color-text-faint)", fontStyle: "italic" }}>
        You're leaving T-Rant territory: everything past this point is somebody else's swamp, we
        don't control it, vouch for it, or get a cut of your afternoon. Wander at your own risk.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        {UNWIND_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "10px 14px",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              color: "var(--color-text)",
              fontSize: 13,
              background: "var(--color-surface)",
            }}
          >
            <div>{link.emoji} {link.label}</div>
            <div style={{ color: "var(--color-text-faint)", fontSize: 12 }}>{link.tag}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

// Reformatted 2026-08-19 for readability: a short heading, three trust
// bullets up front (the promise, at a glance), then the fuller paragraphs
// with more breathing room. The link to House Rules used to live here too;
// it's now in the persistent sidebar nav instead, so it isn't repeated.
function PrivacyNotice() {
  const badges = ["No accounts", "No stored rants", "No tracking"];
  return (
    <section style={{ marginTop: 56, paddingTop: 26, borderTop: "1px solid var(--color-border)" }}>
      <h2
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--color-text-faint)",
          marginBottom: 14,
        }}
      >
        Privacy, in plain terms
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {badges.map((b) => (
          <span
            key={b}
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 999,
              background: "var(--color-sage-soft)",
              color: "#3f473f",
            }}
          >
            {b}
          </span>
        ))}
      </div>
      <div style={{ display: "grid", gap: 14, fontSize: 13.5, color: "var(--color-text-soft)", lineHeight: 1.7, maxWidth: 600 }}>
        <p>
          All responses are generated using Anthropic&apos;s API, which (at the time this site launched)
          does not use API inputs to train their models. Policies can change; for the most current
          information, see{" "}
          <a href={ANTHROPIC_TRAINING_POLICY_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-link)", textDecoration: "underline" }}>
            Anthropic&apos;s data usage policy
          </a>
          .
        </p>
        <p>
          Don&apos;t take our word for it: the code that decides what gets saved is public. Open the{" "}
          <a href={GITHUB_LOGGING_CODE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-link)", textDecoration: "underline" }}>
            <code>src/lib</code> folder
          </a>{" "}
          on GitHub and look at the logging code yourself. You don&apos;t need to read code to get the
          point: there&apos;s no hidden file, database, or service where your rant text goes. What you see
          in that folder is everything.
        </p>
      </div>
    </section>
  );
}
