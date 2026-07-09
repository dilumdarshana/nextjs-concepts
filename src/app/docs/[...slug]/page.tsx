import Link from 'next/link';
import { notFound } from 'next/navigation';

const docContent: Record<string, { title: string; content: string }> = {
  'getting-started': {
    title: 'Getting Started',
    content: 'Create a new Next.js project with `npx create-next-app@latest`. Choose TypeScript, ESLint, Tailwind CSS, and the App Router.',
  },
  'routing': {
    title: 'Routing Fundamentals',
    content: 'Next.js uses file-based routing. Files inside `app/` automatically become routes. `page.tsx` defines the UI, `layout.tsx` wraps pages with shared UI.',
  },
  'routing/parallel': {
    title: 'Parallel Routes',
    content: 'Parallel routes use `@slot` directories to render multiple independent views within a single layout. Each slot has its own loading, error, and page states.',
  },
  'routing/intercepting': {
    title: 'Intercepting Routes',
    content: 'Intercepting routes use `(.)`, `(..)`, `(...)` prefixes to load a route from within the current layout while preserving the URL for sharing.',
  },
  'data-fetching': {
    title: 'Data Fetching',
    content: 'Next.js supports server-side fetch with `async`/`await`, `\'use cache\'` for memoization, and server actions for mutations.',
  },
};

export default async function DocPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = slug.join('/');
  const doc = docContent[path];

  if (!doc) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <nav className="text-sm text-gray-400 flex items-center gap-2">
        <Link href="/docs" className="hover:text-gray-600 transition-colors">Docs</Link>
        {slug.map((segment, i) => (
          <span key={i} className="flex items-center gap-2">
            <span>/</span>
            <span className={i === slug.length - 1 ? 'text-gray-900 font-medium' : ''}>
              {segment}
            </span>
          </span>
        ))}
      </nav>

      <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{doc.title}</h1>
        <p className="text-gray-600 leading-relaxed">{doc.content}</p>

        {slug.length > 1 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href={`/docs/${slug.slice(0, -1).join('/')}`}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Back to {slug.slice(0, -1).join('/')}
            </Link>
          </div>
        )}
      </article>

      <div className="text-xs text-gray-400 text-center">
        <code>/docs/{path}</code> — rendered by <code>[...slug]/page.tsx</code>
      </div>
    </div>
  );
}
