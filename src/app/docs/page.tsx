import Link from 'next/link';

const topics = [
  { href: '/docs/getting-started', title: 'Getting Started', desc: 'Set up a new Next.js project' },
  { href: '/docs/routing', title: 'Routing Fundamentals', desc: 'File-based routing and conventions' },
  { href: '/docs/routing/parallel', title: 'Parallel Routes', desc: 'Render multiple views with @slot' },
  { href: '/docs/routing/intercepting', title: 'Intercepting Routes', desc: 'Modal-style navigation with (.)' },
  { href: '/docs/data-fetching', title: 'Data Fetching', desc: 'Server fetch, cache, and mutations' },
];

export default function DocsIndex() {
  return (
    <div className="space-y-6">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Documentation</h1>
        <p className="text-lg text-gray-500">Browse topics</p>
      </section>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {topics.map((topic) => (
          <Link
            key={topic.href}
            href={topic.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{topic.title}</h2>
            <p className="text-sm text-gray-500">{topic.desc}</p>
          </Link>
        ))}
      </div>

      <div className="text-xs text-gray-400 text-center">
        Try <code>/docs/getting-started</code>, <code>/docs/routing/parallel</code>, or any nested path
      </div>
    </div>
  );
}
