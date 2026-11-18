export const PUBLIC_PATHS = ["/login", "/auth/callback"];

function isPublic(pathname: string): boolean {
  const path = pathname.split("?")[0];
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

/**
 * Where a request should be redirected given the auth state, or null to let
 * it through. `pathname` may include the query string.
 */
export function authRedirect(pathname: string, signedIn: boolean): string | null {
  const path = pathname.split("?")[0];
  if (!signedIn) {
    if (isPublic(pathname)) return null;
    if (pathname === "/" || path === "/") return "/login";
    return `/login?next=${encodeURIComponent(pathname)}`;
  }
  if (path === "/login") return "/";
  return null;
}
