# T-Rant 🦖

**Small arms. Big feelings. Smart translation.**

Paste a heated draft message — a Slack rant, an angry email — and get back three versions at different diplomacy levels, so you can pick one and actually send it instead of the original.

"Angry message → professional rewrite" tools already exist (Angry Email Translator, Anger Translator, AI Corporate Translator, among others). What's different here is the guardrail architecture: a dedicated safety-classification pass, isolated from the rewrite itself, with distinct handling for the several ways a tool like this can go wrong — not just three prompt variations bolted onto an unguarded text box.

## The three tiers

1. **Still You, Just Cooler** — same directness, same points, edges sanded off. No fake pleasantries added.
2. **Professional & Clear** — standard workplace-diplomatic tone, direct but appropriate for a manager or client.
3. **Maximum Diplomacy** — heavily softened, hedge-heavy, prioritizes preserving the relationship over directness.

## Guardrail architecture

A two-stage pipeline, not one prompt trying to classify and respond at once — a dedicated classification pass is much harder to talk past than a single prompt juggling both jobs.

**Stage 1 — Classifier.** Reads the raw input (wrapped in explicit delimiters, treated as data to evaluate, never as instructions) and assigns one label. **Stage 2 — Generation** only ever runs on inputs the classifier has already cleared, and never sees the raw verdict as something to second-guess.

| Input reads as | Pathway | Behavior |
|---|---|---|
| Ordinary venting/frustration | **Clean** | Full three-tier rewrite |
| CSAE, trafficking, extremist content, doxxing, fraud, weapons instructions, actual crime planning | **Hard NO** | Flat, immediate decline. No engagement, no cleverness. |
| Self-harm, suicidal ideation, eating-disorder content, or disclosure of being harmed by someone else | **Serious** | No mascot, no jokes. Plain, calm text pointing to a real crisis-resource directory ([findahelpline.com](https://findahelpline.com)). Biased toward over-flagging rather than under-flagging. |
| Specific, credible threat of violence against a named real person | **Firm** | Polite, on-brand decline — distinct from ordinary venting, but not comedic. |
| Prompt-injection attempts, hate speech, sexual content, other off-purpose use | **Witty** | Declines the request, pairs it with a quote pulled server-side from an 86-quote library (categorized by trigger, so it can't be tampered with client-side). |

We don't claim this is unhackable anywhere — the defensible claim is the layered architecture (role separation, an isolated classification pass, a generation step that can't talk itself out of a verdict it never sees), not a bulletproof guarantee.

## Status

**Phase 1 (done):** core pipeline — input → classifier → generation → three tone versions, all five pathways wired up and tested, rate limiting, no-raw-text logging, mock mode for testing without API credits.

**Next:**
- Pixel T-Rex visual identity, sprite states, Web Audio SFX
- Self-harm pathway calming redesign + IP-based geo-routed resources
- Unwind links section, general disclaimer, bookmarklet
- Bonus features: Director's Cut, diff-style explanations, dialogue-context field, Rant Intensity Score
- Multilingual generation instruction, deploy to Vercel

Full spec: [`t-rant-MASTER-BUILD-BRIEF.md`](t-rant-MASTER-BUILD-BRIEF.md), [`t-rant-technical-spec.md`](t-rant-technical-spec.md), [`t-rant-safety-legal-update.md`](t-rant-safety-legal-update.md), [`t-rant-quotes-by-category.md`](t-rant-quotes-by-category.md).

## Running locally

```bash
cd app
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
- Set `ANTHROPIC_API_KEY` to run against the real classifier/generator, **or**
- Set `MOCK_MODE=true` to exercise the full pipeline and UI with keyword-heuristic mocks instead — no API key or credits needed. See [`src/lib/mock.ts`](app/src/lib/mock.ts).

```bash
npm run dev
```

## Stack

Next.js (App Router, TypeScript) + the Anthropic SDK, both pipeline stages on Haiku. Deploys to Vercel. No accounts, no database — classification category and a timestamp are the only things ever logged; raw rant text is never persisted.

## Privacy & disclaimer

Demo/portfolio project, not professional communications software — rewrites are suggestions, use judgment before sending. Not a substitute for professional legal, HR, or mental-health advice; self-harm resources are informational pointers, not a clinical service. Full detail in [`t-rant-safety-legal-update.md`](t-rant-safety-legal-update.md).
