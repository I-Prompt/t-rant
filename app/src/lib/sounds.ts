// Square-wave SFX via Web Audio oscillator nodes, not licensed audio files —
// no licensing question, and closer to genuine 90s game audio. See
// t-rant-technical-spec.md "Sounds." Every export here must be called from
// inside a click-handler call stack: browsers block audio that isn't tied to
// a user gesture, and the AudioContext is created on click for that reason
// (see page.tsx).

function beep(
  ctx: AudioContext,
  freq: number,
  duration: number,
  delay = 0,
  gainLevel = 0.12
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(gainLevel, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// Firm pathway (violent_threat): a hard, flat stop. Not comedic.
export function playHardStopTone(ctx: AudioContext) {
  beep(ctx, 140, 0.35, 0, 0.15);
}

// Witty pathway block: a descending "womp womp" - deliberately silly, matches
// the quote-instead-of-a-rewrite tone of that pathway.
export function playWittyWomp(ctx: AudioContext) {
  beep(ctx, 300, 0.15, 0);
  beep(ctx, 220, 0.22, 0.13);
}

// Loading state: a short double-thud, echoing the stomping-legs sprite.
export function playStomp(ctx: AudioContext) {
  beep(ctx, 90, 0.08, 0, 0.1);
  beep(ctx, 80, 0.08, 0.12, 0.1);
}

// One distinct click-triggered blip per tone tier, played when a tone
// heading is clicked - see t-rant-phase2-brief.md section 6. Pitch/rhythm
// tracks each tier's personality: blunt and low for Still You Just Cooler,
// a clipped two-note "professional" rise for Professional & Clear, a softer
// single note for Maximum Diplomacy.
export type ToneKey = "still_you_just_cooler" | "professional_clear" | "maximum_diplomacy";

export function playToneBlip(ctx: AudioContext, tone: ToneKey) {
  if (tone === "still_you_just_cooler") {
    beep(ctx, 220, 0.12, 0, 0.12);
  } else if (tone === "professional_clear") {
    beep(ctx, 330, 0.08, 0, 0.1);
    beep(ctx, 392, 0.1, 0.08, 0.1);
  } else {
    beep(ctx, 523, 0.16, 0, 0.07);
  }
}

// Hero-sprite click, a little three-note roar - purely a mascot easter egg,
// only ever wired to the idle hero Rex (never shown/clickable in stealth,
// where the sprite itself is hidden).
export function playRoar(ctx: AudioContext) {
  beep(ctx, 180, 0.09, 0, 0.13);
  beep(ctx, 260, 0.09, 0.08, 0.13);
  beep(ctx, 200, 0.15, 0.16, 0.11);
}

// Clean-result arrival - an upbeat ascending triad, pairs with the confetti
// burst in page.tsx. Never plays for hard_no/firm/witty/serious - each of
// those already has its own distinct cue (or, for hard_no/serious, none).
export function playSuccessChime(ctx: AudioContext) {
  beep(ctx, 440, 0.09, 0, 0.09);
  beep(ctx, 554, 0.09, 0.08, 0.09);
  beep(ctx, 659, 0.15, 0.16, 0.09);
}

// Soft tick synced to the rotating loading-state message, so the copy
// change reads as intentional rather than a silent flicker. Deliberately
// quiet - it repeats every ~1.4s while a request is in flight.
export function playLoadingTick(ctx: AudioContext) {
  beep(ctx, 300, 0.04, 0, 0.05);
}
