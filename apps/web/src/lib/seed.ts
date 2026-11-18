import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Adds the default money accounts and categories once; a no-op after that.
 * Never throws: a failed seed must not block sign-in.
 */
export async function seedMoneyDefaults(client: SupabaseClient<Database>): Promise<void> {
  try {
    const { error } = await client.rpc("seed_money_defaults");
    if (error) console.warn("seed_money_defaults failed", error.message);
  } catch (error) {
    console.warn("seed_money_defaults failed", error);
  }
}
