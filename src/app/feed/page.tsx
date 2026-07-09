import Link from 'next/link';

interface FeedItem {
  id: number;
  title: string;
  description: string;
}

const items: FeedItem[] = [
  { id: 1, title: 'Getting Started with Next.js', description: 'Learn the basics of the App Router, layouts, and server components.' },
  { id: 2, title: 'Understanding Parallel Routes', description: 'How to use @slot directories to render multiple independent views.' },
  { id: 3, title: 'Intercepting Routes Guide', description: 'Create modal overlays with intercepted routes for seamless navigation.' },
  { id: 4, title: 'Data Fetching Patterns', description: 'Compare server fetch, use cache, and server actions.' },
  { id: 5, title: 'Styling with Tailwind CSS', description: 'Utility-first CSS workflow in Next.js projects.' },
];

export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Feed</h1>
        <p className="text-lg text-gray-500">Click an item to open it in a modal</p>
      </section>

      <div className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/feed/item/${item.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h2>
            <p className="text-sm text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="text-xs text-gray-400 text-center">
        Items open as a modal via <code>@modal/(.)item/[id]</code> — navigate to <code>/feed/item/1</code> directly for the full page
      </div>
    </div>
  );
}
