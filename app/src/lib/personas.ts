import { getAnthropicClient, HAIKU_MODEL } from "./anthropic";
import { Persona } from "./types";

// Optional "for fun" fifth+ rewrite styles, layered on top of an
// already-classified-clean message — picked for meme/format recognizability
// (each maps to an existing popular online humor genre), per
// t-rant-phase2-brief.md section 6. Display labels live in types.ts
// (PERSONA_LABELS) since that file is safe to import from client code and
// this one isn't (it pulls in the server-only Anthropic client).

const PERSONA_INSTRUCTIONS: Record<Persona, string> = {
  corporate_memo:
    "Rewrite it as a deadpan corporate memo or Slack message: full of jargon like 'per my last message', 'circling back', 'let's take this offline', 'align on next steps', 'per my last email'. Preserve the actual complaint, just drown it in corporate speak. Should read as genuinely funny, not just wordy.",
  victorian:
    "Rewrite it as an elaborately formal Victorian-era or Shakespearean-style letter: ornate, archaic phrasing, address the reader as befits the register (e.g. 'Dear Sir or Madam', 'thee/thou' if it fits naturally). Preserve the actual complaint, dressed in old-fashioned eloquence.",
  cease_and_desist:
    "Rewrite it as a deadpan, overly formal legal cease-and-desist letter about this (likely minor) grievance: 'Be advised that...', numbered clauses, comically disproportionate legal seriousness for an everyday interpersonal matter. Preserve the actual complaint.",
  haiku:
    "Rewrite the core sentiment as a single haiku (5-7-5 syllable structure). Capture the emotional core, not a literal line-by-line translation.",
  nature_documentary:
    "Rewrite it as a calm, observational nature-documentary narration (David Attenborough style) describing the person's situation as if narrating wildlife behavior: third person, scientific-sounding, but funny. Preserve the actual complaint.",
};

function systemPromptFor(persona: Persona): string {
  return `You are T-Rant's persona mode. The input has already been checked and is safe to rewrite. Detect the language the input is written in and respond in that same language.

${PERSONA_INSTRUCTIONS[persona]}

This is a single rewrite, for fun and for sharing — not one of the three standard diplomacy tones. Do not use em dashes (—); use a short hyphen (-) or colon (:) instead. Respond only by calling the rewrite tool.`;
}

const PERSONA_TOOL = {
  name: "persona_rewrite",
  description: "Report the persona-styled rewrite of the message.",
  input_schema: {
    type: "object" as const,
    properties: {
      text: { type: "string" as const, description: "The persona-styled rewrite." },
    },
    required: ["text"],
  },
};

export async function generatePersonaVersion(text: string, persona: Persona): Promise<string> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 500,
    system: systemPromptFor(persona),
    messages: [
      {
        role: "user",
        content: `<user_input>\n${text}\n</user_input>`,
      },
    ],
    tools: [PERSONA_TOOL],
    tool_choice: { type: "tool", name: "persona_rewrite" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Persona generator did not return a tool_use block");
  }

  return (toolUse.input as { text: string }).text;
}
