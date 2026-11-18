import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Database } from "@/types/database";
import { seedMoneyDefaults } from "./seed";

function clientWith(rpc: () => Promise<unknown>) {
  return { rpc: vi.fn(rpc) } as unknown as SupabaseClient<Database> & { rpc: ReturnType<typeof vi.fn> };
}

describe("seedMoneyDefaults", () => {
  afterEach(() => vi.restoreAllMocks());

  it("calls the seed RPC", async () => {
    const client = clientWith(async () => ({ error: null }));
    await seedMoneyDefaults(client);
    expect(client.rpc).toHaveBeenCalledWith("seed_money_defaults");
  });
  it("warns and resolves when the RPC returns an error", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = clientWith(async () => ({ error: { message: "nope" } }));
    await expect(seedMoneyDefaults(client)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith("seed_money_defaults failed", "nope");
  });
  it("warns and resolves when the RPC throws", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = clientWith(async () => {
      throw new Error("offline");
    });
    await expect(seedMoneyDefaults(client)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});
