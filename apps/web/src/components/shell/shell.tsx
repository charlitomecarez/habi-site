import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/current-user";
import { getModuleFilter } from "@/lib/module-filter";
import { MAIN_TABS, MODULE_SECTIONS, visibleSections } from "@/lib/modules";
import { Sidebar, type NavSection } from "./sidebar";

/** Reads the session and the module filter inside the layout's Suspense boundary. */
export async function Shell({ children }: { children: ReactNode }) {
  const [user, filter] = await Promise.all([getCurrentUser(), getModuleFilter()]);
  // Only what the client draws crosses the boundary.
  const sections: NavSection[] = visibleSections(MODULE_SECTIONS, filter).map((s) => ({
    title: s.title,
    modules: s.modules.map(({ id, label, href, icon, tone }) => ({ id, label, href, icon, tone })),
  }));
  const tabs = MAIN_TABS.map(({ id, label, href }) => ({ id, label, href }));

  return (
    <Sidebar email={user.email} tabs={tabs} sections={sections}>
      {children}
    </Sidebar>
  );
}
