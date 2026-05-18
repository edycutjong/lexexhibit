import { POST } from './route';
import demoTrace from '@/data/demo-trace.json';
import demoInnocent from '@/data/demo-innocent.json';

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
});
