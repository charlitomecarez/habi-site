import { describe, expect, it } from "vitest";
import { mergeFeatures } from "./features";
import { ALL_FEATURES } from "./modules";

describe("mergeFeatures", () => {
  it("returns every feature on for null", () => {
    expect(mergeFeatures(null)).toEqual(ALL_FEATURES);
  });

  it("returns every feature on for undefined", () => {
    expect(mergeFeatures(undefined)).toEqual(ALL_FEATURES);
  });

  it("switches off a feature the server says is off", () => {
    expect(mergeFeatures({ ai: false })).toEqual({ ...ALL_FEATURES, ai: false });
  });

  it("ignores a value that isn't a boolean", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mergeFeatures({ ai: "no" as any })).toEqual(ALL_FEATURES);
  });

  it("drops keys it doesn't know", () => {
    const merged = mergeFeatures({ tip: false, rockets: false } as Partial<Record<string, boolean>>);
    expect(merged).toEqual({ ...ALL_FEATURES, tip: false });
    expect(Object.keys(merged).sort()).toEqual(Object.keys(ALL_FEATURES).sort());
  });

  it("ignores a body that isn't an object", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mergeFeatures("oops" as any)).toEqual(ALL_FEATURES);
  });

  it("doesn't change ALL_FEATURES", () => {
    mergeFeatures({ sports: false });
    expect(ALL_FEATURES.sports).toBe(true);
  });
});
