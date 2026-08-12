import { ImageResponse } from "next/og";

// Code-generated OG image — no mascot art exists yet (that's still ahead
// in the visual design phase), but a share link with zero preview image is
// worse than a plain typographic one. Swap this out once the pixel T-Rex
// identity is built.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f2a1f",
          color: "#f4f8f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, display: "flex" }}>T-Rant</div>
        <div style={{ fontSize: 32, marginTop: 16, color: "#c9d8c9", display: "flex" }}>
          Small arms. Big feelings. Diplomatic rewrites.
        </div>
      </div>
    ),
    size
  );
}
