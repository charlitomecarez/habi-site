import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authRedirect } from "@/lib/auth-routes";
import { getSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Anti-caching headers from setAll; kept so they survive response re-creation.
  let authHeaders: Record<string, string> = {};
  let signedIn = false;
  try {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          authHeaders = { ...authHeaders, ...headers };
          Object.entries(authHeaders).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    });
    // getClaims validates the JWT and refreshes the session if needed.
    const { data } = await supabase.auth.getClaims();
    signedIn = !!data?.claims;
  } catch (error) {
    console.error("proxy: session check failed, treating as signed out", error);
  }
  return { response, authHeaders, signedIn };
}

export async function proxy(request: NextRequest) {
  const { response, authHeaders, signedIn } = await updateSession(request);
  const { pathname, search } = request.nextUrl;
  const target = authRedirect(pathname + search, signedIn);
  if (!target) return response;

  const redirect = NextResponse.redirect(new URL(target, request.url));
  response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  Object.entries(authHeaders).forEach(([k, v]) => redirect.headers.set(k, v));
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|mp4|webm)$).*)",
  ],
};
