import { NextResponse, type NextRequest } from "next/server";
import { callbackErrorKind } from "@/lib/callback-error";
import { safeNext } from "@/lib/safe-next";
import { seedMoneyDefaults } from "@/lib/seed";
import { createClient } from "@/lib/supabase/server";

// Google sends the visitor back here with a one-time code to swap for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = (path: string) => {
    const res = NextResponse.redirect(new URL(path, origin));
    res.headers.set("Cache-Control", "private, no-store");
    return res;
  };
  const failed = () => redirect("/login?error=google");
  const kind = callbackErrorKind(searchParams);
  if (kind === "denied") return redirect("/login?error=denied");
  if (kind || !code) return failed();

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.warn("exchangeCodeForSession failed", error.message);
    return failed();
  }
  await seedMoneyDefaults(supabase);
  return redirect(safeNext(searchParams.get("next")));
}
