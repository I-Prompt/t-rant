"use client";

import { useUIState } from "@/components/UIState";

// Gmail-style compact/comfortable switch. The actual spacing values live in
// page.tsx (most of the layout is inline styles, not CSS classes, so the
// density value is read there directly) - this button just flips the
// shared setting and remembers it.
export default function DensityToggle() {
  const { density, toggleDensity } = useUIState();
  const isCompact = density === "compact";

  return (
    <button
      type="button"
      onClick={toggleDensity}
      className="trant-icon-btn"
      aria-label={isCompact ? "Switch to comfortable spacing" : "Switch to compact spacing"}
      title={isCompact ? "Switch to comfortable spacing" : "Switch to compact spacing"}
    >
      {isCompact ? "▤" : "▦"}
    </button>
  );
}
