import { ImageResponse } from "next/og";
import { getRexCells, REX_GRID_W } from "@/lib/rexSprite";

// Code-generated pixel T-Rex favicon: same geometry as the in-app sprite
// (lib/rexSprite.ts), rebuilt with divs since ImageResponse (Satori)
// doesn't render arbitrary SVG. No external image asset.

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const cell = size.width / REX_GRID_W;
  const cells = getRexCells("idle");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f5f0e6",
        }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x * cell,
              top: c.y * cell,
              width: cell,
              height: cell,
              background: c.color,
              display: "flex",
            }}
          />
        ))}
      </div>
    ),
    size
  );
}
