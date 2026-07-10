'use client';

export default function SentryClientTest() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Client Error Test</h1>
      <p className="text-gray-500 mb-8">Click the button to trigger a client-side error.</p>

      <button
        type="button"
        onClick={() => {
          throw new Error('[Sentry Test] Client error from button click');
        }}
        className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
      >
        Throw Client Error
      </button>

      <p className="text-xs text-gray-400 mt-8">
        Check Sentry dashboard for the error with full browser context.
      </p>
    </div>
  );
}
