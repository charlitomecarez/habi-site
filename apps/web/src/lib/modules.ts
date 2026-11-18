// Ported from my-app/lib/modules.ts @ fc94bf0

/** true works on the web, "partial" works with limits, false is app only. */
export type WebSupport = true | false | "partial";

export type ModuleEntry = {
  id: string;
  label: string;
  href: string;
  /** Ionicons name from the app. The web maps it to its own icon. */
  icon: string;
  tone: "daily" | "people" | "home" | "records";
  /** Whether this module works on the web. */
  web: WebSupport;
  /** Extra words for the search on More. */
  keywords: string;
  /** Only the admin sees this tile. The server checks too. */
  adminOnly?: boolean;
  /** A keyed part of the server this module cannot run without. See lib/features.ts. */
  needs?: Feature;
};

/** Keyed parts of the server. app-features says which ones are set up. */
export type Feature = "sports" | "ai" | "tip" | "email";
export type Features = Record<Feature, boolean>;
/** Until the server answers, or if it cannot, every module shows. */
export const ALL_FEATURES: Features = { sports: true, ai: true, tip: true, email: true };

export type ModuleSection = { title: string; modules: readonly ModuleEntry[] };

/** The modules on More, in sections. The tabs are not here, because the tab bar already shows them. */
export const MODULE_SECTIONS: readonly ModuleSection[] = [
  {
    title: "Daily life",
    modules: [
      {
        id: "habits",
        label: "Habits",
        href: "/habits",
        icon: "repeat-outline",
        tone: "daily",
        web: true,
        keywords: "streak",
      },
      {
        id: "gym",
        label: "Gym",
        href: "/gym",
        icon: "barbell-outline",
        tone: "daily",
        web: true,
        keywords: "workout exercise",
      },
      {
        id: "journal",
        label: "Journal",
        href: "/journal",
        icon: "book-outline",
        tone: "daily",
        web: true,
        keywords: "diary mood",
      },
      {
        id: "health",
        label: "Health",
        href: "/health",
        icon: "medkit-outline",
        tone: "daily",
        web: "partial",
        keywords: "medicine doctor weight",
      },
      {
        id: "alarms",
        label: "Alarms",
        href: "/alarms",
        icon: "alarm-outline",
        tone: "daily",
        web: false,
        keywords: "wake clock gising",
      },
      {
        id: "ulam",
        label: "Ulam",
        href: "/ulam",
        icon: "restaurant-outline",
        tone: "daily",
        web: true,
        keywords: "food meal cook recipe calories",
      },
      {
        id: "sports",
        label: "Sports",
        href: "/sports",
        icon: "football-outline",
        tone: "daily",
        web: true,
        keywords: "football nba basketball standings",
        needs: "sports",
      },
      {
        id: "weather",
        label: "Weather",
        href: "/weather",
        icon: "partly-sunny-outline",
        tone: "daily",
        web: true,
        keywords: "rain forecast temperature ulan panahon",
      },
      {
        id: "news",
        label: "News",
        href: "/news",
        icon: "newspaper-outline",
        tone: "daily",
        web: true,
        keywords: "headlines balita philippines world",
      },
    ],
  },
  {
    title: "People",
    modules: [
      {
        id: "people",
        label: "People",
        href: "/people",
        icon: "people-outline",
        tone: "people",
        web: true,
        keywords: "birthday anniversary gift dates",
      },
      {
        id: "debts",
        label: "Debts",
        href: "/debts",
        icon: "swap-horizontal-outline",
        tone: "people",
        web: true,
        keywords: "utang owe",
      },
      {
        id: "inbox",
        label: "Inbox",
        href: "/inbox",
        icon: "mic-outline",
        tone: "people",
        web: true,
        keywords: "voice message record taglish",
        needs: "ai",
      },
    ],
  },
  {
    title: "Home and plans",
    modules: [
      {
        id: "inventory",
        label: "Inventory",
        href: "/inventory",
        icon: "cube-outline",
        tone: "home",
        web: true,
        keywords: "items box room",
      },
      {
        id: "shopping",
        label: "Shopping",
        href: "/shopping",
        icon: "cart-outline",
        tone: "home",
        web: true,
        keywords: "grocery list",
      },
      {
        id: "travel",
        label: "Travel",
        href: "/travel",
        icon: "airplane-outline",
        tone: "home",
        web: true,
        keywords: "trip plan itinerary",
      },
    ],
  },
  {
    title: "Records and work",
    modules: [
      {
        id: "work",
        label: "Find a work",
        href: "/work",
        icon: "briefcase-outline",
        tone: "records",
        web: true,
        keywords: "job career resume cover letter apply",
        adminOnly: true,
        needs: "ai",
      },
      {
        id: "documents",
        label: "Documents",
        href: "/documents",
        icon: "document-text-outline",
        tone: "records",
        web: true,
        keywords: "renewal expiry licence passport",
      },
      {
        id: "vault",
        label: "Vault",
        href: "/vault",
        icon: "lock-closed-outline",
        tone: "records",
        web: true,
        keywords: "password",
      },
      {
        id: "content",
        label: "Content",
        href: "/content",
        icon: "videocam-outline",
        tone: "records",
        web: true,
        keywords: "video planner",
      },
    ],
  },
];

