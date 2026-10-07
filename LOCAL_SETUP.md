# Run Threadling locally

Exported from Sites source commit `709a2b8a4bfbda5e380ac60841532412332b1147` (published version 13).

## Included

Application source, API handlers, components, database schema and migrations, tests, bundled static images, build helpers, dependency declarations (`package.json`) and exact dependency lockfile (`pnpm-lock.yaml`). Third-party packages are restored from the lockfile; node_modules is not included. No live D1 records, R2 user uploads, session tokens, environment values, credentials, or Git history are included. This is a source export, not a user-data backup.

## Prerequisites

Node.js 22.13 or newer (Node 24 recommended for the node:sqlite test suites), pnpm 11.25.0, and a browser. Install pnpm if needed with `npm install -g pnpm@11.25.0`.

## Install and verify

From this folder:

```sh
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
node scripts/check-accounts.mjs
node scripts/check-closet.mjs
```

The account tests use a Supabase Auth test double and temporary SQLite. They do not call the production account service or modify production data.

## Build and initialize a separate local database

A clean export uses the portable execution profile automatically. Do not copy `.sites-runtime` from the hosted development environment.

```sh
pnpm build
pnpm exec wrangler d1 migrations apply DB --local --config local.wrangler.json --persist-to .wrangler/state
```

Accept the migration confirmation. The local configuration points only to emulated D1/R2. The application seeds prototype data on first sign-in, but each new authenticated user still sees their own empty closet.

## Configure authentication

Copy `.env.example` to `.env.local`, then supply a Supabase project URL and publishable key. Prefer a separate development Supabase project. Never supply a service-role key. The app uses Supabase Auth, while garment/profile data and uploaded photos remain in local D1/R2.

Enable email/password auth and confirmation emails in Supabase, configure working email delivery, and add `https://localhost:8787/` to the allowed redirect URLs. The read-only account email comes from Supabase. A real confirmed test account is needed to use the app UI.

## Start the built application

```sh
pnpm exec wrangler dev --config local.wrangler.json --local --persist-to .wrangler/state --ip localhost --port 8787 --local-protocol https --env-file .env.local
```

Open `https://localhost:8787`. Wrangler generates a local development certificate; your browser may require accepting it. HTTPS is required for the app's Secure `__Host-` session cookie. Do not remove cookie security to make an HTTP preview work. Accepting the local certificate does not configure trusted HTTPS for public hosting.

For editing with hot reload, `pnpm dev` starts the existing Vinext development server. Full authenticated testing is best done using the HTTPS built preview above; rebuild after edits. The starter's simulated ChatGPT sign-in does not authenticate Threadling's Supabase accounts.

## Deployment and data

`.openai/hosting.json` retains the identity of the existing Site. This export does not move production hosting, change DNS, enable GitHub auto-deployment, or transfer existing wardrobe data. The local Wrangler configuration is for local development only. Independent Cloudflare deployment requires separately provisioned D1/R2 resources and environment configuration.

See `ACCOUNTS.md`, `MOBILE-DEVELOPMENT.md`, and the original starter `README.md` for background. Some historical documents describe earlier stages; the source handlers and migrations are authoritative.
