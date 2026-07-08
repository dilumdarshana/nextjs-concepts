import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { cacheLife } from 'next/cache';

const BASE = process.env.API_BASE_URL || 'http://localhost:3000';

interface Product {
  id: number;
  name: string;
  price: number;
}

async function fetchProduct(id: string): Promise<Product | null> {
  'use cache';
  cacheLife({ stale: 30 });

  const res = await fetch(`${BASE}/api/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: 'Product Not Found' };
  return { title: product.name, description: `${product.name} — $${product.price.toFixed(2)}` };
}

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
      </div>
    </div>
  );
}

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
