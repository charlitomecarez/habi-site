"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginErrorMessage, type LoginErrorKind } from "@/lib/login-errors";
import { safeNext } from "@/lib/safe-next";
import { seedMoneyDefaults } from "@/lib/seed";
import { createClient } from "@/lib/supabase/browser";

type Busy = LoginErrorKind | null;

// The live project sends 8 digits (Auth › otp_length); 6 to 8 keeps working if it changes.
const CODE_PATTERN = /^\d{6,8}$/;

function asAuthError(e: unknown): { code?: string; message?: string } {
  if (e && typeof e === "object") {
    const { code, message } = e as { code?: unknown; message?: unknown };
    return {
      code: typeof code === "string" ? code : undefined,
      message: typeof message === "string" ? message : undefined,
    };
  }
  return {};
}

function GoogleMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

type LoginFormProps = { next: string | null; initialError: string | null };

export function LoginForm({ next, initialError }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const sentId = useId();

  // Coming back from Google with the back button restores this page from the
  // back-forward cache, spinner and all; clear it.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setBusy(null);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function run(kind: LoginErrorKind, action: () => Promise<{ done: boolean }>) {
    setBusy(kind);
    setError(null);
    setFieldError(null);
    try {
      const { done } = await action();
      // A finished action is navigating away, so the button keeps its spinner.
      if (!done) setBusy(null);
    } catch (e) {
      setError(loginErrorMessage(asAuthError(e), kind));
      setBusy(null);
    }
  }

  const onGoogle = () =>
    run("google", async () => {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
      const { error: oauthError } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
      return { done: true };
    });

  const sendCode = () =>
    run("send", async () => {
      const { error: sendError } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false },
      });
      if (sendError) throw sendError;
      setCode("");
      setCodeSent(true);
      return { done: false };
    });

  function onSendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!email.trim().includes("@")) {
      setFieldError("Enter your email address.");
      return;
    }
    void sendCode();
  }

  function onVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!CODE_PATTERN.test(code.trim())) {
      setFieldError("Enter the code from the email. It's 6 to 8 digits.");
      return;
    }
    void run("verify", async () => {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (verifyError) throw verifyError;
      await seedMoneyDefaults(supabase);
      router.replace(safeNext(next));
      return { done: true };
    });
  }

  function changeEmail() {
    setCodeSent(false);
    setCode("");
    setError(null);
    setFieldError(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {codeSent ? (
        <>
          <div className="flex flex-col gap-2">
            <h2 className="text-title font-bold text-ink">Check your email</h2>
            <p id={sentId} className="text-body text-ink-muted">
              I sent a code to <span className="font-bold break-all text-ink">{email.trim()}</span>.
            </p>
          </div>
          <form noValidate onSubmit={onVerifyCode} className="flex flex-col gap-4">
            <Input
              label="Code from the email"
              name="code"
              value={code}
              // Strip spaces from a pasted "1234 5678" before capping the length.
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="12345678"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              aria-describedby={sentId}
              error={fieldError}
              readOnly={busy !== null}
            />
            <Button type="submit" loading={busy === "verify"} disabled={busy !== null}>
              Verify code
            </Button>
          </form>
          <div className="flex flex-wrap justify-center gap-x-2">
            <Button
              variant="plain"
              loading={busy === "send"}
              disabled={busy !== null}
              onClick={() => void sendCode()}
            >
              Send a new code
            </Button>
            <Button variant="plain" disabled={busy !== null} onClick={changeEmail}>
              Use a different email
            </Button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-title font-bold text-ink">Sign in</h2>
          <Button
            icon={<GoogleMark />}
            loading={busy === "google"}
            disabled={busy !== null}
            onClick={onGoogle}
          >
            Continue with Google
          </Button>
          <div className="flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-border-input" />
            <span className="text-caption text-ink-muted">or</span>
            <span className="h-px flex-1 bg-border-input" />
          </div>
          <form noValidate onSubmit={onSendCode} className="flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              error={fieldError}
              readOnly={busy !== null}
            />
            <Button
              type="submit"
              variant="secondary"
              loading={busy === "send"}
              disabled={busy !== null}
            >
              Email me a code
            </Button>
          </form>
        </>
      )}

      {error ? (
        <p role="alert" className="rounded-md bg-danger-tint p-3 text-label text-danger">
          {error}
        </p>
      ) : null}

      <p className="text-center text-caption text-ink-muted">Private app. Only your account can sign in.</p>
    </div>
  );
}
