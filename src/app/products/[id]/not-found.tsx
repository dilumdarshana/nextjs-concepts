import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-6xl font-bold text-gray-200">404</div>
      <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
      <p className="text-gray-500 text-sm max-w-md mx-auto">
        The product you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/products"
        className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
      >
        Browse products
      </Link>
    </div>
  );
}
