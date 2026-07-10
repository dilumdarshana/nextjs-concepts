# Next.js Concepts — Pattern Reference

## Table of Contents

1. [The three server primitives (+ the proxy layer)](#the-three-server-primitives--the-proxy-layer)
2. [`'use cache'` + `cacheLife()`](#use-cache--cachelife)
3. [`<Suspense>` + Streaming (PPR)](#suspense--streaming-ppr)
4. [`params` is `Promise` (Next.js 16)](#params-is-promise-nextjs-16)
5. [`cacheComponents: true`](#cachecomponents-true)
6. [`'use client'` for non-deterministic values](#use-client-for-non-deterministic-values)
7. [`generateMetadata` — dynamic SEO](#generatemetadata--dynamic-seo)
8. [Route-level boundaries](#route-level-boundaries)
9. [Catch-all `[...slug]` and optional catch-all `[[...slug]]`](#catch-all-slug-and-optional-catch-all-slug)
10. [Parallel routes `@slot`](#parallel-routes-slot)
11. [Intercepting routes `(.)` `(..)` `(...)` `(..)(..)`](#intercepting-routes)
12. [Root layout metadata template](#root-layout-metadata-template)
13. [Server actions + `revalidatePath`](#server-actions--revalidatepath)
14. [Shared API lib (`src/lib/api.ts`)](#shared-api-lib-srclibapits)
15. [Drizzle ORM + Neon setup](#drizzle-orm--neon-setup)
16. [Env guard pattern](#env-guard-pattern)
17. [Proxy file (`src/proxy.ts`) — edge request layer](#proxy-file-srcproxysts--edge-request-layer)
18. [Tailwind v4 quirks](#tailwind-v4-quirks)
19. [Playwright e2e tests](#playwright-e2e-tests)
20. [Zustand — Global State Management](#zustand--global-state-management)
21. [Sentry — Error Tracking](#sentry--error-tracking)

---

## The three server primitives (+ the proxy layer)

Next.js has three server-side primitives that run in the same process on the server. In front of all of them sits the **proxy** (`src/proxy.ts`), which in Next.js 16 defaults to the **Node.js runtime**:

```
    Incoming Request
           │
           ▼
    ┌──────────────┐
    │   proxy.ts   │  ← Node.js (Next.js 16 default)
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
| **Proxy** | Node.js (default in Next.js 16) | Auth, redirects, headers — runs before every matching request | `src/proxy.ts` |
| **Server Component** | Server | Renders UI from server data (default) | `app/` pages and components |
| **Server Action** | Server | Mutates data, revalidates cache | `actions/` or inline `'use server'` |
| **Route Handler** | Server | Returns JSON/other responses | `app/api/**/route.ts` |

> **Note:** With `cacheComponents: true` + `experimental.useCache: true`, the app uses React's new caching layer which requires Node.js. This means the Edge Runtime is unavailable — all layers (proxy, route handlers, server components, server actions) run on Node.js. See [`cacheComponents: true`](#cachecomponents-true) for details.

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

### Edge Runtime incompatibility

`cacheComponents: true` + `experimental.useCache: true` enable React's new caching primitives (`cacheLife()`, `cacheTag()`, `connection()`). These rely on Node.js APIs and are **incompatible with the Edge Runtime**. This means:

- **Proxy** runs on Node.js (already the Next.js 16 default — no opt-in needed)
- **Route handlers** cannot use `export const runtime = 'edge'` — it would conflict with the caching layer
- **No part of the app runs on the Edge Runtime**

The config files (`sentry.edge.config.ts`, edge-referencing code in `proxy.ts`) are kept as **reference patterns** but are effectively dormant. If you remove `cacheComponents` and `useCache`, you can use `runtime = 'edge'` on individual route handlers to opt into Edge Runtime.

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

## Catch-all `[...slug]` and optional catch-all `[[...slug]]`

Dynamic segments that capture multiple URL path parts:

| Pattern | Matches | Example |
|---|---|---|
| `[id]` | Single segment | `/products/5` |
| `[...slug]` | One or more segments | `/docs/getting-started`, `/docs/routing/parallel` |
| `[[...slug]]` | Zero or more segments | `/categories`, `/categories/electronics`, `/categories/electronics/items` |

```tsx
// app/docs/[...slug]/page.tsx — always needs at least one segment
export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params; // slug is always an array
  const path = slug.join('/');
}

// app/categories/[[...slug]]/page.tsx — works with zero segments too
export default async function CategoriesPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return <CategoriesIndex />;  // renders at /categories
  }
  return <CategoryDetail slug={slug} />;  // renders at /categories/electronics
}
```

- `params.slug` is always `string[]` for catch-all, `string[] | undefined` for optional catch-all
- Use `notFound()` to handle invalid paths
- See: `src/app/docs/[...slug]/page.tsx`, `src/app/categories/[[...slug]]/page.tsx`

---

## Parallel routes `@slot`

Render multiple independent views within the same layout using named slots:

```
app/dashboard/
├── layout.tsx          # Receives children + sidebar as props
├── page.tsx            # Main content (default slot)
├── default.tsx         # Fallback for main slot
└── @sidebar/
    ├── page.tsx        # Sidebar content
    └── default.tsx     # Fallback for sidebar slot
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,       // from page.tsx (default slot)
  sidebar,        // from @sidebar/page.tsx (named slot)
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex gap-6">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}
```

Key points:
- Each slot renders **independently** — its own loading, error, page states
- Slots share the **parent URL** — they don't affect the URL structure
- `default.tsx` is required for each slot as a fallback when navigating from a sub-route that doesn't have a matching page in the slot
- `default.tsx` can re-export the main page or render `null` for conditional slots
- See: `src/app/dashboard/`

---

## Intercepting routes `(.)` `(..)` `(...)` `(..)(..)`

Load a route from within the current layout while preserving the original URL for sharing. The route is "intercepted" when navigated to from a matching parent context.

```
app/feed/
├── layout.tsx              # Parallel layout (children + @modal)
├── page.tsx                # Feed listing
├── @modal/
│   ├── default.tsx         # null — no modal by default
│   └── (.)item/
│       └── [id]/
│           └── page.tsx    # Intercepted — shows modal on /feed page
└── item/
    └── [id]/
        └── page.tsx        # Full page — shown when navigated directly
```

| Prefix | Intercepts from | Example |
|---|---|---|
| `(.)` | Same level | `/feed` → `/feed/item/1` renders modal on `/feed` |
| `(..)` | One level up | `/feed` → `/item/1` (parent route) |
| `(..)(..)` | Two levels up | `/feed` → `/item/1` (grandparent route) |
| `(...)` | Root level | Any → `/item/1` from the app root |

### How it works

1. Navigate to `/feed` — only `@modal/default.tsx` renders (null, nothing visible)
2. Click a link to `/feed/item/1` from within `/feed` — the `@modal/(.)item/[id]` intercepts and renders a modal overlay
3. Navigate directly to `/feed/item/1` (URL bar, external link) — `item/[id]/page.tsx` renders the full page, no interception

This pattern is ideal for:
- Photo galleries with lightbox modals
- Feed/item detail with expandable cards
- Wizards and multi-step forms
- Auth pages (login modal on top of current page)

The modal component typically closes on Escape key or backdrop click via `router.back()`.

```tsx
// app/feed/@modal/(.)item/[id]/page.tsx
'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';

export default function InterceptedItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);  // React.use() unwraps the Promise
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50" onClick={() => router.back()}>
      <div className="bg-white rounded-2xl p-8" onClick={(e) => e.stopPropagation()}>
        {/* modal content */}
        <button onClick={() => router.back()}>Close</button>
      </div>
    </div>
  );
}
```

See: `src/app/feed/`, `src/app/feed/@modal/(.)item/[id]/page.tsx`

---

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

## Shared API lib (`src/lib/api.ts`)

Route handlers and pages share cached DB functions through a common lib.

```ts
// src/lib/api.ts
export async function getProductById(id: string) {
  'use cache';
  cacheLife({ stale: 30 });
  return db.select().from(products).where(eq(products.id, numId)).then(r => r[0] || null);
}
```

Both route handlers and pages import from this lib — no HTTP round-trip needed:

```ts
// src/app/api/products/[id]/route.ts — route handler (public API)
import { getProductById } from '@/lib/api';
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return Response.json(await getProductById(id));
}

// src/app/products/[id]/page.tsx — page uses the same function directly
import { getProductById } from '@/lib/api';
async function ProductDetail({ id }: { id: string }) {
  const product = await getProductById(id);
}
```

Pages wrap the lib call with their own cache layer (separate from the route handler's cache):

```ts
// src/app/products/page.tsx — page-level cache
import { getProducts } from '@/lib/api';

async function getCachedProducts() {
  'use cache';
  cacheLife({ stale: 30 });
  cacheTag('products');
  return getProducts();
}
```

| Layer | Cache | Consumer |
|---|---|---|
| `src/lib/api.ts` | `'use cache'` per function | Internal pages & route handlers |
| Page wrapper | Separate `'use cache'` + `cacheTag` | Page rendering only |
| Route handler | Calls lib function directly | External API consumers |

Route handlers exist for **external** consumers (mobile apps, third parties). Internal pages call the lib directly — this avoids the chicken-and-egg problem of a server fetching itself via HTTP, works during build-time prerendering, and doesn't require `API_BASE_URL` or `VERCEL_URL`.

See: src/lib/api.ts, src/app/api/products/route.ts, src/app/products/page.tsx

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

## Proxy file (`src/proxy.ts`) — request guard

Next.js 16 deprecated `middleware.ts` and renamed it to `proxy.ts`. The concept is the **same** — it runs **before every matching request**, acting as a lightweight reverse proxy in front of your application.

```
        Incoming Request
               │
               ▼
        ┌──────────────┐
        │   proxy.ts   │  ← Node.js runtime (Next.js 16 default)
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

Unlike Express/Node.js middleware, `proxy.ts` does **not** run inside the request-response cycle of the application. It's a separate function that fires first, can short-circuit the request (redirect, rewrite, return 401), or let it pass through to the Next.js server.

> **Important:** In Next.js 15.x the proxy (then called `middleware.ts`) ran on the Edge Runtime by default. Starting in Next.js 16, the proxy defaults to **Node.js** and the `runtime` config option is not available for proxy files. Additionally, this project uses `cacheComponents: true` which makes Edge Runtime unavailable entirely — see the [`cacheComponents: true`](#edge-runtime-incompatibility) section.

### Why the rename?

"Middleware" in the Express sense implies it's part of the app's request pipeline (`req → middleware → route handler`). Next.js middleware was never that — it's a proxy layer that runs **before** the app even receives the request. The rename to `proxy.ts` reflects what it actually does: act as a proxy/guard at the edge of your infrastructure (even though it now runs on Node.js).

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
import { NextResponse } from 'next/server';

// Route matchers — each one defines a set of paths a rule applies to
const protectedRoutes = createRouteMatcher(['/users-form']);
const legacyRoutes = createRouteMatcher(['/old-page']);
const apiRoutes = createRouteMatcher(['/api/private(.*)']);

// The default export is the proxy handler — Next.js runs it on every
// matching request BEFORE the request reaches the server.
export default clerkMiddleware(async (auth, req) => {
  // Rule 1 — redirect legacy paths
  if (legacyRoutes(req)) {
    return NextResponse.redirect(new URL('/about', req.url));
  }

  // Rule 2 — require authentication for protected routes
  if (protectedRoutes(req)) {
    await auth.protect();
  }

  // Rule 3 — require auth for private API routes
  if (apiRoutes(req)) {
    await auth.protect();
  }

  // No rule matched — request passes through to the app normally.
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

---

## Zustand — Global State Management

[Zustand](https://github.com/pmndrs/zustand) is a lightweight state management library for React. It lives outside the component tree (no Provider wrapper needed) and components subscribe to slices of state via selectors.

### Store pattern

Define a store in `src/stores/` with `create()`:

```ts
import { create } from 'zustand';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      // immutable update logic
    }),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== productId),
    })),
}));
```

### Using the store in client components

Subscribe with a selector to avoid unnecessary re-renders:

```tsx
import { useCartStore } from '@/stores/cart';

function CartBadge() {
  const totalItems = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  return <span>{totalItems}</span>;
}

function AddButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  return <button onClick={() => addItem(product)}>Add</button>;
}
```

Each selector is a subscription — the component only re-renders when the selected value changes.

### Why Zustand over Context

| Feature | Zustand | React Context |
|---|---|---|
| Provider wrapper | None | Required at parent |
| Re-render control | Selector-based | Value-based (entire object) |
| Bundle size | ~1 KB | 0 (built-in) |
| Middleware | Persist, Immer, Devtools | N/A |

For simple demo purposes, Context is fine. Zustand shines when multiple unrelated components need to read/write shared state without wrapping the tree in providers.

See: src/stores/cart.ts, src/components/header.tsx, src/app/cart/page.tsx

---

## Sentry — Error Tracking

[Sentry](https://sentry.io) captures both server-side and client-side errors with full stack traces, including source maps from your production build.

### Setup

```ts
// sentry.client.config.ts — browser errors + session replays
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,              // sample 10% of transactions
  replaysSessionSampleRate: 0.1,       // sample 10% of sessions
  replaysOnErrorSampleRate: 1,         // always record on error
});
```

```ts
// sentry.server.config.ts — server component / route handler errors
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

```ts
// sentry.edge.config.ts — edge runtime (proxy.ts)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
});
```

### next.config.ts integration

Wrap with `withSentryConfig` to enable automatic source map upload and build-time instrumentation:

```ts
import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  telemetry: false,
});
```

### Environment variables

| Var | Required | Purpose |
|---|---|---|
| `SENTRY_DSN` | Yes | Public DSN — tells the SDK where to send events |
| `SENTRY_ORG` | For source maps | Org slug from Sentry settings |
| `SENTRY_PROJECT` | For source maps | Project slug from Sentry settings |
| `SENTRY_AUTH_TOKEN` | For source maps | API token with `project:releases` scope |

**Note**: For client-side errors, the DSN must be available in the browser bundle. Set it as `NEXT_PUBLIC_SENTRY_DSN` (Next.js only inlines `NEXT_PUBLIC_`-prefixed vars into client code). The SDK also falls back to `SENTRY_DSN` for server/edge runtimes. Set the same value for both in your Vercel environment variables. The DSN is public (it's in the client bundle) but the auth token must stay secret.

### Testing Sentry locally

Test pages at `/sentry-test` verify each target captures errors:

| Route | Target | Mechanism |
|---|---|---|
| `/sentry-test/server` | Server | Route handler throws — visit to see error in Sentry |
| `/sentry-test/client` | Client | Button click throws — captured by browser SDK with full context |
| `/sentry-test/proxy` | Proxy (Node.js) | `proxy.ts` throws before request reaches the app |

> **Dormant edge config:** `sentry.edge.config.ts` exists as a reference pattern but is currently unused. Because `cacheComponents: true` requires Node.js, the Edge Runtime is unavailable — the proxy and all route handlers run on Node.js. The `/sentry-test/proxy` test hits the proxy (Node.js), so errors flow to `sentry.server.config.ts`. If you remove `cacheComponents` and `useCache`, you can add `export const runtime = 'edge'` on individual route handlers and `sentry.edge.config.ts` would activate.

These pages are safe during build (no prerender interference) and only throw at runtime on Vercel.

See: sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts, next.config.ts, src/app/sentry-test/
