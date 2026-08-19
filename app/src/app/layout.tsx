import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

// Space Grotesk, not Geist Sans: same "one font everywhere" rule as before
// (see globals.css), just a font with more visual character - Geist read as
// too generic/interchangeable-with-any-SaaS-product for a portfolio piece
// meant to look distinctive. Still fully readable at body-copy sizes.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
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
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <div className="trant-shell">
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  );
}
