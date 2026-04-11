import { render, screen, fireEvent, act } from '@testing-library/react';
import { WalletInput } from './WalletInput';
import { useRouter } from 'next/navigation';

describe('WalletInput', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders input and buttons', () => {
    render(<WalletInput />);
    expect(screen.getByPlaceholderText(/Search Ethereum wallet address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Investigate/i })).toBeInTheDocument();
  });

  it('allows typing an address', () => {
    render(<WalletInput />);
    const input = screen.getByPlaceholderText(/Search Ethereum wallet address/i);
    fireEvent.change(input, { target: { value: '0x123' } });
    expect(input).toHaveValue('0x123');
  });

  it('shows scanning overlay and navigates after timeout', async () => {
    render(<WalletInput />);
    const input = screen.getByPlaceholderText(/Search Ethereum wallet address/i);
    const submitBtn = screen.getByRole('button', { name: /Investigate/i });

    fireEvent.change(input, { target: { value: '0x123' } });
    fireEvent.click(submitBtn);

    // Should show overlay
    expect(screen.getByText('TRACING ASSETS')).toBeInTheDocument();

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(mockPush).toHaveBeenCalledWith('/investigate?wallet=0x123');
  });

  it('saves and loads history from localStorage', () => {
    const { unmount } = render(<WalletInput />);
    const input = screen.getByPlaceholderText(/Search Ethereum wallet address/i);
    const submitBtn = screen.getByRole('button', { name: /Investigate/i });

    fireEvent.change(input, { target: { value: '0xabc' } });
    fireEvent.click(submitBtn);

    unmount();

    // Re-render to check if history loaded
    render(<WalletInput />);
    expect(screen.getByText(/0xabc\.\.\.xabc/)).toBeInTheDocument();
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('lexexhibit-history', 'invalid-json');
    // Should not crash
    render(<WalletInput />);
    expect(screen.queryByText(/Recent Investigations/i)).not.toBeInTheDocument();
  });

  it('allows clicking demo wallet buttons', () => {
    render(<WalletInput />);
    const demoBtn = screen.getByText(/Guilty: Bridge Exploiter/i);
    fireEvent.click(demoBtn);
    
    expect(screen.getByPlaceholderText(/Search Ethereum wallet address/i)).toHaveValue('0x098B716B8Aaf21512996dC57EB0615e2383E2f96');

    const cleanBtn = screen.getByText(/Clean: Retail Trader/i);
    fireEvent.click(cleanBtn);
    expect(screen.getByPlaceholderText(/Search Ethereum wallet address/i)).toHaveValue('0xInnocentUser1234567890abcdef1234567890a');
  });

  it('allows clicking history items to set address', () => {
    localStorage.setItem('lexexhibit-history', JSON.stringify(['0x1234567890abcdef1234567890abcdef12345678']));
    render(<WalletInput />);
    
    const historyBtn = screen.getByTitle('0x1234567890abcdef1234567890abcdef12345678');
    fireEvent.click(historyBtn);
    
    expect(screen.getByPlaceholderText(/Search Ethereum wallet address/i)).toHaveValue('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('does nothing on scan if address is empty', () => {
    render(<WalletInput />);
    const form = screen.getByRole('button', { name: /Investigate/i }).closest('form');
    fireEvent.submit(form!);
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByText('TRACING ASSETS')).not.toBeInTheDocument();
  });
});
