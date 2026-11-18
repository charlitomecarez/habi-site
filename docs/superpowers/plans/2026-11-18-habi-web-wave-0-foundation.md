# Habi web, Wave 0 (foundation): implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A deployed `apps/web` that a person on the admin's list can sign in to (Google or email code), and that shows the Banig shell with a sidebar of the modules they can see. No module screens yet; those start in Wave 1.

**Architecture:**
- The Banig tokens move into a workspace package, `packages/banig`, which `apps/web` imports through Tailwind 4 `@theme`.
- Auth uses `@supabase/ssr` with cookie sessions. `src/proxy.ts` refreshes the session and gates routes.
- Pages read the session only inside `<Suspense>`, because `cacheComponents` is on.
- Module visibility comes from a port of `my-app/lib/modules.ts`, plus a `web` field.

**Tech stack:** Next.js 16.4.5 (App Router, `cacheComponents`, `proxy.ts`), React 19.3, Tailwind 4, TypeScript, `@supabase/ssr` + `@supabase/supabase-js`, Vitest, pnpm workspaces, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-18-habi-web-app-design.md`

## Global constraints

- Next.js in this repo has breaking changes. Read the relevant file in `apps/web/node_modules/next/dist/docs/` before writing Next code. Use `proxy.ts`, not `middleware.ts`.
- With `cacheComponents: true` (already in `apps/web/next.config.ts`), reading `cookies()` outside `<Suspense>` is a build error. Never `await` the session at the top level of a layout. See `docs/01-app/02-guides/authentication-with-cache-components.md`.
- Use the same Supabase project as `my-app`. The env vars are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The service-role key never appears in `apps/web` or in Vercel.
- Sign-up stays off. Email codes are sent with `shouldCreateUser: false`, and there's no sign-up UI.
- Banig rules from `my-app/docs/design-system.md`:
  - token classes only, never hex codes in components
  - borders, not shadows
  - one primary action per screen
  - status shown with a word plus `good`, `watch` or `over`
  - sentence case
  - a button names its action
  - inputs use 16 px text
  - visible focus
  - honour reduced motion
- Schibsted Grotesk, at weights 400, 500, 700 and 900.
- Every new screen gets `/impeccable shape` before code, and `/impeccable audit` and `/impeccable critique` after.
- Each file ported from `my-app` starts with the comment `// Ported from my-app/<path> @ <short sha>`.
- Commits follow Conventional Commits (the repo uses `feat:`, `fix:`, `chore:`, `docs:`).

## Review focus

1. **A session that expires mid-use.** The proxy refreshes it silently. If the refresh fails, the next navigation lands on `/login?next=<path>`, never on an error page. *(Task 3 test)*
2. **A crafted `next` parameter** (`//evil.com`, `https://evil.com`, `/\evil.com`). After sign-in, you land on `/`, never off-site. *(Task 4 test)*
3. **An email that isn't on the admin's list.** No account gets created. The page says "This email can't sign in to Habi." *(Task 4 test)*
4. **The `app-features` function fails or is slow.** Every feature counts as set up, so no module flickers out of the sidebar. *(Task 5 test)*
5. **Google sign-in is cancelled or errors** (the callback arrives with `?error=` or with no `code`). You're back on `/login` with "Google sign-in didn't finish. Try again." *(Task 4 test)*

---

### Task 1: The `packages/banig` token package

**Files:**
- Create: `packages/banig/package.json` (name `@habi/banig`, `private: true`, exports `./tokens.css` and `./theme.css`)
- Create: `packages/banig/tokens.css`. These are the `:root` light and dark RGB triples. Use the union of the names in `my-app/global.css` and `apps/site/src/styles/global.css`, keeping the values from `my-app/global.css` where both define a name.
- Create: `packages/banig/theme.css`. This is a Tailwind 4 `@theme inline` block that maps `--color-<name>: rgb(var(--<name>))` for every token, plus:
  - font sizes: `say` 30, `display` 34, `amount` 20, `title-lg` 26, `title` 20, `heading` 16, `body` 16, `label` 14, `caption` 13, `badge` 12, in px
  - radii: `sm` 10, `md` 12, `input` 14, `card` 16, `hero` 20, `sheet` 28, `pill` 999
  - spacing: `touch` 48, `input` 52, `button` 56
