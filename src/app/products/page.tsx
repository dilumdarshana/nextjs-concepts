import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/db';
import { products } from '@/db/schema';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our product catalog',
};

interface Product {
  id: number;
  name: string;
  price: number;
}

async function getProducts(): Promise<Product[]> {
  return db.select().from(products);
}

export default async function ProductsPage() {
  const allProducts = await getProducts();

  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Products</h1>
        <p className="text-lg text-gray-500">All available products</p>
      </section>

      {allProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No products yet</p>
          <p className="text-sm mt-1">Add one via the API</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProducts.map((product) => (
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
