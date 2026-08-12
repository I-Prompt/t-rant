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

export interface ClassifierResult {
  label: ClassifierLabel;
}

export interface ToneVersions {
  stillYouJustCooler: string;
  professionalClear: string;
  maximumDiplomacy: string;
}

export type Pathway = "hard_no" | "serious" | "firm" | "witty" | "clean";

export type RantResponse =
  | { pathway: "hard_no"; message: string }
  | { pathway: "serious"; message: string; resourceUrl: string }
  | { pathway: "firm"; message: string }
  | { pathway: "witty"; message: string; quote: { text: string; author: string | null } }
  | { pathway: "clean"; versions: ToneVersions };

export interface RantRequestBody {
  text: string;
}
