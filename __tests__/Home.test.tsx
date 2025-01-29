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

vi.mock('../src/app/component/counter', () => ({
  default: () => <div>Counter Component</div>
}));

vi.mock('../src/app/component/greet', () => ({
  default: () => <div>Greet Component</div>
}));

describe('Home Page should render', () => {
  it('Should render home page', () => {
    render(
      <ClerkProvider>
        <Home />
      </ClerkProvider>
    );

    // check main page texts rendered
    expect(screen.getByText('Hellooo')).toBeInTheDocument();
    // check child pages rendered
    expect(screen.getByText('Greatings!!!')).toBeInTheDocument();
    expect(screen.getByText('Counter 0')).toBeInTheDocument();
  });
});
