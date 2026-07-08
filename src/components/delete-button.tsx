'use client';

// Client component that bridges a server action (runs on server)
// with a browser onClick event (runs on client).
//
// Hydration: React takes the static HTML from the server and attaches
// event handlers on the client — without this 'use client' boundary,
// the onClick would never execute because server components don't hydrate.

import { useRouter } from 'next/navigation';
import { deleteProductById } from '@/actions/product';

// For use on the listing page: deletes the product and refreshes the
// current page in-place so the removed product disappears from the grid.
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

// For use on the detail page: deletes the product then navigates to
// the listing page (since the current product no longer exists).
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