export const ALL_MODULES: readonly ModuleEntry[] = MODULE_SECTIONS.flatMap((s) => s.modules);

/** The four main tabs of the app, as web paths. */
export const MAIN_TABS: readonly { id: "home" | "money" | "todos" | "vehicle"; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "money", label: "Money", href: "/money" },
  { id: "todos", label: "Todos", href: "/todos" },
  { id: "vehicle", label: "Vehicle", href: "/vehicle" },
];

export const MAX_SHORTCUTS = 8;

/** The saved shortcuts in order. Names the app does not know are skipped. */
export function shortcutModules(ids: readonly string[]): ModuleEntry[] {
  return ids
    .map((id) => ALL_MODULES.find((m) => m.id === id))
    .filter((m): m is ModuleEntry => m !== undefined)
    .slice(0, MAX_SHORTCUTS);
}

/** Adds or removes a shortcut. Adding past the limit changes nothing. */
export function toggleShortcut(ids: readonly string[], id: string): string[] {
  if (ids.includes(id)) return ids.filter((x) => x !== id);
  return ids.length >= MAX_SHORTCUTS ? [...ids] : [...ids, id];
}

/** Sections with only the modules that match the search. Empty sections go. */
export function searchModules(query: string): ModuleSection[] {
  const typed = query.trim().toLowerCase();
  if (!typed) return [...MODULE_SECTIONS];
  return MODULE_SECTIONS.map((section) => ({
    ...section,
    modules: section.modules.filter((m) => `${m.label} ${m.keywords}`.toLowerCase().includes(typed)),
  })).filter((section) => section.modules.length > 0);
}

export type ModuleFilter = { features: Features; hidden: readonly string[]; isAdmin: boolean };

/** Why a module does not show, or null when it shows. */
export function hiddenReason(m: ModuleEntry, f: ModuleFilter): "admin" | "server" | "hidden" | "web" | null {
  if (m.adminOnly && !f.isAdmin) return "admin";
  if (m.needs && !f.features[m.needs]) return "server";
  if (f.hidden.includes(m.id)) return "hidden";
  return m.web === false ? "web" : null;
}

/** The sections of More with only the modules this account can and wants to see. */
export function visibleSections(sections: readonly ModuleSection[], f: ModuleFilter): ModuleSection[] {
  return sections
    .map((s) => ({ ...s, modules: s.modules.filter((m) => hiddenReason(m, f) === null) }))
    .filter((s) => s.modules.length > 0);
}

/** Switches a module off or back on in Settings › Modules. */
export function toggleHidden(hidden: readonly string[], id: string): string[] {
  return hidden.includes(id) ? hidden.filter((x) => x !== id) : [...hidden, id];
}
