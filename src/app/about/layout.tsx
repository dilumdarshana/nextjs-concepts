import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About this demo project',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
