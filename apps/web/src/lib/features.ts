import { ALL_FEATURES, type Feature, type Features } from "./modules";

const FEATURE_KEYS = Object.keys(ALL_FEATURES) as Feature[];

/**
 * The app-features answer laid over ALL_FEATURES. Only known keys with a boolean value count,
 * so a missing, partial or malformed answer leaves those modules showing.
 */
export function mergeFeatures(data: Partial<Features> | null | undefined): Features {
  const merged: Features = { ...ALL_FEATURES };
  if (!data || typeof data !== "object") return merged;
  for (const key of FEATURE_KEYS) {
    const value: unknown = data[key];
    if (typeof value === "boolean") merged[key] = value;
  }
  return merged;
}
