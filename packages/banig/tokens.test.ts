import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf8");

function parseBlock(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const darkMatch = css.match(/@media \(prefers-color-scheme: dark\)\s*\{\s*:root\s*\{([^}]*)\}/);
const lightMatch = css.match(/:root\s*\{([^}]*)\}/);
const light = parseBlock(lightMatch?.[1] ?? "");
const dark = parseBlock(darkMatch?.[1] ?? "");

const REQUIRED = [
  "surface-page", "surface-card", "surface-muted", "border", "border-input", "divider",
  "ink", "ink-muted", "on-accent", "accent", "accent-strong", "accent-tint", "shell", "on-shell",
  "good", "watch", "over", "good-fill", "watch-fill", "over-fill",
  "daily", "daily-tint", "people", "people-tint", "home", "home-tint", "records", "records-tint",
  "warning", "warning-tint", "danger", "danger-tint",
];
const FIELDS = ["daily-field", "people-field", "home-field", "records-field", "shell-field", "on-field"];

const isTriple = (v: string | undefined) =>
  !!v && /^\d{1,3} \d{1,3} \d{1,3}$/.test(v) && v.split(" ").every((n) => Number(n) <= 255);

describe("banig tokens", () => {
  it.each(REQUIRED)("defines %s in light and dark as an RGB triple", (name) => {
    expect(isTriple(light[name]), `light ${name}: ${light[name]}`).toBe(true);
    expect(isTriple(dark[name]), `dark ${name}: ${dark[name]}`).toBe(true);
  });

  it.each(FIELDS)("defines %s in light as an RGB triple", (name) => {
    expect(isTriple(light[name]), `light ${name}: ${light[name]}`).toBe(true);
  });

  it("uses the Banig brand values", () => {
    expect(light["accent"]).toBe("35 32 92");
    expect(dark["accent"]).toBe("185 180 255");
    expect(light["surface-page"]).toBe("244 236 214");
  });
});
