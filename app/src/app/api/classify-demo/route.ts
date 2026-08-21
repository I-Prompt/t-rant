import { NextRequest, NextResponse } from "next/server";
import { classify } from "@/lib/classifier";
import { mockClassify } from "@/lib/mock";
import { checkRateLimit, DEMO_MAX_REQUESTS_PER_WINDOW } from "@/lib/rateLimit";
import { isSameOrigin } from "@/lib/requestGuard";
import { RantRequestBody } from "@/lib/types";

// Classification-only sandbox for the House Rules page: shows category +
// flagged phrases for anything typed in, but never runs generation — even
// for "clean" input. See t-rant-phase2-brief.md section 2.

const MOCK_MODE = process.env.MOCK_MODE === "true";

const MAX_CHARS = 2000;

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Request rejected" }, { status: 403 });
  }

  const ip = getClientIp(req);

  const { limited, remaining } = checkRateLimit(`demo:${ip}`, DEMO_MAX_REQUESTS_PER_WINDOW);
  if (limited) {
    return NextResponse.json(
      {
        error: "Demo rate limit exceeded. Try again later.",
        rateLimit: { remaining: 0, limit: DEMO_MAX_REQUESTS_PER_WINDOW },
      },
      { status: 429 }
    );
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

  let label, flaggedPhrases, reason;
  try {
    ({ label, flaggedPhrases, reason } = MOCK_MODE ? mockClassify(text) : await classify(text));
  } catch (err) {
    console.error("Classifier error:", err);
    return NextResponse.json({ error: "Classification failed" }, { status: 502 });
  }

  // Same rule as the main endpoint — never log raw rant text, only category + timestamp.
  console.log(JSON.stringify({ category: label, timestamp: new Date().toISOString(), demo: true }));

  return NextResponse.json({
    label,
    flaggedPhrases,
    reason,
    rateLimit: { remaining, limit: DEMO_MAX_REQUESTS_PER_WINDOW },
  });
}
