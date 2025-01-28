'use client';
import { useEffect } from 'react';

export default function Error ({ error }: { error: Error}) {
  useEffect(() => {
    console.log('error on fetching users', error)
  }, [error]);

  return (
    <div className="felx item-center justify-center h-sceen">
      <div className="text-2xl text-red-500">Error on fetching users</div>
    </div>
  )
}
