import { POST } from './route';
import { createMockRequest } from '@/jest.setup';

describe('app/api/generate-affidavit', () => {
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });
  const transactions = [
    {
      hash: '0x123',
      timestamp: 1625097600,
      blockNumber: 12345,
      isInternal: false,
      from: '0xabc',
      to: '0xdef',
      value: '1.5',
      tokenSymbol: 'ETH',
      method: 'Transfer',
      category: 'transfer',
      suspiciousFlags: []
    },
    {
      hash: '0x456',
      timestamp: 1625097601,
      blockNumber: 12346,
      isInternal: false,
      from: '0xabc',
      to: '0xdef',
      value: '2.0',
      tokenValue: '2000',
      tokenSymbol: undefined,
      method: undefined,
      category: 'transfer',
      suspiciousFlags: []
    }
  ];

  it('should generate affidavit data and return base64 PDF', async () => {
    const req = createMockRequest({ transactions });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pdfBase64).toContain('data:application/pdf;base64,');
    expect(data.sections.length).toBe(2);
    expect(data.sections[0].exhibitNumber).toBe('A');
    expect(data.sections[0].txHashes).toContain('0x123');
    // Verify fallback logic
    expect(data.sections[1].legalProse).toContain('2,000');
    expect(data.sections[1].legalProse).toContain('ETH');
  });

  it('should handle malformed input gracefully', async () => {
    const req = {
       json: async () => { throw new Error('Bad JSON'); }
    } as unknown as Request;
    
    // We expect console.error to be called but we'll focus on the response
    const response = await POST(req);
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBe('Failed to generate document');
  });

  it('should handle missing tokenValue and value fallbacks', async () => {
    const transactions = [
      {
        hash: '0x789',
        timestamp: 1625097602,
        from: '0xabc',
        to: '0xdef',
        // value is missing, tokenValue is missing
      }
    ];
    const req = createMockRequest({ transactions });
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.sections[0].legalProse).toContain('0 ETH');
  });
});
