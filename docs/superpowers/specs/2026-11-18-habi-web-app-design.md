# Habi web app: design

Date: 2026-11-18
Status: ready for the owner's approval

## Intent

Habi is a private personal assistant. It's an Expo app (SDK 58) in the `my-app` repo, backed by one Supabase project, and it has about 22 modules: todos, money, vehicle, vault, ulam, inbox and more. It runs on Android first. Today the web version is the Expo web build (`npm run web`).

The owner wants a real web app in `apps/web` of this repo, built on Next.js and deployed on Vercel. The Expo web build is limited and awkward to build and host, while Next.js on Vercel offers much more: server rendering, route handlers, preview deploys, cron jobs and a generous free tier.

The new web app replaces the Expo web build. The Android APK stays as it is.

## Goals

- **Every module that can work in a browser comes over.** That includes the four tabs (Home, Money, Todos, Vehicle), More, and every module listed in `my-app/lib/modules.ts`. The goal is full coverage, delivered in waves.
- **Same backend.** The web app uses the same Supabase project, with the same accounts, rows, Row Level Security (RLS), storage buckets and Edge Functions. A change made on the web shows up on the phone, and the reverse.
- **Same sign-in rules.** Google sign-in plus the email code, as in the app. Sign-up stays off, so only accounts the admin added can sign in. The admin flag (`app_admins`) works the same way.
- **New layout, same look.** The layout is designed for a laptop rather than a stretched phone screen, and it keeps the Banig design style.
- **The Vault works fully on the web.** You unlock it with the master password, and it's decrypted only in the browser.

## Non-goals

- No new product features. Each module does what it does on Android, laid out for the web.
- No changes to the Android app, apart from the final step of retiring the Expo web build (see Wave 7).
- No database redesign. Schema changes happen only when the web can't work without one, and each one must keep the Android app working.
- No web push notifications. Reminders keep going to the phone through `send-reminders`.
- No offline mode or installable web app in this project.
- No paid tiers. Everything stays on free tiers, as in `my-app`.

## Anti-goals (failure even if it "works")

- The vault master password, the vault key or any decrypted vault entry reaches the server, a log, an analytics call or a persisted cache.
- Sign-up becomes possible, or a person who isn't on the admin's list gets in.
- A web change breaks the Android app, for example through a migration or a changed RPC.
- It looks like a generic SaaS dashboard (grey cards, shadows, gradients) instead of Habi.
- The Supabase service-role key, or any Edge Function secret, ends up in the browser bundle or in the Vercel project.

## Constraints

