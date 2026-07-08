import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
}

async function getProduct(id: string): Promise<Product | null> {
  const host = (await headers()).get('host') || 'localhost:3000';
  const protocol = host.startsWith('localhost') ? 'http' : 'https';
  const res = await fetch(`${protocol}://${host}/api/products/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Product Not Found' };
  return { title: product.name, description: `${product.name} — $${product.price.toFixed(2)}` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

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
