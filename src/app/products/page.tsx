// Metadata is a server-only export — it sets <title> and <meta> tags for this route.
// See: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { cacheLife } from 'next/cache';
import { deleteProduct } from '@/actions/deleteProduct';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our product catalog',
};

interface Product {
  id: number;
  name: string;
  price: number;
}

// API_BASE_URL decouples the internal fetch URL from the hardcoded host.
// In development it defaults to localhost:3000; in production set it to your deployed URL.
const BASE = process.env.API_BASE_URL || 'http://localhost:3000';

// `'use cache'` on a data-fetching function, not the component.
// cacheComponents: true already handles component caching — this caches only the data,
// so the HTTP call is skipped for 30s regardless of how many times the component renders.
async function getProducts(): Promise<Product[]> {
  'use cache';
  cacheLife({ stale: 30 });

  const res = await fetch(`${BASE}/api/products`);
  if (!res.ok) return [];
  return res.json();
}

// ProductList calls the route handler via fetch, demonstrating API integration.
async function ProductList() {
  let products: Product[];
  try {
    products = await getProducts();
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
              <form action={deleteProduct} className="mt-4 pt-4 border-t border-gray-100">
                <input type="hidden" name="id" value={product.id} />
                <button
                  type="submit"
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </form>
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
