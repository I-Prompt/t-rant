// Manual region -> country -> general emergency number reference, built as
// an alternative to IP-based geolocation (see t-rant-phase2-brief.md and
// the 2026-08-12 discussion: skipped geo-routing for now in favor of a
// user-picked dropdown). Deliberately NOT wired into the self-harm pathway
// yet — see EMERGENCY_NUMBERS_STATUS below. This is a reference tool only.
//
// MAINTENANCE: emergency numbers change extremely rarely (unlike prices or
// APIs), so an annual check is more than enough. To update: cross-check
// against a stable source (e.g. Wikipedia's "List of emergency telephone
// numbers", or each country's official government site), then set that
// entry's `lastVerified` to the date you checked it. Entries with
// `lastVerified: null` have never been independently verified — they were
// drafted from general knowledge, not looked up live, and should be
// checked before this tool is treated as authoritative.

export const EMERGENCY_NUMBERS_STATUS = {
  locked: true,
  reason:
    "Not yet linked into the self-harm/in-danger pathway (which still points to findahelpline.com). Standalone reference tool only, pending a verification pass.",
} as const;

export interface EmergencyNumberEntry {
  country: string;
  number: string;
  note?: string;
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
      { country: "Ireland", number: "112", note: "999 also works", lastVerified: null },
      { country: "United Kingdom", number: "999", note: "112 also works", lastVerified: null },
      { country: "Germany", number: "112", lastVerified: null },
      { country: "France", number: "112", lastVerified: null },
      { country: "Spain", number: "112", lastVerified: null },
      { country: "Italy", number: "112", lastVerified: null },
      { country: "Sweden", number: "112", lastVerified: null },
      { country: "Netherlands", number: "112", lastVerified: null },
      { country: "Portugal", number: "112", lastVerified: null },
      { country: "Switzerland", number: "112", lastVerified: null },
      { country: "Poland", number: "112", lastVerified: null },
      { country: "Greece", number: "112", lastVerified: null },
      { country: "Norway", number: "112", note: "110 police, 113 ambulance", lastVerified: null },
      { country: "Russia", number: "112", lastVerified: null },
      { country: "Turkey", number: "112", lastVerified: null },
    ],
  },
  {
    region: "Americas",
    countries: [
      { country: "United States", number: "911", lastVerified: null },
      { country: "Canada", number: "911", lastVerified: null },
      { country: "Mexico", number: "911", lastVerified: null },
      { country: "Brazil", number: "190", note: "police; 192 for ambulance", lastVerified: null },
      { country: "Argentina", number: "911", lastVerified: null },
      { country: "Chile", number: "133", note: "police; 131 ambulance, 132 fire", lastVerified: null },
      { country: "Colombia", number: "123", lastVerified: null },
    ],
  },
  {
    region: "Asia",
    countries: [
      { country: "Japan", number: "110", note: "police; 119 fire and ambulance", lastVerified: null },
      { country: "China", number: "110", note: "police; 120 ambulance, 119 fire", lastVerified: null },
      { country: "India", number: "112", lastVerified: null },
      { country: "South Korea", number: "112", note: "police; 119 fire and ambulance", lastVerified: null },
      { country: "Singapore", number: "999", note: "police; 995 ambulance and fire", lastVerified: null },
      { country: "Indonesia", number: "112", lastVerified: null },
      { country: "Philippines", number: "911", lastVerified: null },
    ],
  },
  {
    region: "Oceania",
    countries: [
      { country: "Australia", number: "000", lastVerified: null },
      { country: "New Zealand", number: "111", lastVerified: null },
    ],
  },
  {
    region: "Middle East & Africa",
    countries: [
      { country: "United Arab Emirates", number: "999", note: "police; 998 ambulance, 997 fire", lastVerified: null },
      { country: "Israel", number: "100", note: "police; 101 ambulance, 102 fire", lastVerified: null },
      { country: "South Africa", number: "10111", note: "112 from a mobile phone", lastVerified: null },
      { country: "Nigeria", number: "112", lastVerified: null },
    ],
  },
];
