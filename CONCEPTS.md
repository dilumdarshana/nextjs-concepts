# Next.js Concepts — Pattern Reference

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
- See: src/app/products/page.tsx, src/app/products/[id]/page.tsx

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
- See: src/actions/submitForm.ts

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
