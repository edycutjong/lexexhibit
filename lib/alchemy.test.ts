import { fetchWalletTransactions } from './alchemy';

describe('alchemy', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, ALCHEMY_API_KEY: 'test-key' };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('fetches and maps transactions correctly', async () => {
    const mockResponse = {
      result: {
        transfers: [
          {
            hash: '0x123',
            from: '0xabc',
            to: '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', // Tornado cash
            value: 1.5,
            asset: 'ETH',
            blockNum: '0x1234',
            category: 'external',
            metadata: {
              blockTimestamp: '2023-01-01T00:00:00.000Z'
            }
          },
          {
            hash: '0x456',
            from: '0xabc',
            to: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', // Aave
            value: 1000,
            asset: 'USDC',
            blockNum: '0x1235',
            category: 'erc20',
            metadata: {
              blockTimestamp: '2023-01-02T00:00:00.000Z'
            }
          },
          {
            hash: '0x789',
            from: '0xabc',
            to: '0xunknown',
            value: null,
            asset: null,
            blockNum: '0x1236',
            category: 'internal',
            metadata: {
              blockTimestamp: '2023-01-03T00:00:00.000Z'
            }
          },
          {
            hash: '0xabc',
            from: '0xabc',
            to: null,
            value: null,
            asset: null,
            blockNum: '0x1237',
            category: 'internal',
            metadata: {
              blockTimestamp: '2023-01-04T00:00:00.000Z'
            }
          }
        ]
      }
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { transactions, totalValueUsd } = await fetchWalletTransactions('0xabc');
    
    expect(transactions).toHaveLength(4);
    
    // Tornado cash tx
    expect(transactions[0].category).toBe('mixer_interaction');
    expect(transactions[0].value).toBe('1.5');
    
    // Aave tx
    expect(transactions[1].category).toBe('lp_deposit');
    expect(transactions[1].tokenValue).toBe('1000');
    expect(transactions[1].tokenSymbol).toBe('USDC');
    
    // Unknown tx
    expect(transactions[2].category).toBe('transfer'); // fallback
    expect(transactions[2].value).toBe('0');
    
    // 1.5 ETH * 3000 = 4500
    // 1000 USDC = 1000
    // Total = 5500
    expect(totalValueUsd).toBe(5500);
  });

  it('throws an error if ALCHEMY_API_KEY is missing', async () => {
    delete process.env.ALCHEMY_API_KEY;
    await expect(fetchWalletTransactions('0xabc')).rejects.toThrow('ALCHEMY_API_KEY is missing');
  });

  it('throws an error if Alchemy API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(fetchWalletTransactions('0xabc')).rejects.toThrow('Alchemy API error: 500 Internal Server Error');
  });

  it('handles response with no transfers gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ result: {} }),
    });

    const { transactions, totalValueUsd } = await fetchWalletTransactions('0xabc');
    expect(transactions).toHaveLength(0);
    expect(totalValueUsd).toBe(0);
  });
});
