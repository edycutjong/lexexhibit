import { format } from 'date-fns';

export function formatLegalDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `On or about ${format(date, 'MMMM d, yyyy')}`;
}

export function formatParty(address: string, isDefendant: boolean = true): string {
  if (isDefendant) {
    return `the Defendant wallet (ending in ...${address.slice(-6)})`;
  }
  return `the counterparty wallet (ending in ...${address.slice(-6)})`;
}

export function formatValue(value: string, symbol: string = 'ETH'): string {
  const numValue = parseFloat(value);
  const formatted = numValue.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return `${formatted} ${symbol}`;
}

const FLAG_STATEMENTS: Record<string, string> = {
  rapid_dispersal:
    'This movement exhibits characteristics consistent with rapid dispersal — a pattern wherein assets are distributed across multiple addresses in swift succession to impede forensic tracing and frustrate asset recovery efforts.',
  mixer_interaction:
    'The destination address is associated with Tornado Cash, a cryptocurrency mixing protocol sanctioned by the U.S. Department of the Treasury Office of Foreign Assets Control (OFAC, August 2022) as a tool used to conceal the origin, destination, and counterparties of virtual currency transactions.',
  cross_chain_hop:
    'This transaction employs a cross-chain bridge protocol, routing assets across separate blockchain networks in a manner that fragments the on-chain record and complicates standard single-chain forensic analysis.',
  large_value:
    'The aggregate value of this single transfer is consistent with patterns documented in financial intelligence reports as indicative of deliberate bulk asset movement.',
};

function getActionClause(method: string, to: string, val: string, sym: string): string {
  const toShort = `...${to.slice(-6)}`;
  const value = formatValue(val, sym);

  switch (method) {
    case 'swapExactTokensForTokens':
    case 'swap':
      return `exchanged ${value} through a decentralized exchange router at address ${toShort}`;
    case 'bridgeTokens':
    case 'bridge':
      return `transferred ${value} across a cross-chain bridge protocol at address ${toShort}`;
    case 'deposit':
      return `deposited ${value} into a liquidity pool smart contract at address ${toShort}`;
    case 'transfer':
    case 'transferFrom':
      return `directly transmitted ${value} to address ${toShort}`;
    default:
      return `executed an asset movement of ${value} involving address ${toShort}`;
  }
}

export function formatLegalProse(
  timestamp: number,
  from: string,
  to: string,
  value: string,
  symbol: string,
  method: string,
  exhibitNumber: string,
  suspiciousFlags: string[] = []
): string {
  const dateStr = formatLegalDate(timestamp);
  const fromStr = formatParty(from, true);
  const actionClause = getActionClause(method, to, value, symbol);

  const sentences: string[] = [
    `${dateStr}, ${fromStr} ${actionClause}. This transaction is authenticated on the Ethereum public ledger as set forth in Exhibit ${exhibitNumber}.`,
  ];

  for (const flag of suspiciousFlags) {
    const statement = FLAG_STATEMENTS[flag];
    if (statement) sentences.push(statement);
  }

  return sentences.join(' ');
}
