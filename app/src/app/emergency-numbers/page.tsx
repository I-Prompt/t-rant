"use client";

import { useState } from "react";
import { EMERGENCY_NUMBERS, EMERGENCY_NUMBERS_STATUS } from "@/lib/emergencyNumbers";

export default function EmergencyNumbers() {
  const [regionIndex, setRegionIndex] = useState<number | null>(null);
  const [countryIndex, setCountryIndex] = useState<number | null>(null);

  const region = regionIndex !== null ? EMERGENCY_NUMBERS[regionIndex] : null;
  const entry = region && countryIndex !== null ? region.countries[countryIndex] : null;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 28px 64px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>Emergency Numbers (reference)</h1>

      <div style={{ marginTop: 16, padding: 14, border: "1px solid var(--color-sage-soft)", borderRadius: "var(--radius-sm)", background: "var(--color-sage-soft)", fontSize: 14, lineHeight: 1.7, display: "grid", gap: 10 }}>
        <p style={{ margin: 0 }}>{EMERGENCY_NUMBERS_STATUS.reason}</p>
        <p style={{ margin: 0 }}>
          If you're in crisis right now, findahelpline.com (also shown alongside this same picker on
          the main page) is the actively maintained path.
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>Region</label>
        <select
          value={regionIndex ?? ""}
          onChange={(e) => {
            setRegionIndex(e.target.value === "" ? null : Number(e.target.value));
            setCountryIndex(null);
          }}
          className="trant-field"
          style={{ fontSize: 15 }}
        >
          <option value="">Select a region</option>
          {EMERGENCY_NUMBERS.map((r, i) => (
            <option key={r.region} value={i}>
              {r.region}
            </option>
          ))}
        </select>
      </div>

      {region && (
        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14, fontWeight: 600 }}>Country</label>
          <select
            value={countryIndex ?? ""}
            onChange={(e) => setCountryIndex(e.target.value === "" ? null : Number(e.target.value))}
            className="trant-field"
            style={{ fontSize: 15 }}
          >
            <option value="">Select a country</option>
            {region.countries.map((c, i) => (
              <option key={c.country} value={i}>
                {c.country}
              </option>
            ))}
          </select>
        </div>
      )}

      {entry && (
        <div style={{ marginTop: 20, padding: 18, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", background: "var(--color-surface-muted)" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, color: "var(--color-text-soft)" }}>{entry.country}</p>
          <p style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 800 }}>{entry.number}</p>
          {entry.note && <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--color-text-faint)" }}>{entry.note}</p>}
          {entry.helplines && entry.helplines.length > 0 && (
            <ul style={{ margin: "0 0 8px", padding: 0, listStyle: "none", fontSize: 12.5, color: "var(--color-text-soft)", display: "grid", gap: 3 }}>
              {entry.helplines.map((h) => (
                <li key={h.label}>
                  {h.label}: <strong>{h.number}</strong>
                </li>
              ))}
            </ul>
          )}
          <p style={{ margin: 0, fontSize: 12, color: entry.lastVerified ? "#5c8a5c" : "#b06a00" }}>
            {entry.lastVerified ? `Last verified: ${entry.lastVerified}` : "Not yet independently verified"}
          </p>
        </div>
      )}
    </main>
  );
}
