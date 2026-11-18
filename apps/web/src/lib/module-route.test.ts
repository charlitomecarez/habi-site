import { describe, expect, it } from "vitest";
import { ALL_MODULES } from "./modules";
import { MODULE_ROUTE_IDS, moduleForRoute } from "./module-route";

describe("moduleForRoute", () => {
  it("finds a module from ALL_MODULES", () => {
    expect(moduleForRoute("habits")).toEqual({ id: "habits", label: "Habits" });
  });

  it("finds the money, todos and vehicle tabs", () => {
    expect(moduleForRoute("money")).toEqual({ id: "money", label: "Money" });
    expect(moduleForRoute("todos")).toEqual({ id: "todos", label: "Todos" });
    expect(moduleForRoute("vehicle")).toEqual({ id: "vehicle", label: "Vehicle" });
  });

  it("refuses home, which lives at /", () => {
    expect(moduleForRoute("home")).toBeNull();
  });

  it("refuses a module that is app only", () => {
    expect(moduleForRoute("alarms")).toBeNull();
  });

  it("refuses an unknown id", () => {
    expect(moduleForRoute("nope")).toBeNull();
    expect(moduleForRoute("")).toBeNull();
    expect(moduleForRoute("HABITS")).toBeNull();
  });
});

describe("MODULE_ROUTE_IDS", () => {
  it("lists every routable id once", () => {
    const expected = [
      "money",
      "todos",
      "vehicle",
      ...ALL_MODULES.filter((m) => m.web !== false).map((m) => m.id),
    ];
    expect([...MODULE_ROUTE_IDS].sort()).toEqual(expected.sort());
    expect(new Set(MODULE_ROUTE_IDS).size).toBe(MODULE_ROUTE_IDS.length);
  });
});
