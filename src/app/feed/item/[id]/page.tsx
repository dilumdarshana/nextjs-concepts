import Link from 'next/link';
import { notFound } from 'next/navigation';

interface FeedItem {
  id: number;
  title: string;
  description: string;
  content: string;
}

const items: Record<number, FeedItem> = {
  1: {
    id: 1, title: 'Getting Started with Next.js', description: 'Learn the basics of the App Router.',
    content: 'Next.js is a React framework for building full-stack web applications. The App Router is the new paradigm for routing, layouts, and data fetching.',
  },
  2: {
    id: 2, title: 'Understanding Parallel Routes', description: 'How to use @slot directories.',
    content: 'Parallel routes allow you to render multiple independent views within the same layout. Each slot has its own loading, error, and page states.',
  },
  3: {
    id: 3, title: 'Intercepting Routes Guide', description: 'Create modal overlays.',
    content: 'Intercepting routes allow you to load a route from within the current layout while preserving the URL for sharing. Perfect for modals and wizards.',
  },
  4: {
    id: 4, title: 'Data Fetching Patterns', description: 'Server fetch vs use cache.',
    content: 'Next.js supports multiple data fetching approaches: server-side fetch with async/await, the use cache directive for memoization, and server actions for mutations.',
  },
  5: {
    id: 5, title: 'Styling with Tailwind CSS', description: 'Utility-first CSS.',
    content: 'Tailwind CSS provides low-level utility classes that let you build custom designs without leaving your HTML. Version 4 uses CSS-only configuration.',
  },
};

export default async function FeedItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = items[Number(id)];
  if (!item) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/feed" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
        ← Back to feed
      </Link>

      <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{item.title}</h1>
        <p className="text-gray-500 mb-6">{item.description}</p>
        <p className="text-gray-600 leading-relaxed">{item.content}</p>
      </article>

      <div className="text-xs text-gray-400 text-center">
        Full page at <code>/feed/item/{id}</code> — rendered by <code>item/[id]/page.tsx</code>
      </div>
    </div>
  );
}
