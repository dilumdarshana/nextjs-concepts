'use client';
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav>
      <Link href="/" className={pathname === '/'? "text-bold mr-4" : "mr-4 text-blue-500"}>
        Home
      </Link>
      <Link href="/about" className={pathname === '/about' ? "text-bold mr-4": "mr-4 text-blue-500"}>
        About
      </Link>
      <Link
        href="/products/iphone"
        className={pathname.startsWith('/products') ? "text-bold mr-4": "mr-4 text-blue-500"}
      >
        Products
      </Link>
      <Link href="/users-client" className={pathname === '/about' ? "text-bold mr-4": "mr-4 text-blue-500"}>
        Users-Client
      </Link>
      <Link href="/users-server" className={pathname === '/about' ? "text-bold mr-4": "mr-4 text-blue-500"}>
        Users-Server
      </Link>
      <Link href="/users-form" className={pathname === '/about' ? "text-bold mr-4": "mr-4 text-blue-500"}>
        Users-Form
      </Link>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </nav>
  )
}
