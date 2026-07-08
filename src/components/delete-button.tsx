'use client';

import { useRouter } from 'next/navigation';
import { deleteProductById } from '@/actions/product';

export function DeleteButton({ id }: { id: number }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="text-sm text-red-500 hover:text-red-700 transition-colors"
      onClick={async () => {
        await deleteProductById(id);
        router.refresh();
      }}
    >
      Delete
    </button>
  );
}

export function DeleteButtonWithRedirect({ id, redirectTo }: { id: number; redirectTo: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
      onClick={async () => {
        await deleteProductById(id);
        router.push(redirectTo);
      }}
    >
      Delete Product
    </button>
  );
}
