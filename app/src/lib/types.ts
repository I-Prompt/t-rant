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

export type RantResponse =
  | { pathway: "hard_no"; message: string; flagged: FlaggedInfo }
  | {
      pathway: "serious";
      message: string;
      resourceUrl: string;
      emergencyNote: string;
      helpfulThings?: HelpfulThing[];
      flagged: FlaggedInfo;
    }
  | { pathway: "firm"; message: string; flagged: FlaggedInfo }
  | {
      pathway: "witty";
      message: string;
      quote: { text: string; author: string | null };
      flagged: FlaggedInfo;
    }
  | { pathway: "clean"; versions: ToneVersions; intensity: number };

export type ApiRantResponse = RantResponse & { rateLimit: RateLimitInfo };

export interface RantRequestBody {
  text: string;
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
