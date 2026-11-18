import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
let setAllOnCall = true;

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    opts: { cookies: { setAll: (c: unknown[], h: Record<string, string>) => void } },
  ) => ({
    auth: {
      getClaims: async () => {
        if (setAllOnCall) {
          opts.cookies.setAll(
            [{ name: "sb-token", value: "abc", options: { path: "/" } }],
            { "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0", Pragma: "no-cache" },
          );
        }
        return getClaims();
      },
    },
  }),
}));

import { proxy } from "./proxy";

const req = (path: string) => new NextRequest(`http://localhost:3000${path}`);

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy";
  setAllOnCall = true;
  getClaims.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("proxy", () => {
  it("signed-in response carries the cookie and cache headers", async () => {
    getClaims.mockResolvedValue({ data: { claims: { sub: "u" } } });
    const res = await proxy(req("/money"));
    expect(res.headers.get("location")).toBeNull();
    expect(res.cookies.get("sb-token")?.value).toBe("abc");
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("signed-out redirect keeps cookie and headers", async () => {
    getClaims.mockResolvedValue({ data: null });
    const res = await proxy(req("/money"));
    expect(new URL(res.headers.get("location")!).pathname + new URL(res.headers.get("location")!).search).toBe("/login?next=%2Fmoney");
    expect(res.cookies.get("sb-token")?.value).toBe("abc");
    expect(res.headers.get("Cache-Control")).toContain("no-store");
    expect(res.headers.get("Pragma")).toBe("no-cache");
  });

  it("a throwing getClaims redirects to login instead of throwing", async () => {
    setAllOnCall = false;
    getClaims.mockRejectedValue(new Error("boom"));
    const res = await proxy(req("/money"));
    const loc = new URL(res.headers.get("location")!);
    expect(loc.pathname + loc.search).toBe("/login?next=%2Fmoney");
    expect(console.error).toHaveBeenCalled();
  });
});
