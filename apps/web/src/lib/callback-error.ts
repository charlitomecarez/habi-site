/**
 * What the Google callback should tell the login page: "denied" when Supabase
 * turned the account away because sign-ups are off, "google" for any other
 * failure, or null when there is nothing wrong and a code to exchange.
 */
export function callbackErrorKind(params: URLSearchParams): "denied" | "google" | null {
  const errorCode = params.get("error_code");
  if (
    errorCode === "signup_disabled" ||
    errorCode === "otp_disabled" ||
    params.get("error_description")?.includes("Signups not allowed")
  ) {
    return "denied";
  }
  if (params.get("error") || !params.get("code")) return "google";
  return null;
}
