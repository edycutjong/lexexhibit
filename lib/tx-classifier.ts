export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol?: string;
  tokenValue?: string;
  method?: string;
  blockNumber: number;
  timestamp: number;
  isInternal: boolean;
  category: 'transfer' | 'swap' | 'lp_deposit' | 'lp_withdraw' | 'bridge' | 'contract_call' | 'mixer_interaction' | 'unknown';
  suspiciousFlags: string[];
}

export function classifyTransaction(tx: Partial<Transaction>): Transaction['category'] {
  const method = tx.method?.toLowerCase() || '';
  
  if (method.includes('swap')) return 'swap';
  if (method.includes('deposit') || method.includes('addliquidity')) return 'lp_deposit';
  if (method.includes('withdraw') || method.includes('removeliquidity')) return 'lp_withdraw';
  if (method.includes('bridge') || method.includes('across')) return 'bridge';
  if (method.includes('tornado') || method.includes('mix')) return 'mixer_interaction';
  if (method === 'transfer' || method === 'transferfrom' || !method) return 'transfer';
  
  return 'contract_call';
}
