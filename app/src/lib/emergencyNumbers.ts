// Manual region -> country -> general emergency number reference, built as
// an alternative to IP-based geolocation (see t-rant-phase2-brief.md and
// the 2026-08-12 discussion: skipped geo-routing for now in favor of a
// user-picked dropdown). Wired into the self-harm/in-danger pathway as a
// secondary option alongside findahelpline.com (see EmergencyNumbersPicker
// in src/app/page.tsx) and available standalone at /emergency-numbers.
//
// MAINTENANCE: emergency numbers change extremely rarely (unlike prices or
// APIs), so an annual check is more than enough. To update: cross-check
// against a stable source (e.g. Wikipedia's "List of emergency telephone
// numbers", or each country's official government site), then set that
// entry's `lastVerified` to the date you checked it. Entries with
// `lastVerified: null` have never been independently verified — they were
// drafted from general knowledge, not looked up live, and should be
// checked before this tool is treated as authoritative. Every entry point
// (in the pathway and on the standalone page) shows that caveat until it's
// checked off. `helplines` (non-emergency police lines, domestic-violence
// hotlines, poison control, etc.) is only populated for countries where
// there was reasonable confidence in a stable, real number - it's a partial
// list by design, not an indication that other countries don't have
// equivalents worth adding once verified.

export const EMERGENCY_NUMBERS_STATUS = {
  locked: false,
  reason:
    "Linked into the self-harm/in-danger pathway as a secondary option next to findahelpline.com. Entries with lastVerified: null are still unverified — drafted from general knowledge, pending the verification pass described above.",
} as const;

export interface EmergencyHelpline {
  label: string;
  number: string;
}

export interface EmergencyNumberEntry {
  country: string;
  number: string;
  note?: string;
  // Additional official numbers beyond the single general emergency line -
  // non-emergency police, domestic-violence hotlines, poison control, and
  // similar. Shown in smaller font below the main number. Same
  // "general knowledge, not independently verified" caveat as everything
  // else in this file applies here too - only populated where there's
  // reasonable confidence the number is a real, stable, national line, and
  // still worth checking against a current source before relying on it.
  helplines?: EmergencyHelpline[];
  lastVerified: string | null;
}

export interface EmergencyRegion {
  region: string;
  countries: EmergencyNumberEntry[];
}

