// Shared pixel-art geometry for the T-Rex mascot, consumed by both the
// client-rendered sprite (page.tsx, SVG rects) and the server-rendered
// favicon (icon.tsx, ImageResponse/Satori divs) so the two can never drift
// out of sync. The silhouette is defined as horizontal spans rather than a
// hand-aligned character grid — easier to adjust reliably — and the dark
// outline is derived automatically from any filled cell that touches an
// empty neighbor, rather than hand-picked.

export const REX_GRID_W = 18;
export const REX_GRID_H = 14;

type Span = [number, number]; // inclusive x range

// Side profile, head/jaw at the right, tail tapering to a point at the
// left, two legs planted at the bottom. Row index = y (0 at top).
const BODY_ROWS: Span[][] = [
  [[11, 14]], // 0  head top
  [[10, 15]], // 1  head
  [[10, 16]], // 2  head + eye row
  [[9, 15]], // 3  jaw
  [[7, 14]], // 4  neck
  [[5, 13]], // 5  neck into body
  [[3, 12]], // 6  body
  [[1, 12]], // 7  body, widest
  [[0, 11]], // 8  tail tip reaches the left edge here
  [[2, 10]], // 9  tail tapering back in
  [
    [5, 7],
    [9, 11],
  ], // 10 legs begin, gap between them
  [
    [5, 7],
    [9, 11],
  ], // 11
  [
    [5, 7],
    [9, 11],
  ], // 12
  [
    [5, 7],
    [9, 11],
  ], // 13 feet
];

const EYE = { x: 14, y: 2 };
// The tiny arm: a 2-cell stub hanging from the chest, deliberately drawn in
// body color (not the auto-derived outline) so it reads as a small green
// limb rather than blending into the jawline outline above it — "small
// arms, big feelings" is the whole bit, so this needs to actually be seen.
const ARM_CELLS = [
  { x: 13, y: 7 },
  { x: 13, y: 8 },
];
const BELLY_ROWS = new Set([7, 8, 9]);

export const REX_OUTLINE = "#2d2a24";
export const REX_BODY = "#6b8f71";
export const REX_BELLY = "#b9c9b0";
export const REX_EYE = "#f5f0e6";

export interface RexCell {
  x: number;
  y: number;
  color: string;
}

function filledSet(): Set<string> {
  const set = new Set<string>();
  BODY_ROWS.forEach((spans, y) => {
    spans.forEach(([x1, x2]) => {
      for (let x = x1; x <= x2; x++) set.add(`${x},${y}`);
    });
  });
  return set;
}

export function getRexBaseCells(): RexCell[] {
  const filled = filledSet();
  const cells: RexCell[] = [];

  filled.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    const neighbors: [number, number][] = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    const isOutline = neighbors.some(([nx, ny]) => !filled.has(`${nx},${ny}`));
    let color = isOutline ? REX_OUTLINE : BELLY_ROWS.has(y) ? REX_BELLY : REX_BODY;
    if (x === EYE.x && y === EYE.y) color = REX_EYE;
    cells.push({ x, y, color });
  });

  ARM_CELLS.forEach(({ x, y }) => cells.push({ x, y, color: REX_BODY }));

  return cells.sort((a, b) => a.y - b.y || a.x - b.x);
}

export type RexPose = "idle" | "raised_eyebrow" | "necktie" | "olive_branch" | "stop_sign";

// Extra cells layered on top of the base silhouette, keyed by pose. Placed
// either directly over the body (eyebrow, necktie, crossed-arm accent) or in
// space the base silhouette leaves empty (olive branch, stop sign, meteor)
// so they read as held/worn accessories rather than a body distortion.
export const REX_ACCESSORIES: Record<Exclude<RexPose, "idle">, RexCell[]> = {
  raised_eyebrow: [
    { x: 13, y: 1, color: REX_OUTLINE },
    { x: 14, y: 1, color: REX_OUTLINE },
    { x: 12, y: 6, color: "#3f473f" },
  ],
  necktie: [
    { x: 12, y: 4, color: "#4a7a94" },
    { x: 12, y: 5, color: "#3d6a82" },
    { x: 12, y: 6, color: "#4a7a94" },
  ],
  olive_branch: [
    { x: 14, y: 8, color: "#8a7259" },
    { x: 14, y: 7, color: "#a9c9a0" },
    { x: 15, y: 7, color: "#a9c9a0" },
  ],
  stop_sign: [
    { x: 0, y: 3, color: "#c0392b" },
    { x: 1, y: 3, color: "#c0392b" },
    { x: 2, y: 3, color: "#c0392b" },
    { x: 0, y: 4, color: "#c0392b" },
    { x: 2, y: 4, color: "#c0392b" },
    { x: 1, y: 4, color: "#f5f0e6" },
    { x: 0, y: 5, color: "#c0392b" },
    { x: 1, y: 5, color: "#c0392b" },
    { x: 2, y: 5, color: "#c0392b" },
    // A small meteor + trail in the opposite corner — "extinction event"
    // wink, per t-rant-technical-spec.md's visual design section.
    { x: 17, y: 0, color: "#5c5347" },
    { x: 16, y: 1, color: "#e67e22" },
  ],
};

export function getRexCells(pose: RexPose): RexCell[] {
  const cells = getRexBaseCells();
  if (pose === "idle") return cells;
  return [...cells, ...REX_ACCESSORIES[pose]];
}
