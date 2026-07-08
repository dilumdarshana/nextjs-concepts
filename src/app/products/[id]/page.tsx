// generateMetadata is used here for dynamic SEO — the <title> comes from the actual product name.
// `params` is a Promise in Next.js 16, so it must be awaited.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { DeleteButtonWithRedirect } from '@/components/delete-button';

const BASE = process.env.API_BASE_URL || 'http://localhost:3000';

interface Product {
  id: number;
  name: string;
  price: number;
}

// Fetches a single product from the route handler.
// No `'use cache'` here — the cache lives at the route handler level instead
// (see src/lib/api.ts:getProductById). This demonstrates that caching can be
// applied at different layers in the stack.
async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${BASE}/api/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

// generateMetadata runs during page rendering and sets <title> dynamically.
// Because it fetches data (via fetchProduct), the title reflects the real product name.
// If the product doesn't exist, it returns a generic "Not Found" title.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: 'Product Not Found' };
  return { title: product.name, description: `${product.name} — $${product.price.toFixed(2)}` };
}

// ProductDetail is the actual page content. It's wrapped in <Suspense> below,
// so it streams in after the static shell (loading skeleton) is painted.
//
// DeleteButtonWithRedirect is a client component (see src/components/delete-button.tsx).
// It lives inside this server component but is only a leaf — it handles its own onClick
// and hydration. The rest of ProductDetail stays on the server.
//
// If the product doesn't exist, notFound() triggers the closest not-found.tsx
// (which lives in this same directory).
async function ProductDetail({ id }: { id: string }) {
  const product = await fetchProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
        <p className="text-lg text-gray-500">Details for product #{product.id}</p>
      </section>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg mx-auto">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Product ID</span>
            <span className="font-mono text-sm font-medium text-gray-900">{product.id}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Name</span>
            <span className="text-sm font-medium text-gray-900">{product.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Price</span>
            <span className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <DeleteButtonWithRedirect id={product.id} redirectTo="/products" />
        </div>
      </div>
    </div>
  );
}

// The page is async because it needs to await `params` (uncached route data).
// `params` is awaited at the top level, but the actual data-fetching component
// (ProductDetail) is wrapped in <Suspense>, which satisfies cacheComponents requirements.
//
// The fallback skeleton renders instantly; ProductDetail streams in once the API responds.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <section className="text-center py-6">
          <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-3" />
          <div className="h-5 w-48 bg-gray-200 rounded mx-auto" />
        </section>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg mx-auto">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductDetail id={id} />
    </Suspense>
  );
}
