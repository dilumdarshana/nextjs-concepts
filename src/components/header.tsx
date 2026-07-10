'use client';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cart';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products', active: (p: string) => p.startsWith('/products') },
  { href: '/docs', label: 'Docs', active: (p: string) => p.startsWith('/docs') },
  { href: '/categories', label: 'Categories', active: (p: string) => p.startsWith('/categories') },
  { href: '/dashboard', label: 'Dashboard', active: (p: string) => p.startsWith('/dashboard') },
  { href: '/feed', label: 'Feed', active: (p: string) => p.startsWith('/feed') },
  { href: '/users-client', label: 'Users-Client' },
  { href: '/users-server', label: 'Users-Server' },
  { href: '/users-form', label: 'Users-Form' },
  { href: '/sentry-test', label: 'Sentry', active: (p: string) => p.startsWith('/sentry-test') },
];

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const totalItems = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-4xl mx-auto flex items-center gap-1 px-4 h-12">
        {links.map(({ href, label, active }) => {
          const isActive = active ? active(pathname) : pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              {label}
            </Link>
          );
        })}
        <Link
          href="/cart"
          className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            pathname === '/cart'
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <div className="ml-auto flex items-center">
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal" />
          )}
        </div>
      </nav>
    </header>
  )
}
