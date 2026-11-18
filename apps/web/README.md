# Habi web app

The Habi web app is a private Next.js 16 app. It signs in with Google or an email code, then shows one Home and a sidebar of modules. The pages are placeholders for now. It uses the Supabase project from `my-app`, and the Banig tokens come from `packages/banig`.

## Run locally

You need the Supabase CLI and Docker for the local stack.

1. In `../my-app`, run `supabase start`.
2. Run `supabase status` and copy the API URL and the anon key into `apps/web/.env.local`:

   ```sh
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>
   ```

   `apps/web/.env.example` lists both names.
3. Open local Studio at http://127.0.0.1:54323 and add a user in Authentication. Sign-up is off, so only added users can sign in.
4. From the repo root, run `pnpm dev:web`.
5. Open http://localhost:3000, sign in with an email code, and read the code in Mailpit at http://127.0.0.1:54324.

Google sign-in works only on deployed URLs.

> [!WARNING]
> Don't run `supabase config push` from `my-app`. Its `site_url` is localhost, so it would overwrite the live auth settings. See the comment in `my-app/supabase/config.toml` near line 178.

## Regenerate the types

`src/types/database.ts` was copied from `my-app`. Regenerate it after any migration.

For the live project:

```sh
pnpm dlx supabase gen types typescript --project-id <project-ref> > apps/web/src/types/database.ts
```

For the local stack:

```sh
pnpm dlx supabase gen types typescript --local > apps/web/src/types/database.ts
```

## Deploy

The app deploys to Vercel.

- Make one Vercel project for this repo, with the root directory set to `apps/web`.
- Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for both Production and Preview.
- Turn Deployment Protection on for previews, so only signed-in Vercel members can open them.

To check the build without a Vercel project, run this from the repo root:

```sh
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy pnpm --filter web build
```

## Owner checklist

These five steps need the owner's accounts. Do them before the first deploy.

1. Add the test account in Supabase › Authentication › Users.
2. Add `https://<prod-domain>/**` and `https://*-<team>.vercel.app/**` to Supabase › Authentication › URL Configuration › Redirect URLs.
3. Add the same origins to the Google OAuth web client's authorised JavaScript origins.
4. Create or link the Vercel project.
5. Choose the production domain.
