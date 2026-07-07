# nextjs-concepts

## Dev commands

```bash
pnpm dev             # Next.js dev server (suppresses Node warnings)
pnpm build           # full production build with TypeScript check
pnpm test            # vitest (single run)
pnpm test:e2e        # Playwright (chromium, headless)
pnpm test:e2e:ui     # Playwright UI mode
pnpm lint            # next lint (ESLint with eslint-config-next)
pnpm test:coverage
```

Required order before push: `build` (includes typecheck & lint) → `test`.

**Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) — e.g. `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.

## Project structure

```
src/
  proxy.ts                  # Clerk auth middleware (Next.js 16: proxy.ts, NOT middleware.ts)
  components/               # Shared UI components (navigation, counter, greet)
  actions/                  # Server actions (submitForm)
  app/
    (auth)/login, signup, forgot-password  # Route group, renders at /login etc.
    products/[id]/          # Dynamic route with nested layout
    users/route.ts          # Route handler (GET /users)
    users/[id]/route.ts     # Dynamic route handler, params is Promise<{id: string}>
    users-client/           # Client-side fetch with useEffect
    users-server/           # Server component fetch (uses env var)
    users-form/             # Server action form + Clerk auth
```

## Key quirks

- **Route handler params**: `params` is `Promise<{...}>`, must be awaited (`next/server`).
- **Proxy file**: Next.js 16 deprecated `middleware.ts` — use `src/proxy.ts` instead.
- **Tailwind v4**: No `tailwind.config.ts`. Configuration is CSS-only via `@theme`. PostCSS plugin is `@tailwindcss/postcss`. Use `@import "tailwindcss"` not `@tailwind base`.
- **ESLint**: Custom rules — single quotes (avoidEscape), double quotes in JSX, semicolons, trailing commas, final newline. Auto-fixed on save via VSCode.
- **Env vars**: `.env`/`.env.local` gitignored. Placeholder values in `.env.example` (`MOCK_API_USERS=xxx`, `JSON_PLACEHOLDER_USERS=xxx`). Pages reading these use guards to avoid runtime errors.
- **Tests**: Mock Clerk heavily (`@clerk/nextjs` for `ClerkProvider`, `useAuth`, `useUser`; `next/navigation` for `useRouter`). Uses `@testing-library/jest-dom` matchers.
- **pnpm**: Workspace config in `pnpm-workspace.yaml` — allows builds for `@clerk/*`, `esbuild`, `sharp`.
- **Clerk auth in server components**: Import from `@clerk/nextjs/server` (`auth()`, `currentUser()`).
- **Clerk auth in client components**: Import from `@clerk/nextjs` (`useAuth()`, `useUser()`). All hooks must be called unconditionally before any early return.
- **Clerk v7**: `SignedIn`/`SignedOut` removed — use `useAuth()` instead.
- **Stale `.next`**: Delete `.next` if Tailwind or CSS changes aren't reflecting after restart.
