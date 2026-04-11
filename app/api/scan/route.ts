import { NextResponse } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/suspicious-detector';
import { Transaction } from '@/lib/tx-classifier';

// Basic demo retrieval. 
// A real app would hit Alchemy SDK: `alchemy.core.getAssetTransfers({fromBlock, toBlock, fromAddress: address})`
import demoTrace from '@/data/demo-trace.json';
import demoInnocent from '@/data/demo-innocent.json';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    // The golden path requires instantly sending back the demo data if possible
    let transactions: Transaction[] = [];
    let summary = { totalValueUsd: 0, txCount: 0 };
    
    if (address.toLowerCase() === demoTrace.address.toLowerCase()) {
      transactions = detectSuspiciousPatterns(demoTrace.transactions as Transaction[]);
      summary = demoTrace.summary;
    } else if (address.toLowerCase() === demoInnocent.address.toLowerCase()) {
      transactions = detectSuspiciousPatterns(demoInnocent.transactions as Transaction[]);
      summary = demoInnocent.summary;
    } else {
      // Stub generic fallback
      transactions = [];
    }

    return NextResponse.json({ ledger: { transactions, summary } });
  } catch (error) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: 'Failed to trace wallet' }, { status: 500 });
  }
}