- Create: `packages/banig/weave.css`, with the `.weave`, `.weave--deep`, `.field-*` and `.strip` rules, copied from the site.
- Create: `packages/banig/tokens.test.ts`
- Modify: `pnpm-workspace.yaml`, adding `packages/*`
- Modify: `apps/web/package.json`, adding `"@habi/banig": "workspace:*"`

**Interfaces:**
- Produces: `@import "@habi/banig/tokens.css"`, `@import "@habi/banig/theme.css"` and `@import "@habi/banig/weave.css"`. Utility classes like `bg-surface-page`, `text-ink`, `border-border`, `bg-accent`, `text-good`, `bg-daily-tint`, `rounded-card`, `text-title` and `h-touch`.

- [ ] **Step 1: Write the failing test.**
  `tokens.test.ts` reads `tokens.css` and parses the light block and the `prefers-color-scheme: dark` block. It asserts:
  - Every name in `REQUIRED` exists in both blocks, as three integers from 0 to 255.
  - Light `--accent` is `35 32 92` and dark `--accent` is `185 180 255`.
  - Light `--surface-page` is `244 236 214`.

  `REQUIRED` is `surface-page, surface-card, surface-muted, border, border-input, divider, ink, ink-muted, on-accent, accent, accent-strong, accent-tint, shell, on-shell, good, watch, over, good-fill, watch-fill, over-fill, daily, daily-tint, people, people-tint, home, home-tint, records, records-tint, warning, warning-tint, danger, danger-tint`.
  Field tokens (`*-field`, `on-field`) are required in light only.
- [ ] **Step 2: Run** `pnpm vitest run packages/banig`. Expected: FAIL (the file is missing). Add a root `vitest.config.ts` with `projects: ["packages/*", "apps/web"]`, and add `"test": "vitest run"` to the root `package.json`.
- [ ] **Step 3: Write the three CSS files and `package.json`** as listed above.
- [ ] **Step 4: Run** `pnpm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(banig): add the shared Banig token package`

### Task 2: The web module catalogue

**Files:**
- Create: `apps/web/src/lib/modules.ts`, ported from `my-app/lib/modules.ts`
- Create: `apps/web/src/lib/modules.test.ts`, ported from `my-app/lib/modules.test.ts`, plus the new cases below
- Create: `apps/web/vitest.config.ts`, with the `@/` alias set to `src/`
- Modify: `apps/web/package.json`, adding the dev dependency `vitest` and the script `"test": "vitest run"`

**Interfaces:**
- Produces:
  - Types:
    - `type WebSupport = true | false | "partial"`
    - `ModuleEntry`, which is the app's type with these changes:
      - `href: string`
      - `icon: string`, the icon name only
      - `tone: "daily" | "people" | "home" | "records"`
      - adds `web: WebSupport`
    - `Feature`, `Features`, `ModuleSection`, `ModuleFilter`, which are the same as in the app
  - Constants: `ALL_FEATURES`, `MODULE_SECTIONS`, `ALL_MODULES`, `MAIN_TABS: readonly { id: "home" | "money" | "todos" | "vehicle"; label: string; href: string }[]`, with hrefs `/`, `/money`, `/todos` and `/vehicle`
  - Functions:
    - `hiddenReason(m, f): "admin" | "server" | "hidden" | "web" | null`
    - `visibleSections(sections, f): ModuleSection[]`
    - `searchModules(query): ModuleSection[]`
  - Values for `web`:
    - `alarms` is `false`
    - `health` is `"partial"`
    - every other module is `true`

