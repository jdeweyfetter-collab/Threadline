# Threadling source export

This ZIP contains the Threadling source at Sites version 13, commit `709a2b8a4bfbda5e380ac60841532412332b1147`.

## Run locally

Requirements: Node.js 22.13 or newer and pnpm 11.25.0 (Corepack can provide the pinned package manager).

1. Extract the ZIP and open a terminal in the `Threadling` directory.
2. Install dependencies: `corepack pnpm install --frozen-lockfile`.
3. Start the local development server: `corepack pnpm dev`.
4. Open the local address printed in the terminal.

The Vite/Cloudflare development setup provides local D1 and R2 bindings. Local sign-in simulation is enabled for the portable profile. Real email/password account authentication calls Supabase Auth; configure `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in your local Cloudflare development environment (for example, an untracked `.dev.vars`) if you want to test real account signup/sign-in. No values are included here.

For a production-style local Worker preview, run `corepack pnpm build`, then `corepack pnpm start`. Local Wrangler state is written under ignored `.wrangler/` and must not be committed or included in source exports.

## Database and tests

The D1 schema and migrations are in `db/` and `drizzle/`. The development app initializes its local database from the included schema and demo seed. The demo seed is source code, not a production database export; personal name/location references were replaced with generic values in this ZIP.

Run the included checks after installing dependencies:

- `node scripts/check-accounts.mjs`
- `node scripts/check-closet.mjs`
- `node scripts/check-domain.mjs`

These checks use temporary local test databases and fake authentication. They do not connect to production D1, R2, or real user accounts.

## Export contents

The archive includes application routes/API handlers, UI components, database code and migrations, tests and fixtures, bundled public assets, configuration, `package.json`, and `pnpm-lock.yaml`. It excludes Git history, dependency directories, build caches, environment files, local session/runtime state, database snapshots, and R2 user uploads.
