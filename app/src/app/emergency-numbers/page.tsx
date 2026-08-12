"use client";

import Link from "next/link";
import { useState } from "react";
import { EMERGENCY_NUMBERS, EMERGENCY_NUMBERS_STATUS } from "@/lib/emergencyNumbers";

export default function EmergencyNumbers() {
  const [regionIndex, setRegionIndex] = useState<number | null>(null);
  const [countryIndex, setCountryIndex] = useState<number | null>(null);

  const region = regionIndex !== null ? EMERGENCY_NUMBERS[regionIndex] : null;
  const entry = region && countryIndex !== null ? region.countries[countryIndex] : null;

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <p>
        <Link href="/">&larr; Back to T-Rant</Link>
      </p>
      <h1>Emergency Numbers (reference)</h1>

      <div style={{ padding: 12, border: "1px solid #e0c060", borderRadius: 6, background: "#fff8e1", fontSize: 14 }}>
        {EMERGENCY_NUMBERS_STATUS.reason} Numbers here were drafted from general knowledge, not looked
        up live: check the "last verified" note before relying on one. If you're in crisis right now,
        findahelpline.com (shown on the main page, and above this picker there too) is the actively
        maintained path.
      </div>

      <div style={{ marginTop: 20 }}>
        <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Region</label>
        <select
          value={regionIndex ?? ""}
          onChange={(e) => {
            setRegionIndex(e.target.value === "" ? null : Number(e.target.value));
            setCountryIndex(null);
          }}
          style={{ width: "100%", padding: 8, fontSize: 15 }}
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
          <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>Country</label>
          <select
            value={countryIndex ?? ""}
            onChange={(e) => setCountryIndex(e.target.value === "" ? null : Number(e.target.value))}
            style={{ width: "100%", padding: 8, fontSize: 15 }}
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
        <div style={{ marginTop: 20, padding: 16, border: "1px solid #ddd", borderRadius: 8, background: "#fafafa" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, color: "#555" }}>{entry.country}</p>
          <p style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 700 }}>{entry.number}</p>
          {entry.note && <p style={{ margin: "0 0 8px", fontSize: 13, color: "#777" }}>{entry.note}</p>}
          {entry.helplines && entry.helplines.length > 0 && (
            <ul style={{ margin: "0 0 8px", padding: 0, listStyle: "none", fontSize: 12, color: "#888" }}>
              {entry.helplines.map((h) => (
                <li key={h.label}>
                  {h.label}: {h.number}
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