- **Stack.** `apps/web` is already set up with Next.js 16.4, React 19.3, Tailwind 4 and TypeScript, inside a pnpm workspace (`apps/*`). This Next.js version has breaking changes. Read `node_modules/next/dist/docs/` before writing code (see `apps/web/AGENTS.md`). Use `proxy.ts`, not `middleware.ts`.
- **Hosting.** Vercel, with `apps/web` as the project root. The landing site (`apps/site`, Astro) is separate and stays as it is.
- **Supabase.** Use the same project and the same public URL and anon key the app uses (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`), exposed as `NEXT_PUBLIC_*` variables. Supabase settings that need a change:
  - Add the Vercel production URL and preview URLs to Auth › Redirect URLs.
  - Add the web origins to the Google OAuth client.
- **Source of truth for behaviour.** Each module's rules live in `my-app`:
  - `lib/<module>.ts` holds the types, queries, mutations and pure helpers, with tests.
  - `docs/modules/` describes each module.
  - `docs/architecture.md`, `docs/database.md` and `docs/design-system.md` cover the rest.
  - The web app matches this behaviour. When the web and the app disagree, the app wins unless the owner says otherwise.
- **Design rules.** `my-app/docs/design-system.md` applies, apart from rules that are specific to touch or native (see Design below). Every UI change goes through the Impeccable check described there: shape first, then audit and critique after editing, then polish before the PR.

## Decisions

These are the owner's decisions:

- Build in Next.js on Vercel and retire the Expo web build.
- Bring every module over.
- Design a new web layout in the Banig style.
- Keep the same Supabase backend and the same sign-in rules.

These are my calls, which the owner can overrule:

1. **Rewrite the screens, don't share them.** The screens become Next.js and React DOM components. Sharing React Native components through react-native-web would bring back the problems this project exists to escape.
2. **Port the pure logic, with its tests.** Helpers such as `recurring`, `week`, `weave`, `home-summary`, `vehicle-checks`, `travel`, `ulam`, `money` maths and `vault-crypto` get copied into `apps/web/src/lib`, keeping their tests (Vitest). A shared package across the two repos isn't worth it yet. Each ported file names its source file and the `my-app` commit it came from, so drift can be spotted.
3. **Generated database types.** `apps/web/src/types/database.ts` is generated from the Supabase project with `supabase gen types`, not hand-copied.
4. **Auth uses `@supabase/ssr` with cookie sessions.**
   - `proxy.ts` refreshes the session and redirects signed-out visitors to `/login`.
   - A route handler at `/auth/callback` completes Google OAuth with PKCE.
   - The email code uses `signInWithOtp` and `verifyOtp`, as in the app.
   - Sign-up stays blocked by the existing Supabase setting. The web adds no sign-up screen.
   - On first sign-in, call `seed_money_defaults` the same way the app does.
5. **Data loading.**
   - Server Components fetch the first data for each page through the server Supabase client, which runs as the user, under RLS.
   - Client components use TanStack Query for anything interactive, keeping the app's query keys and its "invalidate on settle" model (`my-app/docs/architecture.md › Data fetching`).
   - Writes go straight to Supabase from the client, or through Server Actions. The builder chooses per module, but writes must never use the service-role key.
   - Edge Functions are called the same way the app calls them.
6. **One shared token package.** The Banig tokens (colours for light and dark, the section colours, type scale, radii and the weave pattern) move into `packages/banig`. It holds a CSS file of variables, plus a Tailwind 4 `@theme` file. Both `apps/web` and `apps/site` import it, so the two can't drift. The workspace adds `packages/*`.
7. **Vault on the web.**
   - Use `libsodium-wrappers-sumo`, which has Argon2id. The KDF settings, formats and `wrap_version` 1 and 2 handling must match `my-app/lib/vault-crypto.ts` exactly. The ported tests must pass, and they must decrypt vectors produced by the app.
   - You unlock with the master password, and recovery-key unlock is also supported. There's no PIN and no biometric unlock on the web.
   - The key lives only in memory. It locks on sign-out, after 5 minutes idle, when the tab has been hidden for 5 minutes, and on a manual lock. Vault queries are never persisted (`my-app/lib/query-cache.ts`).
   - Copying a secret to the clipboard clears it after 30 seconds, as the web adapter in the app already does.
   - Argon2 runs in a Web Worker so the page doesn't freeze.
   - Vault pages send `Cache-Control: no-store` and are left out of any analytics.
8. **Phone-only features.** Alarms, steps, screen time, sleep and Health Connect data stay on the phone, and there's no way to read them on the web.
   - Modules made only of phone data (Alarms, Steps, Screen time) are hidden on the web.
   - Modules with some Supabase data (Health, with medicine and visits) show that part, plus one plain line saying the rest is on the phone.
   - Home leaves out phone-only blocks.
   - A module-filter rule marks these modules as `web: false` or `web: "partial"`.
9. **Native-only actions get web versions:**
   - camera QR scan in Inventory → typing in the code, and a webcam scan where the browser supports `BarcodeDetector`
   - voice recording in Inbox → `MediaRecorder`, uploading in the same format the `voice-transcribe` function expects (check this before building)
   - photo pick → a file input
   - printing and sharing a trip PDF → the browser's print and download
   - The existing `*.web.ts` adapters in `my-app` show the intended web behaviour.
10. **Admin-only screens** are the same ones as in the app: Inbox voice access (`admin_voice_accounts`) and Find a work. They show only to the admin, using the same checks the app uses. There's no screen for adding accounts. The admin still adds them in the Supabase dashboard, as today.
11. **Development environment.** Local development and tests run against a local Supabase stack, built from `my-app/supabase/migrations` (`supabase start`). That's also where the vault test vectors and the auth tests run, so day-to-day work never touches real data.

## Design

The look is Banig: indigo, cream, woven colour fields and Schibsted Grotesk. It follows `my-app/docs/design-system.md` and `apps/site/src/styles/global.css`.

**Rules that carry over unchanged:**
- token classes only, never hex codes
- one primary action per screen
- section colours never show status
- status always has a word plus `good`, `watch` or `over`
- borders, not shadows
- rows use 2 px rules
- the assistant says "I"
- sentence case
- reduced motion is respected

**Rules adapted for the web:**
- **Navigation.** On wide screens, a left sidebar replaces the bottom tabs and More. It has the four main sections at the top, then the module sections from `modules.ts` (Daily life, People, Home and plans, Records and work), honouring hidden modules and the server features. Below 768 px, it collapses to a top bar with a menu.
- **List and detail.** Modules with a list (Todos, Money transactions, Inventory, People, Debts, Vault, Journal) show the list and the open item side by side. The item has its own URL, so a link or a refresh opens the same item.
- **Forms.** Forms that are full screens on the phone become a right-side panel or a centred dialog. The small bottom sheets become popovers or small dialogs.
- **Density.** Money, Reports and Travel can use real tables and wider charts. Home can show more blocks above the fold, but it keeps its one-sentence "what needs you today" at the top.
- **Input.** Keyboard and pointer come first: visible focus, keyboard shortcuts for the main actions (new todo, new expense, search), and hover states. The 48 px touch target stays for anything that's also used on a phone browser.
- **Dark mode** follows the system, using the dark set of tokens.

Every new screen starts with `/impeccable shape` before code. The first screens to shape are the shell (sidebar, top bar) and Home, because they set the pattern for the rest.

## Waves

Each wave ships to production on its own and leaves the app usable. The order is my call.

0. **Foundation.**
   - `packages/banig` tokens
   - Supabase clients (browser and server), generated types, `proxy.ts` and the login page (Google and email code)
   - the shell and navigation, with the module filter (features, hidden modules, admin, web support)
   - the Vercel project, environment variables and Supabase redirect URLs
   - Vitest set up
1. **Main tabs.** Home (with `home_summary`), Todos, Money (accounts, transactions, subscriptions, budgets, statement import) and Vehicle (services, fuel, checks).
2. **Daily life.** Habits, Gym, Journal, Health (the Supabase part), Ulam, Weather, News and Sports.
3. **People.** People, Debts and Inbox (voice).
4. **Home and plans.** Inventory, Shopping and Travel.
5. **Records and work.** Find a work, Documents, Content and Reports.
6. **Vault**, with a security review before release.
7. **Settings and cutover.**
   - Settings: modules, theme and account.
   - Check parity with the app, module by module.
   - In `my-app`, remove the Expo web build docs and scripts and point web users to the new URL. This step needs the owner's go-ahead in that repo.

## Testing on live data and sign-off

The owner left these to me:

- **Test account.** The owner adds one test Google account through the Supabase dashboard. All checks on the live project use that account, never the owner's own data. Each wave is checked against an Android phone signed in to the test account.
- **Preview deploys** connect to the live Supabase project, but stay behind Vercel Deployment Protection, so a person must sign in to Vercel to see them. The Supabase redirect URLs allow the preview domains.
- **Sign-off.** The builder approves the designs (including the shell and Home shapes) and ships wave after wave. Each wave is one PR the owner can review as it goes, but no wave waits on the owner.
- **The Vault (Wave 6)** gets a separate security review before release, run by a reviewer that didn't write the code, against the anti-goals in this document.
- **Owner tasks**, collected in one checklist at Wave 0:
  - add the test account
  - add the Vercel and preview URLs to Supabase Auth
  - add the web origins to the Google OAuth client
  - create the Vercel project (or link it with the CLI)
  - choose the production domain

## Left to the builder

- The exact component library. I suggest building small Banig components in `apps/web/src/components/ui` that mirror `my-app/components/ui`, rather than pulling in a UI kit whose look fights Banig.
- Server Actions or direct client writes, chosen per module.
- Chart library, if one is needed.
- The production domain. Ask the owner when Wave 0 deploys.
- Whether the landing site switches to `packages/banig` in Wave 0 or later.

## Testing

- The ported pure-logic tests run in Vitest in `apps/web`.
- Vault: tests prove the web code decrypts entries the app encrypted, and the reverse.
- Auth: an account that isn't on the list can't sign in, and a signed-out request to any app route redirects to `/login`.
- Before each wave ships, a manual check of each moved module against the Android app on the same account: create on the web and see it on the phone, and the reverse.
