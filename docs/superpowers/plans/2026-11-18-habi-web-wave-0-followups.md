# Habi web, Wave 0: follow-ups for Wave 1

This file collects the reviewed items Wave 0 left open. The Wave 1 plan should start from it.

## Before merging Wave 0 (owner preview check)

Test these on the preview deploy with the test account:

- Google sign-in lands on Home.
- The email code works. That includes the real Supabase error code for an unknown email (the web maps `otp_disabled`, `signup_disabled` and "Signups not allowed").
- An unlisted Google account sees "This email can't sign in to Habi."
- Sign out works.
- **Sign out with an expired session.** For a Server Action POST, the proxy answers with a 307 to `/login`. Check that this navigates and doesn't show an error. If it errors, make the proxy skip requests that have a `Next-Action` header and let the action's own auth check redirect.

## Wave 1 must

- **Remove each module id from `ROUTES` in `src/lib/module-route.ts` when its real page lands.** Otherwise `[module]` and the real route both claim the same path.
- **Gate real module pages.** For `adminOnly` and `needs` modules, call `hiddenReason(m, await getModuleFilter())` and `notFound()`.
- **Consider moving the nav's awaits into their own Suspense boundary,** so `{children}` streams without waiting on `app-features`, which can take up to 3 s. This would also let `notFound()` return a real 404.
- **Regenerate `src/types/database.ts`** with `supabase gen types` once the CLI is available. It's currently a copy of my-app's types.

## Can wait

- Mobile menu: `openOn` isn't cleared on a route change, so it can reopen after back and forward.
- Add timeouts to the `user_settings` and `app_admins` reads in `getModuleFilter`.
- Add a timeout to `seed_money_defaults` in the OAuth callback, or don't block the redirect on it.
- Add `cacheLife` and `cacheTag` to the private scopes once the web app writes `hidden_modules` (Settings, Wave 7).
- Announce login validation errors through a live region, or move focus to the field.
- A failed callback drops `next` (plan-mandated).
- Clean-ups in `authRedirect`: it splits on `?` twice and has a redundant `/` check.
- Token tests: the block regex, a light and dark name-set parity check, and a check that `theme.css` maps to `tokens.css`.
- A test for the proxy's env-check throw path.
- `safeNext` passes `%2f` and `%5c` paths through unchanged. They stay same-origin.
- The proxy matcher skips paths with image and font extensions, so any future route handler serving such paths must check auth itself.
- README: mention the monorepo install on Vercel, and the `localhost:3000` redirect URL for testing against the live project.
