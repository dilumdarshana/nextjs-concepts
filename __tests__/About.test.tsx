import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import About from '../src/app/about/page';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: pushMock,
  })),
}));

describe('About Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Should render About page', () => {
    render(<About />);

    expect(screen.getByRole('heading', { name: 'About' })).toBeDefined();
    expect(screen.getByText('App Router')).toBeDefined();
    expect(screen.getByText('Server Components')).toBeDefined();
    expect(screen.getByText('Authentication')).toBeDefined();

    const button = screen.getByRole('button', { name: 'Back to Home' });
    expect(button).toBeDefined();
  });

  it('Should route.push works', async () => {
    render(<About />);

    const button = screen.getByRole('button', { name: 'Back to Home' });

    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith('/');
  });
});

