import { NextRequest, NextResponse } from "next/server";
import { classify } from "@/lib/classifier";
import { generateToneVersions } from "@/lib/generator";
import { mockClassify, mockGenerateToneVersions } from "@/lib/mock";
import { pickQuote, WittyTrigger } from "@/lib/quotes";
import { isRateLimited } from "@/lib/rateLimit";
import { RantRequestBody, RantResponse } from "@/lib/types";

const MOCK_MODE = process.env.MOCK_MODE === "true";

const MAX_CHARS = 2000;

const HARD_NO_MESSAGE =
  "This isn't something T-Rant can help rewrite. No further engagement on this one.";

const SERIOUS_MESSAGE =
  "It sounds like things are really hard right now. T-Rant isn't equipped to help with this — please reach out to people who are. If you're in immediate danger, contact your local emergency services.";

const SERIOUS_RESOURCE_URL = "https://findahelpline.com";

const FIRM_MESSAGE =
  "T-Rant can't help rewrite this one — it reads as a specific threat against a real person rather than venting. If you need to raise a serious concern about someone, consider going through appropriate channels (HR, legal, or law enforcement) instead.";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  let body: RantRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ error: `Text exceeds ${MAX_CHARS} character limit` }, { status: 400 });
  }

  let label;
  try {
    ({ label } = MOCK_MODE ? mockClassify(text) : await classify(text));
  } catch (err) {
    console.error("Classifier error:", err);
    return NextResponse.json({ error: "Classification failed" }, { status: 502 });
  }

  // Never log raw rant text — only the category and a timestamp.
  console.log(JSON.stringify({ category: label, timestamp: new Date().toISOString() }));

  let responseBody: RantResponse;

  switch (label) {
    case "hard_no":
      responseBody = { pathway: "hard_no", message: HARD_NO_MESSAGE };
      break;

    case "self_harm":
    case "in_danger":
      responseBody = { pathway: "serious", message: SERIOUS_MESSAGE, resourceUrl: SERIOUS_RESOURCE_URL };
      break;

    case "violent_threat":
      responseBody = { pathway: "firm", message: FIRM_MESSAGE };
      break;

    case "injection_attempt":
    case "hate_speech":
    case "sexual_content":
    case "other_disallowed": {
      const quote = pickQuote(label as WittyTrigger);
      responseBody = {
        pathway: "witty",
        message: "T-Rant isn't going to help with that one. Here's something to sit with instead.",
        quote,
      };
      break;
    }

    case "clean":
    default: {
      try {
        const versions = MOCK_MODE ? mockGenerateToneVersions(text) : await generateToneVersions(text);
        responseBody = { pathway: "clean", versions };
      } catch (err) {
        console.error("Generator error:", err);
        return NextResponse.json({ error: "Generation failed" }, { status: 502 });
      }
      break;
    }
  }

  return NextResponse.json(responseBody);
}
