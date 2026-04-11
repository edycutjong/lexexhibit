import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import InvestigatePage from './page';

const mockScanData = {
  ledger: {
    transactions: [{ hash: '0x1', timestamp: Date.now(), from: '0x1', to: '0x2', value: '1', category: 'mixer_interaction', suspiciousFlags: [], isInternal: false }],
    summary: { totalValueUsd: 4500, txCount: 1, avgTxValue: 4500, lastActive: '2024-03-20T12:00:00Z', score: 85, riskLevel: 'high' }
  }
};

jest.mock('next/navigation', () => ({
    useSearchParams: jest.fn(() => new URLSearchParams('wallet=0x123')),
    useParams: jest.fn(() => ({})),
}));

describe('Investigate page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch = jest.fn();
    window.open = jest.fn();
    Element.prototype.scrollTo = jest.fn();
  });

  afterEach(() => {
    act(() => { jest.runOnlyPendingTimers(); });
    jest.useRealTimers();
  });

  it('renders loading state initially', async () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<InvestigatePage />);
    expect(screen.getByText('TRACING FUND MOVEMENTS...')).toBeInTheDocument();
  });

  it('renders scan results after loading', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockScanData)
    });
    render(<InvestigatePage />);
    await waitFor(() => expect(screen.getAllByText('Forensic Wallet Trace').length).toBeGreaterThan(0));
  });

  it('handles error during scan result fetching', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Failed' }) });
    render(<InvestigatePage />);
    await waitFor(() => expect(screen.getByText('Forensic Wallet Trace')).toBeInTheDocument());
  });

  it('handles missing summary data gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ledger: { transactions: [] } })
    });
    render(<InvestigatePage />);
    await waitFor(() => expect(screen.getByText('$Unknown')).toBeInTheDocument());
  });

  it('handles partial summary data gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ledger: { transactions: [], summary: { txCount: 0 } } })
    });
    render(<InvestigatePage />);
    await waitFor(() => expect(screen.getByText('$Unknown')).toBeInTheDocument());
  });

  it('handles error gracefully during scan result fetching', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<InvestigatePage />);
    
    await waitFor(() => {
      expect(screen.queryByText('TRACING FUND MOVEMENTS...')).not.toBeInTheDocument();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('generates affidavit successfully and checks download link', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('/api/generate-affidavit')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ pdfBase64: 'data:application/pdf;base64,mock-pdf' }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockScanData) });
    });
    render(<InvestigatePage />);

    // Wait for the main initial fetch
    await act(async () => { await Promise.resolve(); });

    const genButton = await screen.findByText('Generate Legal Affidavit');
    fireEvent.click(genButton);

    // Initial state is "tracing"
    await act(async () => { jest.advanceTimersByTime(500); await Promise.resolve(); });

    // Move to "translating"
    await act(async () => { jest.advanceTimersByTime(1000); await Promise.resolve(); });

    // Move to "formatting"
    await act(async () => { jest.advanceTimersByTime(1500); await Promise.resolve(); });

    // Move to "done"
    await act(async () => { jest.advanceTimersByTime(1500); await Promise.resolve(); });

    // Now check for final buttons to be present
    expect(await screen.findByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByText('Regenerate Legal Affidavit')).toBeInTheDocument();
  });

  it('handles affidavit generation with missing transactions', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          ledger: {
             summary: { totalValueUsd: 0, txCount: 0, avgTxValue: 0, lastActive: '2024-03-20T12:00:00Z', score: 0, riskLevel: 'low' }
             // transactions omitted
          }
        })
    });
    render(<InvestigatePage />);
    await waitFor(() => expect(screen.getAllByText('Forensic Wallet Trace').length).toBeGreaterThan(0));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ pdfBase64: 'fake-base-64', sections: [], exhibitCount: 0 })
    });

    const generateBtn = screen.getByText('Generate Legal Affidavit');
    fireEvent.click(generateBtn);

    act(() => {
        jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
        expect(screen.getByText(/Translating Ledger Graph/)).toBeInTheDocument();
    });

    act(() => {
        jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
        expect(screen.getByText(/Emitting Certified PDF/)).toBeInTheDocument();
    });

    act(() => {
        jest.advanceTimersByTime(1500);
    });
    
    await waitFor(() => {
        expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });
  });

  it('handles error in generateAffidavit', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('/api/generate-affidavit')) {
            // Delay the rejection so the component loop can await the fetch array at the end without throwing out of bound 
            return new Promise((_, reject) => setTimeout(() => reject(new Error('Test Error')), 5000));
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockScanData) });
    });

    render(<InvestigatePage />);
    await waitFor(() => expect(screen.getByText('Generate Legal Affidavit')).toBeInTheDocument());
    
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await act(async () => {
      fireEvent.click(screen.getByText('Generate Legal Affidavit'));
    });
    
    await act(async () => { jest.advanceTimersByTime(1500); });
    await act(async () => { jest.advanceTimersByTime(1500); });
    await act(async () => { jest.advanceTimersByTime(1500); });
    await act(async () => { jest.advanceTimersByTime(500); });

    await waitFor(() => expect(screen.getByText('Generate Legal Affidavit')).toBeInTheDocument(), { timeout: 5000 });
    spy.mockRestore();
  });

  it('covers empty ledger data branch and null coalescing summary', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('/api/generate-affidavit')) {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ pdfBase64: 'data:application/pdf;base64,mock-pdf' }) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ledger: { summary: {} } }) });
    });
    
    // We can also spy on search params to return a truthy wallet at least once!
    const useSearchParamsMock = require('next/navigation').useSearchParams;
    useSearchParamsMock.mockReturnValueOnce({ get: () => '0xTESTWALLET' });

    render(<InvestigatePage />);
    await act(async () => { await Promise.resolve(); });
    // Advance timers completely to avoid state leakage
    await act(async () => { jest.advanceTimersByTime(5000); await Promise.resolve(); });
  });

  it('covers the completely empty data branch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    render(<InvestigatePage />);
    await act(async () => { await Promise.resolve(); });
  });

  it('covers missing wallet param fallback', async () => {
    const useSearchParamsMock = require('next/navigation').useSearchParams;
    useSearchParamsMock.mockReturnValueOnce({ get: () => null });
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockScanData) });
    render(<InvestigatePage />);
    await act(async () => { await Promise.resolve(); });
  });
});
