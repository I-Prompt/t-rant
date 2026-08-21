import { NextRequest, NextResponse } from "next/server";
import { classify } from "@/lib/classifier";
import { mockClassify, mockGeneratePersonaVersion } from "@/lib/mock";
import { generatePersonaVersion } from "@/lib/personas";
import { checkRateLimit } from "@/lib/rateLimit";
import { isSameOrigin } from "@/lib/requestGuard";
import { PERSONAS, Persona, PersonaRequestBody } from "@/lib/types";

// Personas are a secondary, "for fun" feature reached only after a message
// has already come back clean once. This endpoint re-classifies from
// scratch anyway — it never trusts a client claim that the text is safe,
// same principle as the main /api/rant pipeline. Unlike /api/rant, a
// non-clean result here just declines; it doesn't replicate the full
// pathway richness (quotes, self-harm resources) since this is a bonus
// feature, not the primary safety surface.

const MOCK_MODE = process.env.MOCK_MODE === "true";
const MAX_CHARS = 2000;
const PERSONA_MAX_REQUESTS_PER_WINDOW = 15;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Request rejected" }, { status: 403 });
  }

  const ip = getClientIp(req);

  const { limited, remaining } = checkRateLimit(`persona:${ip}`, PERSONA_MAX_REQUESTS_PER_WINDOW);
  if (limited) {
    return NextResponse.json(
      {
        ok: false,
        error: "Persona rate limit exceeded. Try again later.",
        rateLimit: { remaining: 0, limit: PERSONA_MAX_REQUESTS_PER_WINDOW },
      },
      { status: 429 }
    );
  }

  let body: PersonaRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim();
  const persona = body.persona;
  if (!text) {
    return NextResponse.json({ ok: false, error: "Missing text" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ ok: false, error: `Text exceeds ${MAX_CHARS} character limit` }, { status: 400 });
  }
  if (!PERSONAS.includes(persona)) {
    return NextResponse.json({ ok: false, error: "Unknown persona" }, { status: 400 });
  }

  let label, flaggedPhrases, reason;
  try {
    ({ label, flaggedPhrases, reason } = MOCK_MODE ? mockClassify(text) : await classify(text));
  } catch (err) {
    console.error("Classifier error:", err);
    return NextResponse.json({ ok: false, error: "Classification failed" }, { status: 502 });
  }

  console.log(JSON.stringify({ category: label, timestamp: new Date().toISOString(), persona: true }));

  if (label !== "clean") {
    return NextResponse.json({
      ok: false,
      error: "This didn't pass the safety check, so there's no persona rewrite either.",
      flagged: { originalText: text, flaggedPhrases, reason },
      rateLimit: { remaining, limit: PERSONA_MAX_REQUESTS_PER_WINDOW },
    });
  }

  try {
    const personaText = MOCK_MODE
      ? mockGeneratePersonaVersion(text, persona as Persona)
      : await generatePersonaVersion(text, persona as Persona);

    return NextResponse.json({
      ok: true,
      persona,
      text: personaText,
      rateLimit: { remaining, limit: PERSONA_MAX_REQUESTS_PER_WINDOW },
    });
  } catch (err) {
    console.error("Persona generator error:", err);
    return NextResponse.json({ ok: false, error: "Persona generation failed" }, { status: 502 });
  }
}
