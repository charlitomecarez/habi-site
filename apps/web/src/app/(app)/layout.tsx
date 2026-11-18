import { Suspense } from "react";
import { Shell } from "@/components/shell/shell";
import { ShellSkeleton } from "@/components/shell/shell-skeleton";

// No top-level await: the session is read inside Shell, behind the boundary.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
