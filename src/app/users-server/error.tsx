'use client';
import { useEffect } from 'react';
import { captureException } from '@sentry/nextjs';

export default function Error ({ error }: { error: Error}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="felx item-center justify-center h-sceen">
      <div className="text-2xl text-red-500">Error on fetching users</div>
    </div>
  )
}
