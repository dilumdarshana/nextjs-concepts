'use client';

import { useCartStore } from '@/stores/cart';

export function AddToCartButton({ id, name, price }: { id: number; name: string; price: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const items = useCartStore((s) => s.items);
  const inCart = items.find((item) => item.id === id);
  const qty = inCart?.quantity ?? 0;

  return (
    <button
      type="button"
      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
      onClick={() => addItem({ id, name, price })}
    >
      Add to Cart{qty > 0 ? ` (${qty})` : ''}
    </button>
  );
}
