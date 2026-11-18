import { describe, expect, it } from "vitest";
import { loginErrorMessage } from "./login-errors";

describe("loginErrorMessage", () => {
  it.each(["otp_disabled", "signup_disabled"])("says %s can't sign in", (code) => {
    expect(loginErrorMessage({ code }, "send")).toBe("This email can't sign in to Habi.");
  });
  it("falls back to the sign-ups message text", () => {
    expect(loginErrorMessage({ message: "Signups not allowed for otp" }, "send")).toBe(
      "This email can't sign in to Habi.",
    );
  });
  it("says an expired code has expired", () => {
    expect(loginErrorMessage({ code: "otp_expired" }, "verify")).toBe(
      "That code has expired. Send a new one.",
    );
  });
  it("says Google sign-in didn't finish", () => {
    expect(loginErrorMessage(null, "google")).toBe("Google sign-in didn't finish. Try again.");
  });
  it("falls back for an unknown error", () => {
    expect(loginErrorMessage({ code: "unexpected_failure" }, "send")).toBe(
      "Something went wrong. Try again.",
    );
    expect(loginErrorMessage({ message: "boom" }, "verify")).toBe(
      "Something went wrong. Try again.",
    );
  });
});
