// Ported from my-app/lib/modules.test.ts @ fc94bf0
import { describe, expect, it } from "vitest";

import {
  ALL_FEATURES,
  ALL_MODULES,
  hiddenReason,
  MAIN_TABS,
  MAX_SHORTCUTS,
  MODULE_SECTIONS,
  searchModules,
  shortcutModules,
  toggleHidden,
  toggleShortcut,
  visibleSections,
  type ModuleFilter,
} from "@/lib/modules";

describe("modules", () => {
  it("gives every module a unique id", () => {
    expect(new Set(ALL_MODULES.map((m) => m.id)).size).toBe(ALL_MODULES.length);
  });
});

describe("shortcutModules", () => {
  it("keeps your order and skips names it does not know", () => {
    expect(shortcutModules(["vault", "gone", "journal"]).map((m) => m.id)).toEqual(["vault", "journal"]);
  });

  it("stops at the limit", () => {
    expect(shortcutModules(ALL_MODULES.map((m) => m.id))).toHaveLength(MAX_SHORTCUTS);
  });
});

describe("toggleShortcut", () => {
  it("adds and removes", () => {
    expect(toggleShortcut(["vault"], "journal")).toEqual(["vault", "journal"]);
    expect(toggleShortcut(["vault", "journal"], "vault")).toEqual(["journal"]);
  });

  it("adds nothing past the limit", () => {
    const full = Array.from({ length: MAX_SHORTCUTS }, (_, i) => `m${i}`);
    expect(toggleShortcut(full, "journal")).toEqual(full);
  });
});

describe("searchModules", () => {
  it("returns every section for empty text", () => {
    expect(searchModules("  ").flatMap((s) => s.modules)).toHaveLength(ALL_MODULES.length);
  });

  it("finds a module by a keyword, in any case", () => {
    expect(searchModules("UTANG").flatMap((s) => s.modules.map((m) => m.id))).toEqual(["debts"]);
  });

  it("drops sections with no match", () => {
    expect(searchModules("no such module")).toEqual([]);
  });
});

describe("optional modules", () => {
  const on = { features: ALL_FEATURES, hidden: [] as string[], isAdmin: true };
  const ids = (f: ModuleFilter) => visibleSections(MODULE_SECTIONS, f).flatMap((s) => s.modules.map((m) => m.id));

  it("names only known features", () => {
    for (const m of ALL_MODULES) if (m.needs) expect(Object.keys(ALL_FEATURES)).toContain(m.needs);
  });

  it("keys only Sports, Find a work and Inbox; News and Weather need no key", () => {
    expect(ALL_MODULES.filter((m) => m.needs).map((m) => m.id)).toEqual(["sports", "inbox", "work"]);
  });

  it("shows every module with a web version when everything is set up", () => {
    expect(ids(on)).toHaveLength(ALL_MODULES.filter((m) => m.web !== false).length);
  });

  it("hides a module the server cannot run", () => {
    const list = ids({ ...on, features: { ...ALL_FEATURES, sports: false, ai: false } });
    expect(list).not.toContain("sports");
    expect(list).not.toContain("work");
    expect(list).not.toContain("inbox");
    expect(list).toContain("news");
  });

  it("hides what the account switched off, and admin-only tiles from others", () => {
    expect(ids({ ...on, hidden: ["gym"] })).not.toContain("gym");
    expect(ids({ ...on, isAdmin: false })).not.toContain("work");
  });

  it("drops a section with nothing left", () => {
    const people = MODULE_SECTIONS.find((s) => s.title.startsWith("People"))!.modules.map((m) => m.id);
    expect(visibleSections(MODULE_SECTIONS, { ...on, hidden: people }).map((s) => s.title)).not.toContain(
      MODULE_SECTIONS.find((s) => s.title.startsWith("People"))!.title,
    );
  });

  it("says why a module is hidden", () => {
    const sports = ALL_MODULES.find((m) => m.id === "sports")!;
    expect(hiddenReason(sports, { ...on, features: { ...ALL_FEATURES, sports: false } })).toBe("server");
    expect(hiddenReason(sports, { ...on, hidden: ["sports"] })).toBe("hidden");
    expect(toggleHidden(["sports"], "sports")).toEqual([]);
    expect(toggleHidden([], "gym")).toEqual(["gym"]);
  });
});

describe("web support", () => {
  const open = { features: ALL_FEATURES, hidden: [] as string[], isAdmin: true };
  const find = (id: string) => ALL_MODULES.find((m) => m.id === id)!;

  it("hides a module with no web version, last", () => {
    expect(hiddenReason(find("alarms"), open)).toBe("web");
  });

  it("shows a partly supported module", () => {
    expect(find("health").web).toBe("partial");
    expect(hiddenReason(find("health"), open)).toBeNull();
  });

  it("puts admin before web", () => {
    const m = { ...find("alarms"), adminOnly: true };
    expect(hiddenReason(m, { ...open, isAdmin: false })).toBe("admin");
  });

  it("puts hidden before web", () => {
    expect(hiddenReason(find("alarms"), { ...open, hidden: ["alarms"] })).toBe("hidden");
  });

  it("never lists alarms", () => {
    const ids = visibleSections(MODULE_SECTIONS, open).flatMap((s) => s.modules.map((m) => m.id));
    expect(ids).not.toContain("alarms");
  });

  it("uses web paths, not app links", () => {
    for (const m of ALL_MODULES) {
      expect(m.href.startsWith("/")).toBe(true);
      expect(m.href).not.toContain("myapp://");
    }
  });

  it("has the four main tabs", () => {
    expect(MAIN_TABS.map((t) => t.href)).toEqual(["/", "/money", "/todos", "/vehicle"]);
  });
});
