import { PUBLIC_PATHS } from "@/lib/auth-routes";

const BASE = "http://habi.invalid";

/**
 * Where to go after signing in. Only a local path with a single leading slash
 * passes; anything else (another origin, a scheme, a backslash trick, the auth
 * pages themselves) falls back to the root.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || next[0] !== "/" || next[1] === "/" || next[1] === "\\") return "/";
  // Browsers strip tabs and newlines from URLs, so "/\t/evil.com" becomes "//evil.com".
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return "/";

  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return "/";
  }
  if (url.origin !== BASE) return "/";
  // URL collapses dot-segments ("/..//evil.com" becomes "//evil.com"), so check
  // the normalised path again before returning it.
  const path = url.pathname;
  if (path.startsWith("//") || path.startsWith("/\\")) return "/";
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return "/";
  return path + url.search + url.hash;
}
