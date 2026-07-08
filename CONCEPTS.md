# Next.js Concepts — Pattern Reference

## The three server primitives

Next.js has three server-side primitives that run in the same process on the server:

| Primitive | Runs in | Purpose | File location |
|---|---|---|---|
| **Server Component** | Request render | Renders UI from server data | `app/` pages and components (default) |
| **Server Action** | On call | Mutates data, revalidates cache | `actions/` or inline `'use server'` in components |
| **Route Handler** | On request | Returns JSON/other responses | `app/api/**/route.ts` |

```
┌──────────────────────────────────────────────────┐
│                  Next.js Server                  │
│                                                  │
│  ┌──────────────┐  ┌──────────┐  ┌────────────┐ │
│  │   Server     │  │  Server  │  │   Route    │ │
│  │  Component   │  │  Action  │  │  Handler   │ │
│  │              │  │          │  │            │ │
│  │  Renders UI  │  │ Mutates  │  │ Returns    │ │
│  │  (default)   │  │ data     │  │ JSON/etc   │ │
│  └──────┬───────┘  └────┬─────┘  └─────┬──────┘ │
│         │               │              │        │
│         └───────────────┴──────────────┘        │
│                     Shared                       │
│               lib/ + db/ + cache                 │
└──────────────────────────────────────────────────┘
```

**Server Components** are the default — any component without `'use client'` is a server component. They can `await` data directly (DB calls, `fetch()`) and render JSX. They cannot use hooks, event handlers, or browser APIs.

**Server Actions** (`'use server'`) are functions callable from client components (or forms) that run on the server. They handle mutations, then call `revalidatePath`/`revalidateTag` to refresh cached data.

**Route Handlers** (`route.ts`) are traditional API endpoints — they receive a `Request` and return `Response`. Pages typically call them via `fetch()` to demonstrate the HTTP integration pattern.

All three can import shared libraries (`src/lib/`, `src/db/`) and use `'use cache'` — the cache is shared across the entire server process. See each section below for examples.

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
- Use `cacheTag('name')` + `revalidateTag('name')` for on-demand purge
- Enabled by `experimental: { useCache: true }` in `next.config.ts`
- All three server primitives (see [top](#the-three-server-primitives)) can import the same cached function — they share the cache
- Put `'use cache'` on a **data function**, not on a component — the component is already cached by `cacheComponents: true`
- See: src/lib/api.ts, src/app/products/page.tsx

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

## Proxy file (Next.js 16)

Next.js 16 deprecated `middleware.ts`. Use `src/proxy.ts` instead:

```ts
// src/proxy.ts — Clerk auth middleware
import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware();
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
