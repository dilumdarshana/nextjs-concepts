'use client';

import { useEffect } from 'react';
import { captureException } from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { captureException(error); }, [error]);

  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-5xl">!</div>
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="text-gray-500 text-sm max-w-md mx-auto">
        {error.message || 'Failed to load product.'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
