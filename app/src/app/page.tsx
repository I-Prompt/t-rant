"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUIState } from "@/components/UIState";
import { EMERGENCY_NUMBERS } from "@/lib/emergencyNumbers";
import { SELF_HARM_CONTENT, SERIOUS_RESOURCE_URL } from "@/lib/selfHarmContent";
import { playHardStopTone, playLoadingTick, playRoar, playStomp, playSuccessChime, playToneBlip, playWittyWomp, ToneKey } from "@/lib/sounds";
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

// The handful of spacing values that most affect how tall the page feels
// (most of this file is inline styles, not CSS classes, so this is plain
// numbers rather than a CSS variable). Was briefly a comfortable/compact
// toggle; compact read as the only one worth keeping, so it's just the
// fixed values now.
const SPACING = { mainPad: "18px 24px 32px", heroGap: 12, heroSize: 52, cardPad: 14, cardMargin: 14, sectionGap: 12 };

// Cycles under the submit button while a request is in flight - purely
// decorative, never shown for the serious pathway (that state doesn't use
// this loading UI at all - see SeriousCard/showHelpNow, which skip loading
// entirely).
const LOADING_MESSAGES = [
  "Consulting the fossil record...",
  "Sharpening tiny arms...",
  "Reticulating splines...",
  "Warming up the vocal cords...",
  "Polishing the diplomacy...",
  "Counting stomps...",
];

// Randomized bottom-band caption on the branded card, see BrandCard - the
// top band always reads "🦖 T-Rant" (the actual mark); only this smaller
// one rotates.
const BRAND_CAPTIONS = [
  "they probably deserved it",
  "no accounts, no regrets",
  "diplomacy, occasionally",
  "rewritten, not repressed",
];

