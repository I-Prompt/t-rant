# T-Rant — Phase 2 Brief (Trust, Delight & Multilingual Expansion)

**Read this after the original four files** if picking this project back up for phase 2 work. This came out of a second planning session focused on one question: with "angry message → diplomatic rewrite" now a crowded AI-tool category, what makes T-Rant stand out? The answer landed on two pillars — **provable transparency** (the opposite of black-box AI moderation) and **shareable delight** — plus a scoped multilingual pass. Everything below is a confirmed decision, not a brainstorm list.

## Files in this project folder (updated)

1. `t-rant-MASTER-BUILD-BRIEF.md` — v1 overview, still the starting point.
2. `t-rant-technical-spec.md` — v1 pipeline architecture. **Superseded in part**: see "Classifier output schema" below for an addition to Stage 1's return shape.
3. `t-rant-safety-legal-update.md` — v1 safety/legal design. **Superseded in part**: see "Self-harm pathway" below for the per-language resource text addition.
4. `t-rant-quotes-by-category.md` — the 86-quote English library, still current for English.
5. **This file** — phase 2 decisions: transparency features, House Rules page, shareability, multilingual scope, quote localization, unconventional UX additions.

---

## 1. Transparency & trust features

The throughline: don't just say "trust us," make things checkable. People get angry at platforms that block content with no explanation — the fix isn't nicer copy, it's showing your work.

### Classifier output schema — flagged phrases
Stage 1 (classifier) return shape gets one addition beyond the category label:

```
{ category: string, flaggedPhrases: string[], reason: string }
```

- `flaggedPhrases`: up to 2 verbatim substrings copied from the user's actual input — not paraphrased, not a generic category description.
- `reason`: one sentence, under 15 words, plain language.
- Applies to every non-`clean` category (`hard_no`, `self_harm`, `in_danger`, `violent_threat`, and the witty-pathway categories). `clean` responses don't need it — the person just gets their three rewrites.

### "Type it anyway" — inline, not in House Rules
Originally scoped as a separate House Rules explainer; moved. **When a response is blocked under any non-`clean` category, the block response itself shows the user's raw original text back to them, with the flagged phrases highlighted** (bold or a colored span — whatever's cheap in the chosen UI approach). This is the actual proof the tool isn't silently gaslighting them: they see exactly what they typed and exactly what tripped the block, in the same place, immediately — not buried in a separate page they have to go find.

Example shape:
```
⚠ Blocked: violent threat
"I swear I will find you and **make you pay** for this"
That's a threat, not anger — we don't rewrite those.
```

### Privacy / training statement
Non-committal but honest wording, doesn't promise something that could go stale if Anthropic's terms change:

