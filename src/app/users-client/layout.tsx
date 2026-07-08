import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users (Client)',
  description: 'Client-side data fetching with useEffect',
};

export default function UsersClientLayout({ children }: { children: React.ReactNode }) {
  return children;
}
