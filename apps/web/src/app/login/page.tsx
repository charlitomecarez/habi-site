import type { Metadata } from "next";
import { Suspense } from "react";
import { loginErrorMessage } from "@/lib/login-errors";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

function first(value: string | string[] | undefined): string | null {
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

async function LoginFromParams({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const initialError = first(params.error) === "google" ? loginErrorMessage(null, "google") : null;
  return <LoginForm next={first(params.next)} initialError={initialError} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col md:flex-row">
      <section className="weave field-shell relative flex flex-col justify-end gap-2 px-6 pb-12 pt-16 md:w-5/12 md:px-12 md:pb-16">
        <h1 className="text-display font-black">Habi</h1>
        <p className="max-w-xs text-body text-on-field/85">
          Todos, your bike, your room and your passwords, in one place.
        </p>
        <div aria-hidden className="strip absolute inset-x-0 bottom-0" />
      </section>

      <div className="flex flex-1 items-start justify-center bg-surface-page px-6 py-10 md:items-center md:px-12">
        <div className="w-full max-w-sm">
          <Suspense fallback={<div aria-hidden className="min-h-80" />}>
            <LoginFromParams searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
