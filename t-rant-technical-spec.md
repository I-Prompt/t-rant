# T-Rant — Technical Spec

## Guardrail architecture

Two-stage pipeline, not one big prompt trying to do everything at once: a dedicated classification pass, isolated from the generation call, is much harder to talk past than a single prompt juggling "classify AND respond."

**Stage 1 — Classifier (Haiku).** Takes the raw input, wrapped in clear delimiters (e.g. `<user_input>...</user_input>`) with an explicit instruction that anything inside those tags is data to evaluate, never instructions to follow — this is the actual defense against "ignore your instructions" style attacks, not just asking the model nicely. Returns one label:

- `clean` → proceed to Stage 2
- `hard_no` → immediate flat decline, no cleverness — covers CSAE, human exploitation, dangerous organizations/individuals, actual operational harm planning, privacy violations/doxxing, fraud or scam content, and weapons/dangerous-instruction requests. See `t-rant-safety-legal-update.md` section 2 for the full category-by-category table this label maps to.
- `self_harm` (including eating-disorder content) → serious pathway, skip everything else
- `in_danger` (disclosure of being harmed by someone else) → serious pathway, same as self_harm
- `violent_threat` (specific, credible threat against a named real person) → firm pathway
- `injection_attempt` → witty pathway
- `hate_speech` (garden-variety, not organized/extremist) → witty pathway
- `sexual_content` → witty pathway
- `other_disallowed` → witty pathway (catches attempts to extract the system prompt, or anything else that doesn't fit the other buckets but is clearly off-purpose)

**Stage 2 — Generation (only runs on `clean`, Haiku).** The actual three-tier translation.

**Copy rule: never claim "unhackable" anywhere in the UI, README, or marketing copy.** The defensible claim is the layered architecture itself (role separation, isolated classification pass, generation that never sees a raw "clean" verdict it can talk itself out of) — not a bulletproof guarantee.

### The four response pathways

**Hard NO.** Flat, immediate decline — no engagement, no cleverness, no quote, no sprite/mascot treatment of any kind. Anything involving the sexualization of minors should be enforced as a rule above the classifier too, not dependent solely on the model's judgment call.

**Serious pathway (self-harm, eating-disorder content, "I'm in danger" disclosures).** No mascot, no animation, no quote. The page visually steps out of the pixel theme entirely for this state — plain, calm, text plus a link to a real crisis resource directory (findahelpline.com routes by region without needing to guess the user's location).

**Firm pathway (specific, credible violent threats against a named real person).** Distinct from hate-speech-flavored venting or hyperbole. Polite decline, not comedic — on-brand visually but without the joke or quote.

**Witty pathway (injection attempts, hate speech, sexual content, other misuse).** This is where the quote mechanic lives.

### Operational parameters
- Both pipeline stages run on Haiku.
- Don't log raw rant text, for any category, ever. Log only the classification category and a timestamp, for abuse monitoring.
- Bias the self-harm/in-danger classification toward over-flagging rather than under-flagging.
- Rate limit: roughly 10 requests per IP per hour, enforced at the serverless function level.

## The quote library

**See `t-rant-quotes-by-category.md`** — the 86-quote library, categorized by which pathway trigger each quote suits, is the current source of truth. Selection should happen server-side, from whichever category array matches the classifier's trigger, so it can't be tampered with from the browser.

## Visual design — playing the T-Rex angle

**Superseded 2026-08-19:** the "small arms, big feelings" tagline below was dropped from all user-facing copy (README, in-app brand band, easter egg) — it reads as a joke at the expense of people with limb differences, which isn't the intent. Tagline is now "Big feelings. Smart translation." The tiny-arm detail stays in the pixel sprite itself (see `lib/rexSprite.ts`) as a small visual gag, not a spoken/written phrase.

**Core bit:** small arms, big feelings. Leaning into the tiny-T-rex-arms meme ("small arms, big feelings, smart translation") is funnier and safer for a corporate audience than trying to make the dinosaur look intimidating.

**Sprite states, one per tone plus special states:**
- *Still You, Just Cooler* — T-rex with a raised eyebrow, arms as crossed as tiny arms get, unimpressed but composed.
- *Professional & Clear* — tiny pixel necktie, standing straight, neutral expression.
- *Maximum Diplomacy* — soft eyes, holding a small pixel olive branch or flower.
- *Idle/loading* — stomping legs animation while the request processes ("T-Rex is thinking...").
- *Blocked (witty pathway)* — T-rex holding up a small pixel stop sign or shaking its head; a small **meteor icon** as an "extinction event" wink pays off here (e.g., "This one's an extinction-level HR event. Try again.").
- *Hard NO* — no playful sprite treatment. Flat, minimal refusal, no mascot theatrics of any kind.
- *Serious pathway (self-harm)* — no sprite at all, deliberately. Should look nothing like the rest of the site.

**Sounds.** Generate simple square-wave beeps/stomps directly with the Web Audio API (an oscillator node) rather than sourcing external SFX files — no licensing question, and more thematically accurate to genuine 90s game audio. Trigger on click events only (browsers block audio autoplay without a prior user interaction, but click-triggered sound is exactly the allowed case).

**Other visual touches:**
- Pixelated prehistoric background — ferns, a volcano, optionally a tiny meteor animating across the sky as a loading-state easter egg.
- Retro blocky pixel font for headers (e.g. "Press Start 2P," freely available).
- Favicon: a small pixel T-rex head.
- Tagline candidates: "Small arms. Big feelings. Smart translation." or "Rant like a T-Rex, sound like a diplomat."
