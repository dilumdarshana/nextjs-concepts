'use client';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/products', label: 'Products', active: (p: string) => p.startsWith('/products') },
  { href: '/users-client', label: 'Users-Client' },
  { href: '/users-server', label: 'Users-Server' },
  { href: '/users-form', label: 'Users-Form' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <nav className="max-w-4xl mx-auto flex items-center gap-1 px-4 h-12">
      {links.map(({ href, label, active }) => {
        const isActive = active ? active(pathname) : pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {label}
          </Link>
        );
      })}
      <div className="ml-auto flex items-center">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal" />
        )}
      </div>
    </nav>
  )
}
