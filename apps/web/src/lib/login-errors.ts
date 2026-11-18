export type LoginErrorKind = "google" | "send" | "verify";

const NOT_ALLOWED = "This email can't sign in to Habi.";
const EXPIRED = "That code has expired. Send a new one.";
const GOOGLE = "Google sign-in didn't finish. Try again.";
const FALLBACK = "Something went wrong. Try again.";

/** Plain copy for a Supabase Auth error on the login page. */
export function loginErrorMessage(
  e: { code?: string; message?: string } | null,
  kind: LoginErrorKind,
): string {
  const code = e?.code;
  // An unknown email with shouldCreateUser: false comes back as otp_disabled
  // ("Signups not allowed for otp"); signup_disabled is the sign-up-off code.
  if (
    code === "otp_disabled" ||
    code === "signup_disabled" ||
    e?.message?.includes("Signups not allowed")
  ) {
    return NOT_ALLOWED;
  }
  if (code === "otp_expired") return EXPIRED;
  if (kind === "google") return GOOGLE;
  return FALLBACK;
}
