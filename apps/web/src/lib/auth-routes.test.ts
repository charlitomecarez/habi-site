import { describe, expect, it } from "vitest";
import { authRedirect } from "./auth-routes";

describe("authRedirect", () => {
  it("sends signed-out users to login with next", () => {
    expect(authRedirect("/money", false)).toBe("/login?next=%2Fmoney");
  });
  it("omits next for the root", () => {
    expect(authRedirect("/", false)).toBe("/login");
  });
  it("sends signed-in users away from login", () => {
    expect(authRedirect("/login", true)).toBe("/");
  });
  it("leaves the auth callback public", () => {
    expect(authRedirect("/auth/callback", false)).toBeNull();
  });
  it("lets signed-in users through", () => {
    expect(authRedirect("/money", true)).toBeNull();
  });
  it("keeps path and query in next", () => {
    expect(authRedirect("/money/transactions?x=1", false)).toBe(
      "/login?next=%2Fmoney%2Ftransactions%3Fx%3D1",
    );
  });
});
