# T-Rant — Master Build Brief

**Read this file first.** It indexes the other files, and — importantly — captures a chunk of decisions that only ever existed in conversation and never made it into a file until now. If you only send Claude Code one thing to start with, send this one, and point it at the others alongside it.

**Phase 1 (core pipeline) is built and working** — see the repo's own README for current status. **Phase 2 planning is captured in `t-rant-phase2-brief.md`** (file 5 below): transparency/trust features, House Rules page, shareability, multilingual scope, quote localization. Read it after the original four files if resuming this project for phase 2 work.

## Files in this project folder

1. **This file** — overview, the gaps, open decisions, suggested build order (phase 1).
2. **`t-rant-technical-spec.md`** — guardrail architecture (2-stage classifier + generation pipeline), the four response pathways, operational parameters, visual/sprite design, sound design. Partially superseded — see file 5 for a classifier output schema addition.
3. **`t-rant-safety-legal-update.md`** — self-harm design specifics (colors, geolocation, resource routing), the full content categorization table, GDPR/legal considerations, Tetris research + link-out decision, unwind links with copy, bookmarklet mechanics and disclaimer copy, general site disclaimer. Partially superseded — see file 5 for a per-language resource text addition.
4. **`t-rant-quotes-by-category.md`** — the 86-quote library, categorized and formatted. This is the current source of truth for **English** quotes — an earlier draft inside the technical spec has been marked superseded. File 5 covers the non-English quote sets.
5. **`t-rant-phase2-brief.md`** — phase 2 decisions: transparency features, House Rules page, shareability, multilingual scope, quote localization, unconventional UX additions.

## What's in this file that isn't anywhere else

### Input constraints
- **Character limit on the rant textarea: ~2000 characters.** Reasoning: covers any realistic heated Slack message or email with room to spare, keeps worst-case cost per request predictable, and discourages someone pasting in a full document to abuse the tool as a free general-purpose text processor.

### Rate limiting & cost controls
- **Rate limit: roughly 10 requests per IP per hour**, enforced at the serverless function level. This is the actual defense against someone scripting the endpoint to run up costs — a few lines of code, several ready-made libraries exist for this on Vercel/Netlify functions.
- **Budget alert: set a soft spending cap with email notification in the Anthropic Console** (a reasonable starting point is around $5) as a backstop in case rate limiting misses something.
- **Model choice:** Haiku for both the classifier *and* the generation step. The task (classify short text; rewrite short text in three tones) doesn't need a larger model, and Haiku keeps the whole thing well under a cent per submission even with the two-call pipeline.

### The four "stand-out" features — not written up anywhere until now
These came out of a competitive-differentiation brainstorm (after finding that "angry message → professional rewrite" already exists as a concept in several forms — Angry Email Translator, Anger Translator, AI Corporate Translator — none of which have any visible guardrail architecture, personality, or workflow integration). All four are cheap enough to bundle into the first prototype rather than defer:

1. **Director's Cut.** A fourth, hidden option alongside the three diplomacy tiers — the maximally unfiltered version of what the person actually wants to say, clearly labeled something like *"for your eyes only — do not send"*. Not a guardrail bypass; it's a catharsis feature, generated the same as the other three tiers, just never intended for sending. One extra generation call, no new architecture.
2. **Diff-style explanation.** Alongside each of the three (or four) output versions, a short annotation of what changed and why — e.g., *"swapped 'this is unacceptable' → 'I'm concerned about' (removes the accusatory framing)."* Requires extending the structured output schema to include a short reasoning field per edit, not a new pipeline stage.
3. **Optional dialogue-context field.** A second, optional textarea: "what did they say or do?" — lets the rewrite actually respond to the other side's point instead of just neutralizing tone in a vacuum. One more optional input field, passed into the same generation prompt as extra context.
4. **Rant Intensity Score.** A playful 1-10 (or "extinction event scale") rating of how heated the original draft was, shown before the translated versions. The classifier call can return this alongside its category label — no extra model call needed, just one more field in the same structured output.

### Multilingual generation
- **The tone-rewriting itself should work in whatever language the person writes in** — Claude is natively multilingual, but this needs an explicit system-prompt instruction ("detect the input language and produce all output in that same language"); don't assume it happens automatically without that line.
- **The quote library is English-only for now**, and that's a known, acceptable v1 limitation — translating it properly (using canonical source-language versions of religious/historical texts, not machine-retranslating the English versions) is a separate follow-up task, not a blocker.
- **Planned language list for that future quote-translation pass:** German, French, Spanish, Italian, Russian, Swedish, Portuguese, Japanese. Swedish was picked over other Nordic languages for broadest regional reach; Mandarin and Arabic were deliberately deferred (Claude's accessibility in mainland China needs checking, and Arabic's right-to-left layout is a real UI project on its own, not just a translation task).

## Chosen headline

**"Rawr. Who or what deserves it today?"** — decided.

## Question options considered (for reference)

The other nine options that were on the table, kept here for reference in case the chosen one doesn't land well once live and a swap feels right:

1. "What's on your mind?" — neutral
2. "What do you need to get off your chest?" — neutral
3. "What's frustrating you today?" — neutral
4. "Something worth venting about?" — casual
5. "Before you hit send — what's really going on?" — practical, slightly witty
6. "Give me the unfiltered version. What happened?" — direct
7. "What's got you ready to roar?" — light dino pun
8. "What's stomping on your last nerve today?" — medium dino pun
9. "Time to let the T-Rex out. What's going on?" — full brand tie-in

## Recommended v1 scope

**Core (must-have for a working prototype):**
- Single-page site, three-tier tone translation, 2000-char input cap
- Two-stage classifier + generation pipeline (Haiku both stages), full guardrail categorization from the safety-legal-update table
- Self-harm serious pathway with calming redesign + geo-routed resources
- Witty pathway with quote mechanic (random pick from the 86-quote library)
- Pixel T-Rex visual identity, sprite states per tone, click sounds via Web Audio API
- Unwind links section with the T-Rant-voiced disclaimer
- General site disclaimer (including the bookmarklet-is-optional note)
- Rate limiting + budget alert
- Hosted free on Vercel (no domain purchase needed for v1)

**Bundle in if it's not adding real friction (all confirmed cheap):**
- Director's Cut, diff-explanation, dialogue-context field, Rant Intensity Score
- The bookmarklet (confirmed to try, with the softened "no pressure to commit" framing on the drag-to-bookmark page)
- Multilingual generation (the prompt-instruction version, not the quote translation)

**Explicitly later, not v1:**
- Quote library translation into the 8 target languages
- Custom pixel-art icons for the unwind links (emoji are the v1 stopgap)
- Voice input via Web Speech API (mentioned once as an idea, never scoped — treat as a maybe, not a commitment)
- Any custom domain purchase

## Suggested opening message for Claude Code

Once all four files are saved into your local project folder (not a OneDrive-synced one):

> *Read t-rant-MASTER-BUILD-BRIEF.md first, then t-rant-technical-spec.md, t-rant-safety-legal-update.md, and t-rant-quotes-by-category.md in this folder. That's the complete spec for a project called T-Rant. Let's start with the core pipeline (input → classifier → generation → three tone versions) before layering in the visual design and extra features.*
