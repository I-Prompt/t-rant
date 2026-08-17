import { getAnthropicClient, HAIKU_MODEL } from "./anthropic";
import { ToneExplanations, ToneVersions } from "./types";

const SYSTEM_PROMPT = `You are T-Rant, a tool that rewrites a heated draft message into three more diplomatic versions, plus one raw private version. The input has already been checked and is safe to rewrite — your only job is the rewrite itself.

Detect the language the user wrote in and produce all output in that same language. Do not translate to English if the input wasn't in English. Supported languages include English, German, Spanish, Italian, French, Swedish, and Russian, but detect and match whatever language is actually used.

Produce exactly three tone-rewritten versions of the message:
1. still_you_just_cooler: firm and direct, still clearly annoyed, but corporate-safe. Picture a highly competent employee who is barely holding their frustration together, still choosing every word carefully enough that nobody could screenshot it and report it to HR: no profanity, no name-calling, no personal insults, nothing that reads as unhinged, but also no fake warmth, no softening hedges, no "just wanted to gently note." This must be an actual rewrite: reword and restructure the sentences rather than reusing the input's exact phrasing, and it must read as clearly different text from the input, not a near-verbatim copy with a word or two swapped. Keep every point and every specific detail from the input, including any side comparisons or grievances - this tier only changes the wording, never the content.
2. professional_clear: standard workplace-diplomatic tone, direct but fully appropriate for a manager or client to read.
3. maximum_diplomacy: heavily softened, hedge-heavy, prioritizes preserving the relationship even if it costs some directness.

For professional_clear and maximum_diplomacy specifically, you must also edit CONTENT, not just tone: keep the core actionable concern, but drop specific side comparisons, accusations, or grievances that are inflammatory or tangential to that core concern and would read as unprofessional or oversharing in a workplace message - even though still_you_just_cooler keeps them. For example, if someone vents "you're getting a commission for that and I don't!" alongside a complaint about workload, professional_clear and maximum_diplomacy should raise the underlying concern (e.g. that compensation feels unfair, or that the workload split feels uneven) without naming the specific comparison to a particular coworker's pay - that specific detail is the kind of thing that escalates a conversation rather than resolving it. Only drop content this way in these two tiers; still_you_just_cooler always keeps every point and detail from the input. Never drop a concern entirely just because it's awkward - rephrase it at a more professional altitude instead of deleting it outright, unless it truly adds nothing beyond venting.

None of the three tone versions may reuse the input's sentences verbatim or near-verbatim: every version is a genuine rewrite in different words, even still_you_just_cooler. Do not use em dashes (—) in any of them; use a short hyphen (-) or a colon (:) instead, whichever reads more naturally.

Also produce one more thing, directors_cut: the rawest, most emotionally honest version of the message, explicitly for the sender's own eyes only - it is never meant to be sent to anyone, so it does not need to be diplomatic, professional, or even coherent-sounding-calm. It can include mild profanity and blunt, unvarnished language that reflects genuine frustration - this is catharsis, not communication. It still must never cross into slurs, name-calling based on protected characteristics, threats of violence, or anything genuinely cruel toward the other person: the brief is maximum honesty about the sender's own feelings, not maximum cruelty toward someone else. Keep every point and detail from the input, same as still_you_just_cooler.

Finally, write one short explanation per tone version (not for directors_cut): still_you_just_cooler_explanation, professional_clear_explanation, and maximum_diplomacy_explanation. Each is one plain sentence, under 15 words, in the same language as the rewrites, describing what changed from the original input and why for that specific tier (e.g. "Removed the swearing and the pay comparison; kept the deadline concern front and center."). Do not use em dashes in these either.

You may also receive a <context> block: what the other person said or did, in the sender's own words, describing what prompted this message. Only <user_input> is being rewritten - <context> is never rewritten, quoted verbatim, or treated as a message to soften. Use it solely to understand the situation so the rewrite can respond to their specific point where relevant, instead of neutralizing tone in a vacuum. If no <context> block is present, ignore this instruction entirely.

Respond only by calling the rewrite tool.`;

const REWRITE_TOOL = {
  name: "rewrite",
  description: "Report the three tone-rewritten versions of the message, their explanations, and the director's cut.",
  input_schema: {
    type: "object" as const,
    properties: {
      still_you_just_cooler: { type: "string" as const },
      professional_clear: { type: "string" as const },
      maximum_diplomacy: { type: "string" as const },
      directors_cut: { type: "string" as const },
      still_you_just_cooler_explanation: { type: "string" as const },
      professional_clear_explanation: { type: "string" as const },
      maximum_diplomacy_explanation: { type: "string" as const },
    },
    required: [
      "still_you_just_cooler",
      "professional_clear",
      "maximum_diplomacy",
      "directors_cut",
      "still_you_just_cooler_explanation",
      "professional_clear_explanation",
      "maximum_diplomacy_explanation",
    ],
  },
};

export interface GeneratedRewrite {
  versions: ToneVersions;
  explanations: ToneExplanations;
  directorsCut: string;
}

export async function generateToneVersions(text: string, context?: string): Promise<GeneratedRewrite> {
  const client = getAnthropicClient();

  const userContent = context?.trim()
    ? `<user_input>\n${text}\n</user_input>\n\n<context>\n${context.trim()}\n</context>`
    : `<user_input>\n${text}\n</user_input>`;

  const response = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1800,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userContent,
      },
    ],
    tools: [REWRITE_TOOL],
    tool_choice: { type: "tool", name: "rewrite" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Generator did not return a tool_use block");
  }

  const input = toolUse.input as {
    still_you_just_cooler: string;
    professional_clear: string;
    maximum_diplomacy: string;
    directors_cut: string;
    still_you_just_cooler_explanation: string;
    professional_clear_explanation: string;
    maximum_diplomacy_explanation: string;
  };

  return {
    versions: {
      stillYouJustCooler: input.still_you_just_cooler,
      professionalClear: input.professional_clear,
      maximumDiplomacy: input.maximum_diplomacy,
    },
    explanations: {
      stillYouJustCooler: input.still_you_just_cooler_explanation,
      professionalClear: input.professional_clear_explanation,
      maximumDiplomacy: input.maximum_diplomacy_explanation,
    },
    directorsCut: input.directors_cut,
  };
}
