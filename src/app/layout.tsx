import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Suspense } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Next.js Concepts',
    template: '%s — Next.js Concepts',
  },
  description: 'A demo app exploring Next.js App Router features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
        >
          <Suspense fallback={null}>
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-4 flex-1 w-full">
              {children}
            </main>
            <Footer />
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
