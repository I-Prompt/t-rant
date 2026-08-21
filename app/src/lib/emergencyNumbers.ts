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
// numbers", or each country's official government/police/telecom site),
// then set that entry's `lastVerified` to the date you checked it. Every
// entry below was cross-checked this way, in two passes: the original
// 2026-08-17 pass (15 European countries plus a handful elsewhere; India's
// ambulance figure was corrected from 102 to 108 during that pass), and a
// 2026-08-21 pass that added 25 more countries, mainly to round out Middle
// East & Africa (4 -> 23 countries) and Asia/Oceania. A few 2026-08-21
// entries carry a visible note about conflicting sources (Lebanon's fire
// number, Algeria's police number, Tanzania's fire number) rather than
// picking one silently - see each entry's `note`.
// New entries should still start with `lastVerified: null` and carry that
// "drafted from general knowledge, not independently verified" caveat until
// checked — every entry point (in the pathway and on the standalone page)
// shows that caveat for any entry not yet verified. `helplines`
// (non-emergency police lines, domestic-violence
// hotlines, poison control, etc.) is only populated for countries where
// there was reasonable confidence in a stable, real number - it's a partial
// list by design, not an indication that other countries don't have
// equivalents worth adding once verified.
//
// Deliberately excluded: Palestine/West Bank/Gaza (not listed here as a
// separate country, a deliberate product decision, not an oversight) and
// Papua New Guinea (researched for the 2026-08-21 pass; no single reliable
// national number found - PNG's own police site gives only a
// Port-Moresby-area line and notes other provinces differ, which reads as
// worse than no entry for something feeding a crisis pathway).

