import Link from 'next/link';

export default function SentryTestPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Sentry Test</h1>
      <p className="text-gray-500 mb-8">Trigger errors to verify Sentry captures them.</p>

      <div className="grid gap-4">
        <Link
          href="/sentry-test/server"
          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Server Error</h2>
          <p className="text-sm text-gray-500">Route handler throws — captured by <code>sentry.server.config.ts</code></p>
        </Link>

        <Link
          href="/sentry-test/client"
          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Client Error</h2>
          <p className="text-sm text-gray-500">Click a button to throw — captured by <code>sentry.client.config.ts</code></p>
        </Link>

        <Link
          href="/sentry-test/edge"
          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Proxy Error</h2>
          <p className="text-sm text-gray-500"><code>proxy.ts</code> throws (Node.js) — <code>sentry.edge.config.ts</code> kept as reference only</p>
        </Link>
      </div>
    </div>
  );
}
