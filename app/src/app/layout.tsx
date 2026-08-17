import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Retro blocky header font, per t-rant-technical-spec.md's visual design
// section. Applied narrowly (brand mark, main heading, tone headings) via
// var(--font-pixel) — Press Start 2P is unreadable at body-text sizes or in
// long sentences, so it never touches paragraph copy.
const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const SITE_DESCRIPTION =
  "Paste a heated message, get three diplomatic rewrites. Transparent about what gets flagged, what gets logged (nothing), and why.";

export const metadata: Metadata = {
  title: "T-Rant",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "T-Rant",
    description: SITE_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "T-Rant",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
