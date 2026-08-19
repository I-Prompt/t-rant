import { NextResponse } from "next/server";

// Tiny, cheap endpoint so the client can show a "you're looking at mock
// output" badge without waiting for a real submit. Added 2026-08-19 after
// MOCK_MODE=true (left on in .env.local from earlier local testing) was
// mistaken for a real classifier/generator bug twice - previously the only
// way to check this was reading .env.local or the now-removed /status page.
export async function GET() {
  return NextResponse.json({ mockMode: process.env.MOCK_MODE === "true" });
}