// Shared by the shareable-link checkbox picker (CleanResultView) and the
// page that renders a shared link (SharedView), so both agree on labels
// and on which ToneVersions key goes with which.
const TONE_OPTIONS: { key: keyof ToneVersions; label: string }[] = [
  { key: "stillYouJustCooler", label: "Still You, Just Cooler" },
  { key: "professionalClear", label: "Professional & Clear" },
  { key: "maximumDiplomacy", label: "Maximum Diplomacy" },
];

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
  // Only what was ticked in the share picker - could be one tone, one
  // persona, or any mix. `versions` is the pre-tickbox shape (always all
  // three tones, never personas) so links made before this existed still
  // decode - see the `tones ?? versions` fallback in SharedView.
  tones?: Partial<ToneVersions>;
  versions?: ToneVersions;
  personas?: Partial<Record<Persona, string>>;
  intensity: number;
  backstory?: string;
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
// explicitly rather than assuming it's obvious. Collapses to a one-line
// reminder after your first submit (remembered locally) - useful once,
// clutter every time after.
function WritingGuidance({ collapsed, onExpand, onCollapse }: { collapsed: boolean; onExpand: () => void; onCollapse: () => void }) {
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onExpand}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "block",
          marginBottom: 14,
          fontSize: 12.5,
          color: "var(--color-text-faint)",
          textDecoration: "underline",
        }}
      >
        ✍️ Write it like you&apos;d actually send it — tap for the reminder
      </button>
    );
  }

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
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
        <button
          type="button"
          onClick={onCollapse}
          aria-label="Hide this reminder"
          title="Hide this reminder"
          style={{ all: "unset", cursor: "pointer", fontSize: 13, color: "var(--color-text-faint)", padding: "0 2px" }}
        >
          ×
        </button>
      </div>
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
  const [guidanceCollapsed, setGuidanceCollapsed] = useState(true);
  const [masked, setMasked] = useState(false);
  const [showMiniHeader, setShowMiniHeader] = useState(false);
  const [readerMode, setReaderMode] = useState(false);
  const [curtainVisible, setCurtainVisible] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [stealthDecoy, setStealthDecoy] = useState("");

  const { stealth, toggleStealth } = useUIState();
  const spacing = SPACING;
  const draftText = stealth ? stealthDecoy : text;

  const audioCtxRef = useRef<AudioContext | null>(null);
  const konamiProgress = useRef(0);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isSerious = result?.pathway === "serious";

  // Stealth hides whatever's already been typed - the real draft (`text`)
  // is untouched underneath, so it's back exactly as it was on exit. Filled
  // with plausible desk notes rather than left blank, so the box always
  // looks like something genuinely in use, even before you've typed
  // anything. Reshuffled on every entry, not just once, so a previous
  // stealth stint's notes (or anything typed over them) don't linger.
  useEffect(() => {
    if (stealth) setStealthDecoy(pickStealthNoteText());
  }, [stealth]);

  // Textarea starts short (rows=5) and grows with the content instead of
  // presenting a tall empty box by default - re-measured on every change,
  // including programmatic ones (bookmarklet prefill, clearing on submit)
  // and on the stealth-decoy swap above.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draftText]);

  // Scrolls the freshly-arrived result into view instead of leaving the
  // reader stranded below their own (now-collapsed) input.
  useEffect(() => {
    if (result && result.pathway !== "serious") {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  // Panic-key text mask: blurs whatever's currently visible (draft or
  // result) so a glance from across the room reads as illegible smudge,
  // not your actual words. Same combo un-blurs. A modifier combo, not a
  // bare key, since the textarea is very likely focused when you need this.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        setMasked((m) => !m);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Sticky mini-header once the hero scrolls out of view, so a long result
  // doesn't feel like it's left the page behind.
  useEffect(() => {
    function onScroll() {
      setShowMiniHeader(window.scrollY > 260);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  // Bookmarklet prefill (?rant=...), output-only share links (?shared=...),
  // and reader mode (?reader=1: just the textarea and the result, no
  // sidebar/hero/branding - see the data-reader-mode CSS in globals.css).
  // See t-rant-safety-legal-update.md section 6 and t-rant-phase2-brief.md
  // section 7.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("shared");
    const rant = params.get("rant");
    if (params.get("reader") === "1") {
      setReaderMode(true);
      document.documentElement.setAttribute("data-reader-mode", "true");
    }
    if (shared) {
      const decoded = decodeShareData<SharedPayload>(shared);
      if (decoded) setSharedData(decoded);
    } else if (rant) {
      setText(rant);
    }
  }, []);

  // Page-load "curtain rises" transition instead of a hard cut into the
  // hero - see the trant-curtain-rise keyframes in globals.css. Runs once
  // per mount (page load), not on every internal state change.
  useEffect(() => {
    const t = setTimeout(() => setCurtainVisible(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Rotates the loading-state one-liner while a request is in flight.
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
      playSound(playLoadingTick);
    }, 1400);
    return () => clearInterval(interval);
  }, [loading]);

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

  // Must be called from inside a click-handler call stack, same as the
  // sounds themselves - browsers block audio that isn't tied to a direct
  // user gesture. Shared by the submit button and the hero Rex click.
  function ensureAudioContext() {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
  }

  function clickHeroRex() {
    ensureAudioContext();
    playSound(playRoar);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || text.length > MAX_CHARS) return;

    setGuidanceCollapsed(true);
    ensureAudioContext();
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
        if (rest.pathway === "clean") playSound(playSuccessChime);
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
    <main style={{ maxWidth: stealth ? 960 : 700, margin: "0 auto", padding: spacing.mainPad }}>
      {curtainVisible && <CurtainRise />}
      {!isSerious && !readerMode && <MiniHeader visible={showMiniHeader} stealth={stealth} />}
      {!isSerious && !readerMode && <AmbientBackground />}

      {!isSerious && !readerMode && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div>
            {mockMode && !stealth && (
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
                }}
              >
                🧪 Mock mode: rewrites and blocking use crude local patterns, not the real AI
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={toggleStealth}
            className="trant-icon-btn trant-stealth-btn"
            aria-label={stealth ? "Exit stealth mode" : "Enter stealth mode"}
            title={stealth ? "Camouflage: deactivated" : "Camouflage: activated"}
          >
            {stealth ? "⚙ Back" : "🕶️ Stealth"}
          </button>
        </div>
      )}

      {!isSerious && !readerMode && (
        <>
          <header style={{ display: "flex", alignItems: "center", gap: spacing.heroGap }}>
            {!stealth && (
              <button
                type="button"
                onClick={clickHeroRex}
                aria-label="Roar"
                title="🦖"
                style={{ all: "unset", cursor: "pointer", display: "flex" }}
              >
                <PixelRex pose="idle" size={spacing.heroSize} animate animateDuration="2.6s" />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--color-text)" }}>
                {stealth ? "Notes" : "T-Rant"}
              </h1>
              {!stealth && (
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
                  They probably deserved it.
                </p>
              )}
            </div>
          </header>
          {!stealth && (
            <p style={{ marginTop: 16, fontSize: 15.5, color: "var(--color-text-soft)", maxWidth: 540, lineHeight: 1.6 }}>
              Paste your heated draft below — get three versions you can actually send, at your pick of
              diplomacy.
            </p>
          )}

          {easterEgg && !stealth && (
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
        </>
      )}

      {!isSerious && (
        <div
          style={{
            filter: masked ? "blur(6px)" : undefined,
            transition: "filter 150ms ease",
            display: stealth ? "grid" : "block",
            gridTemplateColumns: stealth ? "1.3fr 1fr" : undefined,
            gap: stealth ? 20 : undefined,
            alignItems: stealth ? "start" : undefined,
          }}
        >
          <BrandCard
            stealth={stealth || readerMode}
            cardPad={stealth ? 28 : spacing.cardPad}
            cardMargin={stealth ? 24 : spacing.cardMargin}
          >
            <form onSubmit={handleSubmit}>
              {!stealth && !readerMode && (
                <WritingGuidance
                  collapsed={guidanceCollapsed}
                  onExpand={() => setGuidanceCollapsed(false)}
                  onCollapse={() => setGuidanceCollapsed(true)}
                />
              )}
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => (stealth ? setStealthDecoy(e.target.value) : setText(e.target.value))}
                maxLength={MAX_CHARS}
                rows={5}
                className="trant-field"
                style={{
                  fontSize: stealth ? 17 : 16,
                  resize: "none",
                  overflow: "hidden",
                  // The auto-grow effect below sizes to content, which
                  // would otherwise shrink the decoy notes down to a cramped
                  // box - a real notes app reads as roomier than that.
                  minHeight: stealth ? 340 : undefined,
                }}
                placeholder={stealth ? "Type a note..." : "What's got you fired up?"}
              />
              {!stealth && !readerMode && <RageThermometer text={text} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                {!stealth && !readerMode && (
                  <span style={{ fontSize: 11, color: "var(--color-text-faint)" }}>
                    Ctrl+Shift+M blurs this instantly - same keys to undo
                  </span>
                )}
                <CharCount value={draftText.length} max={MAX_CHARS} />
              </div>

              {!stealth && !readerMode && (
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
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginTop: 20 }}>
                {loading && !stealth && <PixelRex pose="idle" size={30} animate />}
                <button type="submit" className="trant-btn trant-btn-primary" disabled={loading || !text.trim()}>
                  {stealth ? (loading ? "Saving..." : "Save") : loading ? LOADING_MESSAGES[loadingMsgIndex] : "Translate"}
                </button>
              </div>
            </form>
          </BrandCard>
          {stealth && <TaskTracker />}
        </div>
      )}
      {stealth && (
        // Collapsed by default and labeled with something nobody would
        // click out of curiosity - the honest "this is a disguise, not a
        // real notes app" explanation only shows up for someone who
        // deliberately opens it, never at a glance.
        <details style={{ marginTop: 10 }}>
          <summary style={{ fontSize: 10.5, color: "var(--color-text-faint)", cursor: "pointer", listStyle: "none" }}>
            Rules
          </summary>
          <p style={{ marginTop: 4, fontSize: 10.5, color: "var(--color-text-faint)" }}>
            For display only - nothing here is saved.
          </p>
        </details>
      )}

      {!isSerious && !stealth && <HelpNowBar onHelp={showHelpNow} />}

      {!isSerious && rateLimit && !stealth && (
        <p style={{ fontSize: 13, color: "var(--color-text-faint)", marginTop: 6 }}>
          {rateLimit.remaining} of {rateLimit.limit} rants left this hour
        </p>
      )}

      {!isSerious && error && <p style={{ color: "#b3453a", marginTop: 8 }}>{error}</p>}

      {result && (
        <div ref={resultRef} style={{ filter: masked ? "blur(6px)" : undefined, transition: "filter 150ms ease" }}>
          {result.pathway === "serious" ? (
            // Always the real thing, regardless of stealth - a disguise is
            // never worth hiding an actual support flow behind.
            <SeriousCard result={result} onReset={resetToStart} />
          ) : stealth ? null : ( // The decoy notes in the textarea above already cover stealth's cover story.
            <BrandCard stealth={readerMode} cardPad={spacing.cardPad} cardMargin={spacing.cardMargin}>
              <ResultView result={result} originalText={submittedText} onToneClick={playTone} />
            </BrandCard>
          )}
        </div>
      )}

      {!isSerious && !readerMode && !stealth && (
        <details className="trant-accordion" style={{ marginTop: spacing.sectionGap + 16 }}>
          <summary
            style={{
              cursor: "pointer",
              padding: "10px 6px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-faint)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="trant-qa-chevron">▸</span> Learn more
          </summary>
          {result && !stealth && <UnwindLinks />}
          <PrivacyNotice />
        </details>
      )}
    </main>
  );
}

// Page-load transition: a solid panel that lifts away instead of a hard cut
// into the hero. Fixed overlay so it doesn't affect layout, removed from
// the tree once its animation finishes (see the matching setTimeout in
// Home()) rather than lingering as a pointer-events:none div forever.
function CurtainRise() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "var(--color-bg-soft)",
        animation: "trant-curtain-rise 650ms ease forwards",
        pointerEvents: "none",
      }}
    />
  );
}

// Stealth's decoy content: plain, boring, believable desk notes instead of
// whatever's actually been typed - fills the textarea itself (not a
// separate panel), so it reads as "someone's to-do list app," not just an
// empty box sitting on a page. A random subset of a larger pool, reshuffled
// every time stealth is turned on.
const CORPORATE_NOTE_POOL = [
  "Follow up with Sarah re: Q3 budget numbers",
  "Reschedule 1:1 with manager - conflict with dentist appt",
  "Draft agenda for Thursday sync",
  "Check status of vendor contract renewal",
  "Submit expense report by Friday",
  "Review deck before stakeholder meeting",
  "Ping IT about VPN issue",
  "Update project timeline in tracker",
  "Book conference room for sprint planning",
  "Follow up on action items from standup",
  "Confirm dial-in details for client call",
  "Print badge - access expired again",
];

function pickStealthNoteText(): string {
  const shuffled = [...CORPORATE_NOTE_POOL].sort(() => Math.random() - 0.5);
  return shuffled
    .slice(0, 5)
    .map((line) => `- ${line}`)
    .join("\n");
}

// The Notes textarea's other half of the disguise: a project-tracker-style
// panel of already-completed tasks, sitting beside it so the whole page
// reads as "someone's work app," not just an empty note. Fixed list, not
// randomized like the notes - it's set dressing, not meant to feel live.
// pointer-events: none on the wrapper (plus native `disabled` on the
// checkboxes themselves) makes the whole thing inert - nothing here is
// clickable or focusable, on purpose, so it never invites an interaction
// that would reveal it's fake.
const TRACKER_TASKS: { task: string; tag: string }[] = [
  { task: "Finalize Q3 budget draft", tag: "Finance" },
  { task: "Send follow-up to vendor", tag: "Ops" },
  { task: "Update sprint board", tag: "Eng" },
  { task: "Review pull request #482", tag: "Eng" },
  { task: "Confirm meeting room booking", tag: "Admin" },
  { task: "Submit expense report", tag: "Finance" },
  { task: "Sync with design team", tag: "Design" },
  { task: "Archive old tickets", tag: "Ops" },
];

function TaskTracker() {
  return (
    <div
      aria-hidden="true"
      style={{
        pointerEvents: "none",
        userSelect: "none",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        padding: "18px 20px",
      }}
    >
      <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-faint)" }}>
        Task Tracker
      </p>
      <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--color-text-faint)" }}>
        {TRACKER_TASKS.length} completed this week
      </p>
      <div style={{ display: "grid", gap: 10 }}>
        {TRACKER_TASKS.map((t) => (
          <div key={t.task} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <input type="checkbox" checked readOnly disabled style={{ marginTop: 3 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, color: "var(--color-text-faint)", textDecoration: "line-through" }}>{t.task}</div>
              <div style={{ fontSize: 10.5, color: "var(--color-text-faint)", marginTop: 2 }}>{t.tag}</div>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--color-sage)",
                background: "var(--color-sage-soft)",
                padding: "2px 6px",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              Done
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Small sticky bar that appears once the hero has scrolled out of view, so
// a long result never feels disconnected from the rest of the page - a
// wordmark (or "Notes" in stealth mode) plus a quick way back to the top.
function MiniHeader({ visible, stealth }: { visible: boolean; stealth: boolean }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: visible ? "flex" : "none",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 2px",
        marginBottom: 8,
        background: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>{stealth ? "Notes" : "🦖 T-Rant"}</span>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="trant-btn trant-btn-ghost"
        style={{ fontSize: 12, padding: "4px 10px" }}
      >
        ↑ Top
      </button>
    </div>
  );
}

// Branded header + footer around the input and (non-serious) results, so a
// screenshot of either one carries the T-Rant mark no matter where someone
// crops it — top, bottom, or wherever they stop scrolling. Deliberately a
// different color scheme from the calming palette (serious pathway) so
// that state stays visually distinct and un-branded, per
// t-rant-safety-legal-update.md section 1.
function BrandCard({ children, stealth = false, cardPad = 20, cardMargin = 22 }: { children: React.ReactNode; stealth?: boolean; cardPad?: number; cardMargin?: number }) {
  // One caption per card instance, picked after mount rather than during
  // render (Math.random() during render isn't allowed here - see the
  // project's react-hooks/purity rule). Starts on the first caption, then
  // settles on the picked one a tick later; imperceptible in practice.
  const [caption, setCaption] = useState(BRAND_CAPTIONS[0]);
  useEffect(() => {
    setCaption(BRAND_CAPTIONS[Math.floor(Math.random() * BRAND_CAPTIONS.length)]);
  }, []);
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
        margin: `${cardMargin}px 0`,
        background: "var(--color-surface)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {!stealth && <div style={bandStyle}>🦖 T-Rant</div>}
      <div style={{ padding: cardPad }}>{children}</div>
      {!stealth && <div style={{ ...bandStyle, fontSize: 10.5 }}>🦖 T-Rant · {caption}</div>}
    </div>
  );
}

// Rex-palette pixel squares, plain CSS keyframes (see globals.css), no
// animation library. Fires once on mount - only ever rendered from
// CleanResultView, so this never touches the self-harm/in-danger pathway,
// which stays deliberately unbranded.
const CONFETTI_COLORS = ["#6b8f71", "#2b6e63", "#d9c9a3", "#a8552c", "#4a7a94"];

interface ConfettiPiece {
  key: number;
  left: number;
  color: string;
  delay: number;
  tx: string;
  tr: string;
}

function Confetti() {
  // Randomized after mount, not during render (Math.random() during render
  // isn't allowed here - see the project's react-hooks/purity rule). Empty
  // on the first paint, populated a tick later - the burst is already
  // animated in, so a one-tick delay before it starts is unnoticeable.
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  useEffect(() => {
    setPieces(
      Array.from({ length: 18 }, (_, i) => ({
        key: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 150,
        tx: `${(Math.random() - 0.5) * 60}px`,
        tr: `${180 + Math.random() * 180}deg`,
      }))
    );
  }, []);

  return (
    <div aria-hidden="true" style={{ position: "relative", height: 0, overflow: "visible" }}>
      {pieces.map((p) => (
        <span
          key={p.key}
          className="trant-confetti-piece"
          style={
            {
              left: `${p.left}%`,
              top: 0,
              background: p.color,
              animationDelay: `${p.delay}ms`,
              "--tx": p.tx,
              "--tr": p.tr,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// Small "🎉 copied!" stamp that pops in next to a copy action instead of
// only swapping the button's own label - see the trant-stamp-in keyframes.
function CopyStamp() {
  return (
    <span className="trant-copy-stamp" aria-hidden="true">
      📋 Copied!
    </span>
  );
}

// One tick-box in the shareable-link picker - a real checkbox, not a
// button-styled toggle, since the ask is literally "let me tick boxes."
function ShareCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        padding: "6px 10px",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        background: checked ? "var(--color-accent-soft)" : "var(--color-surface)",
        color: checked ? "var(--color-accent)" : "var(--color-text)",
      }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} style={{ margin: 0 }} />
      {label}
    </label>
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
        Thoughts of self-harm
      </button>
      {" · "}
      <button type="button" onClick={() => onHelp("in_danger")} style={linkButtonStyle}>
        Being hurt by someone
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
  // Cache of generated persona text, shared by the "More tones" preview and
  // the shareable-link picker below - picking a persona in one place
  // doesn't force a second API call in the other.
  const [personaTexts, setPersonaTexts] = useState<Partial<Record<Persona, string>>>({});
  const [previewPersona, setPreviewPersona] = useState<Persona | null>(null);
  const [personaLoading, setPersonaLoading] = useState<Persona[]>([]);
  const [personaError, setPersonaError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [personasOpen, setPersonasOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedTones, setSelectedTones] = useState<Set<keyof ToneVersions>>(() => new Set(["professionalClear"]));
  const [selectedPersonas, setSelectedPersonas] = useState<Set<Persona>>(() => new Set());
  const [buildingLink, setBuildingLink] = useState(false);

  // A cache, not per-click state: both the "More tones" preview and the
  // shareable-link picker draw from the same generated text, so picking a
  // persona in one place doesn't force a second API call in the other.
  async function ensurePersona(p: Persona): Promise<string | null> {
    if (personaTexts[p]) return personaTexts[p]!;
    setPersonaLoading((l) => [...l, p]);
    setPersonaError(null);
    try {
      const res = await fetch("/api/persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, persona: p }),
      });
      const data = (await res.json()) as PersonaApiResponse;
      if (data.ok) {
        setPersonaTexts((m) => ({ ...m, [p]: data.text }));
        return data.text;
      }
      setPersonaError(data.error);
      return null;
    } catch {
      setPersonaError("Request failed");
      return null;
    } finally {
      setPersonaLoading((l) => l.filter((x) => x !== p));
    }
  }

  async function previewPersonaClick(p: Persona) {
    setPreviewPersona(p);
    await ensurePersona(p);
  }

  function toggleTone(key: keyof ToneVersions) {
    setSelectedTones((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function togglePersonaSelection(p: Persona) {
    setSelectedPersonas((s) => {
      const next = new Set(s);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  // Only what's ticked goes in the link - could be a single persona, a
  // single tone, or any mix of both. Any selected persona not already
  // generated gets fetched first (in parallel).
  async function copyShareLink() {
    setBuildingLink(true);
    setPersonaError(null);
    try {
      const texts = await Promise.all([...selectedPersonas].map((p) => ensurePersona(p)));
      const personaEntries: Partial<Record<Persona, string>> = {};
      [...selectedPersonas].forEach((p, i) => {
        const t = texts[i];
        if (t) personaEntries[p] = t;
      });

      const toneEntries: Partial<ToneVersions> = {};
      for (const key of selectedTones) toneEntries[key] = result.versions[key];

      const encoded = encodeShareData({
        tones: toneEntries,
        personas: personaEntries,
        intensity: result.intensity,
        backstory: result.backstory,
      });
      const url = `${window.location.origin}/?shared=${encoded}`;
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setBuildingLink(false);
    }
  }

  return (
    <div>
      <Confetti />
      <IntensityGauge intensity={result.intensity} />

      <ToneHeading pose="necktie" tone="professional_clear" label="Professional & Clear" onClick={onToneClick} />
      <p>{result.versions.professionalClear}</p>
      <ExplanationCaption text={result.explanations.professionalClear} />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="trant-btn trant-btn-ghost"
        style={{ marginTop: 4, fontSize: 13 }}
      >
        {expanded ? "Show fewer tones" : "See all 3 tones + Director's Cut"}
      </button>

      {expanded && (
        <>
          <ToneHeading pose="raised_eyebrow" tone="still_you_just_cooler" label="Still You, Just Cooler" onClick={onToneClick} />
          <p>{result.versions.stillYouJustCooler}</p>
          <ExplanationCaption text={result.explanations.stillYouJustCooler} />
          <ToneHeading pose="olive_branch" tone="maximum_diplomacy" label="Maximum Diplomacy" onClick={onToneClick} />
          <p>{result.versions.maximumDiplomacy}</p>
          <ExplanationCaption text={result.explanations.maximumDiplomacy} />

          <DirectorsCut text={result.directorsCut} />
        </>
      )}

      <div style={{ marginTop: 24, fontSize: 14 }}>
        {personasOpen ? (
          <>
            <p style={{ marginBottom: 8, color: "var(--color-text-soft)" }}>Try a persona (just for fun):</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {PERSONAS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => previewPersonaClick(p)}
                  disabled={personaLoading.includes(p)}
                  className="trant-btn trant-btn-secondary"
                >
                  {personaLoading.includes(p) ? "..." : PERSONA_LABELS[p]}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button type="button" onClick={() => setPersonasOpen(true)} className="trant-btn trant-btn-ghost">
            🎭 More tones
          </button>
        )}
        {personaError && <p style={{ color: "#b3453a", marginTop: 8 }}>{personaError}</p>}
        {previewPersona && personaTexts[previewPersona] && (
          <div
            style={{
              marginTop: 10,
              padding: 14,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              background: "var(--color-surface-muted)",
            }}
          >
            <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{PERSONA_LABELS[previewPersona]}</p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{personaTexts[previewPersona]}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, fontSize: 14 }}>
        {!shareOpen ? (
          <button type="button" onClick={() => setShareOpen(true)} className="trant-btn trant-btn-secondary">
            Copy shareable link
          </button>
        ) : (
          <div style={{ padding: 14, border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "var(--color-surface-muted)" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Include tones
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {TONE_OPTIONS.map((t) => (
                <ShareCheckbox key={t.key} label={t.label} checked={selectedTones.has(t.key)} onChange={() => toggleTone(t.key)} />
              ))}
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, color: "var(--color-text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Include personas
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {PERSONAS.map((p) => (
                <ShareCheckbox
                  key={p}
                  label={PERSONA_LABELS[p]}
                  checked={selectedPersonas.has(p)}
                  onChange={() => togglePersonaSelection(p)}
                />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={copyShareLink}
                disabled={buildingLink || (selectedTones.size === 0 && selectedPersonas.size === 0)}
                className="trant-btn trant-btn-primary"
              >
                {buildingLink ? "Preparing link..." : "Copy link"}
              </button>
              <button type="button" onClick={() => setShareOpen(false)} className="trant-btn trant-btn-ghost">
                Cancel
              </button>
              {copied && <CopyStamp />}
            </div>
          </div>
        )}
        <p style={{ fontSize: 12, color: "var(--color-text-faint)", marginTop: 8 }}>
          Only what you tick above goes in the link, never your original draft.
        </p>
      </div>
    </div>
  );
}

// "What changed and why" per tone tier - diff-style-explanations bonus
// feature, see t-rant-phase2-brief.md section 8.
function ExplanationCaption({ text }: { text: string }) {
  if (!text) return null;
  return <p style={{ margin: "10px 0 16px", fontSize: 12.5, color: "var(--color-text-faint)", fontStyle: "italic" }}>{text}</p>;
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
      {data.backstory && (
        <p
          style={{
            marginTop: 14,
            marginBottom: 22,
            padding: "14px 16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            fontSize: 15,
            fontStyle: "italic",
            lineHeight: 1.6,
            color: "var(--color-text)",
          }}
        >
          🦖 {data.backstory}
        </p>
      )}
      <IntensityGauge intensity={data.intensity} />
      {(() => {
        const tones = data.tones ?? data.versions;
        return tones
          ? TONE_OPTIONS.filter((t) => tones[t.key]).map((t) => (
              <div key={t.key}>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 18 }}>{t.label}</h2>
                <p>{tones[t.key]}</p>
              </div>
            ))
          : null;
      })()}
      {data.personas &&
        (Object.keys(data.personas) as Persona[]).map((p) => (
          <div key={p}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 18 }}>{PERSONA_LABELS[p]}</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{data.personas![p]}</p>
          </div>
        ))}
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
