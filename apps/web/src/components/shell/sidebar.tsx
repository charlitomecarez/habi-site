"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { signOut } from "@/app/actions/sign-out";
import type { ModuleEntry } from "@/lib/modules";
import { Icon, TAB_ICONS } from "./icons";

export type NavTab = { id: string; label: string; href: string };
export type NavModule = Pick<ModuleEntry, "id" | "label" | "href" | "icon" | "tone">;
export type NavSection = { title: string; modules: readonly NavModule[] };

type SidebarProps = {
  email: string;
  tabs: readonly NavTab[];
  sections: readonly NavSection[];
  children: ReactNode;
};

const TILE: Record<NavModule["tone"], string> = {
  daily: "bg-daily-field",
  people: "bg-people-field",
  home: "bg-home-field",
  records: "bg-records-field",
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// The open link is a filled cream pill in bold: a change of shape and weight, not colour alone.
function linkClass(active: boolean): string {
  return `flex min-h-touch items-center gap-3 rounded-md px-3 text-body motion-safe:transition-colors ${
    active ? "bg-on-shell font-bold text-on-shell-ink" : "font-medium text-on-shell hover:bg-on-shell/10"
  }`;
}

type NavProps = {
  label: string;
  email: string;
  tabs: readonly NavTab[];
  sections: readonly NavSection[];
  pathname: string;
  onNavigate?: () => void;
};

function Nav({ label, email, tabs, sections, pathname, onNavigate }: NavProps) {
  const headingId = useId();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav
        aria-label={label}
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-color:rgb(var(--on-shell)/0.3)_transparent] [scrollbar-width:thin]"
      >
        <ul className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.id}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={linkClass(active)}
                >
                  <Icon name={TAB_ICONS[tab.id] ?? ""} className="size-6" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {sections.map((section, i) => (
          <section key={section.title} aria-labelledby={`${headingId}-${i}`} className="flex flex-col gap-1">
            <h2 id={`${headingId}-${i}`} className="px-3 pb-1 text-caption font-medium text-on-shell/75">
              {section.title}
            </h2>
            <ul className="flex flex-col gap-0.5">
              {section.modules.map((m) => {
                const active = isActive(pathname, m.href);
                return (
                  <li key={m.id}>
                    <Link
                      href={m.href}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={linkClass(active)}
                    >
                      <span
                        aria-hidden
                        className={`grid size-8 shrink-0 place-items-center rounded-sm text-on-field ${TILE[m.tone]}`}
                      >
                        <Icon name={m.icon} className="size-[18px]" />
                      </span>
                      {m.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="flex shrink-0 flex-col gap-1 border-t border-on-shell/15 px-3 py-3">
        <p className="truncate px-3 text-caption text-on-shell/75" title={email || undefined}>
          {email || "Signed in"}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex min-h-touch w-full items-center gap-3 rounded-md px-3 text-body font-medium text-on-shell hover:bg-on-shell/10 motion-safe:transition-colors"
          >
            <Icon name="log-out-outline" className="size-6" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

/** The frame of every signed-in page: a sidebar from 768 px, a top bar and a menu panel below. */
export function Sidebar({ email, tabs, sections, children }: SidebarProps) {
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so a route change closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const panelId = useId();
  const aside = useRef<HTMLElement>(null);

  // Keep the open module in view in a long sidebar, such as after a reload on /work.
  useEffect(() => {
    aside.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" });
  }, [pathname]);

  useEffect(() => {
    if (open) {
      panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    } else if (wasOpen.current) {
      menuButton.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenOn(null);
    };
    // Widening past 768 px hides the panel, so close it rather than leave the page inert.
    const wide = window.matchMedia("(min-width: 768px)");
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches) setOpenOn(null);
    };
    const root = document.documentElement;
    root.classList.add("max-md:overflow-hidden");
    document.addEventListener("keydown", onKeyDown);
    wide.addEventListener("change", onWide);
    return () => {
      root.classList.remove("max-md:overflow-hidden");
      document.removeEventListener("keydown", onKeyDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const close = () => setOpenOn(null);

  return (
    <div className="flex min-h-dvh flex-1 flex-col md:flex-row">
      <a
        href="#content"
        className="sr-only z-50 rounded-md border border-border bg-surface-card text-body font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-4 focus:py-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between bg-shell px-4 text-on-shell md:hidden [&_:focus-visible]:outline-on-shell">
        <Link href="/" className="rounded-sm px-1 text-title font-black">
          Habi
        </Link>
        <button
          ref={menuButton}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpenOn(open ? null : pathname)}
          className="flex min-h-touch items-center gap-2 rounded-md px-3 text-body font-bold hover:bg-on-shell/10 motion-safe:transition-colors"
        >
          <Icon name={open ? "close" : "menu"} className="size-6" />
          Menu
        </button>
      </header>

      <div
        id={panelId}
        ref={panel}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-20 flex flex-col bg-shell text-on-shell md:hidden [&_:focus-visible]:outline-on-shell"
      >
        {open && (
          <Nav label="Menu" email={email} tabs={tabs} sections={sections} pathname={pathname} onNavigate={close} />
        )}
      </div>

      <aside ref={aside} className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-shell text-on-shell md:flex [&_:focus-visible]:outline-on-shell">
        <div className="weave field-shell px-6 pb-5 pt-6">
          <Link href="/" className="rounded-sm text-title-lg font-black">
            Habi
          </Link>
        </div>
        <Nav label="Main" email={email} tabs={tabs} sections={sections} pathname={pathname} />
      </aside>

      <main id="content" tabIndex={-1} inert={open} className="flex min-w-0 flex-1 flex-col outline-none">
        {children}
      </main>
    </div>
  );
}
