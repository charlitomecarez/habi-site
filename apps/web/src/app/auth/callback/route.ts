import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { seedMoneyDefaults } from "@/lib/seed";
import { createClient } from "@/lib/supabase/server";

// Google sends the visitor back here with a one-time code to swap for a session.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const failed = () => NextResponse.redirect(new URL("/login?error=google", origin));
  if (searchParams.get("error") || !code) return failed();

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.warn("exchangeCodeForSession failed", error.message);
    return failed();
  }
  await seedMoneyDefaults(supabase);
  return NextResponse.redirect(new URL(safeNext(searchParams.get("next")), origin));
}
