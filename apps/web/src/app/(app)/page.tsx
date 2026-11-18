import type { Metadata } from "next";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-3 px-6 py-8 md:px-10 md:py-12">
      <h1 className="text-title-lg font-black text-ink">Home</h1>
      <p className="text-body text-ink-muted">
        I&apos;m moving here from the app. Home, Money, Todos and Vehicle come next.
      </p>
    </div>
  );
}
