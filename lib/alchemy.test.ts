import { fetchWalletTransactions } from './alchemy';

jest.mock('alchemy-sdk', () => {
  return {
    Alchemy: jest.fn().mockImplementation(() => ({
      core: {
        getAssetTransfers: jest.fn().mockResolvedValue({
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
        })
      }
    })),
    Network: { ETH_MAINNET: 'eth-mainnet' },
    AssetTransfersCategory: {
      EXTERNAL: 'external',
      INTERNAL: 'internal',
      ERC20: 'erc20'
    },
    SortingOrder: {
      ASCENDING: 'asc'
    }
  };
});

describe('alchemy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and maps transactions correctly', async () => {
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
});
