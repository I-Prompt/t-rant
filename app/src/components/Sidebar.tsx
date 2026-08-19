"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Persistent left nav, shared by every page via layout.tsx. Client
// component (needs usePathname() to highlight the current page) - the rest
// of the site stays server-rendered where it can.

const MORE_LINKS = [
  { href: "/unwind", label: "🕹️ Unwind Links" },
  { href: "/emergency-numbers", label: "Emergency Numbers" },
  { href: "/dark-patterns", label: "Dark Pattern Audit" },
  { href: "/bookmarklet", label: "Bookmarklet" },
];

function navLinkClass(active: boolean, primary: boolean): string {
  const classes = ["trant-nav-link"];
  if (primary) classes.push("trant-nav-link--primary");
  if (active) classes.push("trant-nav-link--active");
  return classes.join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="trant-sidebar" aria-label="T-Rant">
      <Link href="/" className="trant-sidebar-brand">
        <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden="true">
          <rect x="10" y="0" width="10" height="4" fill="#6b8f71" />
          <rect x="8" y="4" width="14" height="4" fill="#6b8f71" />
          <rect x="4" y="8" width="16" height="4" fill="#6b8f71" />
          <rect x="0" y="12" width="14" height="4" fill="#6b8f71" />
          <rect x="6" y="16" width="4" height="4" fill="#2d2a24" />
          <rect x="14" y="16" width="4" height="4" fill="#2d2a24" />
        </svg>
        <span className="trant-sidebar-brand-name">T-Rant</span>
      </Link>

      <div className="trant-nav">
        <Link href="/house-rules" className={navLinkClass(pathname === "/house-rules", true)}>
          House Rules
        </Link>

        <p className="trant-nav-group-label">More</p>
        {MORE_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={navLinkClass(pathname === link.href, false)}>
            {link.label}
          </Link>
        ))}
      </div>

      <p className="trant-sidebar-foot">No accounts. No stored rants. No tracking.</p>
    </nav>
  );
}