- [ ] **Step 1: Write the failing tests.**
  - Port all the existing tests.
  - Add `hiddenReason` cases:
    - It returns `"web"` for `alarms` with an all-open filter.
    - It returns `null` for `health` (`partial` shows).
    - `"admin"` beats `"web"`.
  - Add a case where `visibleSections` never contains `alarms`.
  - Add a case where every `href` in `ALL_MODULES` starts with `/` and has no `myapp://`.
- [ ] **Step 2: Run** `pnpm --filter web test`. Expected: FAIL (the module is missing).
- [ ] **Step 3: Implement it** by porting `modules.ts` from `my-app`. Drop the `expo-router` and `ModuleTile` imports, add `web` to every entry, and check `web === false` last in `hiddenReason`, after `hidden`.
- [ ] **Step 4: Run** `pnpm --filter web test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(web): port the module catalogue with web support flags`

### Task 3: Supabase clients, generated types and the auth proxy

Read first: `next/dist/docs/01-app/01-getting-started/16-proxy.md`, `03-api-reference/03-file-conventions/proxy.md`, and the current `@supabase/ssr` Next.js guide. Use whatever that guide currently recommends for checking the user in a proxy (`auth.getClaims()` if it's available).

**Files:**
- Create: `apps/web/src/types/database.ts`. Generate it with `pnpm dlx supabase gen types typescript --project-id <ref> > src/types/database.ts`, or with `--local` against the local stack. Don't hand-edit it.
- Create: `apps/web/src/lib/env.ts`, which reads and checks the two public env vars and throws a clear error that names a missing one.
- Create: `apps/web/src/lib/supabase/browser.ts`, exporting `createClient(): SupabaseClient<Database>` (a singleton `createBrowserClient`).
- Create: `apps/web/src/lib/supabase/server.ts`, exporting `async createClient(): Promise<SupabaseClient<Database>>`. It's `createServerClient` with `cookies()` `getAll` and `setAll`, and `setAll` is wrapped in try/catch so Server Components don't crash.
- Create: `apps/web/src/lib/auth-routes.ts`, with `PUBLIC_PATHS = ["/login", "/auth/callback"]` and `authRedirect(pathname: string, signedIn: boolean): string | null`.
- Create: `apps/web/src/lib/auth-routes.test.ts`
- Create: `apps/web/src/proxy.ts`. It runs `updateSession`, then `authRedirect`. Its matcher leaves out `_next/static`, `_next/image`, `favicon.ico` and image and font files.
- Create: `apps/web/.env.example`, with the two variable names and a comment saying where to find them.
- Modify: `apps/web/package.json`, adding the dependencies `@supabase/ssr` and `@supabase/supabase-js`

**Interfaces:**
- Produces:
  - `createClient()` from `@/lib/supabase/browser`
  - `createClient()` from `@/lib/supabase/server`
  - `authRedirect`
  - the `Database` type

- [ ] **Step 1: Write the failing tests** for `authRedirect`:
  - `("/money", false)` returns `"/login?next=%2Fmoney"`.
  - `("/", false)` returns `"/login"`.
  - `("/login", true)` returns `"/"`.
  - `("/auth/callback", false)` returns `null`.
  - `("/money", true)` returns `null`.
  - `("/money/transactions?x=1", false)` keeps the full path and query in `next`. The proxy passes `pathname + search`.
- [ ] **Step 2: Run** `pnpm --filter web test auth-routes`. Expected: FAIL.
- [ ] **Step 3: Implement** `auth-routes.ts`, both Supabase clients, `env.ts` and `proxy.ts`. The proxy must return the response object that carries the refreshed cookies, including on redirects. Copy the cookies onto the redirect response.
- [ ] **Step 4: Run** `pnpm --filter web test`. Expected: PASS. Then run `pnpm --filter web build`. Expected: the build succeeds.
- [ ] **Step 5: Commit** `feat(web): add Supabase clients and the auth proxy`

### Task 4: The login page, OAuth callback and sign out

Run `/impeccable shape` for the login page first. It's one screen with a weave field in the shell colour, the Habi name, "Continue with Google" as the primary action, and an email-code form below it, following `my-app/app/(auth)/login.tsx`.

**Files:**
- Create: `apps/web/src/lib/safe-next.ts`, exporting `safeNext(next: string | null | undefined): string`
- Create: `apps/web/src/lib/safe-next.test.ts`
- Create: `apps/web/src/lib/login-errors.ts`, exporting `loginErrorMessage(e: { code?: string; message?: string } | null, kind: "google" | "send" | "verify"): string`
- Create: `apps/web/src/lib/login-errors.test.ts`
- Create: `apps/web/src/app/login/page.tsx`. This is a Server Component that reads `searchParams` (`next`, `error`) inside `<Suspense>` and renders `<LoginForm>`.
- Create: `apps/web/src/app/login/login-form.tsx` (`"use client"`), handling the three steps:
  - Google: `signInWithOAuth({ provider: "google", options: { redirectTo: origin + "/auth/callback?next=" + encodeURIComponent(safeNext(next)) } })`
  - Send code: `signInWithOtp({ email, options: { shouldCreateUser: false } })`
  - Verify: `verifyOtp({ email, token, type: "email" })`, then `seedMoneyDefaults()`, then `router.replace(safeNext(next))`
- Create: `apps/web/src/app/auth/callback/route.ts`. A `GET` with `code` runs `exchangeCodeForSession(code)`, then `seedMoneyDefaults()`, then redirects to `safeNext(next)`. With `error` or no `code`, it redirects to `/login?error=google`.
- Create: `apps/web/src/lib/seed.ts`, exporting `seedMoneyDefaults(client): Promise<void>`. It calls `rpc("seed_money_defaults")`, logs `console.warn` on error and never throws, matching `my-app/providers/auth-provider.tsx:47`.
- Create: `apps/web/src/app/actions/sign-out.ts` (`"use server"`), exporting `signOut(): Promise<void>`, which runs `auth.signOut()` and then `redirect("/login")`
- Create: `apps/web/src/components/ui/button.tsx`, with variants `primary | secondary | plain`, a 56 px height (`h-button`) and a `loading` prop. Follow the `Button` row of `my-app/docs/design-system.md`.
- Create: `apps/web/src/components/ui/input.tsx`, a labelled field with an error line and 16 px text.
- Modify: `apps/web/src/app/layout.tsx`
  - Use Schibsted Grotesk through `next/font/google`, weights `400 500 700 900`, variable `--font-sans`.
  - Set `metadata.title` to `{ default: "Habi", template: "%s · Habi" }`.
  - Set `lang="en"`.
  - Remove the Geist fonts.
- Modify: `apps/web/src/app/globals.css`. Its whole content becomes `@import "tailwindcss";`, the three `@habi/banig` imports, and base `body` and `:focus-visible` rules using the tokens.
- Delete: `apps/web/src/app/page.tsx`, the starter page. Task 5 replaces it.

**Interfaces:**
- Consumes: both `createClient()` functions (Task 3)
- Produces: `safeNext`, `signOut`, `Button`, `Input`, and `seedMoneyDefaults`

- [ ] **Step 1: Write the failing tests.**
  - `safeNext`:
    - `"/money"` returns `"/money"`.
    - `null`, `""`, `"//evil.com"`, `"https://evil.com"`, `"/\\evil.com"`, `"javascript:alert(1)"` and `"/login"` all return `"/"`.
    - `"/todos?x=1"` returns `"/todos?x=1"`.
  - `loginErrorMessage`:
    - `{ code: "otp_disabled" }` and `{ code: "signup_disabled" }` with `"send"` return `"This email can't sign in to Habi."`.
    - `{ code: "otp_expired" }` with `"verify"` returns `"That code has expired. Send a new one."`.
    - `null` with `"google"` returns `"Google sign-in didn't finish. Try again."`.
    - An unknown error returns `"Something went wrong. Try again."`.
  - Before writing the mapping, confirm which error codes Supabase actually returns for an unknown email with `shouldCreateUser: false`. Try it on the local stack.
- [ ] **Step 2: Run** `pnpm --filter web test`. Expected: FAIL.
- [ ] **Step 3: Implement** the files listed above.
- [ ] **Step 4: Run** `pnpm --filter web test && pnpm --filter web build`. Expected: PASS, and the build succeeds.
- [ ] **Step 5: Check the email-code flow manually against the local stack** (see Task 6 for local setup).
  1. Add a user in local Studio (`http://localhost:54323` › Authentication › Add user).
  2. Sign in with an email code; read it in Mailpit at `http://localhost:54324`. Expected: you land on `/`.
  3. Use an unknown email. Expected: "This email can't sign in to Habi.", and no new row in `auth.users`.
- [ ] **Step 6: Run** `/impeccable audit` and `/impeccable critique` on `src/app/login`, and fix the real findings.
- [ ] **Step 7: Commit** `feat(web): add Google and email-code sign-in`

### Task 5: The app shell and sidebar

Run `/impeccable shape` for the shell first:
- On wide screens (768 px and up), a left sidebar on the `shell` colour has:
  - the Habi name
  - the four `MAIN_TABS`
  - the module sections from `visibleSections`, each with a section-colour icon tile
  - the account email and a "Sign out" button at the bottom
- Below 768 px, a top bar has the Habi name and a "Menu" button that opens the same list as a full-height panel.
- The active link is marked with `aria-current="page"` and a visible indicator, not colour alone.

**Files:**
- Create: `apps/web/src/lib/module-filter.ts` (`server-only`), exporting `getModuleFilter(): Promise<ModuleFilter>`. It reads, in parallel:
  - `functions.invoke("app-features", { method: "GET" })`, merged over `ALL_FEATURES`. On error or after a 3-second timeout, use `ALL_FEATURES`.
  - `user_settings.hidden_modules` (an empty array when there's no row)
  - `app_admins.select("user_id").maybeSingle()`, so `isAdmin = data !== null`
- Create: `apps/web/src/lib/features.ts`, exporting `mergeFeatures(data: Partial<Features> | null | undefined): Features`
- Create: `apps/web/src/lib/features.test.ts`
- Create: `apps/web/src/lib/current-user.ts` (`server-only`), exporting `getCurrentUser(): Promise<{ id: string; email: string }>`. It reads the user from the server client and calls `redirect("/login")` when there's none. Mark it `"use cache: private"`, following the auth-with-cache-components guide, Step 1.
- Create: `apps/web/src/app/(app)/layout.tsx`. It renders `<Shell>`, wrapped in `<Suspense fallback={<ShellSkeleton/>}>`. There's no top-level `await`.
- Create: `apps/web/src/components/shell/shell.tsx` (Server), which awaits `getCurrentUser()` and `getModuleFilter()` inside the boundary, then renders `<Sidebar>` and `{children}`.
- Create: `apps/web/src/components/shell/sidebar.tsx` (`"use client"`), using `usePathname()` for the active link and handling the mobile menu open state. Escape and route changes close it, and focus returns to "Menu".
- Create: `apps/web/src/components/shell/shell-skeleton.tsx`
- Create: `apps/web/src/app/(app)/page.tsx`, the Home placeholder. It's a heading "Home" and one line: "I'm moving here from the app. Home, Money, Todos and Vehicle come next."
- Create: `apps/web/src/app/(app)/[module]/page.tsx`, a placeholder for every other module id in `ALL_MODULES` and `MAIN_TABS`:
  - It shows the module label and "This part of Habi isn't on the web yet. Open it in the app for now."
  - An unknown id calls `notFound()`.
  - It's replaced module by module in later waves.

**Interfaces:**
- Consumes:
  - `ModuleFilter`, `visibleSections`, `MAIN_TABS` and `ALL_FEATURES` (Task 2)
  - the server `createClient()` (Task 3)
  - `signOut` and `Button` (Task 4)
- Produces:
  - `getCurrentUser()`
  - `getModuleFilter()`
  - the `(app)` route group layout, which later waves add pages to
  - `mergeFeatures`

- [ ] **Step 1: Write the failing tests** for `mergeFeatures`:
  - `null` returns `ALL_FEATURES`.
  - `{ ai: false }` returns `{ ...ALL_FEATURES, ai: false }`.
  - `{ ai: "no" as any }` ignores the non-boolean and keeps `true`.
  - Unknown keys are dropped.
- [ ] **Step 2: Run** `pnpm --filter web test features`. Expected: FAIL.
- [ ] **Step 3: Implement** the files listed above.
- [ ] **Step 4: Run** `pnpm --filter web test && pnpm --filter web build`. Expected: PASS, and the build has no "uncached data accessed outside Suspense" errors.
- [ ] **Step 5: Check manually** with `pnpm dev:web` on the local stack, signed in:
  - The sidebar shows the four tabs and the module sections, and Alarms is missing.
  - Hiding a module in `user_settings.hidden_modules` (through Studio) removes it after a reload.
  - At 375 px wide, the Menu button opens the list, Escape closes it, and focus returns to Menu.
  - Sign out lands on `/login`.
  - Visiting `/money` while signed out lands on `/login?next=%2Fmoney`, and signing in returns you to `/money`.
- [ ] **Step 6: Run** `/impeccable audit` and `/impeccable critique` on `src/components/shell` and `src/app/(app)`, and fix the real findings.
- [ ] **Step 7: Commit** `feat(web): add the Banig app shell and sidebar`

### Task 6: Local stack, deploy and owner checklist

**Files:**
- Modify: `apps/web/README.md`, replacing the starter text with:
  - **Run locally:**
    1. In `../my-app`, run `supabase start`.
    2. Copy the local API URL and anon key into `apps/web/.env.local`.
    3. Add a user in local Studio.
    4. Run `pnpm dev:web`.
    5. Sign in with an email code and read the code in Mailpit.
    - Google sign-in works only on deployed URLs. Don't run `supabase config push` from `my-app`, because its `site_url` is localhost (see the comment in `my-app/supabase/config.toml:178`).
  - **Regenerate the types:** the `supabase gen types` command from Task 3.
  - **Deploy:** the Vercel project with root directory `apps/web`, the two env vars for Production and Preview, and Deployment Protection on for previews.
  - **Owner checklist** (the five owner tasks from the spec):
    1. Add the test account in Supabase › Authentication › Users.
    2. Add `https://<prod-domain>/**` and `https://*-<team>.vercel.app/**` to Supabase › Authentication › URL Configuration › Redirect URLs.
    3. Add the same origins to the Google OAuth web client's authorised JavaScript origins.
    4. Create or link the Vercel project.
    5. Choose the production domain.
- Modify: the root `README.md`, changing the `apps/web/` line in the file map to "the Habi web app (Next.js)", and adding `packages/banig/`.

- [ ] **Step 1: Run** `pnpm test && pnpm lint && pnpm --filter web build` at the repo root. Expected: all pass.
- [ ] **Step 2: Hand the owner checklist to the owner and wait.** Deploying needs them to link the Vercel project and set the redirect URLs.
- [ ] **Step 3: Deploy a preview** with `vercel deploy` from `apps/web`, or by pushing the branch once it's linked. Expected: the preview URL shows `/login` after the Vercel sign-in.
- [ ] **Step 4: Check end to end on the preview with the test account:**
  - Google sign-in lands on Home.
  - The email code works.
  - An unlisted Google account is turned away with a message.
  - Sign out works.
- [ ] **Step 5: Commit** `docs(web): add local setup, deploy and owner checklist`
- [ ] **Step 6: Run** `/impeccable polish` on `apps/web`, then open the PR for Wave 0 with the Impeccable results in its description.
