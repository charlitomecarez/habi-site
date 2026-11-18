import { describe, expect, it } from "vitest";
import { callbackErrorKind } from "./callback-error";

const p = (q: string) => new URLSearchParams(q);

describe("callbackErrorKind", () => {
  it("sends signup_disabled to denied", () => {
    expect(callbackErrorKind(p("error=access_denied&error_code=signup_disabled"))).toBe("denied");
  });
  it("sends otp_disabled to denied", () => {
    expect(callbackErrorKind(p("error=access_denied&error_code=otp_disabled"))).toBe("denied");
  });
  it("sends a Signups not allowed description to denied", () => {
    expect(
      callbackErrorKind(p("error=access_denied&error_description=Signups+not+allowed+for+this+instance")),
    ).toBe("denied");
  });
  it("treats a plain access_denied as google", () => {
    expect(callbackErrorKind(p("error=access_denied"))).toBe("google");
  });
  it("treats no error and no code as google", () => {
    expect(callbackErrorKind(p(""))).toBe("google");
  });
  it("returns null for a code with no error", () => {
    expect(callbackErrorKind(p("code=abc"))).toBeNull();
  });
});