> *All responses are generated using Anthropic's API, which — at the time this site launched — does not use API inputs to train their models. Policies can change; for the most current information, see [Anthropic's official data usage policy](#).*

Link to Anthropic's actual current privacy/data-usage page, not a paraphrase asserted as permanent fact.

### Verifiability, for non-technical users
Pair the statement above with a plain-language pointer to `src/lib/` in the GitHub repo — where the "only category + timestamp is logged, never raw text" logging actually lives. For a non-technical reader, spell out what that means in practice, e.g. in the README/House Rules:

> *Don't take our word for it — the code that decides what gets saved is public. Open the [`src/lib` folder](#) on GitHub, look at the files handling logging, and you'll see the actual lines of code. You don't need to read code to get the point: there's no hidden file, database, or service where your rant text goes. What you see in that folder is everything.*

### Rate-limit counter
Show remaining requests on every response (e.g. "7 of 10 rants left this hour"), not a silent 429 when the limit is hit.

### Dark-pattern promise
A short, explicit "things we will never add" list — no ads, no reselling text, no model training on inputs, no fake urgency/scarcity, no paywalling a feature that already works for free. Lives on its own page (see #6 below) and is also linked from House Rules.

---

## 2. House Rules page — final structure

(Supersedes the earlier draft structure — "type it anyway" removed, since it now lives inline per #1 above.)

- What the 3 tones mean — precise, opinionated definitions, one real before/after example each
- How flagging works, with 2-3 example phrases per category (self_harm, violent_threat, hard_no, injection/hate/sexual/other) — the categories themselves, not a live demo
- Live classifier demo — type anything, see the category + flagged phrases returned, no rewrite generated (a safe sandbox to probe the system)
- Privacy/data notice (the statement + verifiability pointer from #1)
- Dark-pattern promise (linked from #1, full list lives on its own page)
- Legal/liability notice, in particular around the self-harm pathway (not a crisis service, informational only)
- Link to rate limits and the `/status` page

---

## 3. Self-harm pathway — additions

Two changes on top of the v1 design in `t-rant-safety-legal-update.md` section 1:

**Safe-messaging conventions.** The support-pathway copy should follow the conventions crisis orgs actually use: "died by suicide," not "committed suicide"; never include methods or means; don't minimize ("just calm down"); always pair the text with a real resource link; an explicit "this is not a crisis service" line, since there's no confidentiality or professional relationship being implied.

**Per-language resource text — static, not live-translated.** Unlike the tone rewrites (which auto-translate live via the model, see #4), the self-harm support text is the highest-stakes copy in the app. It should be **written once in English, then pre-translated and human-reviewed for each supported language, stored as static strings**, and selected based on the detected input language — not generated live per request. Getting a joke's translation slightly off is cheap; getting a crisis message's translation slightly off is not. `findahelpline.com` already resolves by region/country regardless of language, so the outbound resource link doesn't need separate per-language handling.

---

## 4. Multilingual scope — explicit boundary

Supported languages: **English, German, Spanish, Italian, French, Swedish, Russian.**

**In scope for translation:**
- The 3 tone-rewrite outputs (Stage 2 generation) — respond in the same language as the input, via explicit prompt instruction
- The classifier's flagged-phrases/reason explanation (#1) — same mechanism, live via the model, since it's generated per-request like the rewrites
- The self-harm support text — static, pre-translated, human-reviewed (see #3)
- The witty-pathway quote set — see #5, handled separately since it's curated content, not generated

**Explicitly out of scope — stays English-only:**
- House Rules page and everything inside it
- All UI chrome (buttons, labels, the dark-pattern page, `/status` page)
- README and any other project/meta content

Rationale: the app's functional output should meet people in their language; the site's own scaffolding and legal/meta content does not need to for a portfolio-stage project, and keeping it English avoids a much larger i18n surface (UI string library, translation file maintenance) for content that isn't the actual product.

**Difficulty note, for planning purposes:** classifier/generator prompt changes are low-medium effort (mostly prompt instructions + per-language spot-checking, since profanity/slur detection quality needs manual verification per language, not blind trust). Quote localization (#5) is the long pole. Self-harm text is a fixed, one-time translation-and-review cost per language.

---

## 5. Quote library — localization plan

Framing change: drop "not AI-generated" language around the quotes (it invites the obvious "how would we know" pushback). State only that they're **hand-picked** — true, checkable in spirit, no unprovable claim attached.

**English:** stays the full 86-quote library, unchanged, from `t-rant-quotes-by-category.md`.

**Other 6 languages:** a separate, smaller **20-quote set per language**, chosen (not translated 1:1 from the English 86) to cover as much of the category spread as possible — hate-speech/venting, injection attempts, sexual content, general. For each quote:

1. Check first whether an **official/canonical translation already exists** in that language (many of the sourced quotes are scripture, classical philosophy, or well-known historical speeches with established standard translations) — use that where it exists, rather than retranslating from the English version and compounding translation drift.
2. Where no canonical version exists (modern quotes without an authoritative foreign-language translation), get a proper adaptation done — not a literal machine translation, since humor and register rarely survive that intact.

This is real editorial work per language, not a bulk translation pass — budget it as such.

---

## 6. Unconventional UX additions

All confirmed for phase 2:

- **Easter eggs.** Several hidden triggers (e.g. a konami-code-style input, a fake terminal command) unlocking bonus Rex animations or quote variants. Mention their existence in the README as a hint, without spoiling specifics — "a few things are hidden in here, you'll know it when you find one."
- **Keyboard-only flow.** The entire submit → result → share pipeline usable via tab/enter alone, no mouse required.
- **Cooldown-timer mini-interaction.** Replace a generic spinner with an in-theme wait state — pixel Rex pacing/stomping animation — while the API call is in flight.
- **Rage thermometer.** A client-side-only heuristic meter that fills as the person types, before submission — no API call involved, just local text analysis (length, punctuation intensity, caps-lock ratio, etc.) as a lightweight preview.
- **Sound design tied to category, not just tone.** Deliberate silence for the self-harm/in-danger pathway (consistent with the "no mascot, no theatrics" design in the v1 spec); a distinct hard-stop sound for `violent_threat`; existing click-triggered square-wave SFX for the 3 tones stays as-is.
- **Dark-pattern audit page.** A standalone page mocking how a typical app *would* monetize this exact tool (fake "upgrade to unlock more calm" paywall mockups, fake urgency banners) — clearly labeled as satire, explicitly not implemented, linked from the dark-pattern promise in #1.

### Personas — 5 new tone presets, beyond the 3 diplomacy tiers
Picked for meme/format recognizability — each maps to an already-popular online humor genre, which is what gives them share potential:

1. **Corporate memo** ("per my last email" energy)
2. **Victorian/Shakespearean letter** (formal insult-as-art genre)
3. **Legal cease-and-desist** (the "sent from my lawyer" joke format)
4. **Haiku**
5. **Nature-documentary narrator** (Attenborough-voiceover-style description of the rant)

Same generation mechanism as the 3 core tones — additional prompt variants, not a new pipeline stage.

---

## 7. Shareability

Goal: give this real viral potential without touching the "zero accounts, zero tracking" promise anywhere.

- **Styled image-card export.** Before/after (or persona) text rendered as a shareable image sized for X/social, with any named third party redacted/blurred by default.
- **Rant Intensity Score, as a retro pixel gauge**, rendered onto the same share-card image (ties #6's classifier-returned intensity field to something visual and screenshot-worthy).
- **Twitter/X share via intent link only** — `twitter.com/intent/tweet?text=...`, no OAuth, no API key, no login. The user reviews and posts from their own account; the app never touches their social credentials or posts on their behalf. This is the main lever for share reach without any trust cost.
- **Open Graph meta tags** (with the Rex mascot image) so any shared link actually renders a preview card instead of bare text — a prerequisite for the above actually working when pasted anywhere.
- **Output-only permalinks.** Encode the *generated output* (never the original rant) into a shareable URL (e.g. base64 in a query param) so a specific witty response or persona result can be linked directly — no backend storage needed, nothing server-side to leak.

**Explicitly not doing:** a live anonymous usage counter ("1,284 rants defused today"). Confirmed cut — not worth the added surface for the social-proof value it'd add.

---

## 8. Portfolio / technical additions

- **`/status` page.** A plain route (e.g. `app/status/page.tsx`) showing pipeline health at a glance: `MOCK_MODE` on/off, current rate-limit config, and similar operational state. No separate service or config step — it's just another page in the same Next.js app, reading existing env/config at request time.
- **README rewrite.** Full rewrite for visual clarity, not just prose: an actual architecture diagram of the 5-pathway decision tree (classifier → hard_no / self_harm / in_danger / violent_threat / witty / clean→generation), plus a clear rundown of what's now in scope — multilingual support, the transparency features from #1, the quote-localization approach, and the trust/no-tracking posture. Recruiters skim READMEs; a diagram earns more attention than another paragraph.

---

## 9. Sequencing notes

- **Bookmarklet** (already spec'd in `t-rant-safety-legal-update.md` section 6, mechanics unchanged): build last among the confirmed features. It's a distribution convenience, not a differentiator — lower priority than the transparency and shareability work above.
- Recommended order: transparency/trust features (#1-3) and House Rules (#2) first, since they're foundational to the "why trust this" story → multilingual pipeline changes (#4) → quote localization (#5, the slowest editorial task, can run in parallel once scoped) → UX delight additions (#6) → shareability (#7) → portfolio polish (#8) → bookmarklet last.
