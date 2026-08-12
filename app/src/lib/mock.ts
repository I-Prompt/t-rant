// Mock mode — used when MOCK_MODE=true so the pipeline can be exercised
// end-to-end without a paid Anthropic API key. Uses crude keyword heuristics
// instead of a real model call. This can only ever prove the pipeline wires
// together correctly — it is NOT a safety-recall test. A phrase not matching
// any pattern here says nothing about whether the real Haiku classifier
// would catch it; only testing against the real API can answer that.

import { ClassifierLabel, ClassifierResult, Persona, SupportedLanguage, ToneVersions } from "./types";

type ReasonFn = (phrase: string) => string;

export function mockClassify(text: string): ClassifierResult {
  const rules: [ClassifierLabel, RegExp, ReasonFn, SupportedLanguage][] = [
    [
      "hard_no",
      /\b(child porn|csae|traffick\w*|how to make a bomb|steal.*credit card)\b/i,
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
      /\b(?:i(?:'| a)?m going to (?:kill|hurt|beat up) [a-z]+|never come back[^.!?]{0,40}i(?:'ll| will) (?:arrange|make (?:sure|certain)|see to it)|i'll (?:arrange|make sure) (?:that|you))\b/i,
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

export function mockGenerateToneVersions(text: string): ToneVersions {
  return {
    stillYouJustCooler: `[mock: still-you-just-cooler] ${text}`,
    professionalClear: `[mock: professional-clear] I'd like to raise the following: ${text}`,
    maximumDiplomacy: `[mock: maximum-diplomacy] I hope this finds you well - I wanted to gently mention: ${text}`,
  };
}

export function mockGeneratePersonaVersion(text: string, persona: Persona): string {
  return `[mock: ${persona}] ${text}`;
}
