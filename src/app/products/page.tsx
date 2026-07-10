// Metadata is a server-only export — it sets <title> and <meta> tags for this route.
// See: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { DeleteButton } from '@/components/delete-button';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { getProducts } from '@/lib/api';

// Alternative: fetch from the route handler via HTTP.
// Tradeoff: requires API_BASE_URL or VERCEL_URL, breaks build-time prerendering
// because the server isn't running during `next build`.
//
// const BASE = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : process.env.API_BASE_URL || 'http://localhost:3000';
//
// async function getProductsViaApi(): Promise<Product[]> {
//   'use cache';
//   cacheLife({ stale: 30 });
//   cacheTag('products');
//   const res = await fetch(`${BASE}/api/products`);
//   if (!res.ok) return [];
//   return res.json();
// }

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our product catalog',
};

// getCachedProducts wraps the shared lib function with caching.
// The cache is independent from the route handler — pages and API consumers
// each have their own cache entries for the same underlying data.
async function getCachedProducts() {
  'use cache';
  cacheLife({ stale: 30 });
  cacheTag('products');
  return getProducts();
}

// ProductList calls the shared lib directly — no HTTP round-trip to the route handler.
// The route handler at /api/products still exists for external API consumers.
async function ProductList() {
  let products: Awaited<ReturnType<typeof getCachedProducts>>;
  try {
    products = await getCachedProducts();
  } catch {
    products = [];
  }
  if (!Array.isArray(products)) products = [];

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Products</h1>
        <p className="text-lg text-gray-500">All available products</p>
      </section>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No products yet</p>
          <p className="text-sm mt-1">Add one via the API</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
            >
              <Link href={`/products/${product.id}`} className="block">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h2>
                <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-400 mt-2">ID: {product.id}</p>
              </Link>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <DeleteButton id={product.id} />
                <AddToCartButton id={product.id} name={product.name} price={product.price} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// The default export is a non-async function — it returns immediately with the <Suspense> shell.
// Because it doesn't await any uncached data (fetch, headers, params), it stays static
// and can be fully prerendered, satisfying cacheComponents: true.
//
// <Suspense> with a fallback skeleton:
//   - The fallback renders instantly (static HTML)
//   - Once `ProductList` resolves, React streams in the real UI, replacing the skeleton
//
// This pattern is called "streaming" or "Partial Prerendering" (PPR).
export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <section className="text-center py-6">
          <div className="h-10 w-48 bg-gray-200 rounded-lg mx-auto mb-3" />
          <div className="h-5 w-64 bg-gray-200 rounded mx-auto" />
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
              <div className="h-5 w-32 bg-gray-200 rounded" />
              <div className="h-8 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductList />
    </Suspense>
  );
}
