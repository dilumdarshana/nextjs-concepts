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
    // render component
    render(<About />);

    // check if the heading name is defined
    expect(screen.getByRole('heading', { name: 'About' })).toBeDefined();
  
    // check the button is rendered
    const button = screen.getByRole('button', { name: 'Go Home' });
    expect(button).toBeDefined();
    // to use this kind of jest dom matchers (toHaveClass), the additional library needs to 
    // be installed. @testing-library/jest-dom
    expect(button).toHaveClass('bg-blue-500', 'text-white', 'p-2', 'rounded-md');
  });

  it('Should route.push works', async () => {
    render(<About />);

    // get the button
    const button = screen.getByRole('button', { name: 'Go Home' });

    // simulate button click
    fireEvent.click(button);

    // assert the button route push
    expect(pushMock).toHaveBeenCalledWith('/');
  });
});

