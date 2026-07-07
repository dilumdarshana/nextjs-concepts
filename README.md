# Next.js Concepts

A demo app exploring Next.js 16 App Router concepts — routing, layouts, server components, client components, route handlers, server actions, authentication with Clerk, data fetching, and testing.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 6
- Clerk (authentication)
- Tailwind CSS v4
- Vitest + Testing Library
- Playwright (e2e)
- Drizzle ORM + Neon (PostgreSQL)
- pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in your Clerk keys and API endpoints.

## Concepts covered

| Concept | Route | Pattern |
|---|---|---|
| **Static route** | `/about` | `app/about/page.tsx` |
| **Dynamic route** | `/products/[id]` | `app/products/[id]/page.tsx` |
| **Route groups** | `/login`, `/signup`, `/forgot-password` | `app/(auth)/...` |
| **Nested layout** | `/products/[id]` | `app/products/[id]/layout.tsx` |
| **Route handler** | `GET /users` | `app/users/route.ts` |
| **Dynamic route handler** | `GET /users/[id]` | `app/users/[id]/route.ts` |
| **Products API (CRUD)** | `GET/POST /api/products` | `app/api/products/route.ts` |
| **Single product API** | `GET /api/products/[id]` | `app/api/products/[id]/route.ts` |
| **Client data fetch** | `/users-client` | `useEffect` + `fetch` |
| **Server data fetch** | `/users-server` | async server component |
| **Server action form** | `/users-form` | `'use server'` |
| **Clerk auth** | all routes | `proxy.ts`, `layout.tsx` |
| **Drizzle ORM + Neon** | products table | `db/schema.ts`, `db/index.ts` |

## Routes

| Page | Description |
|---|---|
| `/` | Home — server and client component demos |
| `/about` | About page with feature cards |
| `/products` | Product listing (fetches from API) |
| `/products/[id]` | Dynamic product detail (fetches from API) |
| `/users-client` | Client-side data fetching |
| `/users-server` | Server-side data fetching |
| `/users-form` | Server action form with Clerk auth |
| `/login`, `/signup`, `/forgot-password` | Clerk auth pages |

## Commands

```bash
pnpm dev             # start dev server
pnpm build           # production build with type check + lint
pnpm test            # run unit tests (Vitest)
pnpm test:e2e        # run e2e tests (Playwright, headless)
pnpm test:e2e:ui     # run e2e tests (Playwright UI mode)
pnpm lint            # run ESLint
pnpm db:generate     # generate Drizzle migration
pnpm db:push         # push schema to database
pnpm db:migrate      # apply pending migrations
```

## Environment variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=xxx    # Clerk dashboard
CLERK_SECRET_KEY=xxx                     # Clerk dashboard
JSON_PLACEHOLDER_USERS=https://jsonplaceholder.typicode.com/users  # returns [{ id, name, email }]
MOCK_API_USERS=https://<id>.mockapi.io/api/v1/users  # accepts { first_name, email }, returns { id, first_name, email, createdAt }
DATABASE_URL=xxx                         # Neon PostgreSQL connection string (for products API)
```
