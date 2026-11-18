import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("keeps a local path", () => {
    expect(safeNext("/money")).toBe("/money");
  });
  it("keeps the query string", () => {
    expect(safeNext("/todos?x=1")).toBe("/todos?x=1");
  });
  it.each([
    null,
    undefined,
    "",
    "//evil.com",
    "https://evil.com",
    "/\\evil.com",
    "javascript:alert(1)",
    "/login",
    "/login?next=%2Fmoney",
    "/\tevil.com",
    "money",
    "/..//evil.com",
    "/.//evil.com",
    "/%2e%2e//evil.com",
    "/a/..//evil.com",
    "/a/../login",
    "/%2e/auth/callback?code=x",
  ])("falls back to the root for %j", (next) => {
    expect(safeNext(next)).toBe("/");
  });
});
