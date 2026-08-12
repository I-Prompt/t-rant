// Mock mode — used when MOCK_MODE=true so the pipeline can be exercised
// end-to-end without a paid Anthropic API key. Uses crude keyword heuristics
// instead of a real model call. Not a substitute for testing against the
// real classifier/generator before shipping.

import { ClassifierLabel, ClassifierResult, ToneVersions } from "./types";

export function mockClassify(text: string): ClassifierResult {
  const lower = text.toLowerCase();

  const rules: [ClassifierLabel, RegExp][] = [
    ["hard_no", /\b(child porn|csae|traffick|how to make a bomb|steal.*credit card)\b/],
    ["self_harm", /\b(kill myself|suicide|end my life|want to die|self.?harm|starv(e|ing) myself)\b/],
    ["in_danger", /\b(he hits me|she hits me|being abused|afraid (he|she|they)'?ll hurt me)\b/],
    ["violent_threat", /\b(i('| a)?m going to (kill|hurt|beat up) [a-z]+)\b/],
    ["injection_attempt", /\b(ignore (previous|all|your) instructions|you are now|reveal your (system prompt|instructions))\b/],
    ["hate_speech", /\b(hate all|subhuman|(women|men|jews|muslims|black people|white people) are (all )?(inferior|scum|trash))\b/],
    ["sexual_content", /\b(send nudes|sext|explicit photo)\b/],
    ["other_disallowed", /\b(what'?s your system prompt|repeat your instructions)\b/],
  ];

  for (const [label, pattern] of rules) {
    if (pattern.test(lower)) {
      return { label };
    }
  }

  return { label: "clean" };
}

export function mockGenerateToneVersions(text: string): ToneVersions {
  return {
    stillYouJustCooler: `[mock: still-you-just-cooler] ${text}`,
    professionalClear: `[mock: professional-clear] I'd like to raise the following: ${text}`,
    maximumDiplomacy: `[mock: maximum-diplomacy] I hope this finds you well — I wanted to gently mention: ${text}`,
  };
}
