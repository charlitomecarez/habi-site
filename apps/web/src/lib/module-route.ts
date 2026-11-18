import { ALL_MODULES, MAIN_TABS } from "./modules";

export type ModuleRoute = { id: string; label: string };

/**
 * What /[module] can serve: the tabs other than Home (Home is /) and every module that works
 * on the web at least in part. App-only modules, such as Alarms, have no web page.
 */
const ROUTES: readonly ModuleRoute[] = [
  ...MAIN_TABS.filter((t) => t.id !== "home").map(({ id, label }) => ({ id, label })),
  ...ALL_MODULES.filter((m) => m.web !== false).map(({ id, label }) => ({ id, label })),
];

export const MODULE_ROUTE_IDS: readonly string[] = ROUTES.map((r) => r.id);

/** The module a /[module] segment names, or null when there is no such page. */
export function moduleForRoute(id: string): ModuleRoute | null {
  return ROUTES.find((r) => r.id === id) ?? null;
}
