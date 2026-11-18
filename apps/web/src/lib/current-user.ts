import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string };

/**
 * The signed-in user, or a redirect to /login. The proxy already sends signed-out visitors
 * away; this is the check close to the data. Private cache: kept per browser, never on the server.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  "use cache: private";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) redirect("/login");

  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
}
