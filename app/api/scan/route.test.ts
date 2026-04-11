import { POST } from './route';
import demoTrace from '@/data/demo-trace.json';
import demoInnocent from '@/data/demo-innocent.json';

// Simple mock for Request
function createMockRequest(body: unknown) {
  return {
    json: async () => body,
  } as unknown as Request;
}

describe('app/api/scan', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });
  it('should return demo trace data if the correct address is provided', async () => {
    const req = createMockRequest({ address: demoTrace.address });
    const response = await POST(req);
    const data = await response.json();

    expect(data.ledger.summary).toEqual(demoTrace.summary);
    expect(data.ledger.transactions.length).toBeGreaterThan(0);
  });

  it('should return innocent data if the innocent address is provided', async () => {
    const req = createMockRequest({ address: demoInnocent.address });
    const response = await POST(req);
    const data = await response.json();

    expect(data.ledger.summary).toEqual(demoInnocent.summary);
    expect(data.ledger.transactions.length).toBeGreaterThan(0);
  });

  it('should return empty transactions for an unknown address', async () => {
    const req = createMockRequest({ address: '0xUNKNOWN' });
    const response = await POST(req);
    const data = await response.json();

    expect(data.ledger.transactions).toEqual([]);
  });

  it('should return 500 if the request is malformed', async () => {
     // Mocking json() to throw error
    const req = {
       json: async () => { throw new Error('Bad JSON'); }
    } as unknown as Request;
    
    const response = await POST(req);
    expect(response.status).toBe(500);
  });
});
