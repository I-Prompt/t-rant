import { NextRequest } from "next/server";

// Free, zero-latency guard against scripts hitting these endpoints directly
// from another site (or straight via curl with a spoofed page) and burning
// this project's Anthropic quota on someone else's traffic. Checked before
// rate limiting so a rejected request doesn't even cost a slot in the
// limiter. Deliberately permissive when both headers are simply absent -
// some legitimate same-origin requests omit them depending on
// browser/privacy-extension behavior - rather than blocking those outright;
// this raises the bar for casual abuse, it isn't a hard security boundary.
export function isSameOrigin(req: NextRequest): boolean {
  const host = req.headers.get("host");
  if (!host) return true;

  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return true;
}
