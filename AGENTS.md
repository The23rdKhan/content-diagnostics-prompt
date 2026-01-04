# Repository Guidelines

## Project Structure & Module Organization

- `app/` holds Next.js App Router pages and layouts for the frontend.
- `components/`, `hooks/`, and `lib/` contain shared UI, React hooks, and client utilities.
- `styles/` and `public/` store global styles and static assets.
- `tests/` contains Vitest frontend tests and setup.
- `scripts/` houses project scripts (e.g., mock checks).
- `proxy.ts` provides local proxy utilities.
- `backend/` contains the Spring Boot service (Java 21), including `src/main/java`, `src/test/java`, and `src/main/resources/db/migration` for Flyway SQL.
- `doc/` includes backend runbooks and operational notes.

## Build, Test, and Development Commands

Frontend (run from repo root):
- `pnpm dev` - start the Next.js dev server.
- `pnpm build` - create the production build.
- `pnpm start` - run the production build locally.
- `pnpm lint` - run ESLint across the project.
- `pnpm test` - run Vitest in CI mode.
- `pnpm test:watch` - run Vitest in watch mode.
- `pnpm check:mocks` - run mock checks.

Backend (run from `backend/`):
- `./gradlew bootRun` - start the Spring Boot API locally.
- `./gradlew test` - run backend unit/integration tests.
- `docker compose up -d` - start PostgreSQL and LocalStack for local dev (see `backend/README.md`).

## Coding Style & Naming Conventions

- TypeScript/React uses 2-space indentation and double quotes; keep component files in `PascalCase` and hooks as `useX`.
- Tailwind utility classes are used for styling; prefer composition via `components/ui/` primitives.
- Java packages follow `com.contentdiagnostics.*`; keep services in `.../service`, controllers in `.../controller`, and entities in `.../entity`.
- Lint with `pnpm lint` before opening a PR.

## Testing Guidelines

- Backend tests live in `backend/src/test/java` and use Gradle (`./gradlew test`).
- Name tests after the class under test (e.g., `TaskServiceTest`).
- Frontend tests use Vitest and live in `tests/` (see `pnpm test`).

## Commit & Pull Request Guidelines

- Commit messages follow a lightweight conventional style seen in history: `feat: ...`, `fix: ...`.
- PRs should describe scope, link related issues, and include screenshots for UI changes.
- Call out any required environment variables or migrations when touching the backend.

## Security & Configuration Notes

- Never commit secrets; backend configuration is via environment variables (see `backend/README.md`).
- Flyway migrations live in `backend/src/main/resources/db/migration` and should be additive.
