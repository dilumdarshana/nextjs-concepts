# Next.js Concepts — Pattern Reference

## The three server primitives (+ the proxy layer)

Next.js has three server-side primitives that run in the same process on the server. In front of all of them sits the **proxy** (`src/proxy.ts`), an Edge-level request guard:

```
    Incoming Request
           │
           ▼
    ┌──────────────┐
    │   proxy.ts   │  ← Edge Runtime (before the server)
    │  auth/guard  │
    └──────┬───────┘
           │ pass through
           ▼
┌──────────────────────────────────────────┐
│           Next.js Server                 │
│                                          │
│  ┌──────────────┐  ┌──────────┐  ┌────┐ │
│  │   Server     │  │  Server  │  │Route│ │
│  │  Component   │  │  Action  │  │ Hand│ │
│  │              │  │          │  │     │ │
│  │  Renders UI  │  │ Mutates  │  │ JSON│ │
│  │  (default)   │  │ data     │  │     │ │
│  └──────┬───────┘  └────┬─────┘  └──┬──┘ │
│         │               │           │     │
│         └───────────────┴───────────┘     │
│              Shared lib/ + db/ + cache    │
└──────────────────────────────────────────┘
```

| Layer | Runtime | Purpose | File |
|---|---|---|---|
| **Proxy** | Edge | Auth, redirects, headers — runs before every matching request | `src/proxy.ts` |
| **Server Component** | Server | Renders UI from server data (default) | `app/` pages and components |
| **Server Action** | Server | Mutates data, revalidates cache | `actions/` or inline `'use server'` |
| **Route Handler** | Server | Returns JSON/other responses | `app/api/**/route.ts` |

**Server Components** are the default — any component without `'use client'` is a server component. They can `await` data directly (DB calls, `fetch()`) and render JSX. They cannot use hooks, event handlers, or browser APIs.

**Server Actions** (`'use server'`) are functions callable from client components (or forms) that run on the server. They handle mutations, then call `revalidatePath`/`revalidateTag` to refresh cached data.

**Route Handlers** (`route.ts`) are traditional API endpoints — they receive a `Request` and return `Response`. Pages typically call them via `fetch()` to demonstrate the HTTP integration pattern.

All three primitives plus the proxy can import shared libraries (`src/lib/`, `src/db/`). The three server primitives also share `'use cache'`. See each section below for examples.

---

## `'use cache'` + `cacheLife()`

Function-level caching (Replaces `next: { revalidate }` on `fetch()`).

```ts
import { cacheLife } from 'next/cache';

async function getProducts() {
  'use cache';
  cacheLife({ stale: 30 });         // 30s fresh, then stale-while-revalidate
  return db.select().from(products); // works with DB calls, fetch, any async
}
```

