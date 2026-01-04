# Content Diagnostics Prompt

## Project Structure

- `app/` Next.js App Router pages and layouts.
- `components/`, `hooks/`, `lib/` shared UI, hooks, and client utilities.
- `styles/`, `public/` global styles and static assets.
- `tests/` Vitest frontend tests and setup.
- `scripts/` project scripts.
- `proxy.ts` local proxy utilities.
- `backend/` Spring Boot service (see `backend/README.md`).
- `doc/` backend runbooks and operational notes.

## Frontend Development (repo root)

- `pnpm dev` start the Next.js dev server.
- `pnpm build` build for production.
- `pnpm start` run the production build locally.
- `pnpm lint` run ESLint.
- `pnpm test` run Vitest in CI mode.
- `pnpm test:watch` run Vitest in watch mode.
- `pnpm check:mocks` run mock checks.

## Backend Development (`backend/`)

- `./gradlew bootRun` start the Spring Boot API.
- `./gradlew test` run backend unit/integration tests.
- `docker compose up -d` start PostgreSQL and LocalStack.

## Tests

- Frontend tests live in `tests/` and run with `pnpm test`.
- Backend tests live in `backend/src/test/java` and run with `./gradlew test`.

## Ports

- Frontend dev server: `3000` (Next.js default).
- Backend API: `8080`.
- Local PostgreSQL: `5432`.
- LocalStack: `4566`.

## Environment

- `.env.example` documents expected environment variables.
- `.env.local` is for local overrides (not committed).
