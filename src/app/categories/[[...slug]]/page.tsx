import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Item {
  id: number;
  name: string;
  price: number;
}

const categories: Record<string, { title: string; items: Item[] }> = {
  electronics: {
    title: 'Electronics',
    items: [
      { id: 1, name: 'Wireless Headphones', price: 79.99 },
      { id: 2, name: 'USB-C Hub', price: 34.99 },
      { id: 3, name: 'Mechanical Keyboard', price: 129.99 },
    ],
  },
  clothing: {
    title: 'Clothing',
    items: [
      { id: 4, name: 'Cotton T-Shirt', price: 24.99 },
      { id: 5, name: 'Denim Jacket', price: 89.99 },
      { id: 6, name: 'Running Shoes', price: 119.99 },
    ],
  },
  books: {
    title: 'Books',
    items: [
      { id: 7, name: 'TypeScript Handbook', price: 39.99 },
      { id: 8, name: 'Atomic Habits', price: 14.99 },
      { id: 9, name: 'Design Patterns', price: 44.99 },
    ],
  },
};

export default async function CategoriesPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return (
      <div className="space-y-6">
        <section className="text-center py-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Categories</h1>
          <p className="text-lg text-gray-500">Choose a category to browse items</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {Object.entries(categories).map(([key, cat]) => (
            <Link
              key={key}
              href={`/categories/${key}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{cat.title}</h2>
              <p className="text-sm text-gray-400">{cat.items.length} items</p>
            </Link>
          ))}
        </div>

        <div className="text-xs text-gray-400 text-center">
          Or visit <code>/categories/electronics</code> directly
        </div>
      </div>
    );
  }

  const category = categories[slug[0]];
  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-400 flex items-center gap-2 max-w-2xl mx-auto">
        <Link href="/categories" className="hover:text-gray-600 transition-colors">Categories</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{category.title}</span>
      </nav>

      <section className="text-center py-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{category.title}</h1>
        <p className="text-lg text-gray-500">{category.items.length} products</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {category.items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-2xl font-bold text-blue-600">${item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400 text-center">
        <code>/categories{slug.length > 0 ? `/${slug.join('/')}` : ''}</code> — rendered by <code>[[...slug]]/page.tsx</code>
      </div>
    </div>
  );
}
