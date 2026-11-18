import type { ReactNode } from "react";

/**
 * A small set of line icons for the shell, keyed by the Ionicons names in lib/modules.ts.
 * One 24 px grid, 1.75 stroke, round ends. Unknown names draw a plain ring.
 */
const PATHS: Record<string, ReactNode> = {
  "home-outline": (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9v11.5h4.5v-6h4v6h4.5V9" />
    </>
  ),
  "card-outline": (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19M6.5 15h4" />
    </>
  ),
  "checkbox-outline": (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
      <path d="m8 12.2 2.8 2.8L16 9.5" />
    </>
  ),
  motorbike: (
    <>
      <circle cx="5.5" cy="16" r="3.5" />
      <circle cx="18.5" cy="16" r="3.5" />
      <path d="M5.5 16 9 10.5h5.5L18.5 16" />
      <path d="M13.5 6.5H16l2.5 9.5M7.5 10.5h3.5" />
    </>
  ),
  "repeat-outline": (
    <>
      <path d="m16.5 2.5 3 3-3 3" />
      <path d="M4.5 11V9.5a4 4 0 0 1 4-4h11" />
      <path d="m7.5 21.5-3-3 3-3" />
      <path d="M19.5 13v1.5a4 4 0 0 1-4 4h-11" />
    </>
  ),
  "barbell-outline": <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />,
  "book-outline": (
    <>
      <path d="M4.5 19V5a2 2 0 0 1 2-2h13v14.5h-13a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13" />
      <path d="M9 7.5h6" />
    </>
  ),
  "medkit-outline": (
    <>
      <rect x="3" y="7" width="18" height="13.5" rx="2.5" />
      <path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2M12 10.5v6.5M8.75 13.75h6.5" />
    </>
  ),
  "alarm-outline": (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9.5V13l2.5 2M3.5 5 6.5 2.5M20.5 5l-3-2.5" />
    </>
  ),
  "restaurant-outline": (
    <>
      <path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3" />
      <path d="M17.5 21V3C15.5 4.5 14.5 7 14.5 10v3.5h3" />
    </>
  ),
  "football-outline": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.5 4 2.9-1.5 4.6h-5L8 10.4z" />
      <path d="M12 7.5V3M16 10.4l4.2-1.4M14.5 15l2.6 3.6M9.5 15l-2.6 3.6M8 10.4 3.8 9" />
    </>
  ),
  "partly-sunny-outline": (
    <>
      <path d="M8.5 2.5v1.5M3 8h1.5M4.6 4.1l1 1M12.4 4.1l-1 1" />
      <path d="M5.4 11.4a3.75 3.75 0 0 1 6.3-4" />
      <path d="M8 20.5h10a3.5 3.5 0 0 0 .4-7A5.5 5.5 0 0 0 8 14a3.25 3.25 0 0 0 0 6.5z" />
    </>
  ),
  "newspaper-outline": (
    <>
      <path d="M4 4.5h13v14.5a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z" />
      <path d="M17 8.5h3V19a2 2 0 0 1-2 2M7.5 8.5h6M7.5 12.5h6M7.5 16.5h4" />
    </>
  ),
  "people-outline": (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20.5a6.5 6.5 0 0 1 13 0M15.5 4.7a3.5 3.5 0 0 1 0 6.6M18 14.4a6.5 6.5 0 0 1 3.5 6.1" />
    </>
  ),
  "swap-horizontal-outline": <path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" />,
  "mic-outline": (
    <>
      <rect x="9" y="2.5" width="6" height="12" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4" />
    </>
  ),
  "cube-outline": <path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7zM3.5 7 12 11.5 20.5 7M12 11.5v10" />,
  "cart-outline": (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2.5 3h3l2.2 11.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.2L21 7H6.3" />
    </>
  ),
  "airplane-outline": (
    <path d="M12 2.5c.8 0 1.5.9 1.5 2V9l7.5 4.5V16l-7.5-2.5v4l2.5 2V21L12 20l-4 1v-1.5l2.5-2v-4L3 16v-2.5L10.5 9V4.5c0-1.1.7-2 1.5-2z" />
  ),
  "briefcase-outline": (
    <>
      <rect x="3" y="7" width="18" height="13.5" rx="2.5" />
      <path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2M3 13h18" />
    </>
  ),
  "document-text-outline": (
    <>
      <path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" />
      <path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5" />
    </>
  ),
  "lock-closed-outline": (
    <>
      <rect x="4.5" y="10.5" width="15" height="11" rx="2.5" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </>
  ),
  "videocam-outline": (
    <>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="m15.5 10.5 6-3.5v10l-6-3.5" />
    </>
  ),
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  "log-out-outline": <path d="M9.5 20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h3.5M16 16.5l4.5-4.5L16 7.5M20.5 12H9.5" />,
};

export function Icon({ name, className = "size-5" }: { name: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {PATHS[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/** The app's tab icons, by tab id. */
export const TAB_ICONS: Record<string, string> = {
  home: "home-outline",
  money: "card-outline",
  todos: "checkbox-outline",
  vehicle: "motorbike",
};
