# T-Rant — Safety, Design & Legal Update

## 1. Self-harm handling — calming design + geolocation

### Colors and design
- **Muted sage/moss green and soft blue** — reads as safe without feeling clinical.
- **Warm neutral beiges/taupes**, not stark white — stark white reads as "hospital."
- **Avoid bright saturated colors entirely for this state** — red/orange/yellow, even though they're the normal T-Rex palette elsewhere.
- **No celebratory or gamified elements in this state** — no confetti, no cheerful mascot, no upbeat animation. The pixel T-rex and its animations should disappear entirely for this screen, not just change color.
- Layout stays sparse — one clear resource, one clear action, minimal text.

### Geolocation
Use **IP-based geolocation** (server-side, no browser permission prompt) to route to region-appropriate resources — good enough to distinguish Ireland from the US. Don't use browser GPS geolocation; it's more precise than needed and requires an explicit permission prompt that would interrupt the moment.

### Resource routing
- Ireland → Samaritans Ireland (116 123) and Pieta House
- UK → Samaritans (116 123)
- US → 988 Suicide & Crisis Lifeline
- Elsewhere → findahelpline.com, which routes by region automatically

## 2. Content categorization

Two categories added beyond the original Meta-standards list, since they're standard across LLM safety policies and plausible misuse for a "rewrite this message" tool: **fraud/scam content** and **weapons/dangerous-instruction requests disguised as message content**.

| Category | Pathway | Why |
|---|---|---|
| Child Sexual Exploitation, Abuse and Nudity | **Hard NO** | Zero-exception category, no engagement beyond refusal |
| Human Exploitation (trafficking, forced labor) | **Hard NO** | Same tier |
| Dangerous Organizations and Individuals (praise/support/coordination) | **Hard NO** | Distinct from ordinary hate speech — organized/extremist content specifically |
| Coordinating Harm / Publicizing Crime (actual operational planning) | **Hard NO** | Distinguish from angry hyperbole — "I want to kill my manager" as frustration vs. an actual plan |
| Privacy violations (doxxing, sharing someone's private info) | **Hard NO** | — |
| Fraud/scam content | **Hard NO** | Plausible misuse of a "make this sound better" tool |
| Weapons/dangerous instructions disguised as rant content | **Hard NO** | Standard LLM safety catch-all |
| Specific, credible threats of violence against a real, named person | **Firm pathway** (polite, on-brand, not comedic) | More serious than venting, not yet "coordinating harm" tier |
| Self-harm or suicide ideation, any form | **Support pathway** | Serious, resource-first, no mascot |
| Eating-disorder-related content | **Support pathway** | Same sensitivity tier as self-harm |
| "I'm in danger" / disclosure of being harmed by someone else | **Support pathway** | Needs resources, not humor |
| Prompt injection / jailbreak attempts | **Witty pathway** | Low stakes |
| Attempts to extract the system prompt | **Witty pathway** | Subset of the above |
| Hate speech (garden-variety, not organized) | **Witty pathway** | Distinguish from Dangerous Orgs tier above |
| Sexual content (non-exploitative, just inappropriate for the tool) | **Witty pathway** | — |

## 3. Required site content — privacy notice & disclaimer

Not a lawyer; this is the factual landscape, worth a real consult before an actual public launch. GDPR applies (Ireland-established controller, binds regardless of visitor location or non-profit status), and the operating rule that removes most of the compliance burden is already in the technical spec: never log raw rant text, only classification category + timestamp.

**Privacy notice — required content:**
- What's collected (ideally: nothing beyond what's needed to generate the response)
- That Anthropic's API processes the submitted text
- That an IP address is read (for regional resource routing) but not stored
- No accounts, tracking, or analytics (or, if analytics get added later, use a cookie-free tool like Plausible/Fathom rather than one requiring a consent banner)

