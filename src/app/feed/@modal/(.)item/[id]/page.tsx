'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useCallback, use } from 'react';

interface FeedItem {
  id: number;
  title: string;
  description: string;
  content: string;
}

const items: Record<number, FeedItem> = {
  1: { id: 1, title: 'Getting Started with Next.js', description: 'Learn the basics of the App Router.', content: 'Next.js is a React framework for building full-stack web applications. The App Router is the new paradigm for routing, layouts, and data fetching.' },
  2: { id: 2, title: 'Understanding Parallel Routes', description: 'How to use @slot directories.', content: 'Parallel routes allow you to render multiple independent views within the same layout. Each slot has its own loading, error, and page states.' },
  3: { id: 3, title: 'Intercepting Routes Guide', description: 'Create modal overlays.', content: 'Intercepting routes allow you to load a route from within the current layout while preserving the URL for sharing. Perfect for modals and wizards.' },
  4: { id: 4, title: 'Data Fetching Patterns', description: 'Server fetch vs use cache.', content: 'Next.js supports multiple data fetching approaches: server-side fetch with async/await, the use cache directive for memoization, and server actions for mutations.' },
  5: { id: 5, title: 'Styling with Tailwind CSS', description: 'Utility-first CSS.', content: 'Tailwind CSS provides low-level utility classes that let you build custom designs without leaving your HTML. Version 4 uses CSS-only configuration.' },
};

export default function InterceptedItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') router.back();
  }, [router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const item = items[Number(id)];

  if (!id || !item) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => router.back()}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h2>
        <p className="text-gray-500 mb-4">{item.description}</p>
        <p className="text-gray-600 leading-relaxed mb-6">{item.content}</p>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          Intercepted by <code>@modal/(.)item/[id]</code>
        </div>
      </div>
    </div>
  );
}
