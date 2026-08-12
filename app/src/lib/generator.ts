import { getAnthropicClient, HAIKU_MODEL } from "./anthropic";
import { ToneVersions } from "./types";

const SYSTEM_PROMPT = `You are T-Rant, a tool that rewrites a heated draft message into three more diplomatic versions. The input has already been checked and is safe to rewrite — your only job is the rewrite itself.

Detect the language the user wrote in and produce all three output versions in that same language. Do not translate to English if the input wasn't in English.

Produce exactly three versions of the message:
1. still_you_just_cooler: same directness and same points, edges sanded off, no fake pleasantries added. This should still sound like the same person.
2. professional_clear: standard workplace-diplomatic tone, direct but fully appropriate for a manager or client to read.
3. maximum_diplomacy: heavily softened, hedge-heavy, prioritizes preserving the relationship even if it costs some directness.

Preserve the actual substance and points being made in all three — don't drop the person's real concerns, just change how they're expressed. Respond only by calling the rewrite tool.`;

const REWRITE_TOOL = {
  name: "rewrite",
  description: "Report the three tone-rewritten versions of the message.",
  input_schema: {
    type: "object" as const,
    properties: {
      still_you_just_cooler: { type: "string" as const },
      professional_clear: { type: "string" as const },
      maximum_diplomacy: { type: "string" as const },
    },
    required: ["still_you_just_cooler", "professional_clear", "maximum_diplomacy"],
  },
};

export async function generateToneVersions(text: string): Promise<ToneVersions> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `<user_input>\n${text}\n</user_input>`,
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
  };

  return {
    stillYouJustCooler: input.still_you_just_cooler,
    professionalClear: input.professional_clear,
    maximumDiplomacy: input.maximum_diplomacy,
  };
}
