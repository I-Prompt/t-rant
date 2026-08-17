# T-Rant 🦖

**Small arms. Big feelings. Smart translation.**

Paste a heated draft message - a Slack rant, an angry email - and get back three versions at different diplomacy levels, so you can pick one and actually send it instead of the original.

"Angry message → professional rewrite" tools already exist (Angry Email Translator, Anger Translator, AI Corporate Translator, among others). What's different here is two things: a guardrail architecture with dedicated, isolated safety classification, not three prompt variations bolted onto an unguarded text box, and a deliberate bet on **provable transparency** over "trust us": every block shows you exactly what tripped it, in your own words.

A handful of bonus features and independent verification of a couple of content sources are still ahead (see [The full experience](#the-full-experience-planned) below) - everything else described here, including the pixel-art T-Rex identity, the self-harm calming redesign, unwind links, and screenshot branding, is built and working today.

## Architecture

```mermaid
flowchart TD
    A["Raw input, any of 7 languages"] --> B["Stage 1: Classifier"]
    B --> B1["Returns label, flagged phrases, reason, language, intensity"]
    B1 -->|clean| C["Stage 2: Generation"]
    C --> C1["3 tone versions, in the input's language"]
    C1 --> C2["Rant Intensity Score, 1 to 10"]
    C1 --> C3["Optional persona rewrites"]
    B1 -->|hard_no| D["Hard NO: flat decline, no engagement"]
    B1 -->|self_harm or in_danger| E["Serious pathway: resource link plus emergency note"]
    B1 -->|violent_threat| F["Firm pathway: polite decline plus hard-stop tone"]
    B1 -->|injection, hate, sexual, or other| G["Witty pathway: quote from curated library"]
    D --> H["Flagged phrases highlighted in the user's own text"]
    F --> H
    G --> H
    E --> H
    I["Get help now buttons"] -.->|bypass classification entirely| E
```

Two-stage pipeline, not one prompt trying to classify and respond at once: a dedicated classification pass is much harder to talk past than a single prompt juggling both jobs. Stage 2 only ever runs on inputs Stage 1 has already cleared, and never sees the raw verdict as something to second-guess. Personas (see below) re-run the classifier independently before generating anything - they never trust a client's claim that text is already safe.

We don't claim this is unhackable anywhere: the defensible claim is the layered architecture itself (an isolated classification pass, a generation step that never sees a raw verdict to second-guess), not a bulletproof guarantee.

## The three tiers

1. **Still You, Just Cooler**: same directness, same points, edges sanded off. No fake pleasantries added. Keeps every detail from the input, including tangential ones - only the wording changes, not the content.
2. **Professional & Clear**: standard workplace-diplomatic tone, direct but appropriate for a manager or client. Also edits content, not just tone: drops specific side comparisons or accusations that read as inflammatory or oversharing (e.g. "you're getting a commission and I don't") while keeping the underlying concern.
3. **Maximum Diplomacy**: heavily softened, hedge-heavy, prioritizes preserving the relationship over directness. Same content-editing as Professional & Clear, plus more hedging.

Plus five optional **persona rewrites** for fun/sharing, generated on top of an already-clean message: Corporate Memo, Victorian Letter, Cease & Desist, Haiku, Nature Documentary.

## Transparency & trust

The throughline for everything below: don't just claim something's safe or private, make it checkable.

- **Every block shows its work.** When a message is blocked, the response echoes your own text back with the exact triggering phrase(s) highlighted, plus a one-line reason with the phrase quoted inline: never a vague category label.
- **Live rate-limit counter** on every response ("7 of 10 rants left this hour"), never a silent cutoff.
- **Privacy statement with a verifiability pointer**, not just a promise: the site links straight to [`src/lib`](app/src/lib) so anyone can read the actual logging code (only category and timestamp, ever - raw text is never persisted).
- **[House Rules](app/src/app/house-rules/page.tsx) page**: precise definitions of the three tones, example phrases per flagging category, a live sandbox that runs the real classifier with no rewrite generated, and the full privacy/legal breakdown.
- **[Dark Pattern Audit](app/src/app/dark-patterns/page.tsx)**: a satire page mocking how a typical app would monetize this exact tool, kept as a public receipt against ever actually doing it.
- **["Get help now" buttons](app/src/app/page.tsx)**, always visible just below the form as a quiet text line (not a bordered callout - noticeable without competing with the actual product): no classifier, however well-tuned, catches every phrasing, so there's a direct, one-tap path to real help that doesn't depend on the classifier working at all, and doesn't require typing or explaining anything first. Language for the response is read from whatever you've typed, if anything; otherwise it defaults to English rather than guessing from browser/OS locale, which turned out to be an unreliable signal for what language someone's actually reading in.
- **[`/status`](app/src/app/status/page.tsx)**: plain page reading live server config (mock vs. live mode, rate limits, model).

## Guardrail categories

| Input reads as | Pathway | Behavior |
|---|---|---|
| Ordinary venting/frustration | **Clean** | Full three-tier rewrite, Rant Intensity Score, optional personas |
| CSAE, trafficking, extremist content, doxxing, fraud, weapons instructions, actual crime planning | **Hard NO** | Flat, immediate decline. No engagement, no cleverness. |
| Self-harm, suicidal ideation, eating-disorder content, or disclosure of being harmed by someone else (including indirect phrasing, not just literal trigger words) | **Serious** | No mascot, no jokes, no screenshot branding. Calming visual treatment (warm beige, muted sage/soft blue, nothing bright or saturated). Resource link plus emergency note. Self-harm gets a longer, creator-written message with practical things that helped; biased toward over-flagging rather than under-flagging. |
| Specific, credible threat of violence against a named real person (including euphemistic/indirect phrasing) | **Firm** | Polite, on-brand decline, paired with a distinct hard-stop audio tone: not comedic. |
| Prompt-injection attempts, hate speech, sexual content, other off-purpose use | **Witty** | Declines the request, pairs it with a quote picked server-side from a curated library (so it can't be tampered with client-side). |

## Multilingual support

Supported: **English, German, Spanish, Italian, French, Swedish, Russian.** The classifier detects the input's language and the whole per-request response follows it:

- The 3 tone rewrites and persona rewrites: generated live, in the detected language.
- The classifier's flagged-phrase reasoning: generated live, in the detected language.
- The self-harm/in-danger support text: **static, pre-translated per language** (not live-generated), since getting a crisis message's wording slightly wrong matters more than getting a rewrite's wording slightly wrong. Translated by Claude; a native-speaker review pass is still recommended before this goes fully live.
- The witty-pathway quotes: a separate, smaller **20-quote curated set per non-English language** (not a machine translation of the English 86), preferring standard/canonical translations for scripture and classical citations over fresh retranslation.

Deliberately **not** translated: House Rules, site chrome, `/status`, `/dark-patterns`, this README. The tool's actual output meets you in your language; the scaffolding around it doesn't need to yet.

## Sharing

- **Share on X**: opens a pre-filled tweet via `twitter.com/intent/tweet`, no OAuth, no API key. The app never touches your account.
- **Copy shareable link**: encodes only the *rewritten output* (never your original draft) into the URL. No backend storage.
- **Auto-generated Open Graph image**: code-generated at request time ([`opengraph-image.tsx`](app/src/app/opengraph-image.tsx)), so shared links get a real preview card.
- **Bookmarklet**: highlight text anywhere in your browser, click the bookmark, land on T-Rant with it pre-filled. See [`/bookmarklet`](app/src/app/bookmarklet/page.tsx).
- **Screenshot branding**: the input box and every non-serious result render inside a bordered card with a "🦖 T-Rant" band at both the top and bottom, so a manual screenshot carries the mark no matter where someone crops it.

## Visual & sound identity

Built around "small arms, big feelings": code-generated pixel art, no external image assets anywhere in this section.

- **Pixel T-Rex sprite** ([`lib/rexSprite.ts`](app/src/lib/rexSprite.ts)): one shared 18x14 silhouette (small arm included - that's the whole joke) with a distinct pose per tone/pathway - raised eyebrow for Still You Just Cooler, a necktie for Professional & Clear, an olive branch for Maximum Diplomacy, a stomping animation while a request is in flight, a stop sign plus a small meteor for witty-pathway blocks. Deliberately **no sprite at all** for Hard NO or the serious (self-harm/in-danger) pathway - those stay unbranded on purpose, per the guardrail design.
- **Square-wave sound effects** ([`lib/sounds.ts`](app/src/lib/sounds.ts)): oscillator-generated, not licensed audio files. A stomp on submit, a distinct click-triggered blip per tone (click a tone heading to hear it), the hard-stop tone for firm blocks, a "womp womp" for witty blocks. Silent by design for hard_no and the serious pathway.
- **Pixel favicon** ([`icon.tsx`](app/src/app/icon.tsx)): the same sprite geometry, server-rendered, so it can't drift from the in-app sprite.
- **Retro pixel font**: applied narrowly - the brand mark and short headers only, never body text or the House Rules Q&A sentences, since it's unreadable at that length.
- **Pixelated prehistoric background**: a faint fern band and a volcano behind the main page, hidden during the serious pathway so that state still visually steps out of the pixel theme entirely.

## Extras

- **Optional dialogue-context field**: a small "What did they say or do? (optional)" box below the main textarea, so a rewrite can respond to the other side's specific point instead of just neutralizing tone in a vacuum. Whatever's typed there is classified right alongside the main message (clearly labeled, not silently appended) before anything gets generated, so it can't be used to smuggle disallowed content past the guardrail just because it's in a second box.
- **Rant Intensity Score**: 1-10 rating of how heated the input reads, returned by the classifier alongside its label.
- **Rage thermometer**: a client-side-only heuristic meter that fills as you type, before you even submit (no API call).
- **[Unwind links](app/src/app/page.tsx)**: a curated set of links (Tetris, explore.org, r/aww, The Useless Web, 2048) shown after any response except the serious pathway, for stepping away instead of continuing to engage.
- **[Emergency numbers reference](app/src/app/emergency-numbers/page.tsx)**: a region-then-country dropdown showing a general emergency phone number, both standalone and embedded directly in the self-harm/in-danger result as a secondary option alongside `findahelpline.com`, which stays the primary, actively-maintained pointer. Most countries also show smaller-font secondary numbers (non-emergency police, domestic-violence hotlines, poison control, etc.) where there was reasonable confidence in a real, stable number. All 35 entries were cross-checked against Wikipedia's "List of emergency telephone numbers" plus targeted searches on 2026-08-17 (one real correction came out of it: India's ambulance figure, 102 → 108) and each shows its "last verified" date in the UI. Built instead of IP-based geolocation, which was explicitly ruled out. See the maintenance note in [`emergencyNumbers.ts`](app/src/lib/emergencyNumbers.ts) for how to re-verify going forward.
- A couple of things are hidden in here too. You'll know it when you find one.

## The full experience (planned)

The pipeline, safety architecture, transparency features, multilingual support, sharing, and visual/sound identity described above are all built and working. The rest of the intended experience is still ahead:

**Geo-routing.** Explicitly decided against: IP-based geolocation was ruled out in favor of the user-picked region/country dropdown described under Extras, which is now wired into the self-harm/in-danger pathway as a secondary option next to `findahelpline.com` (the emergency-numbers dropdown covers general emergency services, not crisis lines specifically). What's still pending is independently verifying each entry, currently drafted from general knowledge.

**Bonus features under consideration:**
- **Director's Cut**: a fourth, clearly labeled "for your eyes only, do not send" version, maximally unfiltered.
- **Diff-style explanations**: a short annotation per version explaining what changed and why.

## Status

**Shipped:** core two-stage pipeline, all five pathways, transparency features (including a Q&A-format House Rules page), House Rules with a live classifier sandbox, multilingual classification/generation/self-harm-content/quotes, Rant Intensity Score, five personas, rage thermometer, pixel-art T-Rex visual identity with per-pose sprites/sound/favicon/pixel font/background, sharing (X intent, output-only permalinks, OG image, screenshot branding), self-harm calming visual redesign, unwind links, emergency-numbers reference tool wired into the self-harm/in-danger pathway with per-country secondary helplines and all 35 entries independently verified, optional dialogue-context field, `/status`, `/dark-patterns`, bookmarklet, rate limiting, no-raw-text logging, content-editing (not just tone-softening) for the Professional & Clear and Maximum Diplomacy tiers.

**Planned:** a native-speaker review pass on the non-English self-harm/quote translations, the two remaining bonus features under consideration (Director's Cut, diff-style explanations), and deploying to Vercel.

Full spec: [`t-rant-MASTER-BUILD-BRIEF.md`](t-rant-MASTER-BUILD-BRIEF.md), [`t-rant-technical-spec.md`](t-rant-technical-spec.md), [`t-rant-safety-legal-update.md`](t-rant-safety-legal-update.md), [`t-rant-quotes-by-category.md`](t-rant-quotes-by-category.md), [`t-rant-phase2-brief.md`](t-rant-phase2-brief.md).

## Running locally

```bash
cd app
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
- Set `ANTHROPIC_API_KEY` to run against the real classifier/generator, **or**
- Set `MOCK_MODE=true` to exercise the full pipeline and UI with keyword-heuristic mocks instead: no API key or credits needed. This is a convenience for local development only; the mocks are crude regex matches meant to exercise the pipeline's shape, not a demonstration of real classification accuracy. See [`src/lib/mock.ts`](app/src/lib/mock.ts).

```bash
npm run dev
```

## Stack

Next.js (App Router, TypeScript) plus the Anthropic SDK, both pipeline stages on Haiku. Deploys to Vercel. No accounts, no database: classification category and a timestamp are the only things ever logged, and raw rant text is never persisted.

## Privacy & disclaimer

Demo/portfolio project, not professional communications software: rewrites are suggestions, use judgment before sending. Not a substitute for professional legal, HR, or mental-health advice; self-harm resources are informational pointers, not a clinical service. Full detail in [`t-rant-safety-legal-update.md`](t-rant-safety-legal-update.md) and the in-app [House Rules](app/src/app/house-rules/page.tsx) page.
