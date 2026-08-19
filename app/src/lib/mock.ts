// Mock mode — used when MOCK_MODE=true so the pipeline can be exercised
// end-to-end without a paid Anthropic API key. Uses crude keyword heuristics
// instead of a real model call. This can only ever prove the pipeline wires
// together correctly — it is NOT a safety-recall test. A phrase not matching
// any pattern here says nothing about whether the real Haiku classifier
// would catch it; only testing against the real API can answer that.

import { ClassifierLabel, ClassifierResult, Persona, SupportedLanguage, ToneExplanations, ToneVersions } from "./types";

// Mirrors generator.ts's GeneratedRewrite shape without importing from that
// module — generator.ts pulls in the Anthropic client, which mock mode is
// specifically meant to avoid depending on.
interface MockGeneratedRewrite {
  versions: ToneVersions;
  explanations: ToneExplanations;
  directorsCut: string;
}

type ReasonFn = (phrase: string) => string;

export function mockClassify(text: string): ClassifierResult {
  const rules: [ClassifierLabel, RegExp, ReasonFn, SupportedLanguage][] = [
    [
      "hard_no",
      /\b(child porn|csae|traffick\w*|traffic (?:a|the|this) (?:child|kid|minor)|how to make a bomb|steal.*credit card)\b/i,
      (p) => `This falls into a category T-Rant never engages with ("${p}").`,
      "en",
    ],
    [
      "self_harm",
      /\b(kill myself|suicide|end my life|want to die|self.?harm|starv(?:e|ing) myself)\b/i,
      (p) => `This reads as self-harm related ("${p}"), so T-Rant steps back and points to real support instead.`,
      "en",
    ],
    [
      "in_danger",
      /\b(he hits me|she hits me|being abused|afraid (?:he|she|they)'?ll hurt me|held captive|won'?t let me leave|locked me (?:in|inside)|keeps me (?:here|locked)|can'?t leave (?:the house|him|her)|against my will)\b/i,
      (p) => `This reads as a disclosure of being harmed by someone else ("${p}").`,
      "en",
    ],
    [
      "violent_threat",
      /\b(?:i(?:'| a)?m going to (?:kill|hurt|beat up) [a-z]+|never come back[^.!?]{0,40}i(?:'ll| will) (?:arrange|make (?:sure|certain)|see to it)|i'll (?:arrange|make sure) (?:that|you)|i(?:'ll| will) find you[^.!?]{0,60}\b(?:make (?:sure|certain)|see to it|days are (?:limited|numbered))\b|your days are (?:limited|numbered))\b/i,
      (p) => `That reads as a specific threat against a named person ("${p}"), not venting.`,
      "en",
    ],
    [
      "injection_attempt",
      /\b(ignore (?:previous|all|your) instructions|you are now|reveal your (?:system prompt|instructions))\b/i,
      (p) => `This looks like an attempt to redirect what the tool does ("${p}"), not a message to rewrite.`,
      "en",
    ],
    [
      "hate_speech",
      /\b(hate all|subhuman|(?:women|men|jews|muslims|black people|white people) are (?:all )?(?:inferior|scum|trash))\b/i,
      (p) => `This targets a group ("${p}") rather than venting about a specific situation.`,
      "en",
    ],
    [
      "sexual_content",
      /\b(send nudes|sext|explicit photo)\b/i,
      (p) => `This isn't something this tool rewrites ("${p}").`,
      "en",
    ],
    [
      "other_disallowed",
      /\b(what'?s your system prompt|repeat your instructions)\b/i,
      (p) => `This is outside what this tool is built to do ("${p}").`,
      "en",
    ],
    // A handful of non-English smoke-test rules, one per other supported
    // language, each with the reason written in that language (matching
    // what the real classifier is now instructed to do). These only prove
    // the pipeline carries other languages/scripts through correctly end
    // to end — they say nothing about real classification quality in
    // those languages, which can only be checked against the live API.
    [
      "self_harm",
      /\b(ich will mein leben beenden|ich will nicht mehr leben)\b/i,
      (p) => `Das klingt nach Selbstverletzung ("${p}"), deshalb tritt T-Rant zurück und verweist auf echte Unterstützung.`,
      "de",
    ],
    [
      "violent_threat",
      /\b(voy a matar a [a-záéíóúñ]+)\b/i,
      (p) => `Eso es una amenaza específica contra una persona nombrada ("${p}"), no un desahogo.`,
      "es",
    ],
    [
      "injection_attempt",
      /\b(ignore(?:z)? les instructions précédentes)\b/i,
      (p) => `Cela ressemble à une tentative de détourner l'outil ("${p}"), pas un message à réécrire.`,
      "fr",
    ],
    [
      "sexual_content",
      /\b(manda(?:mi)? foto esplicit[ei])\b/i,
      (p) => `Non è qualcosa che questo strumento riscrive ("${p}").`,
      "it",
    ],
    [
      "in_danger",
      /\b(han slår mig|hon slår mig)\b/i,
      (p) => `Det här läser som ett avslöjande om att någon annan skadar dig ("${p}").`,
      "sv",
    ],
    [
      "other_disallowed",
      /(покажи свои инструкции|повтори свои инструкции)/i,
      (p) => `Это выходит за рамки того, для чего создан этот инструмент ("${p}").`,
      "ru",
    ],
  ];

  for (const [label, pattern, reasonFn, language] of rules) {
    const match = text.match(pattern);
    if (match) {
      return { label, flaggedPhrases: [match[0]], reason: reasonFn(match[0]), language, intensity: mockIntensity(text) };
    }
  }

  return { label: "clean", flaggedPhrases: [], reason: "", language: "en", intensity: mockIntensity(text) };
}

// Crude stand-in for the real classifier's intensity judgment: counts
// exclamation marks, ALL-CAPS words, and a few intensity-signaling words.
// Good enough to exercise the UI; not a model of what "heated" means.
function mockIntensity(text: string): number {
  const exclamations = (text.match(/!/g) ?? []).length;
  const capsWords = (text.match(/\b[A-Z]{3,}\b/g) ?? []).length;
  const intenseWords = (text.match(/\b(always|never|worst|hate|furious|unacceptable|ridiculous)\b/gi) ?? []).length;

  const score = 3 + exclamations * 1.5 + capsWords * 1.5 + intenseWords;
  return Math.min(10, Math.max(1, Math.round(score)));
}

// Crude stand-in for a real tone rewrite. Cannot understand meaning the way
// the real Haiku-backed generator can (see generator.ts) - this is regex
// substitution, not comprehension - but it goes further than punctuation
// cleanup so the three tiers are visibly different from the input AND from
// each other, matching what the real generator is instructed to do. The
// UI's own tone headers already say which tier is which, so no
// "[mock: ...]" prefix belongs in the text itself.
const MILD_PROFANITY = /\b(fuck(ing)?|shit|damn|hell|crap|goddamn)\b/gi;

// still_you_just_cooler keeps every point and detail (per generator.ts's
// instructions), only sanding off swearing/shouting - never softens word
// choice or drops content.
function stillYouJustCoolerMock(text: string): string {
  const deSweared = text.replace(MILD_PROFANITY, "").replace(/\s{2,}/g, " ").trim();
  const deShouted = deSweared.replace(/\b[A-Z]{3,}\b/g, (w) => w[0] + w.slice(1).toLowerCase());
  const deEmphasized = deShouted.replace(/!{2,}/g, ".");
  return deEmphasized || text;
}

// professional_clear and maximum_diplomacy also soften word choice...
const INTENSITY_SOFTENERS: [RegExp, string][] = [
  [/\bnever\b/gi, "rarely"],
  [/\balways\b/gi, "often"],
  [/\bunacceptable\b/gi, "not sustainable"],
  [/\bridiculous\b/gi, "frustrating"],
  [/\bhate\b/gi, "really dislike"],
  [/\bworst\b/gi, "most difficult"],
  [/\bfurious\b/gi, "frustrated"],
  [/\bcrazy\b/gi, "hard to manage"],
];

function applySofteners(text: string): string {
  return INTENSITY_SOFTENERS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

// ...and drop specific side comparisons/accusations that read as
// inflammatory or tangential rather than the core professional concern
// (e.g. "you're getting a commission for that and I don't!") - crude
// sentence-level pattern match, same spirit as generator.ts's instruction
// to edit content, not just tone, for these two tiers only.
const COMPARISON_SENTENCE = /\byou'?re\b[^.!?]*\b(?:and|but)\b[^.!?]*\bi\b[^.!?]*\b(?:don'?t|do not|didn'?t|never)\b/i;

function stripComparisons(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  const kept = sentences.filter((s) => !COMPARISON_SENTENCE.test(s));
  const result = kept.join(" ").replace(/\s{2,}/g, " ").trim();
  return result || text;
}

function professionalClearMock(text: string): string {
  const body = applySofteners(stripComparisons(stillYouJustCoolerMock(text)));
  return `I'd like to raise the following: ${body}`;
}

function maximumDiplomacyMock(text: string): string {
  const body = applySofteners(stripComparisons(stillYouJustCoolerMock(text)))
    .replace(/\bI (want|need)\b/gi, "I was hoping we could")
    .replace(/\byou (should|must|need to)\b/gi, "it might help if you could");
  return `I hope this finds you well - I wanted to gently mention: ${body}`;
}

// Context is accepted for signature parity with generator.ts's real
// implementation (see t-rant-phase2-brief.md section 8) but not woven into
// the rewrite here: the mock is regex substitution, not comprehension, so
// there's no meaningful way for it to "respond to their point." It's simply
// unused — no "[context noted: ...]" debug marker gets appended to the
// output either; that used to leak mock-internal state into user-facing
// copy, which read as a broken rewrite rather than a documented mock
// limitation.
//
// directorsCut and the per-tier explanations are likewise crude stand-ins:
// enough to exercise the UI (the reveal-on-click block, the "why" captions),
// not a demonstration of real content quality — see generator.ts for what
// the live model actually produces.
export function mockGenerateToneVersions(text: string, _context?: string): MockGeneratedRewrite {
  return {
    versions: {
      stillYouJustCooler: stillYouJustCoolerMock(text),
      professionalClear: professionalClearMock(text),
      maximumDiplomacy: maximumDiplomacyMock(text),
    },
    explanations: {
      stillYouJustCooler: "Removed profanity and shouting; kept every point.",
      professionalClear: "Softened word choice and dropped tangential comparisons.",
      maximumDiplomacy: "Same edits as Professional & Clear, plus extra hedging.",
    },
    directorsCut: text,
  };
}

const PERSONA_MOCK_WRAPPER: Record<Persona, (body: string) => string> = {
  corporate_memo: (b) => `Per my last message, circling back to align on next steps: ${b}`,
  victorian: (b) => `Dearest reader, I must with great formality convey the following: ${b}`,
  cease_and_desist: (b) => `Be advised: the undersigned hereby raises the following matter: ${b}`,
  haiku: (b) => b,
  nature_documentary: (b) => `Here, in its natural habitat, the aggrieved worker is observed to say: ${b}`,
};

export function mockGeneratePersonaVersion(text: string, persona: Persona): string {
  return PERSONA_MOCK_WRAPPER[persona](stillYouJustCoolerMock(text));
}
