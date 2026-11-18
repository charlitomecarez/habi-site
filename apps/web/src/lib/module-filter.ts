import "server-only";
import { mergeFeatures } from "@/lib/features";
import { ALL_FEATURES, type Features, type ModuleFilter } from "@/lib/modules";
import { createClient } from "@/lib/supabase/server";

const FEATURES_TIMEOUT_MS = 3000;

type Client = Awaited<ReturnType<typeof createClient>>;

/** Which keyed parts the server runs. On an error or a slow answer, every part counts as set up. */
async function readFeatures(supabase: Client): Promise<Features> {
  try {
    const { data, error } = await supabase.functions.invoke<Partial<Features>>("app-features", {
      method: "GET",
      timeout: FEATURES_TIMEOUT_MS,
    });
    if (error) throw error;
    return mergeFeatures(data);
  } catch (error) {
    console.warn("getModuleFilter: app-features failed, showing every module", error);
    return ALL_FEATURES;
  }
}

/** Settings › Modules. No row, or an error, hides nothing. */
async function readHidden(supabase: Client): Promise<readonly string[]> {
  const { data, error } = await supabase.from("user_settings").select("hidden_modules").maybeSingle();
  if (error) console.warn("getModuleFilter: user_settings failed", error.message);
  return data?.hidden_modules ?? [];
}

/** Row-level security returns the caller's own app_admins row, so any row means admin. */
async function readIsAdmin(supabase: Client): Promise<boolean> {
  const { data, error } = await supabase.from("app_admins").select("user_id").maybeSingle();
  if (error) console.warn("getModuleFilter: app_admins failed", error.message);
  return data !== null;
}

/**
 * What this account can and wants to see, read in parallel. Mirrors useModuleFilter in the app.
 * Private cache, like getCurrentUser: the Supabase client reads cookies and the clock, which a
 * runtime prefetch only allows inside a cache scope. Nothing is stored on the server.
 */
export async function getModuleFilter(): Promise<ModuleFilter> {
  "use cache: private";

  const supabase = await createClient();
  const [features, hidden, isAdmin] = await Promise.all([
    readFeatures(supabase),
    readHidden(supabase),
    readIsAdmin(supabase),
  ]);
  return { features, hidden, isAdmin };
}
