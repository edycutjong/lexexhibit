import { POST } from './route';
import demoTrace from '@/data/demo-trace.json';
import demoInnocent from '@/data/demo-innocent.json';
import { supabase } from '@/lib/supabase';
import { fetchWalletTransactions } from '@/lib/alchemy';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    upsert: jest.fn().mockResolvedValue({ error: null }),
  }
}));

// Mock Alchemy lib — no real network calls in tests
jest.mock('@/lib/alchemy', () => ({
  fetchWalletTransactions: jest.fn().mockResolvedValue({
    transactions: [],
    totalValueUsd: 0,
  }),
}));

function createMockRequest(body: unknown) {
  return { json: async () => body } as unknown as Request;
}

describe('app/api/scan', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns demo trace data for the known suspect address', async () => {
    const req = createMockRequest({ address: demoTrace.address });
    const response = await POST(req);
    const data = await response.json();

    expect(data.ledger.summary).toEqual(demoTrace.summary);
    expect(data.ledger.transactions.length).toBeGreaterThan(0);
  });

  it('returns innocent data for the innocent demo address', async () => {
    const req = createMockRequest({ address: demoInnocent.address });
    const response = await POST(req);
    const data = await response.json();

    expect(data.ledger.summary).toEqual(demoInnocent.summary);
    expect(data.ledger.transactions.length).toBeGreaterThan(0);
  });

  it('calls Alchemy and returns empty for an unknown address with no results', async () => {
    const req = createMockRequest({ address: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef' });
    const response = await POST(req);
    const data = await response.json();

    expect(data.ledger.transactions).toEqual([]);
    expect(data.ledger.summary.txCount).toBe(0);
  });

  it('returns 500 if the request is malformed', async () => {
    const req = { json: async () => { throw new Error('Bad JSON'); } } as unknown as Request;
    const response = await POST(req);
    expect(response.status).toBe(500);
  });

  it('returns cached data if available in supabase', async () => {
    (supabase!.from('cached_traces').select('tx_data, tx_count, total_value_usd').eq('wallet_address', '0xcached').eq('chain', 'ethereum').gt('expires_at', '').maybeSingle as jest.Mock)
      .mockResolvedValueOnce({
        data: {
          tx_data: [{ hash: '0xabc', from: 'a', to: 'b', timestamp: 123, value: '1', suspiciousFlags: [] }],
          total_value_usd: 100,
          tx_count: 1
        }
      });
      
    const req = createMockRequest({ address: '0xcached' });
    const response = await POST(req);
    const data = await response.json();
    
    expect(data.cached).toBe(true);
    expect(data.ledger.summary.txCount).toBe(1);
    expect(data.ledger.summary.totalValueUsd).toBe(100);
  });

  it('continues to alchemy if cache read fails', async () => {
    (supabase!.from('cached_traces').select('tx_data, tx_count, total_value_usd').eq('wallet_address', '0xerror').eq('chain', 'ethereum').gt('expires_at', '').maybeSingle as jest.Mock)
      .mockRejectedValueOnce(new Error('db error'));
      
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const req = createMockRequest({ address: '0xerror' });
    const response = await POST(req);
    const data = await response.json();
    
    expect(data.cached).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('Cache read failed (continuing):', expect.any(Error));
    warnSpy.mockRestore();
  });

  it('warns if cache write fails', async () => {
    // Need to trigger a cache write by having transactions.length > 0 from alchemy
    (fetchWalletTransactions as jest.Mock).mockResolvedValueOnce({
      transactions: [{ hash: '0xnew', from: 'a', to: 'b', timestamp: 123, value: '1', suspiciousFlags: [] }],
      totalValueUsd: 10
    });
    
    (supabase!.from('cached_traces').upsert as jest.Mock).mockResolvedValueOnce({ error: { message: 'upsert error' } });
    
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const req = createMockRequest({ address: '0xwrite_error' });
    const response = await POST(req);
    const data = await response.json();
    
    await new Promise(process.nextTick);
    
    expect(data.cached).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('Cache write failed:', 'upsert error');
    warnSpy.mockRestore();
  });
});