export const EMERGENCY_NUMBERS: EmergencyRegion[] = [
  {
    region: "Europe",
    countries: [
      {
        country: "Ireland",
        number: "112",
        note: "999 also works",
        helplines: [
          { label: "Samaritans (crisis line)", number: "116 123" },
          { label: "Women's Aid", number: "1800 341 900" },
        ],
        lastVerified: null,
      },
      {
        country: "United Kingdom",
        number: "999",
        note: "112 also works",
        helplines: [
          { label: "NHS non-emergency", number: "111" },
          { label: "Police non-emergency", number: "101" },
          { label: "Samaritans (crisis line)", number: "116 123" },
        ],
        lastVerified: null,
      },
      {
        country: "Germany",
        number: "112",
        note: "110 also reaches police directly",
        helplines: [{ label: "Telefonseelsorge (crisis line)", number: "0800 111 0 111" }],
        lastVerified: null,
      },
      {
        country: "France",
        number: "112",
        note: "15 medical (SAMU), 17 police, 18 fire also work directly",
        lastVerified: null,
      },
      {
        country: "Spain",
        number: "112",
        note: "091 national police, 062 Guardia Civil also work directly",
        helplines: [{ label: "Gender violence hotline", number: "016" }],
        lastVerified: null,
      },
      {
        country: "Italy",
        number: "112",
        note: "113 police, 115 fire, 118 ambulance also work directly",
        lastVerified: null,
      },
      { country: "Sweden", number: "112", note: "114 14 for non-emergency police", lastVerified: null },
      { country: "Netherlands", number: "112", note: "0900 8844 for non-emergency police", lastVerified: null },
      { country: "Portugal", number: "112", note: "Single number for police, fire, and ambulance", lastVerified: null },
      {
        country: "Switzerland",
        number: "112",
        note: "117 police, 118 fire, 144 ambulance also work directly",
        lastVerified: null,
      },
      {
        country: "Poland",
        number: "112",
        note: "997 police, 998 fire, 999 ambulance also work directly",
        lastVerified: null,
      },
      {
        country: "Greece",
        number: "112",
        note: "100 police, 199 fire, 166 ambulance also work directly",
        lastVerified: null,
      },
      { country: "Norway", number: "112", note: "Police; 110 fire, 113 ambulance", lastVerified: null },
      {
        country: "Russia",
        number: "112",
        note: "102 police, 101 fire, 103 ambulance also work directly",
        lastVerified: null,
      },
      { country: "Turkey", number: "112", note: "155 police, 110 fire also work directly", lastVerified: null },
    ],
  },
  {
    region: "Americas",
    countries: [
      {
        country: "United States",
        number: "911",
        note: "Single number for police, fire, and ambulance",
        helplines: [
          { label: "988 Suicide & Crisis Lifeline", number: "988" },
          { label: "National Domestic Violence Hotline", number: "1-800-799-7233" },
          { label: "Poison Control", number: "1-800-222-1222" },
        ],
        lastVerified: null,
      },
      {
        country: "Canada",
        number: "911",
        note: "Single number for police, fire, and ambulance",
        helplines: [
          { label: "988 Suicide Crisis Helpline", number: "988" },
          { label: "211 (community & social services)", number: "211" },
        ],
        lastVerified: null,
      },
      { country: "Mexico", number: "911", note: "Single number for all emergency services", lastVerified: null },
      {
        country: "Brazil",
        number: "190",
        note: "Police; 192 ambulance (SAMU), 193 fire also work directly",
        lastVerified: null,
      },
      { country: "Argentina", number: "911", note: "Single number for all emergency services", lastVerified: null },
      { country: "Chile", number: "133", note: "Police (Carabineros); 131 ambulance, 132 fire", lastVerified: null },
      { country: "Colombia", number: "123", note: "Single number for all emergency services", lastVerified: null },
    ],
  },
  {
    region: "Asia",
    countries: [
      { country: "Japan", number: "110", note: "police; 119 fire and ambulance", lastVerified: null },
      { country: "China", number: "110", note: "police; 120 ambulance, 119 fire", lastVerified: null },
      {
        country: "India",
        number: "112",
        note: "Single pan-India number, replaces 100 police, 101 fire, 102 ambulance",
        helplines: [
          { label: "Women's Helpline", number: "1091" },
          { label: "Child Helpline", number: "1098" },
        ],
        lastVerified: null,
      },
      { country: "South Korea", number: "112", note: "police; 119 fire and ambulance", lastVerified: null },
      { country: "Singapore", number: "999", note: "police; 995 ambulance and fire", lastVerified: null },
      { country: "Indonesia", number: "112", note: "Routes to police, fire, or ambulance", lastVerified: null },
      { country: "Philippines", number: "911", note: "Single number for all emergency services", lastVerified: null },
    ],
  },
  {
    region: "Oceania",
    countries: [
      { country: "Australia", number: "000", note: "112 also works from a mobile phone", lastVerified: null },
      { country: "New Zealand", number: "111", note: "Single number for police, fire, and ambulance", lastVerified: null },
    ],
  },
  {
    region: "Middle East & Africa",
    countries: [
      { country: "United Arab Emirates", number: "999", note: "police; 998 ambulance, 997 fire", lastVerified: null },
      { country: "Israel", number: "100", note: "police; 101 ambulance, 102 fire", lastVerified: null },
      {
        country: "South Africa",
        number: "10111",
        note: "Police; 112 from a mobile phone",
        helplines: [{ label: "Ambulance", number: "10177" }],
        lastVerified: null,
      },
      { country: "Nigeria", number: "112", note: "Single number for all emergency services", lastVerified: null },
    ],
  },
];
