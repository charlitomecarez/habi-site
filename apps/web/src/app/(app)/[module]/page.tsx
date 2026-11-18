import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MODULE_ROUTE_IDS, moduleForRoute } from "@/lib/module-route";

export function generateStaticParams() {
  return MODULE_ROUTE_IDS.map((module) => ({ module }));
}

export async function generateMetadata({ params }: PageProps<"/[module]">): Promise<Metadata> {
  const found = moduleForRoute((await params).module);
  return found ? { title: found.label } : {};
}

/** A placeholder for each module until its wave replaces it. */
export default async function ModulePage({ params }: PageProps<"/[module]">) {
  const found = moduleForRoute((await params).module);
  if (!found) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-3 px-6 py-8 md:px-10 md:py-12">
      <h1 className="text-title-lg font-black text-ink">{found.label}</h1>
      <p className="text-body text-ink-muted">
        This part of Habi isn&apos;t on the web yet. Open it in the app for now.
      </p>
    </div>
  );
}