**Disclaimer — required content:**
- Demo/portfolio project, not professional communications software — the AI's rewrites are suggestions, use judgment before sending
- Not a substitute for professional advice (legal, HR, or mental health) — self-harm resources are informational pointers, not a clinical service
- Third-party unwind links go to sites not controlled by T-Rant
- The bookmarklet is optional — manually pasting text into the box works identically; the bookmarklet is a shortcut for frequent use, never a requirement

Playful heading option to keep tone consistent: *"The Fine Print (Read By Zero T-Rexes, But You Should)"* — followed by the actual plain-language content underneath.

## 4. Tetris link

Link out to Tetris's official site rather than building a clone — sidesteps The Tetris Company's trademark/trade-dress enforcement entirely, since nothing is being reproduced. Copy note: don't claim clinical proof for the post-rant use case specifically — safe phrasing is something like "inspired by research showing this kind of puzzle can help quiet a racing mind."

## 5. Post-rant "unwind" links

A curated set of 3-4 shown as buttons after the AI's response, so the person picks whatever fits their mood.

**Disclaimer, in T-Rant voice** (goes just above the buttons):

> *You're leaving T-Rant territory. Everything past this point is somebody else's swamp — we don't control it, vouch for it, or get a cut of your afternoon. Wander at your own risk.*

**The links, each with a short witty tag and an icon:**

- 🕹️ **Tetris (official site)** — *Stack blocks, not grudges.*
- 🦦 **[explore.org](https://explore.org)** — *Live animal cams. Zero drama, all whiskers.* Reputable nonprofit nature-cam network — puppies, pandas, otters, all in one stable place.
- 😻 **[reddit.com/r/aww](https://reddit.com/r/aww)** — *Scroll until your blood pressure forgives you.* No login needed.
- 🎲 **[theuselessweb.com](https://theuselessweb.com)** — *One button, zero purpose, somehow it helps.*
- 🧩 **[play2048.co](https://play2048.co)** or **[NYT Wordle](https://www.nytimes.com/games/wordle)** — *Swap one puzzle for a smaller, friendlier one.*

Icons: emoji for v1 (zero-cost). Custom pixel-art icons matching the sprite style are a phase-two polish item, not a launch blocker.

## 6. Bookmarklet

**Mechanics:** `window.getSelection().toString()` grabs whatever text is highlighted on the current page (works identically across sites — Gmail, Slack, anywhere — since it's a browser-level API, not site-specific DOM scraping). Opens T-Rant in a new tab with the text passed as a URL parameter (e.g. `?rant=...`), which the page reads on load and pre-fills into the textarea.

```javascript
javascript:(function(){
  var text = window.getSelection().toString();
  window.open('https://t-rant.vercel.app/?rant=' + encodeURIComponent(text), '_blank');
})();
```

**Required behavior:** if nothing is selected, open T-Rant with an empty textarea — no error.

**Known limitations to note in copy, not fix:** primarily a desktop-browser feature (unreliable inside mobile in-app browsers like Slack's built-in browser); the passed text briefly appears in the user's local browser history (not sent anywhere beyond that — worth a line in the disclaimer, already included above).

**Copy for the "drag to bookmark" page**, framed to lower the hesitation of bookmarking an unfamiliar site:

> *This tool is free to use — no payment, no account, no commitment. You can always just come back here and paste your rant in manually; that works fine on its own, no setup needed. If you end up using T-Rant a lot, drag this button to your bookmarks bar instead — then anytime you want to send something here, highlight the text wherever it is (a draft in Gmail, a message in Slack, anywhere in your browser) and click the bookmark. It only ever grabs text when you actually click it — nothing happens automatically just from selecting text. Totally optional either way.*

(One wording note on an earlier draft of this copy: avoid describing the tool as "emotional support" — that phrase edges toward sounding like a mental-health service claim, which directly conflicts with the disclaimer's own line that this isn't a substitute for professional mental health support. "Helps you vent and reword messages before you send them" says the same thing without that risk.)