export const EMERGENCY_NUMBERS_STATUS = {
  locked: false,
  reason:
    "Linked into the self-harm/in-danger pathway as a secondary option next to findahelpline.com. Every entry was cross-checked against Wikipedia's List of emergency telephone numbers plus targeted searches - see each entry's \"last verified\" date; findahelpline.com remains the primary, actively-maintained pointer.",
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
        lastVerified: "2026-08-17",
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
        lastVerified: "2026-08-17",
      },
      {
        country: "Germany",
        number: "112",
        note: "110 also reaches police directly",
        helplines: [{ label: "Telefonseelsorge (crisis line)", number: "0800 111 0 111" }],
        lastVerified: "2026-08-17",
      },
      {
        country: "France",
        number: "112",
        note: "15 medical (SAMU), 17 police, 18 fire also work directly",
        lastVerified: "2026-08-17",
      },
      {
        country: "Spain",
        number: "112",
        note: "091 national police, 062 Guardia Civil also work directly",
        helplines: [{ label: "Gender violence hotline", number: "016" }],
        lastVerified: "2026-08-17",
      },
      {
        country: "Italy",
        number: "112",
        note: "113 police, 115 fire, 118 ambulance also work directly",
        lastVerified: "2026-08-17",
      },
      { country: "Sweden", number: "112", note: "114 14 for non-emergency police", lastVerified: "2026-08-17" },
      { country: "Netherlands", number: "112", note: "0900 8844 for non-emergency police", lastVerified: "2026-08-17" },
      { country: "Portugal", number: "112", note: "Single number for police, fire, and ambulance", lastVerified: "2026-08-17" },
      {
        country: "Switzerland",
        number: "112",
        note: "117 police, 118 fire, 144 ambulance also work directly",
        lastVerified: "2026-08-17",
      },
      {
        country: "Poland",
        number: "112",
        note: "997 police, 998 fire, 999 ambulance also work directly",
        lastVerified: "2026-08-17",
      },
      {
        country: "Greece",
        number: "112",
        note: "100 police, 199 fire, 166 ambulance also work directly",
        lastVerified: "2026-08-17",
      },
      { country: "Norway", number: "112", note: "Police; 110 fire, 113 ambulance", lastVerified: "2026-08-17" },
      {
        country: "Russia",
        number: "112",
        note: "102 police, 101 fire, 103 ambulance also work directly",
        lastVerified: "2026-08-17",
      },
      { country: "Turkey", number: "112", note: "155 police, 110 fire also work directly", lastVerified: "2026-08-17" },
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
        lastVerified: "2026-08-17",
      },
      {
        country: "Canada",
        number: "911",
        note: "Single number for police, fire, and ambulance",
        helplines: [
          { label: "988 Suicide Crisis Helpline", number: "988" },
          { label: "211 (community & social services)", number: "211" },
        ],
        lastVerified: "2026-08-17",
      },
      { country: "Mexico", number: "911", note: "Single number for all emergency services", lastVerified: "2026-08-17" },
      {
        country: "Brazil",
        number: "190",
        note: "Police; 192 ambulance (SAMU), 193 fire also work directly",
        lastVerified: "2026-08-17",
      },
      { country: "Argentina", number: "911", note: "Single number for all emergency services", lastVerified: "2026-08-17" },
      { country: "Chile", number: "133", note: "Police (Carabineros); 131 ambulance, 132 fire", lastVerified: "2026-08-17" },
      { country: "Colombia", number: "123", note: "Single number for all emergency services", lastVerified: "2026-08-17" },
    ],
  },
  {
    region: "Asia",
    countries: [
      { country: "Japan", number: "110", note: "police; 119 fire and ambulance", lastVerified: "2026-08-17" },
      { country: "China", number: "110", note: "police; 120 ambulance, 119 fire", lastVerified: "2026-08-17" },
      {
        country: "India",
        number: "112",
        note: "Single pan-India number, replaces 100 police, 101 fire, 108 ambulance",
        helplines: [
          { label: "Women's Helpline", number: "1091" },
          { label: "Child Helpline", number: "1098" },
        ],
        lastVerified: "2026-08-17",
      },
      { country: "South Korea", number: "112", note: "police; 119 fire and ambulance", lastVerified: "2026-08-17" },
      { country: "Singapore", number: "999", note: "police; 995 ambulance and fire", lastVerified: "2026-08-17" },
      { country: "Indonesia", number: "112", note: "Routes to police, fire, or ambulance", lastVerified: "2026-08-17" },
      { country: "Philippines", number: "911", note: "Single number for all emergency services", lastVerified: "2026-08-17" },
      {
        country: "Pakistan",
        number: "15",
        note: "Police (nationwide); Rescue 1122 covers ambulance/fire/rescue in most but not all regions",
        helplines: [
          { label: "Edhi Foundation Ambulance (free, nationwide)", number: "115" },
          { label: "Rescue 1122", number: "1122" },
        ],
        lastVerified: "2026-08-21",
      },
      { country: "Bangladesh", number: "999", note: "Single unified number for police, fire, and ambulance", lastVerified: "2026-08-21" },
      { country: "Vietnam", number: "113", note: "Police; 114 fire, 115 ambulance also work directly", lastVerified: "2026-08-21" },
      {
        country: "Thailand",
        number: "191",
        note: "Police; 1669 ambulance, 199 fire also work directly. 112 also works from a mobile phone",
        helplines: [{ label: "Tourist Police (English-speaking)", number: "1155" }],
        lastVerified: "2026-08-21",
      },
      {
        country: "Malaysia",
        number: "999",
        note: "Combines police, fire, and ambulance (MERS 999). 112 also works from a mobile phone",
        lastVerified: "2026-08-21",
      },
    ],
  },
  {
    region: "Oceania",
    countries: [
      { country: "Australia", number: "000", note: "112 also works from a mobile phone", lastVerified: "2026-08-17" },
      { country: "New Zealand", number: "111", note: "Single number for police, fire, and ambulance", lastVerified: "2026-08-17" },
      { country: "Fiji", number: "911", note: "917 police, 910 fire also work directly", lastVerified: "2026-08-21" },
    ],
  },
  {
    region: "Middle East & Africa",
    countries: [
      { country: "United Arab Emirates", number: "999", note: "police; 998 ambulance, 997 fire", lastVerified: "2026-08-17" },
      { country: "Israel", number: "100", note: "police; 101 ambulance, 102 fire", lastVerified: "2026-08-17" },
      {
        country: "South Africa",
        number: "10111",
        note: "Police; 112 from a mobile phone",
        helplines: [{ label: "Ambulance", number: "10177" }],
        lastVerified: "2026-08-17",
      },
      { country: "Nigeria", number: "112", note: "Single number for all emergency services", lastVerified: "2026-08-17" },
      {
        country: "Saudi Arabia",
        number: "999",
        note: "Police; 997 ambulance (Red Crescent), 998 civil defense/fire also work directly",
        lastVerified: "2026-08-21",
      },
      {
        country: "Egypt",
        number: "112",
        note: "Unified number (2022); 122 police, 123 ambulance, 180 fire also work directly, 126 tourist police",
        lastVerified: "2026-08-21",
      },
      {
        country: "Jordan",
        number: "911",
        note: "Single unified number for police, fire, and ambulance; 112 also works from a mobile phone",
        lastVerified: "2026-08-21",
      },
      {
        country: "Lebanon",
        number: "112",
        note: "Police/general; 140 Red Cross ambulance, 125 Civil Defense (medical/rescue). Sources vary on the fire number specifically",
        lastVerified: "2026-08-21",
      },
      {
        country: "Iraq",
        number: "104",
        note: "Police; 122 ambulance, 115 fire also work directly. 112 is unreliable in many areas",
        lastVerified: "2026-08-21",
      },
      {
        country: "Iran",
        number: "110",
        note: "Police; 115 ambulance, 125 fire also work directly. 112 also works",
        lastVerified: "2026-08-21",
      },
      {
        country: "Qatar",
        number: "999",
        note: "Single number for police, fire, and ambulance; 112 also works from a mobile phone",
        lastVerified: "2026-08-21",
      },
      { country: "Kuwait", number: "112", note: "Unified number for police, fire, and ambulance", lastVerified: "2026-08-21" },
      {
        country: "Bahrain",
        number: "999",
        note: "Single number for police, fire, and ambulance; 112 also works from a mobile phone",
        lastVerified: "2026-08-21",
      },
      {
        country: "Oman",
        number: "9999",
        note: "Single number for police, fire, and ambulance; 112 also works from a mobile phone",
        lastVerified: "2026-08-21",
      },
      {
        country: "Kenya",
        number: "999",
        note: "112 also works",
        helplines: [{ label: "Kenya Red Cross Ambulance", number: "1199" }],
        lastVerified: "2026-08-21",
      },
      {
        country: "Ghana",
        number: "112",
        note: "191 police, 192 fire, 193 ambulance also work directly",
        lastVerified: "2026-08-21",
      },
      {
        country: "Ethiopia",
        number: "911",
        note: "991 police, 907 ambulance, 939 fire also work directly. 112 doesn't reliably work",
        lastVerified: "2026-08-21",
      },
      {
        country: "Morocco",
        number: "19",
        note: "Police (urban areas); 15 civil protection covers fire and ambulance, 177 Royal Gendarmerie (rural areas/highways). 112 also works from a mobile phone",
        lastVerified: "2026-08-21",
      },
      {
        country: "Algeria",
        number: "17",
        note: "Police (some sources cite 1548 instead); 14 fire/civil protection, 1055 gendarmerie (rural/highway) also work directly",
        lastVerified: "2026-08-21",
      },
      {
        country: "Tunisia",
        number: "197",
        note: "Police; 198 fire/civil protection, 190 ambulance (SAMU) also work directly. 193 Garde Nationale for rural areas/highways",
        lastVerified: "2026-08-21",
      },
      {
        country: "Tanzania",
        number: "112",
        note: "999 police also works; 114 ambulance also works directly. Fire cited as either 115 or 118 depending on source",
        lastVerified: "2026-08-21",
      },
      {
        country: "Uganda",
        number: "999",
        note: "112 from a mobile phone. Reaches police, fire, and ambulance via the National Emergency Call Centre",
        lastVerified: "2026-08-21",
      },
      {
        country: "Zimbabwe",
        number: "999",
        note: "995 police, 994 ambulance, 993 fire also work directly. Mobile: 112 (Econet) or 114 (NetOne)",
        lastVerified: "2026-08-21",
      },
    ],
  },
];
