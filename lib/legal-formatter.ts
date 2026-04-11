import { format } from 'date-fns';

export function formatLegalDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return `On or about ${format(date, 'MMMM d, yyyy')}`;
}

export function formatParty(address: string, isDefendant: boolean = true): string {
  if (isDefendant) {
    return `the Defendant wallet ending in ${address.slice(-4)}`;
  }
  return `the wallet ending in ${address.slice(-4)}`;
}

export function formatValue(value: string, symbol: string = 'tokens'): string {
  const numValue = parseFloat(value);
  const formatted = numValue.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
  return `${formatted} ${symbol}`;
}

export function formatLegalProse(
  timestamp: number,
  from: string,
  to: string,
  value: string,
  symbol: string,
  method: string,
  exhibitNumber: string
): string {
  const dateStr = formatLegalDate(timestamp);
  const fromStr = formatParty(from, true);
  const toStr = formatParty(to, false);
  const valStr = formatValue(value, symbol);

  let actionStr = 'transferred';
  if (method === 'swapExactTokensForTokens') actionStr = 'swapped';
  else if (method === 'bridgeTokens') actionStr = 'bridged';
  else if (method === 'deposit') actionStr = 'deposited';

  return `${dateStr}, ${fromStr} ${actionStr} approximately ${valStr} to ${toStr} via a decentralized smart contract. This transaction is authenticated on the public ledger (See Exhibit ${exhibitNumber}).`;
}
