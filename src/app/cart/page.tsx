'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Cart</h1>
        <p className="text-gray-400 text-lg">Your cart is empty</p>
        <Link
          href="/products"
          className="inline-block px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Cart</h1>
          <p className="text-gray-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Clear All
        </button>
      </section>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.id}`} className="text-sm font-medium text-gray-900 hover:underline truncate block">
                {item.name}
              </Link>
              <p className="text-sm text-gray-400">${item.price.toFixed(2)} each</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                +
              </button>
            </div>

            <div className="text-right w-24">
              <p className="text-sm font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
            </div>

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
        <span className="text-base font-medium text-gray-900">Total</span>
        <span className="text-xl font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}
