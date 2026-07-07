import { expect, it, describe, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import Home from '../src/app/page';

// mock clerk provider
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isLoaded: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: () => 'test-token',
  }),
  useUser: () => ({
    isSignedIn: true,
    user: { id: 999 },
  }),
}));

vi.mock('@/components/counter', () => ({
  default: () => <div>Counter Component</div>
}));

vi.mock('@/components/greet', () => ({
  default: () => <div>Greet Component</div>
}));

describe('Home Page should render', () => {
  it('Should render home page', () => {
    render(
      <ClerkProvider>
        <Home />
      </ClerkProvider>
    );

    expect(screen.getByText('Next.js Concepts')).toBeInTheDocument();
    expect(screen.getByText('Server Component')).toBeInTheDocument();
    expect(screen.getByText('Client Component')).toBeInTheDocument();
    expect(screen.getByText('Greet Component')).toBeInTheDocument();
    expect(screen.getByText('Counter Component')).toBeInTheDocument();
  });
});
