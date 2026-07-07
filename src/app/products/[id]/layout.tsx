import Link from 'next/link';

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="max-w-4xl mx-auto px-4 pt-3">
        <ol className="flex items-center gap-2 text-sm text-gray-400">
          <li><Link href="/" className="hover:text-gray-600 transition-colors">Home</Link></li>
          <li>/</li>
          <li className="text-gray-600">Products</li>
        </ol>
      </nav>
      {children}
    </div>
  )
}