- Caches the **return value**, not just the HTTP response
- Enabled by `experimental: { useCache: true }` in `next.config.ts`
- All three server primitives (see [top](#the-three-server-primitives)) can import the same cached function — they share the cache
- Put `'use cache'` on a **data function**, not on a component — the component is already cached by `cacheComponents: true`

### `cacheTag()` + `revalidateTag()` — on-demand cache invalidation

Add `cacheTag()` inside the cached function, then call `revalidateTag()` from a server action:

```ts
// pages/products/page.tsx — cached data function
async function getProducts() {
  'use cache';
  cacheLife({ stale: 30 });
  cacheTag('products');                     // tag the cache entry
  return db.select().from(products);
}

// actions/product.ts — server action purges the cache
import { revalidatePath, revalidateTag } from 'next/cache';

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/products');              // broad — clears entire route cache
  revalidateTag('products', { expire: 3600 }); // granular — clears only tagged entries
}
```

| Strategy | Scope | Use case |
|---|---|---|
| `revalidatePath('/path')` | All cache entries under that route | Simple pages |
| `revalidateTag('tag')` | Only entries with that specific tag | Shared data across routes |

In Next.js 16, `revalidateTag()` requires a cache profile as the second argument (`{ expire: 3600 }`). `revalidatePath()` is simpler — no profile needed.

See: src/app/products/page.tsx, src/actions/product.ts

---

## `<Suspense>` + Streaming (PPR / Partial Prerendering)

Non-async page shell → `<Suspense>` → async child component.

```tsx
export default function Page() {              // NOT async — renders instantly
  return (
    <Suspense fallback={<Skeleton />}>         // static shell
      <AsyncContent />                         // streams in after fetch
    </Suspense>
  );
}
```

- Layout and shell are prerendered as static HTML
- Data-fetching parts stream in once resolved
- Required when `cacheComponents: true` and page accesses uncached data
- See: src/app/products/page.tsx, src/app/products/[id]/page.tsx

---

## `params` is `Promise` (Next.js 16)

In route handlers and dynamic pages, `params` must be awaited:

```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

```ts
// Route handlers (next/server)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

See: src/app/products/[id]/page.tsx, src/app/api/products/[id]/route.ts, src/app/users/[id]/route.ts

---

## `cacheComponents: true` (server component caching)

Enables caching of all server components by default.

- Static pages get ISR with revalidate/expire columns in build output
- Dynamic data (`fetch`, `headers`, `params`) must be inside `<Suspense>` boundaries
- `force-dynamic` is incompatible — remove it
- See: next.config.ts, AGENTS.md quirks

---

## `'use client'` for non-deterministic values

Client components are needed for runtime values like `new Date()`.

```tsx
'use client';
export default function Footer() {
  return <p>&copy; {new Date().getFullYear()} My Application</p>;
}
```

Wrap in `<Suspense>` when used inside a cached layout:
```tsx
<Suspense fallback={null}><Footer /></Suspense>
```

See: src/components/footer.tsx

---

## `generateMetadata` — dynamic SEO

```ts
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const product = await fetchProduct(id);
  return { title: product.name, description: `...` };
}
```

- Runs during page rendering
- Can fetch data — returned object becomes `<title>` and `<meta>` tags
- See: src/app/products/[id]/page.tsx

---

## Route-level boundaries

| File | Purpose |
|------|---------|
| `loading.tsx` | Shown while the page (or its Suspense) loads |
| `error.tsx` | Error boundary for the route segment — `'use client'` |
| `not-found.tsx` | Custom 404 when `notFound()` is called |
| `layout.tsx` | Shared wrapper (breadcrumbs, etc.) |

Place them in any route directory. They scope to that segment and below.

---

## Root layout metadata template

```ts
export const metadata: Metadata = {
  title: {
    default: 'Next.js Concepts',
    template: '%s — Next.js Concepts',
  },
};
```

Child pages export just their page name (`'Products'`, `'About'`) — the template appends the suffix automatically. Client-component pages need a sibling `layout.tsx` to export metadata.

See: src/app/layout.tsx, src/app/about/layout.tsx

---

## Server actions + `revalidatePath`

Server actions are one of the three server primitives (see [top](#the-three-server-primitives)). They let client components call server-side mutation functions.

```ts
'use server';
import { revalidatePath } from 'next/cache';

export async function addUserAction(data: FormData) {
  await fetch(API, { method: 'POST', body: JSON.stringify({ ... }) });
  revalidatePath('/users-form');
}
```

- `revalidatePath` purges the cache for that route
- `revalidateTag('tag')` works with `cacheTag()` for granular control
- Use `redirect()` after mutation to navigate the browser to a new page
- See: src/actions/submitForm.ts, src/actions/deleteProduct.ts

---

## `API_BASE_URL` env var for internal fetch

```env
API_BASE_URL=http://localhost:3000
# Set to deployed URL in production (e.g. https://my-app.vercel.app)
```

```ts
const BASE = process.env.API_BASE_URL || 'http://localhost:3000';
const res = await fetch(`${BASE}/api/products`);
```

Never hardcode `localhost` in production code. Fallback only covers local dev.
See: src/app/products/page.tsx, src/app/products/[id]/page.tsx

---

## Shared API lib (`src/lib/api.ts`)

Route handlers (one of the three server primitives — see [top](#the-three-server-primitives)) share cached DB functions through a common lib.

```ts
// src/lib/api.ts — cached DB query
export async function getProductById(id: string) {
  'use cache';
  cacheLife({ stale: 30 });
  // ... db query ...
}

// src/app/api/products/[id]/route.ts — route handler calls the cached function
import { getProductById } from '@/lib/api';
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return Response.json(await getProductById(id));
}
```

Pages call the route handler via `fetch()` (demonstrating API integration), not the lib directly:

```ts
// src/app/products/page.tsx — page fetches from the API
async function getProducts() {
  'use cache';           // component-level cache caches the HTTP call
  cacheLife({ stale: 30 });
  const res = await fetch(`${BASE}/api/products`);
  return res.json();
}
```

- Route handlers cache DB results so frequent API calls don't hit the DB twice
- Pages demonstrate the standard HTTP fetch pattern with their own cache layer
- The `'use cache'` still applies, it's just one layer deeper in the call stack
- See: src/lib/api.ts, src/app/api/products/route.ts

---

## Drizzle ORM + Neon setup

- Schema: `src/db/schema.ts`
- Client: `src/db/index.ts` (reads `DATABASE_URL`)
- Config: `drizzle.config.ts` (loads `.env.local`)
- Commands: `pnpm db:generate` → `pnpm db:migrate` (or `db:push` with caution)

```ts
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

const [product] = await db.select().from(products).where(eq(products.id, 1));
```

---

## Env guard pattern

Prevent crashes when env vars are missing or set to placeholder `xxx`:

```ts
const API = process.env.MOCK_API_USERS;
if (!API || API === 'xxx') return [];
```

See: src/app/users-server/page.tsx, src/app/users-form/page.tsx, src/actions/submitForm.ts

---

## Proxy file (`src/proxy.ts`) — edge request layer

Next.js 16 deprecated `middleware.ts` and renamed it to `proxy.ts`. The concept is the **same** — it runs at the Edge (or the server's closest Edge-like layer) **before every matching request**, acting as a lightweight reverse proxy in front of your application.

```
        Incoming Request
               │
               ▼
        ┌──────────────┐
        │   proxy.ts   │  ← Edge Runtime (fast, global, before the server)
        │  (Clerk auth)│
        └──────┬───────┘
               │ passthrough or redirect
               ▼
        ┌──────────────────────────────────────────┐
        │           Next.js Server                 │
        │  ┌─────────┐ ┌────────┐ ┌───────────┐  │
        │  │ Server  │ │ Server │ │  Route    │  │
        │  │ Comp.   │ │ Action │ │  Handler  │  │
        │  └─────────┘ └────────┘ └───────────┘  │
        │   (the three server primitives)          │
        └──────────────────────────────────────────┘
```

Unlike Express/Node.js middleware, `proxy.ts` does **not** run inside the request-response cycle of the application. It's a separate Edge function that fires first, can short-circuit the request (redirect, rewrite, return 401), or let it pass through to the Next.js server.

### Why the rename?

"Middleware" in the Express sense implies it's part of the app's request pipeline (`req → middleware → route handler`). Next.js middleware was never that — it's a proxy layer that runs **before** the app even receives the request. The rename to `proxy.ts` reflects what it actually does: act as a proxy/guard at the edge of your infrastructure.

### Common uses

- **Authentication** — check cookies, redirect to login, protect routes (Clerk, Auth.js)
- **Redirects** — legacy URL patterns, country-based routing
- **Headers** — add security headers, CORS, set `x-robots-tag`
- **Geolocation** — rewrite to country-specific pages from `x-vercel-ip-country`
- **Bot detection** — block or redirect known crawlers

### `config.matcher`

The `matcher` tells the proxy which routes to run on. Everything else skips it entirely — critical for performance so the proxy doesn't fire on every static file (images, CSS, JS):

```ts
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### Full example — Clerk auth

```ts
// src/proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require authentication
const protectedRoutes = createRouteMatcher(['/users-form']);

export default clerkMiddleware(async (auth, req) => {
  if (protectedRoutes(req)) await auth.protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

See: src/proxy.ts

---

## Tailwind v4 quirks

- No `tailwind.config.ts` — config is CSS-only via `@theme`
- PostCSS plugin is `@tailwindcss/postcss` (not `tailwindcss`)
- Use `@import "tailwindcss"` not `@tailwind base`
- See: src/app/globals.css, postcss.config.mjs, AGENTS.md

---

## Playwright e2e tests

- Config: `playwright.config.ts` (chromium-only, auto-starts dev server)
- Tests: `e2e/*.spec.ts`
- Commands: `pnpm test:e2e` (headless), `pnpm test:e2e:ui` (UI mode)

```ts
test('home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Next.js Concepts' })).toBeVisible();
});
```

See: e2e/*.spec.ts, playwright.config.ts
