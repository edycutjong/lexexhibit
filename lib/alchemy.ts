import { Transaction, classifyTransaction } from './tx-classifier';
import { detectSuspiciousPatterns } from './suspicious-detector';

// Known DeFi contract addresses → override method-based classification
// when Alchemy doesn't return input data / method names.
const KNOWN_CONTRACTS: Record<string, Transaction['category']> = {
  // Uniswap
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'swap',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'swap',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'swap',
  // 1inch
  '0x1111111254eeb25477b68fb85ed929f73a960582': 'swap',
  '0x1111111254fb6c44bac0bed2854e76f90643097d': 'swap',
  // Tornado Cash (OFAC-sanctioned mixer)
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b': 'mixer_interaction',
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf': 'mixer_interaction',
  '0x12d66f87a04a9e220c9d05126814db23abb1e609': 'mixer_interaction',
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936': 'mixer_interaction',
  // Bridges
  '0x4d9079bb4165aeb4084c526a32695dcfd2f77381': 'bridge', // Across
  '0x2796317b0ff8538f253012862c06787adfb8ceb6': 'bridge', // Synapse
  '0x8731d54e9d02c286767d56ac03e8037c07e01e98': 'bridge', // Stargate
  '0xb8901acb165ed027e32754e0ffe830802919727f': 'bridge', // Hop
  '0x401f6c983ea34274ec46f84d70b31c15146b138e': 'bridge', // Ronin bridge
  // Lending / LP
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': 'lp_deposit', // Aave V2
  '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b': 'lp_deposit', // Compound
  '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7': 'lp_deposit', // Curve 3pool
};

// Approximate ETH price — good enough for forensic USD estimates.
// In production this should come from Alchemy Prices API or CoinGecko.
const ETH_PRICE_USD = 3000;

function resolveCategory(to: string): Transaction['category'] {
  return KNOWN_CONTRACTS[to.toLowerCase()] ?? classifyTransaction({ to });
}

interface AlchemyTransfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  metadata: {
    blockTimestamp: string;
  };
}

export async function fetchWalletTransactions(address: string): Promise<{
  transactions: Transaction[];
  totalValueUsd: number;
}> {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    throw new Error('ALCHEMY_API_KEY is missing');
  }

  // Fetch outbound transfers via native fetch to avoid alchemy-sdk vulnerabilities
  const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 1,
      jsonrpc: '2.0',
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          fromAddress: address,
          category: ['external', 'internal', 'erc20'],
          withMetadata: true,
          maxCount: '0x64', // 100 in hex
          order: 'asc',
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const transfers: AlchemyTransfer[] = data.result?.transfers || [];

  const transactions: Transaction[] = transfers.map(t => {
    const isEth = !t.asset || t.asset === 'ETH';
    const rawValue = t.value?.toString() ?? '0';
    const to = t.to ?? '';
    const timestamp = Math.floor(new Date(t.metadata.blockTimestamp).getTime() / 1000);

    return {
      hash: t.hash,
      from: t.from,
      to,
      value: isEth ? rawValue : '0',
      tokenSymbol: t.asset ?? undefined,
      tokenValue: !isEth ? rawValue : undefined,
      method: undefined,
      blockNumber: parseInt(t.blockNum, 16),
      timestamp,
      isInternal: t.category === 'internal',
      category: resolveCategory(to),
      suspiciousFlags: [],
    };
  });

  const flagged = detectSuspiciousPatterns(transactions);

  const totalValueUsd = flagged.reduce((acc, tx) => {
    const val = parseFloat(tx.tokenValue ?? tx.value);
    const isEth = !tx.tokenSymbol || tx.tokenSymbol === 'ETH';
    return acc + (isEth ? val * ETH_PRICE_USD : val);
  }, 0);

  return { transactions: flagged, totalValueUsd };
}
