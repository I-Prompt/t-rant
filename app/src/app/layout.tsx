import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { UIStateProvider } from "@/components/UIState";
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

// Runs before first paint so the page never flashes light-then-dark (or
// vice versa) on load. Reads the explicit user choice from localStorage if
// there is one; otherwise leaves data-theme unset and the
// prefers-color-scheme media query in globals.css takes over.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("trant-theme");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={spaceGrotesk.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <UIStateProvider>
          <div className="trant-shell">
            <Sidebar />
            {children}
          </div>
        </UIStateProvider>
      </body>
    </html>
  );
}
