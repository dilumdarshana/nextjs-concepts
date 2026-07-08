import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { cacheLife } from 'next/cache';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our product catalog',
};

interface Product {
  id: number;
  name: string;
  price: number;
}

const BASE = process.env.API_BASE_URL || 'http://localhost:3000';

const getProducts = async (): Promise<Product[]> => {
  'use cache';
  cacheLife({ stale: 30 });

  const res = await fetch(`${BASE}/api/products`);

  return res.json();
}

async function ProductList() {
  const products: Product[] = await getProducts();

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
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-2">ID: {product.id}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

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
