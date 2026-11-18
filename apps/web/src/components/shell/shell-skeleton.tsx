/** The shell's shape while the session and modules load. Static, so it prerenders. */
export function ShellSkeleton() {
  return (
    <div aria-busy className="flex min-h-dvh flex-1 flex-col md:flex-row">
      <p className="sr-only" role="status">
        Loading
      </p>
      <div className="flex h-16 shrink-0 items-center bg-shell px-5 text-title font-black text-on-shell md:hidden">
        Habi
      </div>
      <div aria-hidden className="hidden h-dvh w-64 shrink-0 flex-col bg-shell text-on-shell md:flex">
        <div className="weave field-shell px-6 pb-5 pt-6 text-title-lg font-black">Habi</div>
        {/* Rows match the sidebar's (48 px, same gaps), so nothing jumps when it arrives. */}
        <div className="flex flex-col gap-6 px-3 py-4">
          <div className="flex flex-col gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex h-touch items-center gap-3 px-3">
                <div className="size-6 rounded-sm bg-on-shell/10 motion-safe:animate-pulse" />
                <div className="h-4 w-20 rounded-sm bg-on-shell/10 motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="mx-3 mb-2 mt-1 h-3 w-16 rounded-sm bg-on-shell/10 motion-safe:animate-pulse" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex h-touch items-center gap-3 px-3">
                <div className="size-8 rounded-sm bg-on-shell/10 motion-safe:animate-pulse" />
                <div className="h-4 w-20 rounded-sm bg-on-shell/10 motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="flex flex-1 flex-col gap-4 px-6 py-8 md:px-10 md:py-12">
        <div className="h-8 w-40 rounded-sm bg-surface-muted motion-safe:animate-pulse" />
        <div className="h-4 w-full max-w-md rounded-sm bg-surface-muted motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
