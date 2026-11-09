# my-app-site

This repository holds the website for [my-app](https://github.com/charlitomecarez/my-app). my-app is one private app that tells you what needs you today.

It is a pnpm monorepo with two apps:

| App | Path | Stack | Status |
| --- | --- | --- | --- |
| Landing page | [`apps/site`](apps/site) | Astro 7 | 1.0.0, released |
| Web app | [`apps/web`](apps/web) | Next.js 16, React 19, Tailwind 4 | Template only |

## Requirements

- Node 24. Run `nvm use` to read the version from `.nvmrc`. Astro 7.4.7 needs Node 22.23.4 or later.
- pnpm 10.34.7. The `packageManager` field in `package.json` sets it.

## Start

```sh
pnpm install
pnpm dev:site
```

## Commands

Run these from the repository root.

| Command | What it does |
| --- | --- |
| `pnpm dev:site` | Starts the landing page dev server. |
| `pnpm build:site` | Builds the landing page into `apps/site/dist`. |
| `pnpm dev:web` | Starts the Next.js dev server. |
| `pnpm build:web` | Builds the Next.js app. |
| `pnpm lint` | Runs `astro check` for the site and ESLint for the web app. |

## Landing page

- The sections live in `apps/site/src/components`, one file for each section.
- The data (links, chips, dishes and module groups) lives in `apps/site/src/data/site.ts`.
- The colour tokens and the weave texture live in `apps/site/src/styles/global.css`. The page follows the system light or dark setting.
- The page has no analytics and makes no third-party requests. Schibsted Grotesk comes from `@fontsource`.
- With reduce motion on, the page shows still frames. With JavaScript off, it shows the finished states.

## Releases

Each app has its own tags. A landing page release uses `site-vX.Y.Z`, for example [`site-v1.0.0`](https://github.com/charlitomecarez/my-app-site/releases/tag/site-v1.0.0). The version is also in `apps/site/package.json`.

## Branches

`main` is the default branch. Make changes on a branch and open a pull request into `main`.
