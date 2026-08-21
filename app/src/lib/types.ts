export const CLASSIFIER_LABELS = [
  "clean",
  "hard_no",
  "self_harm",
  "in_danger",
  "violent_threat",
  "injection_attempt",
  "hate_speech",
  "sexual_content",
  "other_disallowed",
] as const;

export type ClassifierLabel = (typeof CLASSIFIER_LABELS)[number];

// The 7 languages with dedicated static translations (self-harm copy,
// localized quotes). Detected input languages outside this list fall back
// to "en". See t-rant-phase2-brief.md section 4.
export const SUPPORTED_LANGUAGES = ["en", "de", "es", "it", "fr", "sv", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface ClassifierResult {
  label: ClassifierLabel;
  // Up to 2 verbatim substrings copied from the user's input that triggered
  // the label. Empty for "clean". Echoed back to the user so a block is
  // never a black box — see t-rant-phase2-brief.md section 1.
  flaggedPhrases: string[];
  // One short plain-language sentence explaining the label. Empty for "clean".
  reason: string;
  // Detected input language, used to pick the right static self-harm
  // content and localized quote set.
  language: SupportedLanguage;
  // 1-10 "Rant Intensity Score" — how heated the raw input reads, judged
  // regardless of category. Only surfaced to the user on the "clean"
  // pathway. See t-rant-MASTER-BUILD-BRIEF.md's stand-out features list.
  intensity: number;
}

export interface ToneVersions {
  stillYouJustCooler: string;
  professionalClear: string;
  maximumDiplomacy: string;
}

// One short "what changed and why" sentence per tone tier — the
// diff-style-explanations bonus feature, see t-rant-phase2-brief.md
// section 8. Generated alongside the rewrites, never a separate pass.
export interface ToneExplanations {
  stillYouJustCooler: string;
  professionalClear: string;
  maximumDiplomacy: string;
}

export type Pathway = "hard_no" | "serious" | "firm" | "witty" | "clean";

// Attached to every non-"clean" pathway so the UI can show the user's raw
// text back to them with the triggering phrases highlighted ("type it
// anyway" — see t-rant-phase2-brief.md section 1).
export interface FlaggedInfo {
  originalText: string;
  flaggedPhrases: string[];
  reason: string;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
}

// One item in the self-harm pathway's optional "things that helped me" list.
// `emphasizeFirstLetter` marks the 5 core items whose leading letters spell
// T-R-A-N-T — English-only wordplay, see t-rant-phase2-brief.md section 3.
// `optional` marks the aside that isn't part of the acrostic.
export interface HelpfulThing {
  title: string;
  body: string;
  emphasizeFirstLetter?: boolean;
  optional?: boolean;
}

// The "serious" pathway covers two different situations that need different
// framing — see t-rant-phase2-brief.md's original design plus the 2026-08-19
// redesign: someone about to act on self-harm needs a different response
// than someone disclosing they're being hurt by another person, and the
// latter is itself ambiguous between "in physical danger right now" and
// "being hurt emotionally, no immediate danger." `kind` lets the UI branch;
// `inDanger` only exists for kind "in_danger".
export type SeriousKind = "self_harm" | "in_danger";

export interface InDangerContent {
  // Acknowledges the physical/emotional ambiguity up front and states
  // plainly that T-Rant isn't equipped for either — shown before the two
  // resource blocks below.
  intro: string;
  // Local emergency numbers are shown first for this pathway (see
  // EmergencyNumbersPicker in page.tsx) — this is the label/context shown
  // just above that picker.
  physicalNote: string;
  // findahelpline.com, reframed as the path for emotional harm/being
  // controlled by someone without immediate danger, not a generic primary
  // link — shown second, below the emergency numbers.
  emotionalNote: string;
}

export type RantResponse =
  | { pathway: "hard_no"; message: string; flagged: FlaggedInfo }
  | {
      pathway: "serious";
      kind: SeriousKind;
      message: string;
      resourceUrl: string;
      emergencyNote?: string;
      helpfulThings?: HelpfulThing[];
      inDanger?: InDangerContent;
      flagged: FlaggedInfo;
    }
  | { pathway: "firm"; message: string; flagged: FlaggedInfo }
  | {
      pathway: "witty";
      message: string;
      quote: { text: string; author: string | null };
      flagged: FlaggedInfo;
    }
  | {
      pathway: "clean";
      versions: ToneVersions;
      explanations: ToneExplanations;
      // Director's Cut — a fourth, maximally-unfiltered version for the
      // sender's eyes only, never meant to be sent. Deliberately kept as a
      // sibling field rather than a fourth key on `versions`, so it can
      // never accidentally end up in the share-link payload (which encodes
      // `versions` wholesale — see copyShareLink in page.tsx).
      directorsCut: string;
      intensity: number;
      // A silly 1-2 sentence dinosaur-world allegory of what the rant was
      // about, generated without reusing any of the actual words - shown as
      // a teaser on the shareable-link page, ahead of the real rewrite. See
      // generator.ts's dinosaur_backstory field.
      backstory: string;
    };

export type ApiRantResponse = RantResponse & { rateLimit: RateLimitInfo };

export const CONTEXT_MAX_CHARS = 500;

export interface RantRequestBody {
  text: string;
  // Optional: what the other person said or did, in the sender's own words.
  // Lets the rewrite respond to their specific point instead of just
  // neutralizing tone in a vacuum. See t-rant-phase2-brief.md section 8
  // ("Optional dialogue-context field").
  context?: string;
}

// House Rules "live classifier demo" — classification only, no rewrite
// ever gets generated. See t-rant-phase2-brief.md section 2.
export interface ClassifyDemoResponse {
  label: ClassifierLabel;
  flaggedPhrases: string[];
  reason: string;
  rateLimit: RateLimitInfo;
}

// Persona rewrites — a single, shareable "for fun" restyling on top of an
// already-clean message, generated in the input's detected language (see
// src/lib/personas.ts). Kept here (not in personas.ts) because personas.ts
// imports the server-only Anthropic client — this file needs to stay safe
// to import from client components.
export const PERSONAS = [
  "corporate_memo",
  "victorian",
  "cease_and_desist",
  "haiku",
  "nature_documentary",
] as const;
export type Persona = (typeof PERSONAS)[number];

export const PERSONA_LABELS: Record<Persona, string> = {
  corporate_memo: "Corporate Memo",
  victorian: "Victorian Letter",
  cease_and_desist: "Cease & Desist",
  haiku: "Haiku",
  nature_documentary: "Nature Documentary",
};

export interface PersonaRequestBody {
  text: string;
  persona: Persona;
}

export type PersonaApiResponse =
  | { ok: true; persona: Persona; text: string; rateLimit: RateLimitInfo }
  | { ok: false; error: string; flagged?: FlaggedInfo; rateLimit: RateLimitInfo };
